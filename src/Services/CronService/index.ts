import { HTTPException } from 'hono/http-exception'
import nodeCron from 'node-cron'

import { TaskData } from '@Database/cronFactory'
import { TaskRepo } from '@Repos/Task'
import { TelegramMsgr } from '@Services/TelegramMsgr'

import type { ScheduledTask } from 'node-cron'

export class CronService {
	private static activeTaskMap = new Map<string, ScheduledTask>()

	private static cronFunc = (stackName: string, taskName: string) => () =>
		(async () => {
			try {
				console.log(`Executing CRON ${stackName}.${taskName}`)

				const now = new Date()

				const data = await TaskRepo.getTaskByNameWithStack(stackName, taskName)

				const taskKey = this.createKey(stackName, taskName)
				if (!data) return this.unsetCron(taskKey)

				const { task, stack } = data

				const { url, headers, name } = task
				const { logTelegramId } = stack

				let res
				try {
					res = await fetch(url, {
						method: 'POST',
						headers: {
							...headers,
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							name: task.name,
							cron: task.cron,
							createdAt: task.createdAt,
							succesfullCalls: task.succesfullCalls,
							lastSuccesfullCall: task.lastSuccesfullCall,
							consecutiveFailures: task.consecutiveFailures
						})
					})
				} catch (e) {
					await TaskRepo.incrementTaskFailures(stackName, taskName)

					if (logTelegramId)
						await TelegramMsgr.sendMessage(
							logTelegramId,
							`Error occured on cron <b>${stackName}.${name}</b>:\n<code>Unreachable address ${url}</code>`
						)
					return
				}

				if (res.status !== 200) {
					await TaskRepo.incrementTaskFailures(stackName, taskName)

					if (logTelegramId)
						await TelegramMsgr.sendMessage(
							logTelegramId,
							`Error occured on cron <b>${stackName}.${name}</b>:\n<code>${res.status} ${res.statusText}</code>`
							// Don't send the response body - Telegram may try to parse it and fail
						)

					return
				}

				await TaskRepo.incrementTaskSuccesses(stackName, taskName, now)
			} catch (e) {
				console.error(e)
			}
		})()

	public static createKey = (stackName: string, taskName: string) => `${stackName}/${taskName}`

	public static async setCron(cronData: TaskData) {
		const { cron, name, stackName } = cronData

		const taskKey = this.createKey(stackName, name)

		if (this.activeTaskMap.has(taskKey)) {
			this.unsetCron(taskKey)
		}

		try {
			const runner = nodeCron.schedule(cron, this.cronFunc(stackName, name))

			this.activeTaskMap.set(taskKey, runner)
		} catch (e) {
			await TaskRepo.deleteTask(stackName, name)

			throw new HTTPException(400, { message: 'Unable to initialize specified cron!' })
		}
	}

	public static unsetCron(taskKey: string) {
		if (!this.activeTaskMap.has(taskKey)) return false

		this.activeTaskMap.get(taskKey)!.stop()
		this.activeTaskMap.delete(taskKey)

		return true
	}

	public static async cronInit() {
		const tasks = await TaskRepo.getTasks()

		const promises = tasks.map((task) => this.setCron(task))

		const settled = await Promise.allSettled(promises)

		for (const result of settled) {
			if (result.status === 'rejected') console.error(result.reason)
		}
	}
}

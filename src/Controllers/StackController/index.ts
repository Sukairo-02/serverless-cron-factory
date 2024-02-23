import { zValidator } from '@hono/zod-validator'
import { HTTPException } from 'hono/http-exception'

import { verifyPassword } from '@Middleware/verifyPassword'
import { StackRepo } from '@Repos/Stack'
import { TaskRepo } from '@Repos/Task'
import { CronService } from '@Services/CronService'
import { stackSchema, taskSchema } from './schema'

import type { Hono } from 'hono'

export class StackController {
	constructor(app: Hono, path: string) {
		app.post(`${path}`, zValidator('json', stackSchema), async (c) => {
			const data = c.req.valid('json')

			try {
				const passHash = await Bun.password.hash(data.password)
				data.password = passHash

				const stack = await StackRepo.createStack(data)

				return c.json(stack)
			} catch (e) {
				throw new HTTPException(403, { message: `Stack ${data.name} already exists!` })
			}
		})

		app.get(`${path}/:stackName`, verifyPassword, async (c) => {
			const { stackName } = c.req.param()

			const stack = await StackRepo.getStackByNameWithTasks(stackName)
			if (!stack) throw new HTTPException(404, { message: `Stack ${stackName} not found!` })

			return c.json(stack)
		})

		app.patch(`${path}/:stackName`, verifyPassword, zValidator('json', stackSchema.partial()), async (c) => {
			const { stackName } = c.req.param()
			const data = c.req.valid('json')

			if (data.password) {
				const passHash = await Bun.password.hash(data.password)
				data.password = passHash
			}

			let stack
			try {
				stack = await StackRepo.updateStack(stackName, data)
			} catch (e) {
				throw new HTTPException(403, { message: `Stack ${data.name} already exists!` })
			}

			if (!stack) throw new HTTPException(404, { message: `Stack ${stackName} not found!` })

			return c.json(stack)
		})

		app.delete(`${path}/:stackName`, verifyPassword, async (c) => {
			const { stackName } = c.req.param()

			const stack = await StackRepo.deleteStack(stackName)
			if (!stack) throw new HTTPException(404, { message: `Stack ${stackName} not found!` })

			return c.text(`Stack ${stackName} deleted succesfully!`)
		})

		app.get(`${path}/:stackName/task`, verifyPassword, async (c) => {
			const { stackName } = c.req.param()

			const tasks = await TaskRepo.getTasksByStackName(stackName)

			return c.json(tasks)
		})

		app.post(`${path}/:stackName/task`, verifyPassword, zValidator('json', taskSchema), async (c) => {
			const { stackName } = c.req.param()
			const data = { ...c.req.valid('json'), stackName }

			let task

			try {
				task = await TaskRepo.writeTask(data)
			} catch (e) {
				throw new HTTPException(403, {
					message: `Task ${data.name} in stack ${data.stackName} already exists!`
				})
			}

			await CronService.setCron(task)

			return c.json(task)
		})

		app.get(`${path}/:stackName/task/:taskName`, verifyPassword, async (c) => {
			const { stackName, taskName } = c.req.param()

			const task = await TaskRepo.getTaskByName(stackName, taskName)
			if (!task) throw new HTTPException(404, { message: `Task ${taskName} in stack ${stackName} not found!` })

			return c.json(task)
		})

		app.patch(
			`${path}/:stackName/task/:taskName`,
			verifyPassword,
			zValidator('json', taskSchema.partial()),
			async (c) => {
				const { stackName, taskName } = c.req.param()
				const data = c.req.valid('json')

				let task
				try {
					task = await TaskRepo.updateTask(stackName, taskName, data)
				} catch (e) {
					throw new HTTPException(403, {
						message: `Task ${data.name} in stack ${stackName} already exists!`
					})
				}

				if (!task)
					throw new HTTPException(404, { message: `Task ${taskName} in stack ${stackName} not found!` })

				if ('stackName' in data || 'name' in data) {
					const oldTaskKey = CronService.createKey(stackName, taskName)
					const newTaskKey = CronService.createKey(task.stackName, task.name)

					if (oldTaskKey !== newTaskKey) {
						CronService.unsetCron(oldTaskKey)
					}
				}

				await CronService.setCron(task)
				return c.json(task)
			}
		)

		app.delete(`${path}/:stackName/task/:taskName`, verifyPassword, async (c) => {
			const { stackName, taskName } = c.req.param()

			const task = await TaskRepo.deleteTask(stackName, taskName)
			if (!task) throw new HTTPException(404, { message: `Task ${taskName} in stack ${stackName} not found!` })

			const oldTaskKey = CronService.createKey(stackName, taskName)
			CronService.unsetCron(oldTaskKey)

			return c.text(`Task ${taskName} in stack ${stackName} deleted succesfully!`)
		})
	}
}

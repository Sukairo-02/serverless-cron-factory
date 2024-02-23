import { eq, sql, and } from 'drizzle-orm'
import { TaskData, NewTaskData, Task, db, Stack } from '@Database/cronFactory'
import { defaultLimit, defaultOffset } from '@Globals'

export class TaskRepo {
	public static async writeTask(data: NewTaskData) {
		const task = await db.insert(Task).values(data).returning().get()

		return task
	}

	public static async writeTasks(data: NewTaskData[]) {
		const tasks = await db.insert(Task).values(data).returning().all()

		return tasks
	}

	public static async getTasks(offset = defaultOffset, limit = defaultLimit) {
		const tasks = await db.select().from(Task).offset(offset).limit(limit).all()

		return tasks
	}

	public static async getTaskByName(stackName: string, name: string) {
		const task = await db
			.select()
			.from(Task)
			.where(and(eq(Task.name, name), eq(Task.stackName, stackName)))
			.get()

		return task
	}

	public static async getTaskByNameWithStack(stackName: string, name: string) {
		const task = await db
			.select()
			.from(Task)
			.innerJoin(Stack, eq(Task.stackName, Stack.name))
			.where(and(eq(Task.name, name), eq(Task.stackName, stackName)))
			.get()

		return task
	}

	public static async getTasksByStackName(stackName: string, offset = defaultOffset, limit = defaultLimit) {
		const tasks = await db
			.select()
			.from(Task)
			.where(eq(Task.stackName, stackName))
			.offset(offset)
			.limit(limit)
			.all()

		return tasks
	}

	public static async updateTask(stackName: string, name: string, data: Partial<TaskData>) {
		const task = await db
			.update(Task)
			.set(data)
			.where(and(eq(Task.name, name), eq(Task.stackName, stackName)))
			.returning()
			.get()

		return task
	}

	public static async incrementTaskSuccesses(stackName: string, name: string, successDate: Date) {
		const task = await db
			.update(Task)
			.set({
				succesfullCalls: sql<number>`${Task.succesfullCalls} + ${1}`,
				consecutiveFailures: 0,
				lastSuccesfullCall: successDate
			})
			.where(and(eq(Task.name, name), eq(Task.stackName, stackName)))
			.returning()
			.get()

		return task
	}

	public static async incrementTaskFailures(stackName: string, name: string) {
		const task = await db
			.update(Task)
			.set({
				consecutiveFailures: sql<number>`${Task.consecutiveFailures} + ${1}`
			})
			.where(and(eq(Task.name, name), eq(Task.stackName, stackName)))
			.returning()
			.get()

		return task
	}

	public static async deleteTask(stackName: string, name: string) {
		const task = await db
			.delete(Task)
			.where(and(eq(Task.name, name), eq(Task.stackName, stackName)))
			.returning()
			.get()

		return task
	}
}

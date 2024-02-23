import { eq } from 'drizzle-orm'
import { NewStackData, Stack, StackData, Task, db } from '@Database/cronFactory'

export class StackRepo {
	public static async createStack(data: NewStackData) {
		const stack = await db
			.insert(Stack)
			.values(data)
			.returning({
				name: Stack.name,
				owner: Stack.owner,
				createdAt: Stack.createdAt,
				logTelegramId: Stack.logTelegramId
			})
			.get()

		return stack
	}

	public static async createStacks(data: NewStackData[]) {
		const stacks = await db
			.insert(Stack)
			.values(data)
			.onConflictDoNothing()
			.returning({
				name: Stack.name,
				owner: Stack.owner,
				createdAt: Stack.createdAt,
				logTelegramId: Stack.logTelegramId
			})
			.all()

		return stacks
	}

	public static async getStackByName(name: string) {
		const stack = await db.select().from(Stack).where(eq(Stack.name, name)).get()

		return stack
	}

	public static async getStackByNameWithTasks(name: string) {
		const stacks = await db
			.select({
				name: Stack.name,
				owner: Stack.owner,
				createdAt: Stack.createdAt,
				taskName: Task.name,
				logTelegramId: Stack.logTelegramId
			})
			.from(Stack)
			.where(eq(Stack.name, name))
			.leftJoin(Task, eq(Stack.name, Task.stackName))
			.all()

		if (!stacks.length) return undefined

		const mapped = {
			...stacks[0],
			taskName: undefined,
			tasks: stacks.reduce((p, e) => {
				if (typeof e.taskName === 'string') p.push(e.taskName)

				return p
			}, [] as string[])
		}

		delete mapped.taskName

		return mapped as Omit<typeof mapped, 'taskName'>
	}

	public static async updateStack(name: string, data: Partial<StackData>) {
		const stack = await db
			.update(Stack)
			.set(data)
			.where(eq(Stack.name, name))
			.returning({
				name: Stack.name,
				owner: Stack.owner,
				createdAt: Stack.createdAt,
				logTelegramId: Stack.logTelegramId
			})
			.get()

		return stack
	}

	public static async deleteStack(name: string) {
		const stack = await db
			.delete(Stack)
			.where(eq(Stack.name, name))
			.returning({
				name: Stack.name,
				owner: Stack.owner,
				createdAt: Stack.createdAt,
				logTelegramId: Stack.logTelegramId
			})
			.get()

		return stack
	}
}

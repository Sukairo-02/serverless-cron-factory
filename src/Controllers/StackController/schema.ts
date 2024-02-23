import { z } from 'zod'

export const stackSchema = z
	.object({
		name: z.string(),
		owner: z.string(),
		password: z.string().min(6).max(30),
		logTelegramId: z.string().optional()
	})
	.strict()

export const taskSchema = z
	.object({
		name: z.string(),
		cron: z.string(),
		url: z.string().url(),
		headers: z.record(z.string()).optional()
	})
	.strict()

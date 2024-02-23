import { Stack, Task } from './schema'
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm'

export type StackData = InferSelectModel<typeof Stack>
export type NewStackData = InferInsertModel<typeof Stack>

export type TaskData = InferSelectModel<typeof Task>
export type NewTaskData = InferInsertModel<typeof Task>

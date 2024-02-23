import { HTTPException } from 'hono/http-exception'

import { StackRepo } from '@Repos/Stack'

import type { MiddlewareHandler } from 'hono'

export const verifyPassword: MiddlewareHandler<any, `${string}/:stackName${string}`> = async (c, next) => {
	const { stackName } = c.req.param()

	const stack = await StackRepo.getStackByName(stackName)
	if (!stack) throw new HTTPException(404, { message: `Stack ${stackName} not found!` })

	const password = c.req.header('Authorization')
	if (!password) throw new HTTPException(401, { message: 'Password must be passed in Authorization header!' })

	if (!(await Bun.password.verify(password, stack.password)))
		throw new HTTPException(403, { message: 'Invalid password!' })

	c.set('stack', stack)

	await next()
}

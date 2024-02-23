# Serverless Cron Factory

Service to call your HTTP endpoints on cron-based timings.  
Intended for usage in serverless applications that do not support cron triggers.

# Deployment

1.  Set up `fly.io` cli
2.  Configure environment variables
3.  Run `npm run deploy`

# Usage

1.  Create `stack`; connect to [Telegram bot](https://t.me/serverless_cron_facroty_bot) if you wish to receive error logs on failed calls to your endpoints
2.  Set up `HTTP`-triggers with `POST` method in your API for functions you'd like to call.  
    Expect them to receive following payloads:

    ```Typescript
    type Payload = {
        name: string;
        cron: string;
        createdAt: Date;
        succesfullCalls: number;
        lastSuccesfullCall: Date | null;
        consecutiveFailures: number;
    }
    ```

3.  Create `task`(-s) using your endpoints

# Endpoints

:lock: - route is protected, stack password must be provided in `Headers.Authorization` to access it.

## Stack

-   `/stack`

    -   `POST` - create new stack

        ```Typescript
        type Input = {
            name: string; // Name of the stack
            owner: string;  // Owner identification
            password: string; // Password for administrating stack and it's tasks. 6-30 symbols.
            logTelegramId?: string; // Id of Telegram account you wish to receive possible error logs on
        }

        type Output = {
            name: string;
            owner: string;
            createdAt: Date;
            logTelegramId: string | null;
        }
        ```

-   :lock:`/stack/:stackName`

    -   `GET` - get stack

        ```Typescript
        type Output = {
            name: string;
            owner: string;
            tasks: string[];
            createdAt: Date;
        }
        ```

    -   `PATCH` - update stack

        ```Typescript
        type Input = {
            name?: string; // Name of the stack
            owner?: string;  // Owner identification
            password?: string; // Password for administrating stack and it's tasks. 6-30 symbols.
            logTelegramId?: string; // Id of Telegram account you wish to receive possible error logs on
        }

        type Output = {
            name: string;
            owner: string;
            createdAt: Date;
            logTelegramId: string | null;
        }
        ```

    -   `DELETE` - delete stack

## Task

-   :lock:`/stack/:stackName/task`

    -   `GET` - get all tasks of stack

        ```Typescript
        type Output = {
            name: string;
            createdAt: Date;
            stackName: string;
            cron: string;
            url: string;
            headers: Record<string, string> | null;
            succesfullCalls: number;
            consecutiveFailures: number;
            lastSuccesfullCall: Date | null;
        }[]
        ```

-   :lock:`/stack/:stackName/task`

    -   `POST` - create new task

        ```Typescript
        type Input = {
            name: string; // Name of task
            cron: string; // CRON timing string
            url: string; // URL of endpoint to POST
            headers?: Record<string, string> | undefined; // Additional headers to add to requests
        }

        type Output = {
            name: string;
            createdAt: Date;
            stackName: string;
            cron: string;
            url: string;
            headers: Record<string, string> | null;
            succesfullCalls: number;
            consecutiveFailures: number;
            lastSuccesfullCall: Date | null;
        }
        ```

-   :lock:`/stack/:stackName/task/:taskName`

    -   `GET` - get task

        ```Typescript
        type Output = {
            name: string;
            createdAt: Date;
            stackName: string;
            cron: string;
            url: string;
            headers: Record<string, string> | null;
            succesfullCalls: number;
            consecutiveFailures: number;
            lastSuccesfullCall: Date | null;
        }
        ```

    -   `PATCH` - update task

        ```Typescript
        type Input = {
            name?: string; // Name of task
            cron?: string; // CRON timing string
            url?: string; // URL of endpoint to POST
            headers?: Record<string, string> | undefined; // Additional headers to add to requests
        }

        type Output = {
            name: string;
            createdAt: Date;
            stackName: string;
            cron: string;
            url: string;
            headers: Record<string, string> | null;
            succesfullCalls: number;
            consecutiveFailures: number;
            lastSuccesfullCall: Date | null;
        }
        ```

    -   `DELETE` - delete task

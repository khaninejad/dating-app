import { handlerPath } from "@libs/handler-resolver";

export const createUserHandler = {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: '/user/create',
            },
        },
    ],
};
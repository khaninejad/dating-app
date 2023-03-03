import { handlerPath } from "@libs/handler-resolver";

export const createUserHandler = {
    handler: `${handlerPath(__dirname)}/createUserHandler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: '/user/create',
            },
        },
    ],
};

export const loginUserHandler = {
    handler: `${handlerPath(__dirname)}/loginUserHandler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: '/login',
            },
        },
    ],
};
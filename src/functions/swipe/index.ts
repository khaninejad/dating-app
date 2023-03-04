import { handlerPath } from "@libs/handler-resolver";

export const swipeHandler = {
    handler: `${handlerPath(__dirname)}/swipeHandler.main`,
    events: [
        {
            http: {
                method: 'post',
                path: '/swipe',
            },
        },
    ],
};
import { handlerPath } from "@libs/handler-resolver";

export const getProfileHandler = {
    handler: `${handlerPath(__dirname)}/handler.main`,
    events: [
        {
            http: {
                method: 'get',
                path: '/profiles',
            },
        },
    ],
};
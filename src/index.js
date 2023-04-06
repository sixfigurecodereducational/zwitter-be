import app from "./server.js";

export const handler = async (
    event,
    context
) => {
    return await app.run(event, context);
}
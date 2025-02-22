import pino from "pino";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const isDevelopment = process.env.NODE_ENV !== "production";

const logger = pino({
    level: process.env.LOG_LEVEL || "info",
    // In development, use pino-pretty for a more readable output.
    ...(isDevelopment && {
        transport: {
            target: "pino-pretty",
            options: {
                colorize: true,
                translateTime: "yyyy-mm-dd HH:MM:ss.l",
                ignore: "pid,hostname",
            },
        },
    }),
});

export default logger;

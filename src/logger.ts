import * as winston from "winston";

export const logger = winston.createLogger({
    level: "info",
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error", handleExceptions: true }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

export async function logErrorThenNull(message: any): Promise<null>
{
    logger.error(message);
    return null;
}

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

import * as winston from "winston";

export const logger = winston.createLogger({
    level: "info",
    transports: [
        new winston.transports.File({ filename: "error.log", level: "error", handleExceptions: true }),
        new winston.transports.File({ filename: "combined.log" }),
    ],
});

if (process.env.NODE_ENV !== "production") {
    logger.add(new winston.transports.Console({
        format: winston.format.simple(),
    }));
}

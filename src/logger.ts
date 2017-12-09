import * as winston from "winston";

const console = new winston.transports.Console();
const file = new winston.transports.File({ filename: "combined.log" });

// todo look into updating to 3.0 when types available
export const logger = new winston.Logger({
    transports: [
        console,
        file,
    ],
});

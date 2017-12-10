import {Client} from "discord.js";
import * as dotenv from "dotenv";
import {readdir} from "fs";
import {promisify} from "util";
import {Commands} from "./src/commands";
import {Mongo} from "./src/db";
import {logger} from "./src/logger";

const client = new Client();

async function connectDiscord() {
    try {
        await client.login(process.env.API_TOKEN || "");
    } catch {
        logger.error("Failed to login to Discord");
    }
}

const init = async () => {
    dotenv.config();

    // Register handlers
    const events = await promisify(readdir)("./src/events/");
    events.forEach((value) => {
        if (!value.endsWith(".js")) return;
        const eventName = value.split(".")[0];
        const event = require(`./src/events/${value}`);
        client.on(eventName, event.bind(null));
        logger.info(`Loaded event ${eventName}`);
    });

    // Register commands
    await Commands.loadAllCommands();

    // Begin connect
    await Promise.all([Mongo.connect(), connectDiscord()]);
};

init();

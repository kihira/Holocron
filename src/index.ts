import { Client } from "discord.js";
import * as dotenv from "dotenv";
import { readdir } from "fs";
import { promisify } from "util";
import { Commands } from "./commands";
import { Database } from "./db";
import { EmojiCache } from "./emoji";
import { logger } from "./logger";

const client = new Client();

const init = async () => {
    dotenv.config();

    // Register handlers
    try
    {
        const events = await promisify(readdir)("./dist/events/");
        events.forEach((value) => {
            if (!value.endsWith(".js")) return;
            const eventName = value.split(".")[0];
            const event = require(`./events/${value}`);
            client.on(eventName, event.bind(null));
            logger.info(`Loaded event ${eventName}`);
        });
    }
    catch (err)
    {
        logger.error(`Failed to load events: ${err}`);
        process.exit();
    }

    // Register commands
    client.on("ready", async () => {
        logger.info("Connected to Discord");
        await EmojiCache.init(client);
        await Commands.init(client);
    });

    // Begin connect
    await Database.connect();
    try {
        await client.login(process.env.API_TOKEN || "");
    } catch {
        logger.error("Failed to login to Discord");
        process.exit();
    }

    // Set status
    await client.user?.setPresence({activity: {name: "Star Wars RPG"}});
};

process.on('exit', () =>
{
    logger.info("Process exiting, attempting clean disconnect");
    client.destroy();
});

init();

import {Client} from "discord.js";
import * as dotenv from "dotenv";
import {readdir} from "fs";
import {promisify} from "util";
import {Commands} from "./src/commands";
import {Database} from "./src/db";
import * as emojiCache from "./src/emoji";
import {logger} from "./src/logger";

const client = new Client();

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
    client.on("ready", async () => {
        logger.info("Connected to Discord");
        await Commands.init(client);
        emojiCache.init(client);
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
    await client.user.setPresence({game: {name: "Star Wars RPG"} });
};

init();

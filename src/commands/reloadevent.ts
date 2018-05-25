import {Message} from "discord.js";
import {logger} from "../logger";
import {Argument, Command, PermissionLevel} from "./command";

export = class ReloadEvent extends Command {
    constructor() {
        super("reloadevent", [new Argument("event")], PermissionLevel.BOT_ADMIN);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        const eventName = args[0];
        try {
            delete require.cache[require.resolve(`../events/${eventName}.js`)];
            const event = require(`../events/${eventName}.js`);

            message.client.removeAllListeners(eventName);
            message.client.on(eventName, event.bind(null));
            logger.info(`Loaded event ${eventName}`);

            await message.reply(`The event \`${eventName}\` has been reloaded`);
        } catch (e) {
            logger.error(e);
            await message.reply(`Failed to reload event \`${eventName}\``);
        }
    }
};

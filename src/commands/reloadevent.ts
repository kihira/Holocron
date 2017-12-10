import {Message} from "discord.js";
import {Command} from "../command";
import {logger} from "../logger";

export = class ReloadEvent extends Command {
    constructor() {
        super("reloadevent");
    }
    public async run(message: Message): Promise<void> {
        if (message.author.id !== process.env.ADMIN) return;

        const split = message.content.split(" ");
        if (split.length < 2) {
            await message.reply("Please specify an event to reload");
            return;
        }

        const eventName = split[1];
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

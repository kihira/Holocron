import {Message} from "discord.js";
import {Commands} from "../commands";
import {Command} from "./command";

export = class Stop extends Command {
    constructor() {
        super("stop", []);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.author.id !== process.env.ADMIN) return;

        await message.client.destroy();
        process.exit(0);
    }
};

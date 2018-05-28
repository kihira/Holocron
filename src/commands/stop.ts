import {Message} from "discord.js";
import {Command, PermissionLevel} from "./command";

export = class Stop extends Command {
    constructor() {
        super("stop", undefined, PermissionLevel.BOT_ADMIN);
    }
    public async run(message: Message, args: string[]) {
        await message.client.destroy();
        process.exit(0);
    }
};

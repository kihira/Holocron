import { Message } from "discord.js";
import { Argument, Command, PermissionLevel } from "./command";

export = class Config extends Command {
    constructor() {
        super("config", [new Argument("setting"), new Argument("value")], PermissionLevel.GUILD_OWNER);
    }
    public async run(message: Message, args: string[]) {
        const setting = args[0];
        const value = args[1];
        switch (setting) {
            case "prefix":
                // TODO
                break;
            default:
                await message.reply(`Unknown setting \`${setting}\``);
                return;
        }
        await message.reply(`Updated setting \`${setting}\` to \`${value}\``);
    }
};

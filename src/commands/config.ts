import { Message } from "discord.js";
import { Database } from "../db";
import { Argument, Command, PermissionLevel } from "./command";

export = class Config extends Command {
    private readonly prefixes = ["!", "?", "%", "+", "-"];

    constructor() {
        super("config", [new Argument("setting"), new Argument("value")], PermissionLevel.GUILD_OWNER);
    }
    public async run(message: Message, args: string[]) {
        const setting = args[0];
        const value = args[1];
        switch (setting) {
            case "prefix":
                if (this.prefixes.indexOf(value) === -1) {
                    message.reply(`Invalid prefix! Only the following prefixes are supported \`${this.prefixes.join(" ")}\``);
                    return;
                }
                Database.Settings.collection("guilds").updateOne({_id: message.guild.id}, {prefix: value}, {upsert: true});
                message.reply(`Updated prefix to \`${value}\``);
                break;
            default:
                await message.reply(`Unknown setting \`${setting}\``);
                return;
        }
        await message.reply(`Updated setting \`${setting}\` to \`${value}\``);
    }
};

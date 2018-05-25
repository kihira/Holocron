import {Message} from "discord.js";
import {Commands} from "../commands";
import { PermissionLevel } from "../commands/command";

export = async (message: Message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;

    const split = message.content.split(/ +/g);
    const cmd = Commands.get(split[0].slice(1));
    if (cmd === undefined) {
        await message.reply(`Unknown command \`${split[0].slice(1)}\``);
        return;
    }
    // Check permissions
    if (cmd.permissionLevel !== PermissionLevel.ALL) {
        switch (cmd.permissionLevel) {
            case PermissionLevel.BOT_ADMIN:
                if (message.author.id !== process.env.ADMIN) {
                    await message.reply(`You do not have permission to use \`${split[0].slice(1)}\``);
                    return;
                }
                break;
            case PermissionLevel.GUILD_OWNER:
                if (message.author.id !== message.guild.ownerID) {
                    await message.reply(`You do not have permission to use \`${split[0].slice(1)}\``);
                    return;
                }
                break;
            default:
                break;
        }
    }
    // Checks args
    const args = split.slice(1);
    if (cmd.arguments !== undefined && cmd.arguments.length !== args.length) {
        await message.reply("Invalid number of arguments"); // todo show help for cmd
    }
    else await cmd.run(message, split.slice(1));
};

import { Message } from "discord.js";
import { Commands } from "../commands";
import { PermissionLevel } from "../commands/command";
import { logger } from "../logger";
import { GuildSettings } from "../settings";

export = async (message: Message): Promise<void> => {
    if (message.author.bot) return;
    if (message.guild == null) return;
    const settings = await GuildSettings.getSettings(message.guild);
    if (!message.content.startsWith(settings.prefix)) return;

    const split = message.content.split(/ +/g);
    const cmd = Commands.get(split[0].slice(1));
    if (cmd === undefined) {
        logger.verbose(`Unknown command: ${split[0].slice(1)}`);
        return;
    }

    // Reload the command if we're in a dev environment for faster development
    if (process.env.NODE_ENV === "development") {
        await Commands.reloadCommand(cmd);
    }

    // Check permissions
    if (cmd.permissionLevel !== PermissionLevel.ALL) {
        switch (cmd.permissionLevel) {
            case PermissionLevel.BOT_ADMIN:
                if (message.author.id !== process.env.ADMIN) {
                    await message.reply(`You do not have permission to use \`${cmd}\``);
                    return;
                }
                break;
            case PermissionLevel.GUILD_OWNER:
                if (message.author.id !== message.guild?.ownerID) {
                    await message.reply(`You do not have permission to use \`${cmd}\``);
                    return;
                }
                break;
            default:
                break;
        }
    }
    // Checks args
    const args = split.slice(1);
    if (cmd.arguments !== undefined && cmd.arguments.length > args.length) { // quick and dirty hack for now
        await message.reply("Invalid number of arguments"); // todo show help for cmd
    }
    else await cmd.run(message, split.slice(1));
};

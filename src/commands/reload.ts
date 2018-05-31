import { Message } from "discord.js";
import { Commands } from "../commands";
import { Argument, Command, PermissionLevel } from "./command";

export = class Reload extends Command {
    constructor() {
        super("reload", [new Argument("command")], PermissionLevel.BOT_ADMIN);
    }

    public async run(message: Message, args: string[]) {
        const cmdName = args[0];
        const cmd = Commands.get(cmdName);
        if (cmd === undefined) {
            await message.reply(`The command with the name/alias \`${cmdName}\` does not exist`);
            return;
        }
        await Commands.reloadCommand(cmd);
        await message.reply(`The command \`${cmdName}\` has been reloaded`);
    }
};

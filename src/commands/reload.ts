import {Message} from "discord.js";
import {Commands} from "../commands";
import {Command} from "./command";

export = class Reload extends Command {
    constructor() {
        super("reload");
    }
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.author.id !== process.env.ADMIN) return;

        if (args.length < 1) {
            await message.reply("Please specify a command to reload");
            return;
        }
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

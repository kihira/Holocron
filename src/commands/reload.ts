import {Message} from "discord.js";
import {Commands} from "../commands";
import {Argument, Command} from "./command";

export = class Reload extends Command {
    constructor() {
        super("reload", [new Argument("command")]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        if (message.author.id !== process.env.ADMIN) return;

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

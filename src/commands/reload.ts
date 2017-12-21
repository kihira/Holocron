import {Message} from "discord.js";
import {Command} from "../command";
import {Commands} from "../commands";

export = class Reload extends Command {
    constructor() {
        super("reload");
    }
    public async run(message: Message): Promise<void> {
        if (message.author.id !== process.env.ADMIN) return;

        const split = message.content.split(" ");
        if (split.length < 2) {
            await message.reply("Please specify a command to reload");
            return;
        }
        const cmdName = split[1];
        const cmd = Commands.get(cmdName);
        if (cmd === undefined) {
            await message.reply(`The command with the name/alias \`${cmdName}\` does not exist`);
            return;
        }
        await Commands.reloadCommand(cmd);
        await message.reply(`The command \`${cmdName}\` has been reloaded`);
    }
};

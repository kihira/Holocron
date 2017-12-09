import {Message} from "discord.js";
import {Command} from "../command";
import {Commands} from "../commands";

export default class Reload extends Command {
    constructor() {
        super("reload");
    }
    public async run(message: Message): Promise<void> {
        if (message.member.user.id !== process.env.ADMIN) return;

        const split = message.content.split(" ");
        if (split.length < 2) {
            await message.reply("Please specify command to reload");
            return;
        }
        const cmd = Commands.get(split[1]);
        if (cmd === undefined) {
            await message.reply(`The command with the name/alias ${split[1]} does not exist`);
            return;
        }
        Commands.reloadCommand(cmd);
        await message.reply(`The command ${split[0]} has been reloaded`);
    }
}

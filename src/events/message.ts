import {Message} from "discord.js";
import {Commands} from "../commands";

export = async (message: Message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith("!")) return;

    const split = message.content.split(/ +/g);
    const cmd = Commands.get(split[0].slice(1));
    if (cmd === undefined) {
        await message.reply(`Unknown command \`${split[0].slice(1)}\``);
        return;
    }
    const args = split.slice(1);
    if (cmd.arguments.length !== args.length) {
        await message.reply("Invalid number of arguments"); // todo show help for cmd
    }
    else await cmd.run(message, split.slice(1));
};

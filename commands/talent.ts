import {Message} from "discord.js";
import {Command} from "./command";

export class Talent extends Command {
    public run(message: Message): void {
        message.reply("Talent!");
    }
}

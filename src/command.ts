import {Client, Message} from "discord.js";
import {isArray} from "util";

export abstract class Command {
    public readonly name: string;
    public readonly aliases: string[];

    constructor(name: string | string[]) {
        if (isArray(name)) {
            this.name = name[0];
            this.aliases = name.slice(1);
        }
        else this.name = name;
    }
    public abstract async run(message: Message, args: string[]): Promise<void>;
    public async init(client: Client): Promise<void> {}
}

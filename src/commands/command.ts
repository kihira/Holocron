import {Client, Message} from "discord.js";
import {isArray} from "util";

export abstract class Command {
    public readonly name: string;
    public readonly aliases: string[];
    public readonly arguments: Argument[];

    constructor(name: string, args: Argument[], ...aliases: string[]) {
        this.name = name;
        this.arguments = args;
        if (aliases !== undefined) this.aliases = aliases;
    }
    public abstract async run(message: Message, args: string[]): Promise<void>;
    public async init(client: Client): Promise<void> {}
}

// tslint:disable-next-line:max-classes-per-file
export class Argument {
    public readonly name: string;
    public readonly description: string;
    public readonly required: boolean;

    constructor(name: string, description?: string, required: boolean = true) {
        this.name = name;
        if (description !== undefined) this.description = description;
        this.required = required;
    }
}

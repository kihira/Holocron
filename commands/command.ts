import {Message} from "discord.js";

export abstract class Command {
    public readonly name: string;

    constructor(name: string) {
        this.name = name;
    }
    public abstract run(message: Message): void;
}

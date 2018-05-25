import {Client, Message} from "discord.js";

export abstract class Command {
    public readonly name: string;
    public readonly aliases: string[] | undefined;
    public readonly arguments: Argument[] | undefined;
    public readonly permissionLevel: PermissionLevel;

    constructor(name: string | string[], args?: Argument[], permissionLevel: PermissionLevel = PermissionLevel.ALL) {
        if (typeof(name) === "string") {
            this.name = name;
        }
        else {
            this.name = name[0];
            this.aliases = name.slice(1);
        }
        this.permissionLevel = permissionLevel;
        this.arguments = args;
    }

    public abstract async run(message: Message, args: string[]): Promise<void>;
    // tslint:disable-next-line:no-empty
    public async init(client: Client): Promise<void> {}
}

export enum PermissionLevel {
    BOT_ADMIN,
    GUILD_OWNER,
    ALL,
}

// tslint:disable-next-line:max-classes-per-file
export class Argument {
    public readonly name: string;
    public readonly description: string;
    public readonly required: boolean;

    constructor(name: string, description?: string, required: boolean = true) {
        this.name = name;
        this.description = description || "";
        this.required = required;
    }
}

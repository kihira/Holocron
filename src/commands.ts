import { Client, Collection } from "discord.js";
import { readdir } from "fs";
import { promisify } from "util";
import { Command } from "./commands/command";
import { logger } from "./logger";

class CommandRegistry {
    private commands: Collection<string, Command> = new Collection<string, Command>();
    private client!: Client;

    public async init(client: Client) {
        this.client = client;
        await this.loadAllCommands();
    }

    public register(command: Command) {
        if (this.commands.has(command.name)) {
            logger.error(`Already registered a command with the name ${command.name}`);
        }
        if (command.aliases !== undefined && command.aliases.length > 0) {
            command.aliases.forEach((value) => {
                if (this.commands.has(value)) {
                    logger.error(`Already registered a command with the name/alias ${value}`);
                    return;
                }
            });
        }
        // Register the command and aliases
        this.commands.set(command.name, command);
        if (command.aliases !== undefined) {
            command.aliases.forEach((value) => {
                this.commands.set(value, command);
            });
        }
        logger.info(`Loaded command: ${command.name}`);
    }

    public get(name: string): Command | undefined {
        return this.commands.get(name);
    }

    public async loadAllCommands() {
        const list = await promisify(readdir)("./dist/commands/");
        list.forEach(async (value) => {
            if (value.endsWith(".js")) {
                await this.loadCommand(value);
            }
        });
    }

    public async reloadCommand(command: Command) {
        this.unloadCommand(command);
        await this.loadCommand(command.name);
    }

    private async loadCommand(name: string) {
        try {
            logger.info(`Loading command: ${name}`);
            let cmd = require(`./commands/${name}`);
            if (cmd.default != null) cmd = cmd.default;
            if (cmd.prototype instanceof Command) {
                const obj = new cmd();
                this.register(obj);
                await obj.init(this.client);
            }
        } catch (e) {
            logger.error(`Failed to load command ${name}: ${e}`);
        }
    }

    private unloadCommand(command: Command) {
        if (command.aliases !== undefined) {
            command.aliases.forEach((value) => {
                this.commands.delete(value);
            });
        }
        this.commands.delete(command.name);
        delete require.cache[require.resolve(`./commands/${command.name}.js`)];
        logger.info(`Unloaded command: ${command.name}`);
    }
}

export const Commands = new CommandRegistry();

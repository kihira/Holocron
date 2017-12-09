import {Collection} from "discord.js";
import {readdir} from "fs";
import {Command} from "./command";
import {logger} from "./logger";
import {promisify} from "util";

class CommandRegistry {
    private commands: Collection<string, Command> = new Collection<string, Command>();

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
        const list = await promisify(readdir)("./src/commands/");
        list.forEach((value) => {
            if (value.endsWith(".js")) {
                this.loadCommand(value);
            }
        });
    }

    public reloadCommand(command: Command) {
        this.unloadCommand(command);
        this.loadCommand(command.name);
    }

    private loadCommand(name: string) {
        try {
            const cmd = require(`./commands/${name}`);
            logger.info(`Loading command: ${name}`);
            this.register(new cmd.default());
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

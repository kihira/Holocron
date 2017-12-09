import {Collection} from "discord.js";
import {Command} from "./command";

class CommandRegistry {
    private commands: Collection<string, Command> = new Collection<string, Command>();

    public register(command: Command) {
        if (this.commands.has(command.name)) {
            console.error(`Already registered a command with the name ${command.name}`);
        }
        if (command.aliases !== undefined && command.aliases.length > 0) {
            command.aliases.forEach((value) => {
                if (this.commands.has(value)) {
                    console.error(`Already registered a command with the name/alias ${value}`);
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
    }

    public get(name: string): Command | undefined {
        return this.commands.get(name);
    }
}

export const Commands = new CommandRegistry();

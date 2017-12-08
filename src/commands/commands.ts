import {Collection} from "discord.js";
import {Command} from "./command";

export class Commands {
    private static commands: Collection<string, Command>;

    public static register(command: Command) {
        if (command.name in this.commands) {
            console.error(`Already registered a command with the name ${command.name}`);
        }
        if (command.aliases.length > 0) {
            command.aliases.forEach((value) => {
                if (this.commands.has(value)) {
                    console.error(`Already registered a command with the name/alias ${value}`);
                    return;
                }
            });
        }
        // Register the command and aliases
        this.commands.set(command.name, command);
        command.aliases.forEach((value) => {
            this.commands.set(value, command);
        });
    }
}
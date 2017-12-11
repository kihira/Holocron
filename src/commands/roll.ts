import {Client, Collection, Emoji, Message} from "discord.js";
import * as _ from "lodash";
import {Command} from "../command";
import {logger} from "../logger";

interface Die {
    success?: number;
    advantage?: number;
    triumph?: number;
    failure?: number;
    threat?: number;
    despair?: number;
    light?: number;
    dark?: number;
}

const diceValues = new Collection<string, Die[]>([
    ["ability", [
        {},
        {advantage: 1},
        {success: 2},
        {success: 1},
        {advantage: 2},
        {success: 1},
        {success: 1, advantage: 1},
        {advantage: 1},
    ]],
    ["proficency", [
        {},
        {success: 1},
        {advantage: 2},
        {success: 1, advantage: 1},
        {success: 1, advantage: 1},
        {success: 2},
        {success: 1, advantage: 1},
        {advantage: 1},
        {success: 2},
        {success: 1},
        {advantage: 2},
        {triumph: 1},
    ]],
    ["difficulty", [
        {},
        {failure: 1, threat: 1},
        {threat: 1},
        {failure: 2},
        {threat: 2},
        {threat: 1},
        {failure: 1},
        {threat: 1},
    ]],
    ["challenge", [
        {},
        {failure: 1},
        {threat: 1},
        {failure: 2},
        {failure: 1, threat: 1},
        {threat: 2},
        {failure: 1, threat: 1},
        {failure: 2},
        {threat: 1},
        {failure: 1},
        {threat: 2},
        {despair: 1},
    ]],
    ["boost", [
        {},
        {},
        {advantage: 1},
        {success: 1, advantage: 1},
        {success: 1},
        {advantage: 2},
    ]],
    ["setback", [
        {},
        {},
        {failure: 1},
        {failure: 1},
        {threat: 1},
        {threat: 1},
    ]],
    ["force", [
        {light: 2},
        {light: 2},
        {dark: 1},
        {light: 1},
        {dark: 1},
        {dark: 1},
        {dark: 2},
        {light: 2},
        {dark: 1},
        {dark: 1},
        {light: 1},
        {dark: 1},
    ]],
]);
const symbolEmoji = new Collection<string, Emoji>();

export = class Roll extends Command {
    private diceRegex: RegExp = /(\d{1,2})([a-z]+)/;

    constructor() {
        super(["roll", "r"]);
    }

    public async init(client: Client): Promise<void> {
        if (process.env.EMOJI_GUILD === undefined) {
            logger.error("Emoji guild not defined, emoji's will not work");
            return;
        }
        const guild = client.guilds.get(process.env.EMOJI_GUILD || "");
        if (guild === undefined) {
            logger.error(`Unable to find guild ${process.env.EMOJI_GUILD} for emoji's`);
            return;
        }
        const symbolsIds: {[key: string]: string} = {success: "id", failure: "id"}; // todo actual ids and move to config
        for (const key in symbolsIds) {
            if (symbolsIds.hasOwnProperty(key)) {
                const emoji = guild.emojis.get(symbolsIds[key]);
                if (emoji === undefined) {
                    logger.error(`Unable to find emoji ${symbolsIds[key]} for ${key}`);
                    return;
                }
                symbolEmoji.set(key, emoji);
            }
        }
    }

    public async run(message: Message): Promise<void> {
        if (message.author.id !== process.env.ADMIN) return;

        let args = message.content.split(" ");
        if (args.length < 2) {
            await message.reply("Please specify dice to roll");
            return;
        }
        args = args.splice(1);

        const diceResults: Die[] = [];

        for (const arg of args) {
            const match = arg.match(this.diceRegex);
            if (match != null) {
                if (match.length < 3) {
                    await message.reply("Invalid dice roll");
                    return;
                }
                this.rollDice(match[2], parseInt(match[1], 10), diceResults);
            }
        }
        const results: Die = this.calcResult(diceResults);
        await message.reply(message.guild.emojis.find("name", "abilityAA").toString());

        logger.verbose(`Roll Results`, {dice: diceResults, result: results});
    }

    private rollDice(dice: string, count: number, results: Die[]) {
        const values = diceValues.get(dice);
        if (values === undefined) return;
        for (let i = 0; i < count; i++) {
            const result = Math.floor(Math.random() * values.length);
            // _.merge(results, values[result]);
            results.push(values[result]);
        }
    }

    private calcResult(dice: Die[]): Die {
        const results: Die = {};

        dice.forEach((value) => {
            _.merge(results, value);
        });
        // Calc success/failure
        if (results.success !== undefined && results.failure !== undefined) {
            if (results.success > results.failure) {
                results.success -= results.failure;
                results.failure = 0;
            }
            else if (results.failure > results.success) {
                results.failure -= results.success;
                results.success = 0;
            }
            else {
                results.failure = 0;
                results.success = 0;
            }
        }
        if (results.advantage !== undefined && results.threat !== undefined) {
            // Advantage/disadvantage
            if (results.advantage > results.threat) {
                results.advantage -= results.threat;
                results.threat = 0;
            }
            else if (results.threat > results.advantage) {
                results.threat -= results.advantage;
                results.advantage = 0;
            }
            else {
                results.advantage = 0;
                results.threat = 0;
            }
        }

        return results;
    }
};

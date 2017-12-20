import {Client, Collection, Emoji, Message} from "discord.js";
import * as _ from "lodash";
import {Command} from "../command";
import {logger} from "../logger";

interface Values {
    success?: number;
    advantage?: number;
    triumph?: number;
    failure?: number;
    threat?: number;
    despair?: number;
    light?: number;
    dark?: number;
}

interface DieSide extends Values {
    emoji: string;
}

const diceValues = new Collection<string, DieSide[]>([
    ["ability", [
        {emoji: "abilityBlank"},
        {emoji: "abilityA", advantage: 1},
        {emoji: "abilitySS", success: 2},
        {emoji: "abilityS", success: 1},
        {emoji: "abilityAA", advantage: 2},
        {emoji: "abilityS", success: 1},
        {emoji: "abilitySA", success: 1, advantage: 1},
        {emoji: "abilityA", advantage: 1},
    ]],
    ["proficiency", [
        {emoji: "proficiencyBlank"},
        {emoji: "proficiencyS", success: 1},
        {emoji: "proficiencyAA", advantage: 2},
        {emoji: "proficiencySA", success: 1, advantage: 1},
        {emoji: "proficiencySA", success: 1, advantage: 1},
        {emoji: "proficiencySS", success: 2},
        {emoji: "proficiencySA", success: 1, advantage: 1},
        {emoji: "proficiencyA", advantage: 1},
        {emoji: "proficiencySS", success: 2},
        {emoji: "proficiencyS", success: 1},
        {emoji: "proficiencyAA", advantage: 2},
        {emoji: "proficiencyT", triumph: 1},
    ]],
    ["difficulty", [
        {emoji: "difficultyBlank"},
        {emoji: "difficultyFT", failure: 1, threat: 1},
        {emoji: "difficultyT", threat: 1},
        {emoji: "difficultyFF", failure: 2},
        {emoji: "difficultyTT", threat: 2},
        {emoji: "difficultyT", threat: 1},
        {emoji: "difficultyF", failure: 1},
        {emoji: "difficultyT", threat: 1},
    ]],
    ["challenge", [
        {emoji: "challengeBlank"},
        {emoji: "challengeF", failure: 1},
        {emoji: "challengeT", threat: 1},
        {emoji: "challengeFF", failure: 2},
        {emoji: "challengeFT", failure: 1, threat: 1},
        {emoji: "challengeTT", threat: 2},
        {emoji: "challengeFT", failure: 1, threat: 1},
        {emoji: "challengeFF", failure: 2},
        {emoji: "challengeT", threat: 1},
        {emoji: "challengeF", failure: 1},
        {emoji: "challengeTT", threat: 2},
        {emoji: "challengeD", despair: 1},
    ]],
    ["boost", [
        {emoji: "boostBlank"},
        {emoji: "boostBlank"},
        {emoji: "boostA", advantage: 1},
        {emoji: "boostSA", success: 1, advantage: 1},
        {emoji: "boostS", success: 1},
        {emoji: "boostAA", advantage: 2},
    ]],
    ["setback", [
        {emoji: "setbackBlank"},
        {emoji: "setbackBlank"},
        {emoji: "setbackF", failure: 1},
        {emoji: "setbackF", failure: 1},
        {emoji: "setbackT", threat: 1},
        {emoji: "setbackT", threat: 1},
    ]],
    ["force", [
        {emoji: "forceLL", light: 2},
        {emoji: "forceLL", light: 2},
        {emoji: "forceD", dark: 1},
        {emoji: "forceL", light: 1},
        {emoji: "forceD", dark: 1},
        {emoji: "forceD", dark: 1},
        {emoji: "forceDD", dark: 2},
        {emoji: "forceLL", light: 2},
        {emoji: "forceD", dark: 1},
        {emoji: "forceD", dark: 1},
        {emoji: "forceL", light: 1},
        {emoji: "forceD", dark: 1},
    ]],
]);
const symbolEmoji = new Collection<string, string>([["success", "success"]]);

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
        // Find and load emoji for dice sides
        diceValues.forEach((diceSides, key) => {
            diceSides.forEach((value) => {
                const emoji = guild.emojis.find("name", value.emoji);
                if (emoji === undefined || emoji === null) {
                    logger.error(`Unable to find emoji ${value.emoji} for ${key}`);
                }
                else {
                    logger.verbose(`Loaded emoji ${value.emoji} for ${key}`);
                    value.emoji = emoji.toString(); // Assign it to something we can use in text
                }
            });
        });

        symbolEmoji.forEach((value, key) => {
            const emoji = guild.emojis.find("name", value);
            if (emoji === undefined || emoji === null) {
                logger.error(`Unable to find emoji ${value} for ${key}`);
            }
            else {
                logger.verbose(`Loaded emoji ${value} for ${key}`);
                symbolEmoji.set(key, emoji.toString()); // Assign it to something we can use in text
            }
        });
    }

    public async run(message: Message): Promise<void> {
        if (message.author.id !== process.env.ADMIN) return;

        let args = message.content.split(" ");
        if (args.length < 2) {
            await message.reply("Please specify dice to roll");
            return;
        }
        args = args.splice(1);

        const diceResults: Values[] = [];

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
        const results: Values = this.calcResult(diceResults);
        await message.reply(message.guild.emojis.find("name", "abilityAA").toString());

        logger.verbose(`Roll Results`, {dice: diceResults, result: results});
    }

    private rollDice(dice: string, count: number, results: Values[]) {
        const values = diceValues.get(dice);
        if (values === undefined) return;
        for (let i = 0; i < count; i++) {
            const result = Math.floor(Math.random() * values.length);
            // _.merge(results, values[result]);
            results.push(values[result]);
        }
    }

    private calcResult(rolls: Values[]): Values {
        const results: Values = {};

        rolls.forEach((value) => {
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

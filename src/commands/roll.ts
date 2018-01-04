import { Client, Collection, Message, RichEmbed } from "discord.js";
import { defaultTo, forIn, mergeWith } from "lodash";
import { emojiMap } from "../emoji";
import { logger } from "../logger";
import { defaultParse } from "../util";
import { Argument, Command } from "./command";

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

export = class Roll extends Command {
    private diceRegex: RegExp = /(\d{0,2})([a-z]+)/;
    private diceValues = new Collection<string, DieSide[]>([
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

    constructor() {
        super("roll", [new Argument("dice")], "r");
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
    }

    public async run(message: Message, args: string[]): Promise<void> {
        const diceResults: DieSide[] = [];

        for (const arg of args) {
            const match = arg.match(this.diceRegex);
            if (match != null) {
                if (match.length < 3) {
                    await message.reply("Invalid dice roll");
                    return;
                }
                const dice = this.diceValues.get(match[2]);
                if (dice === undefined) {
                    await message.reply(`Invalid dice \`${match[2]}\``);
                    return;
                }
                this.rollDice(dice, defaultParse(match[1], 1), diceResults);
            }
        }
        const results: Values = this.calcResult(diceResults);
        const displayResults = this.displayResults(results);
        const embed = new RichEmbed();
        embed.setAuthor(message.member.displayName, message.author.avatarURL);
        embed.setColor("DARK_RED");
        embed.addField("Roll", diceResults.map((value) => value.emoji).join(""));
        if (displayResults.length > 0) embed.addField("Results", displayResults);
        await message.channel.send(embed);

        logger.verbose(`Roll Results`, {dice: diceResults, result: results});
    }

    private rollDice(dice: DieSide[], count: number, results: DieSide[]) {
        for (let i = 0; i < count; i++) {
            const result = Math.floor(Math.random() * dice.length);
            results.push(dice[result]);
        }
    }

    private calcResult(rolls: DieSide[]): Values {
        const results: Values = {};

        rolls.forEach((value) => {
            mergeWith(results, value, (objValue, srcValue) => {
                return defaultTo(objValue, 0) + srcValue;
            });
        });
        delete (results as DieSide).emoji; // The merge causes emoji to be copied over, delete it

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

    private displayResults(results: Values): string {
        let out = "";
        forIn(results, (value, key) => {
            out += (emojiMap.get(key) || "").repeat(defaultTo(value, 0));
        });
        return out;
    }
};

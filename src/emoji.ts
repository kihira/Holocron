import { Client } from "discord.js";
import { logger } from "./logger";

// Simple file for storing a cache of emojis so no need to constantly look them up
// Also maps non emoji names to emoji

export async function init(client: Client) {
    const guild = client.guilds.get(process.env.EMOJI_GUILD || "");
    if (process.env.EMOJI_GUILD === undefined || guild === undefined) {
        logger.error("Emoji guild not defined or invalid guild ID, emoji's will not work");
        return;
    }

    emojiMap.forEach((value, key) => {
        const emoji = guild.emojis.find("name", value);
        if (emoji === undefined || emoji === null) {
            logger.error(`Unable to find emoji ${value} for ${key}`);
        }
        else {
            logger.verbose(`Loaded emoji ${value} for ${key}`);
            emojiMap.set(key, emoji.toString());
        }
    });

    // Load all emojis from the guild
    guild.emojis.forEach((element) => {
        emojiMap.set(element.name, element.toString());
    });
}

export const emojiMap = new Map<string, string>([
    ["light", "⚪"],
    ["dark", "⚫"],
    ["BOOST", "boost"],
    ["SUCCESS", "success"],
    ["ADVANTAGE", "advantage"],
    ["TRIUMPH", "triumph"],
    ["SETBACK", "setback"],
    ["FAILURE", "failure"],
    ["THREAT", "threat"],
    ["DESPAIR", "despair"],
]);

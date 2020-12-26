import { Client } from "discord.js";
import { logErrorThenNull, logger } from "./logger";

// Simple file for storing a cache of emojis so no need to constantly look them up
// Also maps non emoji names to emoji

class EmojiRegistery {
    private emojiMap: Map<string, string> = new Map<string, string> ([
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

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {}

    public async init(client: Client) {
        const guild = await client.guilds.fetch(process.env.EMOJI_GUILD || "").catch(logErrorThenNull);
        if (process.env.EMOJI_GUILD === undefined || guild === null) {
            logger.error("Emoji guild not defined or invalid guild ID, emoji's will not work");
            return;
        }

        this.emojiMap.forEach((value, key) => {
            const emoji = guild.emojis.cache.find(e => e.name == value);
            if (emoji === undefined || emoji === null) {
                logger.error(`Unable to find emoji ${value} for ${key}`);
            }
            else {
                logger.verbose(`Loaded emoji ${value} for ${key}`);
                this.emojiMap.set(key, emoji.toString());
            }
        });

        // Load all emojis from the guild
        guild.emojis.cache.forEach(element => {
            this.emojiMap.set(element.name, element.toString());
        });
    }

    public get(key: string): string {
        return this.emojiMap.get(key) || "";
    }
}

export const EmojiCache = new EmojiRegistery();

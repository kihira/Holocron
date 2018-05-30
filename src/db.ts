import { ObjectID } from "bson";
import { Message } from "discord.js";
import { Collection, Db, FilterQuery, MongoClient } from "mongodb";
import { logger } from "./logger";
import { idToName } from "./util";

class Mongo {
    public Data!: Db;
    public Settings!: Db;
    private client!: MongoClient;

    public async connect() {
        try {
            this.client = await MongoClient.connect(process.env.MONGO_CONN || "mongodb://localhost:27017");
            logger.info("Connected to Mongo");

            this.Data = this.client.db(process.env.DB_DATA || "data");
            this.Settings = this.client.db(process.env.DB_SETTINGS || "settings");
        } catch {
            logger.error("Failed to connect to Mongo");
            process.exit();
        }
    }
}

export const Database = new Mongo();

export interface Entry {
    _id: string | ObjectID;
    index: string[];
    description?: string;
    image?: string;
    name?: string;
}

const choiceEmojis: string[] = [
    "🇦", "🇧", "🇨", "🇩", "🇪",
];

/**
 * A function that search the collection based on the filter.
 * If multiple results are returned, the user is prompted to select a choice and that choice is returned
 * If the user does not select a choice, undefined is returned
 * TODO keep it in this file?
 * @param collection Collection to search
 * @param filter The Query
 */
export async function findOne<T extends Entry>(collection: Collection, filter: FilterQuery<T>, message: Message): Promise<T | undefined> {
    const results = await collection.find<T>(filter).limit(5);
    const count = await results.count();

    if (count === 0) {
        return undefined;
    }
    // Multiple results
    else if (count > 1) {
        // Map results to emoji reactions and build message
        const emojiToResult = new Map<string, T>();
        let contents = `${count} results found, please select one:\n`;
        for (let i = 0; i < count; i++) {
            const value = await results.next();
            emojiToResult.set(choiceEmojis[i], value);
            const name = value.name ? value.name : idToName(value._id as string);
            contents += `${choiceEmojis[i]} ${name}\n`;
        }

        // Send choice message and collect reactions
        const selectorMessage = await message.channel.send(contents) as Message;
        for (const emoji of emojiToResult.keys()) {
            // TODO best way of doing this? might do too many API calls
            await selectorMessage.react(emoji);
        }
        const reactions = await selectorMessage.awaitReactions((reaction, user) => user.id === message.author.id, { time: 10, max: 1 });

        // Remove selection message and parse results
        if (selectorMessage.deletable) {
            await selectorMessage.delete();
        }
        if (reactions.size === 0) {
            await message.channel.send("Option selection timed out");
            return undefined;
        }
        // todo set data to the one that was selected
        return emojiToResult.get("");
    }
    // One result
    return results.next();
}

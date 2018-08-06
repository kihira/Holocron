import { ObjectID } from "bson";
import { Client, Message, Snowflake } from "discord.js";
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

export interface SelectorResult<T> { msg?: Message; item: T; }

/**
 * A function that search the collection based on the filter.
 * If multiple results are returned, the user is prompted to select a choice and that choice is returned as well as the message ysed
 * If the user does not select a choice, undefined is returned
 * @param collection Collection to search
 * @param filter The Query
 */
export async function findOne<T extends Entry>(collection: Collection, filter: FilterQuery<T>, message: Message): Promise<SelectorResult<T> | undefined> {
    const results = await collection.find<T>(filter).limit(5);
    const count = await results.count(true);

    if (count === 0) {
        return undefined;
    }
    else if (count > 1) { // Multiple results
        const choices: T[] = [];
        let contents = `${count} results found, please type out the number for your selection:\n\n`;

        for (let i = 0; i < count; i++) {
            const value = await results.next();
            if (value == null) break;
            choices.push(value);
            contents += `**${i + 1}**: ${value.name ? value.name : idToName(value._id as string)}\n`;
        }

        // Send choice message and collect reactions
        const selectorMessage = await message.channel.send(contents) as Message;

        try {
            // Prompt user to choose selection
            return new Promise<SelectorResult<T>>(async (resolve, reject) => {
                const timeout = message.client.setTimeout(() => {
                        message.client.removeListener("message", listener);
                        reject("Selection timed out");
                    }, 10000);

                const listener = async (msg: Message) => {
                    if (msg.author.id === message.author.id && msg.channel.id === message.channel.id) {
                        message.client.removeListener("message", listener);
                        message.client.clearTimeout(timeout);

                        // Check if the selection is valid
                        const selection = parseInt(msg.content, 10);
                        if (!isNaN(selection) && selection <= choices.length && selection > 0) {
                            if (msg.deletable) {
                                await msg.delete();
                            }
                            resolve({
                                item: choices[selection - 1],
                                msg: selectorMessage,
                            });
                        }
                        else reject("Invalid selection");
                    }
                };
                message.client.on("message", listener);
            });
        } catch (reason) {
            await selectorMessage.edit(reason);
        }

        return undefined;
    }
    return {
        item: await results.next() as T,
        msg: undefined,
    }; // One result
}

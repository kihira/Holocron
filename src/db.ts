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
    const count = await results.count(true);

    if (count === 0) {
        return undefined;
    }
    // Multiple results
    else if (count > 1) {
        // Map results to emoji reactions and build message
        const choices: T[] = [];
        let contents = `${count} results found, please type out the number for your selection:\n\n`;
        for (let i = 0; i < count; i++) {
            const value = await results.next();
            choices.push(value);
            contents += `**${i + 1}**: ${value.name ? value.name : idToName(value._id as string)}\n`;
        }

        // Send choice message and collect reactions
        const selectorMessage = await message.channel.send(contents) as Message;

        // todo this seems a bit messy, clean up?
        try {
            // Prompt user to choose selection
            // split into a class?
            return await new Promise<T>((resolve, reject) => {
                const timeout = message.client.setTimeout(() => {
                        message.client.removeListener("message", listener);
                        reject("Selection timed out");
                    }
                    , 10000);
                const listener = (msg: Message) => {
                    if (msg.author.id === message.author.id && msg.channel.id === message.channel.id) {
                        message.client.removeListener("message", listener);
                        message.client.clearTimeout(timeout);

                        // Check if the selection is valid
                        const selection = parseInt(msg.content, 10);
                        if (!isNaN(selection) && selection <= choices.length && selection > 0) {
                            if (msg.deletable) {
                                msg.delete();
                            }
                            resolve(choices[selection - 1]);
                        }
                        else reject("Invalid selection");
                    }
                };
                message.client.on("message", listener);
            });
        } catch (reason) {
            message.channel.send(reason);
        } finally {
            // Remove selection message
            if (selectorMessage.deletable) {
                await selectorMessage.delete();
            }
        }

        return undefined;
    }
// One result
    return results.next();
}

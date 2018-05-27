import {ObjectID} from "bson";
import {Db, MongoClient} from "mongodb";
import {logger} from "./logger";

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
}

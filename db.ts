import {Db, MongoClient} from "mongodb";

export class Mongo {
    public static Data: Db;
    public static Settings: Db;

    public static async connect() {
        try {
            this.client = await MongoClient.connect(process.env.MONGO_CONN || "mongodb://localhost:27017");
            console.log("Connected to Mongo");

            this.Data = this.client.db(process.env.DB_DATA || "data");
            this.Settings = this.client.db(process.env.DB_SETTINGS || "settings");
        } catch {
            console.error("Failed to connect to Mongo");
        }
    }

    private static client: Db;
}

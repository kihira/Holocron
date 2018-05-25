import { Guild } from "discord.js";
import { Database } from "./db";
import { IGuildSettings } from "./IGuildSettings";

// Bot settings
export const userBotRatioThreshold: number = 10;

// TODO see if we can't merge Guild class declerations with our own so we can just store it on the object itself.
// Ideally without too many hacks
class Settings {
    private cache: Map<string, IGuildSettings> = new Map();
    private default: IGuildSettings = {prefix: "!"};

    public async getSettings(guild: Guild) {
        return this._getSettings(guild.id);
    }

    /**
     * Internal function to get the settings from a guild ID
     * @param guild The guild
     */
    private async _getSettings(guild: string): Promise<IGuildSettings> {
        let settings = this.cache.get(guild);
        if (settings == null) {
            await this.loadSettings(guild);
            settings = this.cache.get(guild);
        }
        // Can assert its not undefined based on loadSettings;
        return settings as IGuildSettings;
    }

    /**
     * Loads the guild settings from the database, overwriting what is in the cache.
     * Loads the default settings if it does not exist in database
     * @param guild The guild
     */
    private async loadSettings(guild: string) {
        let settings = await Database.Settings.collection("guilds").findOne<IGuildSettings>({_id: guild});
        if (settings == null) {
            settings = this.default;
        }
        this.cache.set(guild, settings);
    }

    /**
     * Saves the settings from the cache to the database, or does nothing if there are no settings
     * @param guild The guild
     */
    private async saveSettings(guild: string) {
        const settings = this.cache.get(guild);
        if (settings == null) {
            return;
        }
        await Database.Settings.collection("guilds").updateOne({_id: guild}, settings);
    }
}

export const GuildSettings = new Settings();

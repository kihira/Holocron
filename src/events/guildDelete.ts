import { Guild } from "discord.js";
import { logger } from "../logger";

export = async (guild: Guild): Promise<void> => {
    logger.verbose(`Removed from guild (${guild.name})`, { service: "DiscordJs" });
    // todo delete settings
};

import { Guild } from "discord.js";
import { logger } from "../logger";

export = async (guild: Guild) => {
    logger.verbose(`Removed from guild (${guild.name})`);
    // todo delete settings
};

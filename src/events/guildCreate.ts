import { Guild } from "discord.js";
import { logger } from "../logger";

export = async (guild: Guild): Promise<void> => {
    logger.verbose(`Joined Guild (${guild.name})`);
};

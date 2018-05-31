import { Guild } from "discord.js";
import { logger } from "../logger";

export = async (guild: Guild) => {
    logger.verbose(`Joined Guild (${guild.name})`);
};

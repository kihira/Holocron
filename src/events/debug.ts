import { logger } from "../logger";

export = async (info: string): Promise<void> => {
    logger.debug(info, { service: "DiscordJs" });
};

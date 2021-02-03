import { logger } from "../logger";

export = async (info: string): Promise<void> => {
    logger.error(info, { service: "DiscordJs" });
};

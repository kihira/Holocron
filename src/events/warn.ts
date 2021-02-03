import { logger } from "../logger";

export = async (info: string): Promise<void> => {
    logger.warn(info, { service: "DiscordJs" });
};

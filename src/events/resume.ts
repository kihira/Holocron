import { logger } from "../logger";

export = async (replayed: number): Promise<void> => {
    logger.warn(`Reconnected to WebSocket, replaying ${replayed} events`, { service: "DiscordJs" });
};

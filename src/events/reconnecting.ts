import { logger } from "../logger";

export = async (): Promise<void> => {
    logger.error("Disconnected from WebSocket, attempting to reconnect", { service: "DiscordJs" });
};

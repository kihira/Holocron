import { logger } from "../logger";

export = async () => {
    logger.crit("Disconnected from WebSocket, attempting to reconnect");
};

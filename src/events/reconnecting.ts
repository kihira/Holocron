import { logger } from "../logger";

export = async () => {
    logger.error("Disconnected from WebSocket, attempting to reconnect");
};

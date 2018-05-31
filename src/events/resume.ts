import { logger } from "../logger";

export = async (replayed: number) => {
    logger.crit(`Reconnected to WebSocket, replaying ${replayed} events`);
};

import {Guild, GuildMember} from "discord.js";
import {logger} from "../logger";
import {Settings} from "../settings";

export = async (guild: Guild) => {
    let bots = 0;
    let users = 0;
    guild.members.forEach((member: GuildMember) => {
        if (member.user.bot) bots++;
        else users++;
    });
    if (users / bots > Settings.userBotRatioThreshold) {
        await guild.leave();
        // todo blacklist guild?
        logger.verbose(`Left Guild (${guild.name}) due to high user/bot ratio (${users / bots})`);
    }
    logger.verbose(`Joined Guild (${guild.name})`);
};

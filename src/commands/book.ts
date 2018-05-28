import {Message} from "discord.js";
import {Database, Entry} from "../db";
import {createEmbed, escapeRegex} from "../util";
import {Argument, Command} from "./command";

interface IBook extends Entry {
    name: string;
    system: string;
    ffg_url: string;
    isbn: string;
    release_date: Date;
}

export = class Book extends Command {
    constructor() {
        super("book", [new Argument("book")]);
    }
    public async run(message: Message, args: string[]): Promise<void> {
        const searchTerm = escapeRegex(args[0]);
        const data = await Database.Data.collection("books")
            .findOne<IBook>({$or: [{_id: {$regex: searchTerm, $options: "i"}}, {name: {$regex: searchTerm, $options: "i"}}]});

        if (data == null) {
            await message.reply("No Species found");
            return;
        }

        const embed = createEmbed(message, data, "books", `${data.system}: ${data.name}`);
        embed.addField("Release Data", data.release_date.toLocaleDateString(), true);
        embed.addField("ISBN", data.isbn, true);
        embed.setURL(data.ffg_url);

        await message.channel.send({embed});
    }
};

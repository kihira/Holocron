"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const mongodb_1 = require("mongodb");
const client = new discord_js_1.Client();
function connectDiscord() {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.login(process.env.API_TOKEN || "");
    });
}
function connectMongo() {
    return __awaiter(this, void 0, void 0, function* () {
        yield mongodb_1.MongoClient.connect(process.env.MONGO_CONN || "mongodb://localhost:27017");
    });
}
client.on("ready", () => {
    console.log("Ready!");
});
client.on("message", (message) => {
    console.log(message);
    if (message.content === "ping") {
        message.reply("pong!");
    }
});

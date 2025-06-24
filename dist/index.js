"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const DiscordGateway_1 = require("./gateway/DiscordGateway");
if (!process.env.DISCORD_BOT_TOKEN) {
}
else {
    const gateway = new DiscordGateway_1.DiscordGateway(process.env.DISCORD_BOT_TOKEN);
    gateway.connect();
}

import { DiscordGateway } from './gateway/DiscordGateway'

if (!process.env.DISCORD_BOT_TOKEN) {
    
} else {
    const gateway = new DiscordGateway(process.env.DISCORD_BOT_TOKEN);
    gateway.connect();
}

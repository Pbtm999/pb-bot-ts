import axios from "axios";

class DiscordGateway {

    private token: string;
    private ws: WebSocket;
    private heartbeatInterval: number;

    static public gatewayURL: string;

    static private APIURL = 'https://discord.com/api'
    static private APIVERSION = '10'

    constructor(token: string) {
        this.token = token;
    }

    private static async fetchGateway(): Promise<string | null> {
        try {
            const res = await axios.get(`${DiscordGateway.APIURL}/v${DiscordGateway.APIVERSION}/gateway`);
            this.gatewayURL = res.data.url;
            return this.gatewayURL;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    public async connect() {

    }

}
"use strict";
import axios from "axios";
import WebSocket from "ws";

export class DiscordGateway {

    private token: string;
    private heartbeatIntervalFunc?: NodeJS.Timeout;
    private ws?: WebSocket;
    private lastHeartbeatAcked: boolean = true;

    private static gatewayURL: string;
    private static API_BASE = 'https://discord.com/api'
    private static API_VERSION = '10'

    constructor(token: string) {
        this.token = token;
        console.log(`Gateway instance for token: ${token}`);
    }

    private static async getGateway(): Promise<string | null> {
        const gatewayURL = DiscordGateway.gatewayURL;
        if (!gatewayURL)
            try {
                console.log(`Current gateway: ${gatewayURL}`);
                return await DiscordGateway.fetchGateway()
            } catch (error) {
                return null;
            }
        else
            return gatewayURL;
    }

    private static async fetchGateway(): Promise<string | null> {
        try {
            const res = await axios.get(`${DiscordGateway.API_BASE}/v${DiscordGateway.API_VERSION}/gateway`);
            const gatewayURLRetrived = res.data.url;
            DiscordGateway.gatewayURL = gatewayURLRetrived;
            console.log(`Gateway fetched: ${gatewayURLRetrived}`);
            return gatewayURLRetrived;
        } catch (error) {
            console.error(error);
            return null;
        }
    }

    public async connect() {
        const gatewayURL = await DiscordGateway.getGateway();
        if (!gatewayURL) {
            console.error("Couldn't retrive gateway url from Discord Rest API aborting gateway connection")
            return
        }

        this.ws = new WebSocket(`${gatewayURL}?v=10&encoding=json`);
        console.log(`Connection stablish request sent to Discord Gateway API`);
        
        this.ws.onmessage = (event) => {
            const payload = JSON.parse(event.data.toString());
            
            const {op, d, s, t} = payload;
            
            console.log(`OpCode: ${op}`)
            if (op == 10) {
                console.log(`Hello from Discord Gateway API received`);
                this.identify();
                this.startHeartbeat(d.heartbeatInterval);
            } else if (op == 11) {
                console.log(`Heartbeat ACK received!`);
                this.lastHeartbeatAcked = true
            }
        }

        this.ws.onclose = (e) => {
            console.error("WebSocket closed", e);
        };
        this.ws.onerror = (e) => {
            console.error("WebSocket error", e);
        };        
    }

    private reconnect() {
        console.log(`Reconnection initiated!`);

        if (this.ws && this.ws.readyState == WebSocket.OPEN)
            this.ws.close();

        if (this.heartbeatIntervalFunc)
            clearInterval(this.heartbeatIntervalFunc);

        this.connect();
    }
    
    private startHeartbeat(interval: number) {
        console.log(`Heartbeat cycle started!`);

        let jitter = Math.random();
        setTimeout(() => {    
            this.sendHeartbeat();

            this.heartbeatIntervalFunc = setInterval(() => {
                if (!this.lastHeartbeatAcked) {
                    console.error("No ACK received back from Discord API, Zombie connection presumed trying to reconnect");
                    this.reconnect();
                    return
                }
                this.sendHeartbeat();
            }, interval)
        }, interval*jitter);
    }
    
    private isSocketOpen() : boolean {
        return this.ws?.readyState == WebSocket.OPEN;
    }

    public sendPayload(data: Record<string, any>) {
        this.ws?.send(JSON.stringify(data))
    }

    private sendHeartbeat() {        
        this.lastHeartbeatAcked = false;
        
        if (!this.isSocketOpen()) {
            console.error("Socket is closed or waiting on heartbeat sending, trying to reconnect");
            this.reconnect();
            return;
        }

        console.log(`Heartbeat sented!`);

        this.sendPayload({
            op: 1,
            d: null,
        });

    }

    private identify() {
        if (!this.isSocketOpen()) {
            console.error("Socket is closed or waiting on identify sending, trying to reconnect");
            this.reconnect();
            return;
        }

        this.sendPayload({
            op: 2,
            d: {
                token: this.token,
                intents: 0,
                properties: {
                    $os: process.platform,
                    $browser: "disco",
                    $device: "disco",
                }
            }
        });

        console.log("Identify Sent!")
    }
}
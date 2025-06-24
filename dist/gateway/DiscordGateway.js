"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordGateway = void 0;
const axios_1 = __importDefault(require("axios"));
const ws_1 = __importDefault(require("ws"));
class DiscordGateway {
    constructor(token) {
        this.lastHeartbeatAcked = true;
        this.token = token;
        console.log(`Gateway instance for token: ${token}`);
    }
    static getGateway() {
        return __awaiter(this, void 0, void 0, function* () {
            const gatewayURL = DiscordGateway.gatewayURL;
            if (!gatewayURL)
                try {
                    console.log(`Current gateway: ${gatewayURL}`);
                    return yield DiscordGateway.fetchGateway();
                }
                catch (error) {
                    return null;
                }
            else
                return gatewayURL;
        });
    }
    static fetchGateway() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const res = yield axios_1.default.get(`${DiscordGateway.API_BASE}/v${DiscordGateway.API_VERSION}/gateway`);
                const gatewayURLRetrived = res.data.url;
                DiscordGateway.gatewayURL = gatewayURLRetrived;
                console.log(`Gateway fetched: ${gatewayURLRetrived}`);
                return gatewayURLRetrived;
            }
            catch (error) {
                console.error(error);
                return null;
            }
        });
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const gatewayURL = yield DiscordGateway.getGateway();
            if (!gatewayURL) {
                console.error("Couldn't retrive gateway url from Discord Rest API aborting gateway connection");
                return;
            }
            this.ws = new ws_1.default(`${gatewayURL}?v=10&encoding=json`);
            console.log(`Connection stablish request sent to Discord Gateway API`);
            this.ws.onmessage = (event) => {
                const payload = JSON.parse(event.data.toString());
                const { op, d, s, t } = payload;
                console.log(`OpCode: ${op}`);
                if (op == 10) {
                    console.log(`Hello from Discord Gateway API received`);
                    this.identify();
                    this.startHeartbeat(d.heartbeatInterval);
                }
                else if (op == 11) {
                    console.log(`Heartbeat ACK received!`);
                    this.lastHeartbeatAcked = true;
                }
            };
            this.ws.onclose = (e) => {
                console.error("WebSocket closed", e);
            };
            this.ws.onerror = (e) => {
                console.error("WebSocket error", e);
            };
        });
    }
    reconnect() {
        console.log(`Reconnection initiated!`);
        if (this.ws && this.ws.readyState == ws_1.default.OPEN)
            this.ws.close();
        if (this.heartbeatIntervalFunc)
            clearInterval(this.heartbeatIntervalFunc);
        this.connect();
    }
    startHeartbeat(interval) {
        console.log(`Heartbeat cycle started!`);
        let jitter = Math.random();
        setTimeout(() => {
            this.sendHeartbeat();
            this.heartbeatIntervalFunc = setInterval(() => {
                if (!this.lastHeartbeatAcked) {
                    console.error("No ACK received back from Discord API, Zombie connection presumed trying to reconnect");
                    this.reconnect();
                    return;
                }
                this.sendHeartbeat();
            }, interval);
        }, interval * jitter);
    }
    isSocketOpen() {
        var _a;
        return ((_a = this.ws) === null || _a === void 0 ? void 0 : _a.readyState) == ws_1.default.OPEN;
    }
    sendPayload(data) {
        var _a;
        (_a = this.ws) === null || _a === void 0 ? void 0 : _a.send(JSON.stringify(data));
    }
    sendHeartbeat() {
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
    identify() {
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
        console.log("Identify Sent!");
    }
}
exports.DiscordGateway = DiscordGateway;
DiscordGateway.API_BASE = 'https://discord.com/api';
DiscordGateway.API_VERSION = '10';

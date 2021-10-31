import { IncomingWebhook, IncomingWebhookResult } from "@slack/webhook";
import { Service } from "typedi";
import { getLogger } from "../logger";
import { BaseMessage } from "./messages/BaseMessage";

type Constructable<T extends BaseMessage> = new () => T;

@Service()
export class Webhook {
    static readonly SLACK_WEBHOOK_URL: string | null = process.env.SLACK_WEBHOOK_URL
        ? <string>process.env.SLACK_WEBHOOK_URL
        : null;

    private readonly incomingWebhook: IncomingWebhook;

    constructor() {
        if (!Webhook.SLACK_WEBHOOK_URL) {
            throw new Error("Failed to initialize Webhook: SLACK_WEBHOOK_URL environment variable was null or undefined");
        }
        this.incomingWebhook = new IncomingWebhook(Webhook.SLACK_WEBHOOK_URL);
    }

    async sendMessage<T extends BaseMessage>(messageClass: Constructable<T>, args?: unknown) {
        try {
            const message: T = new messageClass();
            const result: IncomingWebhookResult = await this.incomingWebhook.send(message.getMessage(args));
            getLogger().info("Webhook Result: ", result);
        } catch (err) {
            getLogger().error("Webhook Error: ", err);
        }
    }
}
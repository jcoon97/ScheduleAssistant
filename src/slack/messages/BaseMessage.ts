import { IncomingWebhookSendArguments } from "@slack/webhook";

export abstract class BaseMessage<T = unknown> {
    abstract getMessage(args?: T): IncomingWebhookSendArguments;
}
import { IncomingWebhookSendArguments } from "@slack/webhook";
import { Dayjs } from "dayjs";
import { BaseMessage } from "./BaseMessage";

export enum CoverageRequestProgram {
    /**
     * Data Visualization (DV)
     */
    DATA_VISUALIZATION = "DV",

    /**
     * Full Stack Flex (FSF)
     */
    FULL_STACK_FLEX = "FSF",

    /**
     * Financial Technology (FinTech)
     */
    FINANCIAL_TECHNOLOGY = "FinTech",

    /**
     * Cyber Security (Cyber)
     */
    CYBER_SECURITY = "Cyber"
}

export interface CoverageRequestArguments {
    /**
     * The {@link Dayjs} instance that represents the beginning of this coverage request
     */
    dtStart: Dayjs,

    /**
     * The {@link Dayjs} instance that represents the end of this coverage request
     */
    dtEnd: Dayjs,

    /**
     * The program that this coverage request is attached to, e.g. Full Stack Flex,
     * Data Visualization, etc.
     */
    program: CoverageRequestProgram;
}

export class CoverageRequest extends BaseMessage<CoverageRequestArguments> {
    getMessage(args?: CoverageRequestArguments): IncomingWebhookSendArguments {
        if (!args) {
            throw new Error("CoverageRequest#getMessage(): Function requires that argument is present before execution");
        }

        const date: string = args.dtStart.format("MMMM DD, YYYY");
        const startTime: string = args.dtStart.format("hh:mmA");
        const endTime: string = args.dtEnd.format("hh:mmA");
        const nextDay: string = args.dtEnd.isTomorrow() ? "(next day)" : "";
        const timezone: string = args.dtStart.format("z");

        const mainText: string[] = [
            `*Date*: ${ date }`,
            `*Time*: ${ startTime } — ${ endTime } ${ nextDay } ${ timezone }`,
            `*Program*: ${ args.program }`
        ];

        return {
            blocks: [
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: "@channel A new coverage request has been posted!"
                    }
                },
                {
                    type: "section",
                    text: {
                        type: "mrkdwn",
                        text: mainText.join("\n")
                    }
                },
                {
                    type: "actions",
                    elements: [
                        {
                            type: "button",
                            text: {
                                type: "plain_text",
                                text: "Open in Browser"
                            },
                            style: "primary",
                            url: "http://localhost:3000/" // TODO: In prod, don't callback to localhost, obviously
                        }
                    ]
                }
            ]
        };
    }
}
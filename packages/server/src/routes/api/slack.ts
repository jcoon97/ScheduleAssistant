import dayjs from "dayjs";
import { Response, Router } from "express";
import { Container } from "typedi";
import {
    CoverageRequest,
    CoverageRequestArguments,
    CoverageRequestProgram
} from "../../slack/messages/CoverageRequest";
import { Webhook } from "../../slack/Webhook";

const router: Router = Router();
const slack: Webhook = Container.get(Webhook);

const testArgs: CoverageRequestArguments = {
    dtStart: dayjs(),
    dtEnd: dayjs().add(7, "hours"),
    program: CoverageRequestProgram.FULL_STACK_FLEX
};

router.post("/test", async (_, res: Response) => {
    await slack.sendMessage(CoverageRequest, testArgs);
    res.json({ success: true });
});

export default router;
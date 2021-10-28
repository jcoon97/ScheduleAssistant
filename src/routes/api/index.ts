import { Router } from "express";
import googleRoutes from "./google";
import slackRoutes from "./slack";

const router: Router = Router();

router.use("/google", googleRoutes);
router.use("/slack", slackRoutes);

export default router;
import { Router } from "express";
import googleRoutes from "./google";

const router: Router = Router();
router.use("/google", googleRoutes);
export default router;
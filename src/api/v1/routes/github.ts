import { json, Router } from "express";

import { gitReviewWebhook } from "../controller/github";
import inject from "../../../utils/inject";
import { verify } from "../controller/helpers/verifier";

const router = Router();

router.post("/github/webhook", json({ type: "application/json", verify: inject }), verify, gitReviewWebhook);

export default router;

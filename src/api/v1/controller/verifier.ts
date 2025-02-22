import { Request, Response, NextFunction } from "express";
import { Webhooks } from "@octokit/webhooks";
import * as dotenv from "dotenv";

import { RawBodyRequest } from "../../../utils/inject";

dotenv.config({ path: __dirname + "/.env" });

const webhooks = new Webhooks({
    secret: process.env.GITHUB_WEBHOOK_SECRET as string,
});

export const verify = async (req: Request, res: Response, next: NextFunction) => {
    const signature = req.headers["x-hub-signature-256"] as string;
    const body = (req as RawBodyRequest).rawBody;

    // Ensure that both body and signature are available and correctly typed
    if (!body || typeof signature !== "string") {
        res.status(400).send("Bad request");
        return;
    }

    if (!(await webhooks.verify(body, signature))) {
        res.status(401).send("Unauthorized");
        return;
    }

    next();
};

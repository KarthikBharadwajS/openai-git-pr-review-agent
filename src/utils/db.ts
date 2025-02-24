import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";

import type { Request, Response } from "express";
import { ReviewStats } from "../api/v1/type";

export const db = new LowSync(new JSONFileSync<ReviewStats>("./data/review-stats.json"), {});

export const getData = (req: Request, res: Response) => {
    db.read();
    res.json(db.data);
};

import type { Request, Response } from "express";

// Extend the Request type to include a rawBody property
export interface RawBodyRequest extends Request {
    rawBody?: string;
}

export default function (req: RawBodyRequest, _res: Response, buf: Buffer, encoding: BufferEncoding) {
    req.rawBody = buf.toString(encoding || "utf-8");
}

import express from "express";
import http from "http";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import * as dotenv from "dotenv";

import logger from "./utils/logger";
import { shouldCompress } from "./utils/server";

import GithubWebhooks from "./api/v1/routes/github";

/*
 * .env Configuration
 */
dotenv.config({ path: __dirname + "/.env" });

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required");
}

if (!process.env.GITHUB_TOKEN) {
    throw new Error("GITHUB_TOKEN is required");
}

const PORT = process.env.PORT ?? 8080;

// Express application
const app = express();

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

app.use(helmet());
app.use(helmet.hsts({ maxAge: 300, includeSubDomains: true }));
app.use(compression({ filter: shouldCompress }));
app.use(
    cors({
        origin: "*",
        methods: ["GET", "POST", "OPTIONS"],
        preflightContinue: false,
    })
);

app.use("/api/v1", [GithubWebhooks]);

server.listen(+PORT, function () {
    logger.info("Server started on port", PORT);
});

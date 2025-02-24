import express from "express";
import http from "http";
import crypto from "crypto";
import compression from "compression";
import helmet from "helmet";
import cors from "cors";
import * as dotenv from "dotenv";

import logger from "./utils/logger";
import { shouldCompress } from "./utils/server";

import GithubWebhooks from "./api/v1/routes/github";
import { getData } from "./utils/db";
import { htmlTemplate as html } from "./utils/html";

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
app.get("/api/v1/stats", getData);

// Serve the frontend files
app.get("/api/stats-dashboard", (req, res) => {
    res.locals.nonce = crypto.randomBytes(16).toString("base64"); // Generate a unique nonce
    res.setHeader(
        "Content-Security-Policy",
        `default-src 'self'; script-src 'self' 'nonce-${res.locals.nonce}'; style-src 'self' 'nonce-${res.locals.nonce}'`
    );
    res.send(html(res.locals.nonce));
});

server.listen(+PORT, function () {
    logger.info("Server started on port", PORT);
});

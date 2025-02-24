import { Request, Response, NextFunction } from "express";
import { Octokit } from "@octokit/rest";
import * as dotenv from "dotenv";

import type { emitterEventNames } from "@octokit/webhooks";
import type { FileReview, GitHubWebhookBody, ReviewFeedback, ReviewResponse } from "../type";

import logger from "../../../utils/logger";
import { performAction } from "../../../utils/openai/action";
import { chatCompletion } from "../../../utils/openai/openai";
import { messages } from "../../../utils/openai/boilerplate";

import { REVIEW_INSTRUCTIONS, TLDR_TEMPLATE } from "./prompt";

dotenv.config({ path: __dirname + "/.env" });

const PR_FILE_THRESHOLD = 25000;

const initiateFeedback = async (file: { filename: string; patch: string }, validLineNos: number[], lines: Map<number, number>) => {
    try {
        const user_query = `
            Review the code.

            File: ${file.filename}
            Valid line numbers for you to comment on if there is anything to comment on: ${validLineNos.join(", ")}

            Patches / Changes:
            ${file.patch}
        `;
        const actionRes = (await performAction(REVIEW_INSTRUCTIONS, user_query, [
            {
                functionDescription: "Provide code review feedback for specific lines of code",
                functionName: "provide_code_review",
                properties: {
                    feedback: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                line: {
                                    type: "number",
                                    description: "The line number in the new version of the file",
                                },
                                comment: {
                                    type: "string",
                                    description: "The review comment for this line",
                                },
                            },
                            required: ["line", "comment"],
                        },
                    },
                },
                requiredProperties: ["feedback"],
            },
        ])) as {
            name: string;
            arguments: string;
        };

        const feedback: ReviewResponse["feedback"] = !actionRes.arguments ? [] : JSON.parse(actionRes.arguments);

        const validFeedback = feedback.filter((item) => lines.has(item.line));

        return {
            file: file.filename,
            feedback: validFeedback,
        };
    } catch (error) {}
};

export const gitReviewWebhook = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const gitEvent = req.headers["x-github-event"] as (typeof emitterEventNames)[number];

        if (!gitEvent) {
            res.status(400).json({ ok: false, message: "Event not found" });
            return;
        }

        const body: GitHubWebhookBody = req.body;

        if (gitEvent === "pull_request" && (body.action === "opened" || body.action === "synchronize" || body.action === "reopened")) {
            const { pull_request, repository } = body;

            try {
                logger.debug(pull_request.number, " : PR REVIEW :");

                const owner = repository.owner.login;
                const repo = repository.name;
                const pull_number = pull_request.number;

                const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
                const { data: files } = await octokit.pulls.listFiles({
                    owner,
                    repo,
                    pull_number,
                });

                const reviews: FileReview[] = [];

                for (const file of files) {
                    if (!file.patch || file.patch.length > PR_FILE_THRESHOLD) continue;

                    const lines = lineParser(file.patch);
                    const validateLines = Array.from(lines.keys()).sort((a, b) => a - b);

                    // Skip files with no valid lines to review
                    if (validateLines.length === 0) continue;

                    const review = await initiateFeedback({ filename: file.filename, patch: file.patch }, validateLines, lines);
                    if (review) reviews.push(review);
                }

                if (!reviews.length) {
                    await octokit.pulls.createReview({
                        owner,
                        repo,
                        pull_number,
                        event: "COMMENT",
                        body: "Bot: Everything looks good",
                    });
                    res.status(200).json({ ok: true, message: "Nothing to review" });
                    return;
                }

                const postReviewComment = await chatCompletion({
                    messages: messages(TLDR_TEMPLATE.replace("{{reviews}}", JSON.stringify(reviews.slice(0, 10), null, 2)), null),
                });

                const comments = reviews.flatMap((review: FileReview) =>
                    review.feedback.map((feedback: ReviewFeedback) => ({
                        path: review.file,
                        line: feedback.line,
                        body: feedback.comment,
                    }))
                );

                await octokit.pulls.createReview({
                    owner,
                    repo,
                    pull_number,
                    event: "COMMENT",
                    comments,
                    body: (postReviewComment.choices[0].message.content as string) ?? "I review is done, have a look",
                });
                res.status(200).json({ ok: true, message: "Submitted" });
                return;
            } catch (error) {
                logger.error("Error at review inside :", error);
                res.status(400).json({ ok: false, message: "something went wrong" });
                return;
            }
        }

        res.status(200).json({ ok: false, message: `Skipped due to no match ${gitEvent} ${body.action}` });
    } catch (error) {
        logger.error("Error at gitReviewWebhook", error);
        res.status(400).json({ ok: false, message: "something went wrong" });
    }
};

/**
 * Builds a map of valid line numbers from a git patch.
 * Only includes added or modified lines (those starting with "+").
 * The returned map maps the new line number to itself.
 */
function lineParser(patch: string): Map<number, number> {
    const lines = patch.split(/\r?\n/);
    const lineMap = new Map<number, number>();
    let newLineNumber = 0;
    let insideHunk = false;

    for (const line of lines) {
        // Identify the start of a hunk and reset newLineNumber accordingly.
        if (line.startsWith("@@")) {
            insideHunk = true;
            const hunkHeaderMatch = line.match(/^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@/);
            if (hunkHeaderMatch) {
                // Subtract 1 so that the first processed line in the hunk increments correctly.
                newLineNumber = parseInt(hunkHeaderMatch[1], 10) - 1;
            }
            continue;
        }

        // Skip lines until a hunk header has been encountered.
        if (!insideHunk) continue;

        if (line.startsWith("+")) {
            // Added/modified line: increment and record the new line number.
            newLineNumber++;
            lineMap.set(newLineNumber, newLineNumber);
        } else if (line.startsWith("-")) {
            // Deleted line: do not update the new line number.
            continue;
        } else {
            // Context (unchanged) line: simply increment the new line number.
            newLineNumber++;
        }
    }

    return lineMap;
}

import { Octokit, RestEndpointMethodTypes } from "@octokit/rest/dist-types";
import { FileReview, ReviewFeedback } from "../../type";

export const getExistingReviewComments = async (octokit: Octokit, owner: string, repo: string, pull_number: number) => {
    try {
        const { data: reviews } = await octokit.pulls.listReviews({ owner, repo, pull_number });

        let existingComments: Map<string, ReviewFeedback[]> = new Map();

        for (const review of reviews) {
            if (!review.body.startsWith("BOT:")) continue;
            const { data: comments } = await octokit.pulls.listReviewComments({
                owner,
                repo,
                pull_number,
                review_id: review.id,
            });

            for (const comment of comments) {
                if (!existingComments.has(comment.path)) {
                    existingComments.set(comment.path, []);
                }
                existingComments.get(comment.path)!.push({
                    line: comment.line as number,
                    comment: comment.body,
                });
            }
        }

        return existingComments;
    } catch (error) {
        console.error("Error fetching existing review comments:", error);
        return [];
    }
};

export const createReviewComment = async (octokit: Octokit, params: RestEndpointMethodTypes["pulls"]["createReview"]["parameters"]) => {
    try {
        await octokit.pulls.createReview(params);
    } catch (error) {
        console.error("Error creating review comment:", error);
    }
};

export const getFilesChanged = async (
    octokit: Octokit,
    params: RestEndpointMethodTypes["pulls"]["listFiles"]["parameters"]
): Promise<RestEndpointMethodTypes["pulls"]["listFiles"]["response"]> => {
    try {
        return await octokit.pulls.listFiles(params);
    } catch (error) {
        console.error("Error fetching changed files:", error);
        throw error;
    }
};

export const filterResolvedAndNewIssues = (existingReviews: Map<string, ReviewFeedback[]>, newReviews: FileReview[]) => {
    let finalReviews: FileReview[] = [];

    for (const review of newReviews) {
        const prevFeedback = existingReviews.get(review.file) || [];

        let filteredFeedback: ReviewFeedback[] = [];
        let resolvedIssues = new Set<number>();

        for (const newIssue of review.feedback) {
            const existingIssue = prevFeedback.find((prev) => prev.line === newIssue.line && prev.comment === newIssue.comment);

            if (!existingIssue) {
                // If not found in previous reviews, it's a new issue
                filteredFeedback.push(newIssue);
            } else {
                // If found, consider it unresolved
                resolvedIssues.add(newIssue.line);
            }
        }

        if (filteredFeedback.length > 0) {
            finalReviews.push({
                file: review.file,
                feedback: filteredFeedback,
                tokens_used: review.tokens_used,
            });
        }
    }

    return finalReviews;
};

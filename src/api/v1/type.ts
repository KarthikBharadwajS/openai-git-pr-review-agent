export interface GitHubWebhookBody {
    action: string;
    pull_request: {
        number: number;
    };
    repository: {
        owner: {
            login: string;
        };
        name: string;
    };
}

export interface ReviewFeedback {
    line: number;
    comment: string;
}

export interface ReviewResponse {
    feedback: ReviewFeedback[];
}

export interface FileReview {
    file: string;
    feedback: ReviewFeedback[];
}

export interface ReviewState {
    owner?: string;
    repo?: string;
    pull_number?: number;
    reviews?: FileReview[];
    botName?: string;
}

export interface File {
    sha: string;
    filename: string;
    status: "added" | "removed" | "modified" | "renamed" | "copied" | "changed" | "unchanged";
    additions: number;
    deletions: number;
    changes: number;
    blob_url: string;
    raw_url: string;
    contents_url: string;
    patch?: string | undefined;
    previous_filename?: string | undefined;
}

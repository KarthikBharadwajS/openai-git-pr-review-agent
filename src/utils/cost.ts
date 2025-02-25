// Cost per 1M tokens in USD
const MODEL_COSTS = {
    // GPT-4 Models
    "gpt-4-0125-preview": { input: 10, output: 30 },
    "gpt-4-1106-preview": { input: 10, output: 30 },
    "gpt-4": { input: 30, output: 60 },
    "gpt-4-32k": { input: 60, output: 120 },
    "gpt-4-0613": { input: 30, output: 60 },
    "gpt-4-0314": { input: 30, output: 60 },
    "gpt-4o": { input: 250, output: 1000 },
    "gpt-4o-mini": { input: 0.15, output: 0.6 },
    "gpt-4-turbo": { input: 10, output: 30 },
    "gpt-4-turbo-2024-04-09": { input: 10, output: 30 },

    // GPT-3.5 Models
    "gpt-3.5-turbo-0125": { input: 0.5, output: 1.5 },
    "gpt-3.5-turbo-instruct": { input: 1.5, output: 2 },
    "gpt-3.5-turbo-16k": { input: 0.5, output: 1.5 },
    "gpt-3.5-turbo": { input: 0.5, output: 1.5 },
} as const;

export type ModelId = keyof typeof MODEL_COSTS;

function isKnownModel(model: string): model is ModelId {
    return model in MODEL_COSTS;
}

export function calculateCost(prompt_tokens: number, completion_tokens: number, model: string) {
    if (!isKnownModel(model)) {
        // Default to GPT-4o mini pricing if unknown
        model = "gpt-4o-mini";
    }

    const costs = MODEL_COSTS[model as ModelId];

    // Costs are in USD per 1M tokens
    const inputCost = (prompt_tokens / 1000000) * costs.input;
    const outputCost = (completion_tokens / 1000000) * costs.output;

    // Round to 6 decimal places for fractional cents
    return Number((inputCost + outputCost).toFixed(6));
}

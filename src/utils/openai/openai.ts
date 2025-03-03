import OpenAI from "openai";
import { RequestOptions } from "openai/core";
import { ChatCompletionCreateParamsNonStreaming, ChatModel } from "openai/resources";
import * as dotenv from "dotenv";
import { AutoParseableResponseFormat } from "openai/lib/parser";

dotenv.config({ path: __dirname + "/.env" });

export const DEFAULT_MODEL: ChatModel = (process.env.OPENAI_MODEL as string as ChatModel) ?? "gpt-4o-mini";
type CompletionExclusions = "model" | "response_format";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const chatCompletion = async (args: Omit<ChatCompletionCreateParamsNonStreaming, CompletionExclusions>, options?: RequestOptions) => {
    args.temperature = args.temperature ?? 0;
    return await openai.chat.completions.create({ ...args, model: DEFAULT_MODEL }, options);
};

export const parseCompletion = async <T>(
    args: Omit<ChatCompletionCreateParamsNonStreaming, CompletionExclusions>,
    responseFormat: AutoParseableResponseFormat<T>
) => {
    args.temperature = args.temperature ?? 0;
    const parsed = await openai.beta.chat.completions.parse({
        ...args,
        model: DEFAULT_MODEL,
        response_format: responseFormat,
    });

    return parsed;
};

import OpenAI from "openai";
import { RequestOptions } from "openai/core";
import { ChatCompletionCreateParamsNonStreaming, ChatModel } from "openai/resources";
import * as dotenv from "dotenv";

dotenv.config({ path: __dirname + "/.env" });

const DEFAULT_MODEL: ChatModel = "gpt-4o-mini";
type CompletionExclusions = "model";

export const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export const chatCompletion = async (args: Omit<ChatCompletionCreateParamsNonStreaming, CompletionExclusions>, options?: RequestOptions) => {
    args.temperature = args.temperature ?? 0.5;
    return await openai.chat.completions.create({ ...args, model: DEFAULT_MODEL }, options);
};

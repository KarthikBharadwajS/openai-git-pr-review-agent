import { calculateCost } from "../cost";
import logger from "../logger";
import { messages, tools, ToolsBoilerPlateArgs } from "./boilerplate";
import { chatCompletion, DEFAULT_MODEL } from "./openai";

export const performAction = async (instructions: string, query: string, availableTools: ToolsBoilerPlateArgs[]) => {
    try {
        const messageList = messages(instructions, query);
        const toolList = tools(availableTools);

        const completion = await chatCompletion({
            messages: messageList,
            tools: Object.values(toolList).map((entry) => entry.tool),
            tool_choice: "auto",
        });

        if (
            completion &&
            completion.choices[0] &&
            completion.choices[0].finish_reason === "tool_calls" &&
            completion.choices[0]?.message &&
            completion.choices[0]?.message?.tool_calls
        ) {
            const fn = completion.choices[0]?.message?.tool_calls[0]?.function;

            if (!fn.arguments) {
                throw new Error("Arguments expected");
            }

            if (toolList[fn.name] && toolList[fn.name].run && toolList[fn.name].run !== undefined) {
                const call = toolList[fn.name].run as (params?: Record<string, unknown>) => Promise<void>;
                return await call(JSON.parse(fn.arguments));
            }

            return {
                name: fn.name,
                arguments: fn.arguments,
                tokens_used: completion.usage?.total_tokens ?? 0,
                cost: calculateCost(
                    completion.usage?.prompt_tokens ?? 0,
                    completion.usage?.completion_tokens ?? 0,
                    completion.model ?? DEFAULT_MODEL
                ),
            };
        }
    } catch (error) {
        logger.error(error, "error while executing action");
    }
};

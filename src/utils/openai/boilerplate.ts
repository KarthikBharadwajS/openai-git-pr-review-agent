import { ChatCompletionMessageParam, ChatCompletionTool, FunctionParameters } from "openai/resources";

export interface ToolsBoilerPlateArgs {
    functionName: string;
    functionDescription: string;
    properties: FunctionParameters;
    requiredProperties: string[];
    run?: (params?: Record<string, unknown>) => Promise<void>;
}

/**
 * Boilerplate for building messages for chat completion
 * @param system_prompt
 */
export const messages = (system_prompt: string, query: string | null) => {
    const messages: ChatCompletionMessageParam[] = [{ role: "system", content: system_prompt }];

    if (query) messages.push({ role: "user", content: query });
    return messages;
};

/**
 * Boilerplate for building tools for chat completion
 */
export const tools = (params: ToolsBoilerPlateArgs[]) => {
    const availableTools: Record<string, { tool: ChatCompletionTool; run?: (params?: Record<string, unknown>) => Promise<void> }> = {};

    params.forEach((param) => {
        const tool: ChatCompletionTool = {
            type: "function",
            function: {
                name: param.functionName,
                description: param.functionDescription,
                parameters: {
                    type: "object",
                    properties: param.properties,
                    required: param.requiredProperties,
                },
            },
        };
        availableTools[param.functionName] = { run: param.run, tool };
    });

    return availableTools;
};

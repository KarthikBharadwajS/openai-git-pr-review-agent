import { promises as fs } from "fs";
import logger from "./logger";

/**
 * Read the config.json file
 * @returns config.json
 */
export const readConfig = async (): Promise<any> => {
    try {
        const data = await fs.readFile("config.json", "utf-8");
        return JSON.parse(data);
    } catch (error) {
        logger.error("Failed to read JSON file:", error);
        return null;
    }
};

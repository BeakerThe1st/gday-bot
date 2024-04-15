import OpenAI from "openai";
import { useEnv } from "./useEnv";

let openai: OpenAI | undefined;

export const useOpenAI = () => {
    if (!openai) {
        openai = new OpenAI({
            apiKey: useEnv("OPENAI_KEY"),
        });
    }
    return openai;
};

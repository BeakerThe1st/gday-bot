import {useEnv} from "./useEnv";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: useEnv("OPENAI_KEY")
})

export const useOpenAI = () => {
    return openai;
};
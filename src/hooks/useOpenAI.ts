import {useEnv} from "./useEnv";
import {Configuration, OpenAIApi} from "openai";

const configuration = new Configuration({
    apiKey: useEnv("OPENAI_KEY"),
});

const openai = new OpenAIApi(configuration);

export const useOpenAI = () => {
    return openai;
};
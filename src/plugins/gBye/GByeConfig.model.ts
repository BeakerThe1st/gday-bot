import { model, Schema } from "mongoose";

export interface IGByeConfig {
  guild: string;
  channel: string;
}

const gByeConfigSchema = new Schema<IGByeConfig>({
  guild: String,
  channel: String,
});

export const GByeConfig = model<IGByeConfig>("gByeConfig", gByeConfigSchema);

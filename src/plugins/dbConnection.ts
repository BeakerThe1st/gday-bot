import mongoose from "mongoose";
import { useEnv, useEvent } from "../hooks";

useEvent("ready", () => {
  mongoose.connect(useEnv("MONGO_URI"));
});

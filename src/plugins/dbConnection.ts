import mongoose from "mongoose";
import {useEnv, useEvent} from "../hooks";

useEvent("ready", () => {
    //IGNORED PROMISE -> please pay attention to promise when doing anything important w/ DB
    mongoose.connect(useEnv("MONGO_URI"));
});

# Contributing to G'day (WIP)
## Hooks??
G'day's framework provides a number of "hooks" replicating React hooks to streamline development
and ensure creation of new plugins and features is as simple as possible. G'day provides the following hooks:
- `useButton`
- `useChatCommand`
- `useClient`
- `useEnv`
- `useError`
- `useEvent`
- `useInteraction`
- `useOpenAI`


## Setting up a development environment
1. Install npm and NodeJS
2. Clone this repo
3. Create a .env file with the following template:
    ```dotenv
   DISCORD_CLIENT_ID=""
   DISCORD_TOKEN=""
   MONGO_URI=""
   OPENAI_KEY=""
   NODE_ENV="development"
4. Run `npm install` in the root directory.
   - NB: You may need to resolve dependencies for [node-canvas](https://www.npmjs.com/package/canvas).
5. Run `npm run dev` which will run the TypeScript directly with nodemon in watch mode.
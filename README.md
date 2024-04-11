![G'day banner](https://i.imgur.com/DEzQcIW.png)
# G'day
G'day is a Discord moderation bot with a simple design philosophy: to supplement Discord's native moderation tools
rather than completely reinvent them. G'day is written with the r/Apple Discord in mind, however it could
be adapted and used successfully in any server.

## Key Features
- Permanent records of warns/kicks/timeouts/bans/unbans through the case record system
- A communal "scratchpad" attached to each user for moderators to keep notes about particular users
- Additional supplement moderation commands such as `/clear` and `/warn`
- A modmail system
- A ban appeal system from a corresponding web frontend
- "Event mode" for big server events with high traffic to answer FAQ throughout
- The G'bye network to share information about bans amongst various high profile tech servers.
- Full logging of join/leave, message edits & deletion, roles, nicknames, and case generation
- A tag system for responses to frequently asked questions in a support context
- Various other small, but nevertheless handy, features for the functioning of the r/Apple Discord

## Hosting G'day
1. Install NPM and NodeJS
2. Clone this repo
3. Run `npm install` in the root directory
4. Run `npm build && npm run start` in the root directory 

Please note that you will most likely want to adapt parts of the bot before using it in your own community, in particular, 
you will need to change values in globals.ts, as well as removing the gBye & rApple plugins which will likely provide
very little utility outside of their designated purpose.
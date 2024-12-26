## Project Setup

- `bun dev`
- make sure to fill out the whole .dev.vars
- setup client id and secret for auth
- currenlty tested google and github client
- when adding a new var, make sure to add it to .dev.vars
  - if you need to use the env vars outside of hono, make sure to init config from dot env with path .dev.vars
  - if needing to access within the hono app make sure to set it within c.set("NAME) and pass the c within your functions

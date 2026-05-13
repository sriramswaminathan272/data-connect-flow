# Claude Code Instructions

## Core rule
Never ask the user to run commands, scripts, terminals, or do anything manually.
You develop it. You run it. You commit it. You push it.
The only deliverable to the user is: "Here is what changed, here is how it works."

## Development workflow
- All changes go to branch `claude/new-session-lu7ae`
- Always commit and push after completing a task
- Always run `npm run build` to verify no TypeScript errors before committing
- Run the depth checker `npm run check-depth` before committing faker data changes

## Simulation
- The simulation writes results to `public/simulation-results/latest.json`
- The React dashboard fetches from `/simulation-results/latest.json` at runtime
- Run simulation with: `npm run simulate`
- Run simulation + dev server with: `npm run simulate:dev`

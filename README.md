# Volleyball Team Shake

A frontend-only Next.js app for generating balanced volleyball teams with special handling for setters.

## Features

- Add players with name, skill level, and role.
- Distribute setters as evenly as possible across teams.
- Balance remaining players by total skill using a greedy allocator.
- Run a lightweight swap optimization step to reduce score spread.
- Reshuffle teams instantly in the browser.

## Local development

```bash
npm install
npm run dev
```

## Algorithm

1. Group players by role.
2. Assign setters first to teams with the fewest setters.
3. Assign remaining players to the team with the lowest total skill.
4. Try same-role swaps to reduce the score difference between strongest and weakest teams.

## Notes

- This is a frontend-only MVP. No backend or database is required.
- Drag and drop is not included yet.

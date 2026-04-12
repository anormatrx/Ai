# Coordinator Protocol for Large Parallel Changes

When the user requests a large-scale, parallelizable change across the codebase, follow this protocol:

## Phase 1: Research and Planning (Plan Mode)
1. **Understand Scope**: Research deeply to find all files, patterns, and call sites. Understand existing conventions.
2. **Break Down Work**: Divide the work into 5-30 independent units. Each unit must be:
   - Independently executable in an isolated git worktree.
   - Independently mergeable.
   - Roughly uniform in size.
3. **Define E2E Test Recipe**: Determine how to verify the change works from end-to-end.
   - Use browser automation for UI changes.
   - Use CLI/tmux for CLI changes.
   - Use dev server + curl for API changes.
4. **Write the Plan**: Create a plan file including:
   - Research summary.
   - Numbered list of work units (Title, Files/Folders, Description).
   - E2E test recipe.
   - Precise instructions for each worker.

## Phase 2: Recruiting Workers
After plan approval, launch one background agent per work unit using the agent tool with `isolation: "worktree"` and `run_in_background: true`.

## Phase 3: Progress Tracking
Display an initial status table and update it as background tasks complete.

| Unit | Status | PR |
|------|--------|----|
| <Title> | Running | — |

Finalize with a summary of completed units.

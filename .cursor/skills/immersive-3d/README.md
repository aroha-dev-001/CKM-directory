# Immersive 3D (user-wide Cursor agent)

This skill is loaded by the **immersive-3d** custom subagent.

## Where it lives

| Piece | Path | Shows up as |
| --- | --- | --- |
| Subagent | `~/.cursor/agents/immersive-3d.md` | Agent / Task picker, `/immersive-3d` |
| Slash command | `~/.cursor/commands/immersive-3d.md` | Command palette `/immersive-3d` |
| Skill | `~/.cursor/skills/immersive-3d/SKILL.md` | Auto-attached expertise |

User-scoped files apply to **every** project on this machine. They are not part of any website repo.

## Desktop install

Cloud Agent home directories do not automatically copy to your laptop. To see this in the Cursor desktop agent list:

```bash
mkdir -p ~/.cursor/agents ~/.cursor/skills/immersive-3d ~/.cursor/commands ~/.claude/agents
```

Copy `immersive-3d.md` into `~/.cursor/agents/` and `~/.claude/agents/`, the skill folder into `~/.cursor/skills/immersive-3d/`, and the command into `~/.cursor/commands/`. Reload the window.

## Invoke

- Type `/immersive-3d` then describe the world (stills, beats, mood).
- Or: “Use the immersive-3d agent to plan a 3D walk for …”
- Do not start from an unrelated existing site unless you name that repo.

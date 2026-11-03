# Project skills

Claude skills that every Claude Code thread on this repo loads automatically. Added 2026-11-03 at Angad's request.

All are third-party open source, copied in (not linked) and pinned to the commit below. Before they were added, every file was checked for hidden Unicode, prompt-injection phrases, outbound URLs and shell commands. The only executable code is Anthropic's `webapp-testing` scripts, which were read in full. `evals/` folders were left out. The `allowed-tools` pre-approval (Bash/Write/WebFetch) was removed from the three geo-* skills so they ask like any other step.

| Skills | Source | Commit | License |
|---|---|---|---|
| copywriting, copy-editing, cro, lead-magnets, schema, programmatic-seo, emails, ai-seo, free-tools, marketing-psychology, site-architecture, seo-audit, offers | [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) | 88c79f6 | MIT |
| seo-local, seo-schema, seo-technical, seo-page (+ shared `seo/references/`) | [AgriciDaniel/claude-seo](https://github.com/AgriciDaniel/claude-seo) | 6be93f4 | MIT |
| geo-citability, geo-llmstxt, geo-crawlers | [zubair-trabzada/geo-seo-claude](https://github.com/zubair-trabzada/geo-seo-claude) | 989cae0 | MIT |
| frontend-design, webapp-testing | [anthropics/skills](https://github.com/anthropics/skills) | ca45fc4 | Apache-2.0 |

Notes:
- The claude-seo skills mention a `scripts/claude-seo` helper that is not included. Each has a manual fallback (read the page source), which is what threads should use.
- Our own rules still win: no COI/"insured" claims, no vendor names before payment, `replyPromise`, visuals + FAQs + schema on every page (see SITE_LOG.md and docs/DESIGN_SYSTEM.md).
- To update: re-copy from the source repo at a newer commit, re-check, and update this table.

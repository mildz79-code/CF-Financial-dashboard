# Local Setup — Working on Sensitive Financials

This repo is configured so that **real financial data stays on your
local machine** and does not get pushed to GitHub. Use this guide to
clone, set up, and work safely.

## 1. Clone to your desktop

```bash
cd ~/Desktop        # or wherever you keep projects
git clone https://github.com/mildz79-code/CF-Financial-dashboard.git
cd CF-Financial-dashboard
```

Open the folder in Cursor (`File → Open Folder…`).

## 2. Install dependencies

Frontend:

```bash
npm install
cp .env.example .env
# edit .env locally — Supabase URL/key stay on your machine
npm run dev
```

Optional Python scripts:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## 3. Sensitive data files (gitignored)

These paths are listed in `.gitignore` and will **never** be committed
or pushed:

- `2026_monthly_budget.xlsx`
- `2026_monthly_budget_korean.xlsx`
- `data/2026/*.csv` (Jan/Feb/Mar P&L exports)
- `data/2026/*.xlsx` (YTD forecast)
- `supabase/migrations/004_seed_2026_data.sql`
- anything inside `private/` or `local/`

Drop the real files into those paths on your local machine. They will
show up when you run the app but will not appear in `git status`.

If you ever need to share a sanitized example, create a sibling file
like `004_seed_2026_data.example.sql` with placeholder numbers and
commit *that* file instead.

## 4. Normal local workflow

```bash
git checkout -b my-local-work
# edit, run, test — nothing leaves your laptop
git add <files-safe-to-share>
git commit -m "Describe the change"
# still local-only until:
git push -u origin my-local-work
```

Before pushing, double check with:

```bash
git status
git diff --cached
```

If you accidentally staged a sensitive file, unstage it:

```bash
git restore --staged path/to/file
```

## 5. Using Cursor cloud agents

Cloud agents running in this repo commit and push to GitHub
automatically on `cursor/...` branches. **Do not paste real financial
numbers into cloud-agent prompts** — use the local Cursor IDE on your
desktop for any work that touches real data. Cloud agents are fine for
non-sensitive refactors, UI work, and scaffolding.

## 6. Going live

Once you're ready to publish:

```bash
git checkout main
git pull
git merge my-local-work      # or open a PR on GitHub
git push
```

## 7. Note on git history

The sensitive files listed above existed in the repo's history before
being untracked, so older commits on GitHub still contain them. If you
need them scrubbed from history entirely, that requires a separate
history-rewrite step (`git filter-repo` / BFG) and a force push —
ask and it can be done as a follow-up.

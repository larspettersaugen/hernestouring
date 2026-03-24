# Using Google Stitch with this app

**Stitch** ([stitch.withgoogle.com](https://stitch.withgoogle.com)) is Google Labs’ AI UI design tool. You describe screens or upload references; it produces layouts and can **export front-end code** (or send work to Figma).

Stitch is **not** an npm dependency. You don’t “install Stitch” into the repo. You use it in the browser, then **bring the output into this codebase** (by hand or with help in Cursor).

## Can we use it?

**Yes.** Typical workflow:

1. **Design in Stitch** — e.g. login, dashboard shell, tour list. Iterate until you like the look.
2. **Export** — use Stitch’s code export (or Figma handoff if your team prefers).
3. **Integrate here** — map the export onto **Next.js App Router** components under `src/app/` and `src/components/`, using **Tailwind** like the rest of the app.

## Fitting this project’s theme

The app uses a shared **stage** palette and **light/dark** via `next-themes` and CSS variables in [`src/app/globals.css`](../src/app/globals.css) (e.g. `--stage-surface`, `--stage-accent`). Tailwind maps these to classes like `bg-stage-surface`, `text-stage-muted`, `border-stage-border`.

When you paste Stitch-generated markup:

- Prefer **`bg-stage-*`, `text-stage-*`, `border-stage-*`** over raw hex colors so **dark mode** and future tweaks stay consistent.
- Keep **layout rules** from [`.cursor/rules/stability.mdc`](../.cursor/rules/stability.mdc) in mind (e.g. [`DashboardLayoutClient`](../src/components/DashboardLayoutClient.tsx) breakpoints and structure).

## Practical next steps

1. Pick **one screen** to start (e.g. `/login` or dashboard chrome).
2. Export from Stitch and save the snippet (or a screenshot + notes).
3. In **Agent mode**, ask to “apply this Stitch export to `src/app/login/page.tsx`” (or attach the file) so changes stay aligned with existing patterns.

## If you meant something else

- **shadcn/ui** — a popular React + Tailwind **component kit** (copy-paste components). Different tool; we can add it later if you want a shared component library instead of Stitch-led layouts.

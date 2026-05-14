<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## Tailwind v4 — breaking changes
- No `tailwind.config.js` — configuration lives in CSS via `@theme` block
- Utility names changed: `shadow-sm` → `shadow-xs`, `ring-1` → `ring`, etc.
- Read `node_modules/tailwindcss/CHANGELOG.md` before using any utility class

## ShadCN UI v4 — breaking changes
- Components are copied into `src/components/ui/` — do not import from `shadcn`
- Run `npx shadcn@latest add <component>` to add new components
- Registry format changed; do not hand-write registry entries

## NextAuth v5 — breaking changes
- Config exported from `src/lib/auth.ts` as named `{ handlers, auth, signIn, signOut }`
- Route handler is `src/app/api/auth/[...nextauth]/route.ts` exporting `{ GET, POST } = handlers`
- `getServerSession()` is removed — use `auth()` from `src/lib/auth.ts`
- Middleware: `export { auth as middleware }` from `src/lib/auth.ts`

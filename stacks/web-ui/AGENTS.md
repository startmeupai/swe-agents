# Web UI Rules

Apply these rules to UI source under `app/` and `components/` (`.ts`, `.tsx`,
and `.css` files). They extend the TypeScript rules.

Components and accessibility:

- Reuse accessible shared primitives before creating custom controls.
- Use semantic HTML, visible focus states, keyboard access, and clear labels.
- Keep server and data access outside presentational components.
- Represent loading, empty, error, disabled, and success states deliberately.
- Prefer token-driven styling and testable component boundaries.
- Do not use visual-only signals for critical state.

Responsive layout and Tailwind:

- Design mobile-first and add only purposeful breakpoints.
- Distinguish viewport queries from container-size needs.
- Prevent overflow with correct flex and grid minimum sizes and wrapping.
- Use semantic design tokens instead of hardcoded palette values.
- Keep light and dark tokens semantically named across themes.
- Verify requested responsive behavior at representative desktop, tablet, and
  mobile sizes.

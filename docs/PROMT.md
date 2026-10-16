# Task: Convert `docs/index.html` to Nuxt.js, Tailwind CSS, Prisma ORM, and Database-Driven Application

## 1. Project Objective

Convert the existing HTML page located at `docs/index.html` into a fully functional Nuxt.js application using Tailwind CSS.

The existing `docs/index.html` must be treated as the primary source of truth for the user interface, content, layout, and behavior.

Do not simply copy the HTML into a Vue component. Analyze the existing implementation, identify reusable UI elements, determine which data should be dynamic, design an appropriate database schema, and implement the backend API required to serve the data.

The final result must be a maintainable, functional, and production-oriented Nuxt.js application.

## 2. Technology Stack

Use the following technologies:

- **Nuxt.js**: Application framework, Vue components, routing, SSR, and backend API.
- **Vue 3 Composition API**: Prefer `<script setup lang="ts">`.
- **TypeScript**: Use strict and explicit types where practical.
- **Tailwind CSS**: Recreate the original design and responsive layout.
- **Prisma ORM**: Database schema, migrations, queries, and data access.
- **PostgreSQL**: Default relational database unless the existing project already uses another database provider.
- **Nitro Server API**: Implement backend endpoints inside `server/api/`.
- **Zod**: Validate API request parameters and request bodies when appropriate.
- **`.env.example`**: Document environment variables with meaningful comments.
- **Utilities**: Extract reusable, framework-independent functions into `utils/` when appropriate.

Before making changes, inspect the existing repository and reuse its installed dependencies, configurations, and conventions whenever possible. Do not unnecessarily replace working configurations or upgrade major dependencies.

If Prisma or Tailwind CSS is already configured, follow the existing setup rather than creating duplicate configurations.

## 3. Analyze `docs/index.html`

Before implementing the application, thoroughly inspect `docs/index.html` and any related assets, stylesheets, scripts, fonts, and images referenced by it.

Identify the following:

1. Page layout and section hierarchy.
2. Header, navigation, footer, sidebar, and other shared UI elements.
3. Typography, colors, spacing, borders, shadows, and other design tokens.
4. Responsive behavior across desktop, tablet, and mobile screen sizes.
5. Interactive elements, including forms, dropdowns, tabs, modals, filters, pagination, and buttons.
6. Repeated elements that should become reusable Vue components.
7. Static content that should remain in the frontend.
8. Dynamic content that should be retrieved from the database.
9. User actions that require backend processing.
10. Existing assets that should be reused instead of recreated.

Preserve the original design as closely as possible.

Do not arbitrarily redesign the page, remove sections, replace meaningful content with placeholder text, or introduce unrelated functionality.

If the HTML references local assets, inspect their actual locations and reuse them correctly within the Nuxt.js asset and public directory conventions.

## 4. Convert the HTML into Nuxt.js Components

Convert the existing HTML into appropriate Vue components and Nuxt pages.

Use the following conventions:

- `app.vue` for the application shell when appropriate.
- `pages/` for route-level pages.
- `components/` for reusable UI components.
- `layouts/` for shared layouts when necessary.
- `assets/css/` for CSS files processed by the build system.
- `public/` for static assets that should be served directly.
- `composables/` for reusable Vue-specific reactive logic.
- `utils/` for general-purpose reusable functions.
- `server/api/` for HTTP API endpoints.
- `server/utils/` for server-only helpers.
- `prisma/` for the Prisma schema, migrations, and seed configuration.

Example structure:

```text
.
├── docs/
│   └── index.html
├── assets/
│   └── css/
│       └── main.css
├── components/
│   ├── layout/
│   ├── ui/
│   └── sections/
├── composables/
├── layouts/
├── pages/
│   └── index.vue
├── public/
│   └── images/
├── server/
│   ├── api/
│   ├── middleware/
│   └── utils/
├── shared/
│   └── types/
├── utils/
├── prisma/
│   ├── schema.prisma
│   └── seed.ts
├── .env.example
├── nuxt.config.ts
├── package.json
└── tsconfig.json
```

This is an example, not a rigid directory structure. Adjust it according to the actual page and the existing project.

Create components based on actual sections found in `docs/index.html`. Do not create unnecessary components merely to fill the directory structure.

Use semantic HTML elements and accessible controls.

## 5. Tailwind CSS Implementation

Use Tailwind CSS to reproduce the original visual design.

Requirements:

- Translate existing styles into appropriate Tailwind utility classes.
- Preserve the original layout, typography, colors, spacing, and component proportions.
- Reproduce responsive breakpoints and mobile navigation behavior.
- Implement hover, focus, active, and disabled states where applicable.
- Use consistent design tokens or Tailwind theme configuration when the same values recur.
- Keep custom CSS limited to styles that are difficult or inappropriate to express with Tailwind.
- Avoid unnecessary inline styles.
- Do not introduce a second styling framework.
- Do not remove important visual details for the sake of simplifying the implementation.

Use the Tailwind CSS integration compatible with the installed Nuxt.js and Tailwind CSS versions. Do not mix configuration conventions from different major versions.

After implementation, compare the Nuxt.js page with the original HTML at equivalent viewport sizes and correct any noticeable differences.

## 6. Identify and Model Dynamic Data

Analyze every section of the page and determine which information should be dynamic.

Examples may include:

- Products and product categories.
- Services and service descriptions.
- Articles and categories.
- Portfolio projects.
- Team members.
- Testimonials.
- Frequently asked questions.
- Navigation menus.
- Pricing plans.
- Statistics and metrics.
- Contact information.
- Forms and submissions.
- Other repeated or editable content found in the actual HTML.

These are examples only. Implement entities that are relevant to the existing page.

For every dynamic section:

1. Identify the data fields required by the UI.
2. Determine appropriate data types and nullable fields.
3. Identify entity relationships.
4. Define primary keys and foreign keys.
5. Add indexes and unique constraints where justified.
6. Determine whether records need timestamps, publication status, sorting order, or soft deletion.
7. Decide whether pagination, filtering, searching, or sorting is necessary.
8. Determine whether the content should be managed through a database or remain static.

Do not put every piece of HTML content into the database unnecessarily. Static labels, decorative text, and fixed UI configuration should remain in the frontend when database management provides no meaningful benefit.

## 7. Prisma Database Schema

Create a complete `prisma/schema.prisma` based on the actual dynamic data identified in `docs/index.html`.

Requirements:

- Use the configured database provider.
- Define models with meaningful names and fields.
- Use appropriate scalar types.
- Define primary keys, foreign keys, and relationships.
- Use unique constraints for fields that must be unique.
- Add indexes for commonly queried fields when justified.
- Use `createdAt` and `updatedAt` where appropriate.
- Use enums when a fixed set of states or categories is appropriate.
- Configure relation deletion behavior intentionally.
- Avoid redundant fields and unnecessary database tables.
- Use explicit database mappings only when necessary.
- Avoid storing related entities as serialized JSON when relational tables are more appropriate.

If the existing project uses a Prisma version that supports the newer configuration conventions, follow that version's requirements. Otherwise, preserve the conventions appropriate to the installed Prisma version.

Include a complete database migration workflow and a seed script containing realistic development data that corresponds to the original HTML.

Do not use fake data in production code as a substitute for actual database queries.

Provide commands for:

```bash
npx prisma validate
npx prisma generate
npx prisma migrate dev --name init
npx prisma db seed
```

Adjust these commands when required by the installed Prisma version or project configuration.

If a migration already exists, inspect it before creating another migration.

## 8. Prisma Client and Database Access

Create a reusable Prisma client instance in an appropriate server-only location, for example:

`server/utils/prisma.ts`

Requirements:

- Avoid creating a new Prisma client instance for every API request.
- Reuse the client appropriately during development hot reload.
- Ensure the Prisma client is never imported into client-side Vue components.
- Keep database queries on the server.
- Handle database errors appropriately.
- Avoid exposing database credentials or internal error details to API consumers.

Follow the initialization and connection conventions of the installed Prisma version.

Do not expose Prisma models directly as an uncontrolled public API. Select only the fields needed by each endpoint.

## 9. Implement Server API Endpoints

Create the required Nitro API endpoints under `server/api/`.

Use Nuxt's file-based API routing conventions and HTTP method suffixes.

Examples:

```text
server/api/
├── products/
│   ├── index.get.ts
│   ├── index.post.ts
│   ├── [id].get.ts
│   ├── [id].patch.ts
│   └── [id].delete.ts
├── categories/
│   └── index.get.ts
└── contact/
    └── index.post.ts
```

These endpoints are illustrative. Create only the endpoints required by the actual page and its intended functionality.

For every endpoint:

- Use the correct HTTP method.
- Validate query parameters, route parameters, and request bodies.
- Use Prisma for database access.
- Return consistent response structures.
- Handle missing records with appropriate HTTP status codes.
- Return meaningful validation errors.
- Handle unexpected errors without exposing stack traces or sensitive information.
- Implement pagination for collections when necessary.
- Support filtering and sorting when required by the UI.
- Prevent unauthorized modifications to protected resources.
- Apply appropriate input validation and security checks.
- Avoid unnecessary database queries and N+1 query patterns.

Use Nuxt/Nitro utilities such as `defineEventHandler`, `getQuery`, `getRouterParam`, `readBody`, and `createError` when appropriate.

Example API implementation style:

```ts
// server/api/products/index.get.ts

export default defineEventHandler(async (event) => {
  const products = await prisma.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    data: products,
  };
});
```

Treat this as an illustrative example only. Import and initialize the Prisma client correctly, select only necessary fields, and implement pagination and error handling according to the actual application requirements.

If an endpoint modifies or deletes data, ensure that its access control and validation match the intended application permissions.

Do not create public write endpoints for data that should only be managed by authenticated administrators.

## 10. Consume API Data from the Frontend

Use Nuxt's data-fetching utilities to consume the backend APIs.

Prefer:

- `useFetch` for reactive data fetching in Nuxt pages and components.
- `useAsyncData` when custom asynchronous data-loading logic is needed.
- `$fetch` for event handlers and client-side actions such as submitting forms.
- Server-side database access only inside server code.

Requirements:

- Replace hardcoded dynamic content with API-backed data.
- Preserve server-side rendering where appropriate.
- Avoid duplicate requests caused by incorrect SSR and hydration patterns.
- Implement loading, empty, and error states.
- Handle API failures gracefully.
- Keep the existing page usable when data collections are empty.
- Preserve the original HTML's interaction behavior.
- Avoid fetching the same data repeatedly in multiple components when it can be shared efficiently.

Do not access Prisma directly from client-side components.

## 11. Reusable Functions in `utils/`

I prefer declaring reusable functions using `const` and arrow function syntax.

Use the following style as the default:

```ts
export const formatCurrency = (value: number, currency = "IDR"): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
};
```

Prefer:

```ts
export const functionName = () => {
  // Implementation
};
```

Avoid using this as the default style:

```ts
export function functionName() {
  // Implementation
}
```

Use arrow functions consistently for reusable utility functions, API-related helper functions, formatters, mappers, and other applicable functions.

Place utilities in the correct location:

- `utils/`: General-purpose functions that can safely be used by the frontend and server.
- `composables/`: Functions that depend on Vue reactivity or Vue lifecycle behavior.
- `server/utils/`: Server-only functions, database helpers, and backend-specific logic.

Do not put database queries, server secrets, or server-only dependencies in a utility that may be imported by the client.

Create utilities only when they provide meaningful reuse or improve maintainability. Do not create unnecessary abstractions for trivial one-off operations.

Examples of potentially useful utilities, depending on the actual application:

- Currency formatting.
- Date formatting.
- String normalization.
- Slug generation.
- Pagination parsing.
- API response mapping.
- Request validation helpers.
- Shared constants and types.

Ensure utilities have appropriate TypeScript types and handle invalid input when necessary.

## 12. Environment Variables

Create `.env.example` with all environment variables required by the application.

Every variable must include a comment explaining its purpose.

Example:

```dotenv
# Database connection URL used by Prisma.
# Replace the placeholder credentials and database name with your local configuration.
DATABASE_URL="postgresql://postgres:password@localhost:5432/myapp?schema=public"

# Public base URL of the Nuxt.js application.
NUXT_PUBLIC_APP_URL="http://localhost:3000"

# Optional: secret used by the authentication provider if authentication is implemented.
# Generate a cryptographically secure random value for the actual environment.
BETTER_AUTH_SECRET="replace-with-a-secure-random-secret"

# Base URL used by the authentication provider if authentication is implemented.
BETTER_AUTH_URL="http://localhost:3000"
```

The authentication-related variables above are conditional examples. Include them only if authentication is actually required by the existing project or the intended features.

Requirements:

- Inspect the existing project to identify all variables that are genuinely required.
- Include database configuration and any other required external service settings.
- Include comments describing the purpose of each variable and how to configure it.
- Use placeholders rather than real credentials.
- Never commit actual secrets.
- Do not expose private variables through `runtimeConfig.public`.
- Prefix client-accessible environment variables with `NUXT_PUBLIC_` only when public exposure is intentional.
- Use server-side runtime configuration for private values.
- Ensure `.env.example` stays synchronized with the variables used by the application.
- Do not assume `.env.example` is automatically loaded by Nuxt or Node.js. Document how to create the actual local `.env` file.

If the project does not need authentication, SMTP, payment integrations, or other external services, do not add unused environment variables merely for completeness.

## 13. Validation, Security, and Error Handling

Implement appropriate safeguards for the application.

Requirements:

- Validate all external input on the server.
- Use Zod or an equivalent validation mechanism where appropriate.
- Never trust frontend validation alone.
- Avoid SQL injection by using Prisma's parameterized query mechanisms and avoiding unsafe raw SQL.
- Apply authorization checks to protected endpoints.
- Avoid mass assignment by explicitly selecting accepted request fields.
- Avoid exposing passwords, authentication tokens, private fields, or database connection information.
- Handle missing and malformed request parameters.
- Prevent unintended modification of records through public endpoints.
- Use appropriate HTTP status codes.
- Keep server-only code out of the client bundle.

Do not introduce authentication or role-based access control without determining whether the application actually requires it. If protected administrative operations are necessary, implement them securely.

## 14. Loading States and User Experience

Preserve the original interactions and make the application functional.

For database-backed content, implement:

- Loading states.
- Empty states.
- Error states.
- Form validation feedback.
- Success and failure messages.
- Responsive layouts.
- Accessible keyboard navigation.
- Appropriate focus states.
- Functional links and buttons.

Do not leave buttons with placeholder actions when the original design implies real functionality.

If a feature requires an external service or additional credentials, clearly identify the missing configuration instead of pretending the feature is operational.

## 15. Seed Data and Initial Content

Create `prisma/seed.ts` to populate the database with development data based on the content in `docs/index.html`.

Requirements:

- Use realistic content derived from the original page.
- Match the actual Prisma schema.
- Include the records necessary to render the page during local development.
- Avoid creating duplicate records on repeated seed executions.
- Use deterministic identifiers or unique constraints where appropriate.
- Keep the seed script separate from production application logic.

Use an idempotent approach such as `upsert` when appropriate.

Do not silently replace existing production data or run destructive database operations.

## 16. Documentation

Update or create `README.md` with clear instructions covering:

1. Prerequisites.
2. Installing dependencies.
3. Configuring environment variables.
4. Starting the local database.
5. Running Prisma migrations.
6. Generating the Prisma client.
7. Seeding the database.
8. Starting the Nuxt.js development server.
9. Building and running the production application.
10. Available API endpoints.
11. Database model descriptions.
12. Any external services required by the application.

Include the actual commands appropriate for the repository rather than assuming all package managers or deployment environments are identical.

If Docker Compose is useful for local database development, provide a configuration consistent with the chosen database provider and existing project setup.

## 17. Quality Requirements

The completed application must satisfy the following criteria:

- The page visually matches `docs/index.html` as closely as practical.
- All relevant sections are preserved.
- Reusable Vue components are implemented where appropriate.
- Tailwind CSS is used consistently.
- Dynamic content is loaded from the database through the server API.
- The Prisma schema reflects the actual data requirements.
- Database migrations and seed data are included.
- The necessary `server/api/` endpoints are functional.
- Reusable utilities use `const` arrow functions by default.
- Environment variables are documented in `.env.example`.
- TypeScript types are consistent across the frontend, API, and database access layers.
- API validation and error handling are implemented.
- No database credentials or server secrets are exposed to the browser.
- No unnecessary dependencies or duplicate configurations are introduced.
- The application works with empty datasets and handles API errors gracefully.
- The project can be installed, migrated, seeded, developed, and built using the documented instructions.

## 18. Execution Plan

Execute the work in the following order:

### Phase 1: Inspect

- Inspect the repository and package configuration.
- Read `docs/index.html` completely.
- Inspect all referenced assets and styles.
- Identify the existing framework and dependency versions.
- Document the UI sections, interactions, and dynamic data requirements.

### Phase 2: Design the Architecture

- Define the Nuxt.js component structure.
- Determine which content should be dynamic.
- Design the Prisma models and relationships.
- Map each dynamic section to the required API endpoints.
- Determine validation, authorization, and pagination requirements.

### Phase 3: Implement the Backend

- Configure Prisma.
- Create the Prisma schema.
- Implement the Prisma client.
- Add database migrations and seed data.
- Create the necessary `server/api/` endpoints.
- Add request validation and error handling.
- Create reusable server utilities.

### Phase 4: Implement the Frontend

- Convert the HTML into Vue components and Nuxt pages.
- Configure Tailwind CSS.
- Reproduce the original design and responsive behavior.
- Connect dynamic sections to the server API.
- Implement loading, empty, and error states.
- Create reusable utilities using `const` arrow functions.

### Phase 5: Configuration and Documentation

- Create or update `.env.example`.
- Update the README.
- Document setup, migration, seeding, development, and production commands.
- Ensure no actual credentials are committed.

### Phase 6: Verification

- Run Prisma schema validation.
- Generate the Prisma client.
- Run migrations against a configured development database.
- Execute the seed script.
- Run TypeScript checks and the Nuxt production build.
- Fix errors introduced by the implementation.
- Verify API responses and frontend interactions.
- Compare the rendered page with the original HTML at representative viewport sizes.

Do not claim that a check passed unless it was actually executed successfully.

## 19. Final Deliverables

At the end of the task, provide:

1. A summary of the changes made.
2. The final project directory structure.
3. The complete Prisma schema and migration files.
4. The implemented Nitro API endpoints.
5. The converted Nuxt.js pages and Vue components.
6. The Tailwind CSS configuration.
7. The reusable utility functions.
8. The `.env.example` file with comments.
9. The database seed script.
10. The README with setup instructions.
11. A list of executed validation commands and their actual results.
12. Any remaining issues, assumptions, or required external configuration.

**Important:** Work directly with the existing repository. Do not stop after producing an architectural proposal or example snippets. Implement the application, inspect the results, and verify the completed changes. If essential information is missing, make reasonable assumptions based on the existing codebase and clearly document them. Ask questions only when an unresolved decision materially affects correctness or security.

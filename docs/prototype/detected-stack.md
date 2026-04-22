# Detected Tech Stack

| Layer | Detected | Confidence | Evidence |
|-------|----------|------------|----------|
| Frontend | React 19 + TypeScript | High | `package.json` → `react: ^19.0.0`, `tsconfig.json` → `jsx: react-jsx` |
| UI Framework | Radix UI + shadcn/ui + Tailwind CSS v4 | High | 40+ Radix primitives in `src/components/ui/`, `@tailwindcss/vite` in deps |
| Build Tool | Vite (SWC) | High | `vite.config.ts` → `@vitejs/plugin-react-swc` |
| Animation | Framer Motion | High | `framer-motion: ^12.6.2` in deps, used in DocumentTree, AIChatPanel |
| Charts | Recharts + D3 | High | `recharts: ^2.15.1`, `d3: ^7.9.0` in deps |
| PDF Rendering | Custom (simulated) | Medium | `PDFViewer.tsx` renders static content; no pdf.js/pdfjs-dist in deps |
| Form Handling | React Hook Form + Zod | High | `react-hook-form: ^7.54.2`, `zod: ^3.25.76`, `@hookform/resolvers` |
| State / Persistence | GitHub Spark KV | High | `@github/spark` hooks (`useKV`) used throughout all components |
| Icons | Phosphor Icons | High | `@phosphor-icons/react: ^2.1.7` used in every component |
| Backend | None (client-only mockup) | High | No server code, no API routes, all persistence via Spark KV |
| Database | None | High | No DB config files or ORM libraries |
| Infrastructure | GitHub Spark (hosting) | High | `spark.meta.json`, `@github/spark` plugin in vite config |

## Tech Stack Summary

The design folder contains a **client-only UI mockup** built on GitHub Spark (a rapid prototyping platform). It demonstrates the full UX flow but has:

- **No real backend** — all data persisted via `useKV` (Spark's ephemeral KV store)
- **No real PDF rendering** — PDFViewer shows simulated/static content
- **No real AI integration** — chat responses are mocked
- **No authentication** — user identity comes from `window.spark.user()`

### Production Stack Decisions Needed

| Capability | Mockup Approach | Production Options to Evaluate |
|------------|----------------|-------------------------------|
| PDF Rendering & Annotation | Custom simulated viewer | pdf.js, PSPDFKit, PDF Tron, Nutrient (formerly PSPDFKit) |
| Document Conversion (→PDF) | Not implemented | LibreOffice headless, Aspose, CloudConvert API |
| AI Chat / RAG | Mocked responses | Azure OpenAI + Azure AI Search, LangChain, LlamaIndex |
| Document Storage | Spark KV (ephemeral) | Azure Blob Storage, S3, SharePoint |
| Authentication | Spark user() | NUS SSO (SAML/OIDC), Azure AD B2C |
| Backend API | None | Node.js/Express, .NET, Spring Boot, FastAPI |
| Database | None | PostgreSQL, Cosmos DB, MongoDB |
| Search | Not implemented | Azure AI Search, Elasticsearch, Typesense |
| File Processing | Not implemented | Azure Functions, AWS Lambda, background workers |

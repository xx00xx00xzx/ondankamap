# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**yuell-ユエル-** is an MBTI personality-based conversation simulator built with Next.js 14, TypeScript, and OpenAI GPT-4.1. It helps users improve their communication skills by generating realistic dialogues between two people based on their MBTI types and provides psychological analysis.

## Common Development Commands

```bash
npm run dev        # Start development server (http://localhost:3000)
npm run build      # Production build
npm run lint       # Run ESLint
npm run type-check # TypeScript validation
```

## Architecture & Key Patterns

### Core Flow
1. User inputs MBTI types and parameters on main page (`app/page.tsx`)
2. Form submission calls `/api/simulate` endpoint with OpenAI integration
3. Results stored in sessionStorage and displayed on `/result` page
4. Optional PDF export with jsPDF + html2canvas

### API Endpoints
- `/app/api/simulate/route.ts` - Main conversation simulator with advanced psychological techniques
- `/app/api/simulate_default/route.ts` - Simplified simulator without psychological techniques section
- `/app/api/analyze/route.ts` - Analyzes conversations and provides structured insights

### Important Files
- `/lib/mbti.ts` - All MBTI types, interfaces, and core data structures
- `/components/ChatSection.tsx` - Animated conversation display logic
- `/components/ReportSection.tsx` - Analysis report generation
- `test.yaml` & `tst.yaml` - Project specifications and feature blueprints

### Key Design Patterns
- **No Backend/Database**: Uses sessionStorage for state persistence
- **Type Safety**: Comprehensive TypeScript interfaces in `lib/mbti.ts`
- **Component Architecture**: shadcn/ui components in `/components/ui/`
- **Japanese-First**: All prompts and UI optimized for Japanese language

### OpenAI Integration
- Model: GPT-4.1-2025-04-14 (different temperatures for different purposes)
  - Temperature 1.0 for conversation simulation (creative outputs)
  - Temperature 0.7 for analysis (focused outputs)
- Structured JSON response format enforced for analysis
- Ethical content filtering with comedic fallback responses
- Response includes: conversation, scores, analysis, advice

### Prompt Engineering Features
- Cultural awareness (Japanese formality rules, 敬語 usage)
- Psychological techniques (cognitive biases, persuasion principles)
- Parameter-based customization (formality, closeness, favorability, etc.)
- Age-based dialogue adjustments
- Ethical safeguards with `ethical_check_triggered` flag

### UI Framework
- Tailwind CSS with custom gradients and glass morphism effects
- Framer Motion for animations (fade-in, scale transitions)
- Recharts for radar chart visualization
- Responsive design with mobile-first approach

## Environment Setup

Create `.env.local` with:
```
OPENAI_API_KEY=your_openai_api_key_here
```

## Development Notes

- When modifying conversation generation, update the system prompt in `/app/api/simulate/route.ts`
- For simpler conversations without psychological techniques, use `/app/api/simulate_default/route.ts`
- MBTI personality descriptions and types are centralized in `/lib/mbti.ts`
- All UI components follow shadcn/ui patterns - check existing components before creating new ones
- Session storage keys: `simulationResult` for main data persistence
- The analysis endpoint provides structured scoring on 5 dimensions (円満度, 目標達成度, etc.)

## Claude Development Guidelines

### Task Management & Communication Rules
- **Todo System**: Use TodoWrite tool to plan and track multi-step tasks. Create todos for complex tasks requiring 3+ steps or multiple operations.
- **Concurrent Execution**: To maximize efficiency, execute multiple independent processes concurrently, not sequentially.
- **Task Completion Notification**: Send macOS notification upon task completion using: `osascript -e 'display notification "${TASK_DESCRIPTION} is complete" with title "personatalk_dev"'`
- **Language**: Think in English, respond in Japanese. No unnecessary spaces in Japanese (e.g., "Claude Code入門" not "Claude Code 入門").
- **Prompt Preservation**: Do not modify existing prompts in the codebase unless explicitly requested. Maintain prompt content as-is during development.

### Code Quality Standards
- **Linting**: Always run lint and type-check commands after making changes to ensure code correctness.
- **Testing**: Verify solutions with tests when possible. Check README or search codebase for testing approach rather than assuming test framework.
- **TypeScript**: Avoid `any` or `unknown` types. Do not use `class` unless absolutely necessary (e.g., extending Error class).
- **Hard-coding**: Avoid hard-coded values unless absolutely necessary.

### Documentation Standards
- **JSDoc/Docstrings**: Write in English
- **Code comments (implementation reasoning)**: Write in Japanese
- **Embedded comments** (Vitest, zod-openapi descriptions): Write in English
- **No emojis** in any documentation

### Development Workflow
- **Requirements**: Document in `.tmp/design.md`
- **Task Planning**: Define detailed sub-tasks in `.tmp/task.md` and update as work progresses
- **Branching**: Create feature branches with `feature/` prefix
- **Commits**: Break down into small, manageable units
- **Code Formatting**: Always apply formatter for readability
- **Library Research**: Use Context7 MCP for latest library information
- **Hidden Files**: Use Bash tool to find hidden folders like `.tmp`


##注意事項
1./(admin)/page.tsx等のルートグループをネストルーティングとして認識しないようにしてください。 
➡ ルートグループはルーティングとしては認識しません。トップページのpage.tsxと競合するのでエラーになります。

2.useEffect()を原則使用しない。 
➡ ベストプラクティスは「サーバーコンポーネントでのデータフェッチ」です。DAL等でデータフェッチ用のファイルを作成しておき、呼び出すときはサーバーコンポーネントで行うようにしましょう。

3.ストリーミングデータフェッチングする。
➡先ほどのサーバーコンポーネントの利用に加えて、各コンポーネントでデータ取得時にスケルトン表示したい場合は「ストリーミングデータフェッチング」をSuspenceで行うようにしてください。

4. Server Actionsで原則実装する。 
➡可能な限りServer Actionsが理想です。

5. useSearchParamsや動的ルーティングの/blog/[id]等のpramas受け取る際は、非同期で受け取る。
➡ async/awaitで受け取らないとエラーになります。

6.Supabaseをサーバー側で実行する場合はcreateServerClient()を利用する。
➡ クライアント側で実行する場合はcreateClient()で、サーバー側で実行する場合はcreateServerClient()を利用するのが正解です。モジュールは@supabase/supabase-js @supabase/ssrを利用しています。
# HealthyMe AI – Frontend Technical Test

Smart Health Insight & Planner built with **React + TypeScript + Vite**, **Redux Toolkit**, **Ant Design UI & Charts**, and an **LLM integration** for generating structured health reports.

The app lets a user enter basic health details and goal weight, calls an LLM (or a mock generator) to create a personalized report, and renders:

- **Summary & BMI**
- **Exercise calendar**
- **Nutrition insights (charts)**
- **Weight progress line chart**
- **Activity & body composition charts**
- **Timeline with estimated weeks to goal**
- **PDF export of the final report**

## Tech stack

- **React + TypeScript + Vite**
- **Redux Toolkit** for state and async flows
- **Ant Design** (`antd`) for UI
- **Ant Design Charts** (`@ant-design/charts`) for data visualisation
- **Google Gen AI SDK** (`@google/genai`) for Gemini LLM integration
- **html2canvas + jsPDF** for PDF export

## Getting started

From the repository root:

```bash
npm install
npm run dev
```

Then open the printed local URL (typically `http://localhost:5173/`) in your browser.

## LLM configuration (Gemini)

To enable real LLM-generated reports using **Gemini via `@google/genai`**:

1. Create a `.env` file in the project root:

```bash
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```

2. Restart the dev server:

```bash
npm run dev
```

The LLM client uses the official Google Gen AI SDK and sends a strict JSON-structured instruction so that the response can be parsed directly into the app’s TypeScript types.

## Project structure (key files)

- `src/types/report.ts` – shared TypeScript types for the health report
- `src/services/llmClient.ts` – LLM API client + mock fallback
- `src/store/reportSlice.ts` – Redux slice and async thunk for report generation
- `src/store/index.ts` – store setup and typed hooks
- `src/components/UserInputForm.tsx` – Ant Design form for user inputs
- `src/components/HealthReportView.tsx` – layout + charts + PDF export
- `src/App.tsx` / `src/main.tsx` – overall layout and Redux provider wiring

## Running lint and build

```bash
npm run lint
npm run build
```

These commands ensure the project compiles cleanly and passes basic linting before submission.

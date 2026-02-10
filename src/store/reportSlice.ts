import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { HealthReport, UserProfileInput } from '../types/report';
import { generateHealthReport } from '../services/llmClient';

export interface ReportState {
  userInput: UserProfileInput | null;
  report: HealthReport | null;
  loading: boolean;
  error: string | null;
  rawResponse: string | null;
}

const initialState: ReportState = {
  userInput: null,
  report: null,
  loading: false,
  error: null,
  rawResponse: null,
};

export const generateReportThunk = createAsyncThunk<
  { report: HealthReport; rawText: string },
  UserProfileInput
>('report/generate', async (input, { rejectWithValue }) => {
  try {
    const result = await generateHealthReport(input);
    return result;
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Failed to generate report';
    return rejectWithValue(message);
  }
});

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setUserInput(state, action: PayloadAction<UserProfileInput>) {
      state.userInput = action.payload;
    },
    clearReport(state) {
      state.report = null;
      state.rawResponse = null;
      state.error = null;
      state.loading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateReportThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        generateReportThunk.fulfilled,
        (state, action: PayloadAction<{ report: HealthReport; rawText: string }>) => {
          state.loading = false;
          state.report = action.payload.report;
          state.rawResponse = action.payload.rawText;
        },
      )
      .addCase(generateReportThunk.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string | null) ??
          action.error.message ??
          'Unknown error';
      });
  },
});

export const { setUserInput, clearReport } = reportSlice.actions;

export default reportSlice.reducer;


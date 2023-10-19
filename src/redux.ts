import { configureStore, createSlice } from "@reduxjs/toolkit";
import { State } from "./state/types";
export const NEVER_CHANGES = { value: "never changes" };

const initialState: State | null = null;

const slice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setState: (state, action) => {
      state = action.payload;
    },
  },
});

export const { setState } = slice.actions;
export const store = configureStore({ reducer: slice.reducer });
export type AppDispatch = typeof store.dispatch;

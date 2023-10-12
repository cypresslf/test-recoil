import { configureStore, createSlice } from "@reduxjs/toolkit";
export const NEVER_CHANGES = { value: "never changes" };
const slice = createSlice({
  name: "state",
  initialState: {
    mousePosition: { x: 0, y: 0 },
    neverChanges: NEVER_CHANGES,
  },
  reducers: {
    setMousePosition: (state, action) => {
      state.mousePosition = action.payload;
    },
    setNeverChanges: (state, action) => {
      state.neverChanges = action.payload;
    },
  },
});

export const { setMousePosition, setNeverChanges } = slice.actions;
export const store = configureStore({ reducer: slice.reducer });
export type AppDispatch = typeof store.dispatch;
export type State = ReturnType<typeof store.getState>;

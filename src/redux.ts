import { PayloadAction, configureStore, createSlice } from "@reduxjs/toolkit";
import { LIST_IDS } from "./constants";
export const NEVER_CHANGES = { value: "never changes" };

export type State = {
  list: Record<string, { value: number }>;
  listIds: string[];
  mousePosition: { x: number; y: number };
  neverChanges: { value: string };
};

const initialState: State = {
  listIds: LIST_IDS,
  list: LIST_IDS.map((id) => ({ [id]: { value: 0 } })).reduce(
    (a, b) => ({ ...a, ...b }),
    {}
  ),
  mousePosition: { x: 0, y: 0 },
  neverChanges: NEVER_CHANGES,
};

const slice = createSlice({
  name: "state",
  initialState,
  reducers: {
    setMousePosition: (state, action) => {
      state.mousePosition = action.payload;
    },
    setNeverChanges: (state, action) => {
      state.neverChanges = action.payload;
    },
    setListValue: (
      state,
      action: PayloadAction<{ id: number; value: number }>
    ) => {
      const item = state.list[action.payload.id];
      if (item) item.value = action.payload.value;
    },
  },
});

export const { setMousePosition, setNeverChanges, setListValue } =
  slice.actions;
export const store = configureStore({ reducer: slice.reducer });
export type AppDispatch = typeof store.dispatch;

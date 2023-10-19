import { configureStore } from "@reduxjs/toolkit";
import { State } from "./state/types";
import { TypedUseSelectorHook, useSelector } from "react-redux";
import { applyJsonPatch } from "./state/lib";

export const store = configureStore({
  reducer: (state: State | null = null, action) => {
    if (action.type === "patch") {
      return applyJsonPatch(state, action.payload);
    }
    return state;
  },
});
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<State> = useSelector;

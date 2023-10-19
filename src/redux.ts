import { configureStore } from "@reduxjs/toolkit";
import { State } from "./state/types";
import { applyPatch } from "fast-json-patch";
import { TypedUseSelectorHook, useSelector } from "react-redux";

export const store = configureStore({
  reducer: (state: State | null = null, action) => {
    if (action.type === "patch") {
      return applyPatch(state, action.payload, undefined, false).newDocument;
    }
    return state;
  },
});
export type AppDispatch = typeof store.dispatch;
export const useAppSelector: TypedUseSelectorHook<State> = useSelector;

import "./App.css";
import { useState } from "react";
import Recoil from "./Recoil";
import Redux from "./Redux";
import { RecoilRoot } from "recoil";
import { Provider } from "react-redux";
import { store } from "./redux";
import Custom, { StateProvider } from "./Custom";

type Page = "recoil" | "redux" | "custom";
const pageUI = {
  recoil: (
    <RecoilRoot>
      <Recoil />
    </RecoilRoot>
  ),
  redux: (
    <Provider store={store}>
      <Redux />
    </Provider>
  ),
  custom: (
    <StateProvider>
      <Custom />
    </StateProvider>
  ),
};

export default function App() {
  const [page, setPage] = useState<Page>("custom");

  return (
    <>
      <div>
        <button
          onClick={() => setPage("recoil")}
          className={page === "recoil" ? "selected" : ""}
        >
          Recoil
        </button>
        <button
          onClick={() => setPage("redux")}
          className={page === "redux" ? "selected" : ""}
        >
          Redux
        </button>
        <button
          onClick={() => setPage("custom")}
          className={page === "custom" ? "selected" : ""}
        >
          Custom
        </button>
      </div>
      {pageUI[page]}
    </>
  );
}

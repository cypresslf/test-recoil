import "./App.css";
import { useState } from "react";
import Recoil from "./Recoil";
import Redux from "./Redux";
import { RecoilRoot } from "recoil";
import { Provider } from "react-redux";
import { store } from "./redux";

type Page = "recoil" | "redux";

export default function App() {
  const [page, setPage] = useState<Page>("recoil");

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
      </div>
      {page === "recoil" ? (
        <RecoilRoot>
          <Recoil />
        </RecoilRoot>
      ) : (
        <Provider store={store}>
          <Redux />
        </Provider>
      )}
    </>
  );
}

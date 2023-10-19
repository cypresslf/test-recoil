import "./App.css";
import { useState } from "react";
import Recoil from "./Recoil";
import Redux from "./Redux";
import { RecoilRoot } from "recoil";
import { Provider } from "react-redux";
import { store } from "./redux";
import Custom from "./Custom";
import { StateProvider, WebsocketProvider } from "./state/context";

type Page = "recoil" | "redux" | "custom";
const pageUI = {
  recoil: (
    <WebsocketProvider key="recoil">
      <RecoilRoot>
        <Recoil />
      </RecoilRoot>
    </WebsocketProvider>
  ),
  redux: (
    <WebsocketProvider key="redux">
      <Provider store={store}>
        <Redux />
      </Provider>
    </WebsocketProvider>
  ),
  custom: (
    <WebsocketProvider key="custom">
      <StateProvider>
        <Custom />
      </StateProvider>
    </WebsocketProvider>
  ),
};

export default function App() {
  const path = window.location.pathname.substring(1);
  const initialPage: Page = Object.keys(pageUI).includes(path)
    ? (path as Page)
    : "recoil";
  const [page, setPage] = useState<Page>(initialPage);
  const handleClick = (page: Page) => () => {
    setPage(page);
    const url = new URL(window.location.href);
    url.pathname = page;
    history.pushState({}, "", url);
  };

  return (
    <>
      <div>
        <button
          onClick={handleClick("recoil")}
          className={page === "recoil" ? "selected" : ""}
        >
          Recoil
        </button>
        <button
          onClick={handleClick("redux")}
          className={page === "redux" ? "selected" : ""}
        >
          Redux
        </button>
        <button
          onClick={handleClick("custom")}
          className={page === "custom" ? "selected" : ""}
        >
          Custom
        </button>
      </div>
      {pageUI[page]}
    </>
  );
}

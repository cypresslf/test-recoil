import { atom, useRecoilValue, useSetRecoilState } from "recoil";
import "./App.css";
import { useEffect, useState } from "react";

const NEVER_CHANGES = { value: "never changes" };

const counterState = atom({
  key: "counterState",
  default: 0,
});

const mousePositionState = atom({
  key: "mousePositionState",
  default: { x: 0, y: 0 },
});

const neverChangesState = atom({
  key: "neverChanges",
  default: NEVER_CHANGES,
});

type Page = "recoil" | "redux";

function App() {
  const page = useState<Page>("recoil");
  const setCounter = useSetRecoilState(counterState);
  const setMousePosition = useSetRecoilState(mousePositionState);
  const setNeverChanges = useSetRecoilState(neverChangesState);

  useEffect(() => {
    const id = setInterval(() => {
      setCounter((c) => c + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [setCounter]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setNeverChanges(NEVER_CHANGES);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [setMousePosition, setNeverChanges]);

  return (
    <>
      <FastChild />
      <SlowChild />
    </>
  );
}

function FastChild() {
  const counter = useRecoilValue(counterState);
  const mousePosition = useRecoilValue(mousePositionState);

  return (
    <div>
      <p>Counter: {counter}</p>
      <p>
        Mouse position: ({mousePosition.x}, {mousePosition.y})
      </p>
    </div>
  );
}

function SlowChild() {
  const neverChanges = useRecoilValue(neverChangesState);

  const start = Date.now();
  while (Date.now() - start < 1000) {
    // artificial delay: simulate a slow render
  }

  return <div>Slow Child {neverChanges.value}</div>;
}

export default App;

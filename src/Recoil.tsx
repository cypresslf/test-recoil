import { useEffect } from "react";
import { RecoilRoot, atom, useRecoilValue, useSetRecoilState } from "recoil";

const NEVER_CHANGES = { value: "never changes" };

const mousePositionState = atom({
  key: "mousePositionState",
  default: { x: 0, y: 0 },
});

const neverChangesState = atom({
  key: "neverChanges",
  default: NEVER_CHANGES,
});

function Recoil() {
  const setMousePosition = useSetRecoilState(mousePositionState);
  const setNeverChanges = useSetRecoilState(neverChangesState);

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
  const mousePosition = useRecoilValue(mousePositionState);

  return (
    <p>
      Mouse position: ({mousePosition.x}, {mousePosition.y})
    </p>
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

export default Recoil;

import { useEffect } from "react";
import { atom, atomFamily, useRecoilValue, useSetRecoilState } from "recoil";

const NEVER_CHANGES = { value: "never changes" };

const mousePositionState = atom({
  key: "mousePositionState",
  default: { x: 0, y: 0 },
});

const neverChangesState = atom({
  key: "neverChanges",
  default: NEVER_CHANGES,
});

const listState = atom({
  key: "listIds",
  default: [1, 2, 3],
});

const listStateFamily = atomFamily({
  key: "list",
  default: { value: 0 },
});

function Recoil() {
  const setMousePosition = useSetRecoilState(mousePositionState);
  const setNeverChanges = useSetRecoilState(neverChangesState);
  const setListItem = useSetRecoilState(listStateFamily(1));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setListItem({ value: e.clientX + e.clientY });
      setNeverChanges(NEVER_CHANGES);
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [setMousePosition, setNeverChanges, setListItem]);

  return (
    <>
      <SlowList />
      <FastChild />
      <SlowChild />
    </>
  );
}

function SlowList() {
  const listIds = useRecoilValue(listState);

  const start = Date.now();
  while (Date.now() - start < 1000) {
    // artificial delay: simulate a slow render
  }

  return (
    <>
      <p>Slow list with one fast-changing item</p>
      <ul>
        {listIds.map((id) => (
          <FastListItem id={id} />
        ))}
      </ul>
    </>
  );
}

function FastListItem({ id }: { id: number }) {
  const item = useRecoilValue(listStateFamily(id));

  return item ? <li key={item.value}>{item.value}</li> : undefined;
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

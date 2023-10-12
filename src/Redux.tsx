import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  AppDispatch,
  NEVER_CHANGES,
  State,
  setListValue,
  setMousePosition,
  setNeverChanges,
} from "./redux";

function Redux() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      dispatch(setMousePosition({ x: e.clientX, y: e.clientY }));
      dispatch(setListValue({ id: 1, value: e.clientX + e.clientY }));
      dispatch(setNeverChanges(NEVER_CHANGES));
    };
    window.addEventListener("mousemove", handler);
    return () => window.removeEventListener("mousemove", handler);
  }, [dispatch]);
  return (
    <>
      <SlowList />
      <FastChild />
      <SlowChild />
    </>
  );
}

function SlowList() {
  const list = useSelector((state: State) => state.list);

  const start = Date.now();
  while (Date.now() - start < 1000) {
    // artificial delay: simulate a slow render
  }

  return (
    <>
      <p>Slow list with one fast-changing item</p>
      <ul>
        {Object.values(list).map((item) => (
          <li key={item.id}>
            id: {item.id} value: {item.value}
          </li>
        ))}
      </ul>
    </>
  );
}

function FastChild() {
  const mousePosition = useSelector((state: State) => state.mousePosition);

  return (
    <p>
      Mouse position: ({mousePosition.x}, {mousePosition.y})
    </p>
  );
}
function SlowChild() {
  const neverChanges = useSelector((state: State) => state.neverChanges);

  const start = Date.now();
  while (Date.now() - start < 1000) {
    // artificial delay: simulate a slow render
  }

  return <p>Slow child {neverChanges.value}</p>;
}

export default Redux;

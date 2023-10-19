import { useDispatch } from "react-redux";
import { AppDispatch } from "./redux";

function Redux() {
  const dispatch = useDispatch<AppDispatch>();

  return <p>Redux</p>;
}

export default Redux;

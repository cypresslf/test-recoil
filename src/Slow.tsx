function Slow() {
  const neverChanges = useRecoilValue(neverChangesState);

  const start = Date.now();
  while (Date.now() - start < 1000) {
    // artificial delay: simulate a slow render
  }

  return <div>Slow Child {neverChanges.value}</div>;
}

import { useState } from "react";

export function HostInput({
  onChange,
  value,
}: {
  onChange: (host: string | null) => void;
  value: string | null;
}) {
  const [input, setInput] = useState<string | null>(value);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onChange(input);
        const url = new URL(window.location.href);
        if (input === null) url.searchParams.delete("host");
        else url.searchParams.set("host", input);
        history.pushState({}, "", url);
      }}
    >
      <input
        type="text"
        placeholder="scanner hostname"
        value={input ?? ""}
        onChange={(e) => setInput(e.target.value)}
      />
      <button type="submit" disabled={value === input}>
        Connect
      </button>
    </form>
  );
}

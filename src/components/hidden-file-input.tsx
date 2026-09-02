import { useEffect, useState, type ComponentProps } from "react";

/** Client-only so screenshot tooling cannot mutate a server-rendered file input. */
export function HiddenFileInput(props: ComponentProps<"input">) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <input {...props} type="file" className={`hidden ${props.className ?? ""}`} />;
}

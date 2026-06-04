export function Message({
  message,
  type,
}: {
  message?: string;
  type?: string;
}) {
  if (!message) return null;
  return <div className={`notice ${type === "error" ? "error" : "ok"}`}>{message}</div>;
}

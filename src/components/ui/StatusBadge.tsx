export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone =
    normalized === "completed" || normalized === "approved" || normalized === "active"
      ? "ok"
      : normalized === "pending"
        ? "warn"
        : normalized === "rejected" || normalized === "cancelled" || normalized === "inactive"
          ? "error"
          : "";

  return <span className={`badge ${tone}`}>{status}</span>;
}

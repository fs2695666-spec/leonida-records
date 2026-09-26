// Re-mounts on every navigation → soft page-enter animation (CSS only, no JS).
export default function Template({ children }) {
  return <div className="page-enter">{children}</div>;
}

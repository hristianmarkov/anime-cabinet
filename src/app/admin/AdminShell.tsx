import Link from "next/link";
import { logout } from "./actions";

export function AdminShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: "orders" | "messages";
}) {
  const linkClass = (key: "orders" | "messages") =>
    key === active
      ? "rounded-full bg-accent/20 px-4 py-2 text-sm font-semibold text-accent"
      : "rounded-full px-4 py-2 text-sm font-semibold text-muted transition hover:text-cream";

  return (
    <div className="min-h-screen">
      <header className="border-b border-line bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <nav className="flex items-center gap-2">
            <span className="font-display mr-4 text-lg text-cream">Admin</span>
            <Link href="/admin" className={linkClass("orders")}>
              Orders
            </Link>
            <Link href="/admin/messages" className={linkClass("messages")}>
              Messaging
            </Link>
          </nav>
          <form action={logout}>
            <button
              type="submit"
              className="rounded-full border border-line px-5 py-2 text-sm font-semibold text-muted transition hover:text-cream"
            >
              Log out
            </button>
          </form>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

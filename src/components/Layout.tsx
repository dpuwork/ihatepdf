import { Outlet } from "react-router-dom";
import Header from "./Header";

export default function Layout() {
  return (
    <>
      <Header />

      <main className="flex-1 bg-canvas">
        <Outlet />
      </main>

      {/* Simplified, hyper-minimalist footer: {YEAR} ihatepdf   {link to github} */}
      <footer className="mt-auto bg-canvas border-t border-hairline py-6 font-mono text-xs">
        <div className="max-w-6xl mx-auto px-4 flex justify-between items-center text-mute">
          <span>2026 ihatepdf</span>
          <a
            href="https://github.com/borisevstratov/ihatepdf"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink underline uppercase tracking-wider font-bold"
          >
            github
          </a>
        </div>
      </footer>
    </>
  );
}

import { Link } from "react-router-dom";

const logoAscii = `
░██░██                      ░██                                 ░██     ░████ 
   ░██                      ░██                                 ░██    ░██    
░██░████████   ░██████   ░████████  ░███████  ░████████   ░████████ ░████████ 
░██░██    ░██       ░██     ░██    ░██    ░██ ░██    ░██ ░██    ░██    ░██    
░██░██    ░██  ░███████     ░██    ░█████████ ░██    ░██ ░██    ░██    ░██    
░██░██    ░██ ░██   ░██     ░██    ░██        ░███   ░██ ░██   ░███    ░██    
░██░██    ░██  ░█████░██     ░████  ░███████  ░██░█████   ░█████░██    ░██    
                                              ░██                             
                                              ░██                             
                                                                              
`.trim();

export default function Header() {
  return (
    <div className="font-mono text-ink">
      {/* Announcement Strip */}
      <div className="bg-surface-dark text-on-dark text-center py-2 text-xs font-bold uppercase tracking-wider border-b border-hairline">
        All the files are processed locally. No server uploads. Ever.
      </div>

      {/* Centerpiece Hero Block-ASCII Logo */}
      <section className="py-8 md:py-16 max-w-6xl mx-auto px-4 text-center">
        <Link
          to="/"
          className="inline-block text-left select-none font-bold text-ink leading-none max-w-full hover:opacity-85 transition-opacity"
        >
          <pre
            className="font-mono whitespace-pre tracking-normal"
            style={{
              fontSize: "clamp(4px, 1.7vw, 14px)",
              lineHeight: "0.8",
            }}
          >
            {logoAscii}
          </pre>
        </Link>
      </section>
    </div>
  );
}

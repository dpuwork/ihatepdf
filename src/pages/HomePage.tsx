import { Link } from "react-router-dom";

const toolCategories = [
  {
    name: "Organize & Manage",
    tools: [
      {
        name: "Merge PDF",
        route: "/merge-pdf",
        marker: "[+]",
        description: "Combine multiple PDFs into one single file",
      },
      {
        name: "Split PDF",
        route: "/split-pdf",
        marker: "[x]",
        description: "Separate one PDF into multiple files",
      },
      {
        name: "Remove Pages",
        route: "/remove-pages",
        marker: "[-]",
        description: "Delete specific pages from a file",
      },
      {
        name: "Organize PDF",
        route: "/organize-pdf",
        marker: "[#]",
        description: "Sort, add, and delete PDF pages interactively",
      },
      {
        name: "Rotate PDF",
        route: "/rotate-pdf",
        marker: "[o]",
        description: "Rotate pages within a document",
      },
    ],
  },
  {
    name: "Optimize",
    tools: [
      {
        name: "Compress PDF",
        route: "/compress-pdf",
        marker: "[%]",
        description: "Reduce the file size of your PDF losslessly",
      },
    ],
  },
  {
    name: "Convert",
    tools: [
      {
        name: "JPG to PDF",
        route: "/jpg-to-pdf",
        marker: "[>]",
        description: "Convert images to PDF documents",
      },
      {
        name: "PDF to JPG",
        route: "/pdf-to-jpg",
        marker: "[<]",
        description: "Save pages of your PDF as images",
      },
    ],
  },
  {
    name: "Edit & Annotations",
    tools: [
      {
        name: "Add Page Numbers",
        route: "/add-pdf-page-number",
        marker: "[1]",
        description: "Add customized numbering to pages",
      },
      {
        name: "Add Watermark",
        route: "/pdf-add-watermark",
        marker: "[~]",
        description: "Stamp customized text over PDF",
      },
    ],
  },
];

export default function HomePage() {
  return (
    <div className="font-mono text-ink">
      {/* Tool Categories */}
      <section className="py-16 max-w-6xl mx-auto px-4">
        <div className="space-y-16">
          {toolCategories.map((category) => (
            <div key={category.name} className="space-y-6">
              <h2 className="text-lg font-bold uppercase tracking-widest text-ink">
                {category.name}
              </h2>
              <hr className="border-t border-hairline" />
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.tools.map((tool) => (
                  <Link
                    key={tool.route}
                    to={tool.route}
                    className="group block p-6 bg-canvas border border-hairline hover:border-ink rounded-sm transition-colors"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-base font-bold text-ink select-none font-mono">
                        {tool.marker}
                      </span>
                      <h3 className="font-bold text-base uppercase text-ink group-hover:underline">
                        {tool.name}
                      </h3>
                    </div>
                    <p className="text-sm text-body font-mono leading-relaxed">
                      {tool.description}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

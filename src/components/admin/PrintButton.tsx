"use client";

// Prints the current document (receipt or statement). The page hides the site and admin chrome when printing.
export function PrintButton({ label = "Print or save as PDF" }: { label?: string }) {
  return (
    <button type="button" onClick={() => window.print()} className="btn-primary btn-sm">
      {label}
    </button>
  );
}

// Hides everything but the document when printing. Put once on a page that renders [data-print-doc].
export const printCss =
  "@media print{body:has([data-print-doc]) header,body:has([data-print-doc]) footer,body:has([data-print-doc]) aside,body:has([data-print-doc]) [data-admin-chrome],body:has([data-print-doc]) [data-no-print]{display:none!important}body:has([data-print-doc]) [data-print-doc]{box-shadow:none;border:0}}";

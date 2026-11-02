#!/usr/bin/env bash
# Preview images for spreadsheet-only downloads: first sheet rendered by LibreOffice, page 1 as PNG.
#   bash scripts/build-previews.sh     (needs soffice and pdftoppm)
set -euo pipefail
cd "$(dirname "$0")/.."
tmp=$(mktemp -d)
for pair in event-budget-spreadsheet/event-budget-spreadsheet guest-list-rsvp-tracker/guest-list-rsvp-tracker \
            rental-order-calculator/rental-order-calculator vendor-tracker/vendor-tracker; do
  dir=public/dl/${pair%%/*}; name=${pair##*/}
  soffice --headless --convert-to pdf --outdir "$tmp" "$dir/$name.xlsx" >/dev/null 2>&1
  pdftoppm -r 110 -png -f 1 -l 1 -singlefile "$tmp/$name.pdf" "$dir/cover"
  echo "preview $dir/cover.png"
done
rm -rf "$tmp"

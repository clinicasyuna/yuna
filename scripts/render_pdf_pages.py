from __future__ import annotations

import argparse
from pathlib import Path

import pypdfium2 as pdfium


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("pdf_path")
    parser.add_argument("output_dir")
    parser.add_argument("pages", nargs="*")
    parser.add_argument("--scale", type=float, default=2.0)
    args = parser.parse_args()

    pdf_path = Path(args.pdf_path)
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)

    pdf = pdfium.PdfDocument(str(pdf_path))
    if args.pages:
        page_numbers = [int(page) for page in args.pages]
    else:
        page_numbers = list(range(1, len(pdf) + 1))

    for page_number in page_numbers:
        page = pdf[page_number - 1]
        image = page.render(scale=args.scale).to_pil()
        image.save(output_dir / f"page_{page_number:02d}.png")

    print(f"pages={len(pdf)} rendered={len(page_numbers)} output_dir={output_dir}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

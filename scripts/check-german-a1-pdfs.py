"""Render every page and inspect text bounds; make contact sheets for visual review."""
import json
from pathlib import Path
import pypdfium2 as pdfium
import pdfplumber
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parents[1]
lessons = json.loads((root / "tmp/pdfs/german-a1.json").read_text(encoding="utf8"))
out = root / "tmp/pdfs/review"
out.mkdir(parents=True, exist_ok=True)
for unit in range(10):
    sheet = Image.new("RGB", (1200, 2200), "#dce5ed")
    draw = ImageDraw.Draw(sheet)
    for offset in range(5):
        lesson = lessons[unit * 5 + offset]
        path = root / "public/resources/german-a1" / (lesson["slug"] + ".pdf")
        with pdfplumber.open(path) as pdf:
            assert len(pdf.pages) == 4
            for page in pdf.pages:
                # Exclude the rotated watermark from normal text bounds.
                chars = [char for char in page.chars if char.get("upright")]
                assert all(24 <= c["top"] and c["bottom"] <= page.height - 18 for c in chars), lesson["slug"]
                assert all(50 <= c["x0"] and c["x1"] <= page.width - 50 for c in chars), lesson["slug"]
        document = pdfium.PdfDocument(path)
        for page_number in range(4):
            page = document[page_number]
            bitmap = page.render(scale=1.15)
            image = bitmap.to_pil().convert("RGB")
            image.save(out / f"{unit * 5 + offset + 1:02d}-{page_number + 1}.png")
            image.thumbnail((286, 405))
            x, y = page_number * 300 + 7, offset * 440 + 25
            sheet.paste(image, (x, y))
            draw.text((x, y - 18), f"Lesson {unit * 5 + offset + 1:02d} / page {page_number + 1}", fill="black")
            bitmap.close()
            page.close()
        document.close()
    sheet.save(out / f"unit-{unit + 1:02d}.jpg")
print("Rendered all 200 pages. All text bounds passed. Ten unit contact sheets ready.")

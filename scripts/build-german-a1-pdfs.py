"""Build downloadable EveryGyan A1 workbooks from the website's validated catalog.

Run node scripts/export-german-a1.mjs first. Requires reportlab and pypdf.
Generated PDFs are site assets under public/resources/german-a1.
"""
import json
from pathlib import Path
from xml.sax.saxutils import escape
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
FONT_DIR = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("EG", str(FONT_DIR / "arial.ttf")))
pdfmetrics.registerFont(TTFont("EG-Bold", str(FONT_DIR / "arialbd.ttf")))
pdfmetrics.registerFontFamily("EG", normal="EG", bold="EG-Bold", italic="EG", boldItalic="EG-Bold")
NAVY = colors.HexColor("#102a43")
BLUE = colors.HexColor("#087bad")
MUTED = colors.HexColor("#536879")
styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="EGTitle", fontName="EG-Bold", fontSize=25, leading=30, textColor=NAVY, spaceAfter=14))
styles.add(ParagraphStyle(name="EGHeading", fontName="EG-Bold", fontSize=13, leading=18, textColor=BLUE, spaceBefore=12, spaceAfter=8))
styles.add(ParagraphStyle(name="EGBody", fontName="EG", fontSize=10, leading=15, textColor=NAVY, spaceAfter=9))
styles.add(ParagraphStyle(name="EGSmall", fontName="EG", fontSize=9, leading=13, textColor=MUTED, spaceAfter=6))
styles.add(ParagraphStyle(name="EGLabel", fontName="EG-Bold", fontSize=9, leading=13, textColor=BLUE, spaceAfter=8))


def clean(text):
    return text.replace("–", "-").replace("—", "-").replace("‑", "-")


def p(text, style="EGBody"):
    return Paragraph(escape(clean(text)), styles[style])


def ruled_lines(count):
    table = Table([[""] for _ in range(count)], colWidths=[475], rowHeights=[24] * count)
    table.setStyle(TableStyle([("LINEBELOW", (0, 0), (-1, -1), .4, colors.HexColor("#cbd9e3"))]))
    return table


def page_decoration(lesson, number):
    def draw(canvas, doc):
        canvas.saveState()
        canvas.setTitle(f"EveryGyan German A1 - Lesson {number:02d} - {lesson['title']}")
        canvas.setAuthor("EveryGyan")
        canvas.setSubject("German A1 lesson notes, practice worksheet and answer key")
        canvas.setFillColor(colors.HexColor("#f0f3f6"))
        canvas.translate(A4[0] / 2, A4[1] / 2)
        canvas.rotate(38)
        canvas.setFont("EG-Bold", 49)
        canvas.drawCentredString(0, 0, "EveryGyan.com")
        canvas.restoreState()
        canvas.saveState()
        canvas.setFillColor(NAVY)
        canvas.setFont("EG-Bold", 12)
        canvas.drawString(55, A4[1] - 35, "EveryGyan")
        canvas.setFont("EG", 8)
        canvas.drawRightString(A4[0] - 55, A4[1] - 35, f"GERMAN A1  /  LESSON {number:02d} OF 50")
        canvas.setStrokeColor(colors.HexColor("#d8e5ee"))
        canvas.line(55, 42, A4[0] - 55, 42)
        canvas.setFillColor(MUTED)
        canvas.setFont("EG", 8)
        canvas.drawString(55, 28, "EveryGyan.com  |  Learn. Practise. Grow.")
        canvas.drawRightString(A4[0] - 55, 28, f"Lesson {number:02d}  |  Page {doc.page}")
        canvas.restoreState()
    return draw


lessons = json.loads((ROOT / "tmp/pdfs/german-a1.json").read_text(encoding="utf8"))
destination = ROOT / "public/resources/german-a1"
destination.mkdir(parents=True, exist_ok=True)
for number, lesson in enumerate(lessons, 1):
    path = destination / f"{lesson['slug']}.pdf"
    doc = SimpleDocTemplate(str(path), pagesize=A4, rightMargin=55, leftMargin=55,
                            topMargin=66, bottomMargin=57, pageCompression=1)
    story = [p(f"UNIT {lesson['unitOrder']} / {lesson['unit']}", "EGLabel"), p(lesson["title"], "EGTitle"),
             p("Your goal: " + lesson["description"]), p("01  Learn the idea", "EGHeading")]
    story.extend(p(note) for note in lesson["notes"])
    story.append(p("Words and phrases", "EGHeading"))
    rows = [[p("German", "EGLabel"), p("English", "EGLabel")]]
    rows.extend([p(phrase["german"]), p(phrase["english"])] for phrase in lesson["phrases"])
    table = Table(rows, colWidths=[240, 235], hAlign="LEFT")
    table.setStyle(TableStyle([("VALIGN", (0, 0), (-1, -1), "TOP"),
                              ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#e9f5fb")),
                              ("LINEBELOW", (0, 1), (-1, -1), .3, colors.HexColor("#dbe5ed")),
                              ("LEFTPADDING", (0, 0), (-1, -1), 8), ("RIGHTPADDING", (0, 0), (-1, -1), 8)]))
    story += [table, Spacer(1, 12), p("Say each phrase aloud. Listen on the lesson page, then repeat without looking at the English.", "EGSmall"), PageBreak()]

    story += [p("02  Conversation and mission", "EGTitle"), p("Read the conversation once for meaning. Repeat both roles, then cover the English and perform it again.")]
    for line in lesson["dialogue"]:
        story.append(KeepTogether([p(line["speaker"], "EGLabel"), p(line["german"]), p(line["english"], "EGSmall"), Spacer(1, 5)]))
    story += [p("Your real-life mission", "EGHeading"), p(lesson["task"]), p("Plan or write your response here. Try first; a model appears in the answer key.", "EGSmall"), ruled_lines(6), PageBreak()]

    story += [p("03  Practice without peeking", "EGTitle"), p("Choose one answer per question. For the final question, return to the conversation. Mark difficult items and explain your choice before checking the key.")]
    for i, question in enumerate(lesson["exercises"], 1):
        block = [p(f"{i}. {question['prompt']}", "EGHeading")]
        block.extend(p(f"{'ABC'[j]}. {choice}") for j, choice in enumerate(question["choices"]))
        story.append(KeepTogether(block))
    story += [Spacer(1, 12), p("Reflection: Which phrase will you use this week?", "EGSmall"), ruled_lines(2), PageBreak()]

    story += [p("04  Answer key and review", "EGTitle")]
    for i, question in enumerate(lesson["exercises"], 1):
        answer = question["answer"]
        story.append(KeepTogether([p(f"{i}. {'ABC'[answer]} - {question['choices'][answer]}", "EGHeading"), p(question["explanation"])]))
    story += [p("One possible mission response", "EGHeading"), p(lesson["model"]),
              p("Your own answer can differ. Check whether it completes the task and uses the lesson's patterns.", "EGSmall"),
              p("Build the habit", "EGHeading"), p("Today: say five phrases aloud. Tomorrow: cover the answers and try the quiz again. In one week: repeat the conversation with your own details.", "EGSmall"),
              p("Continue learning", "EGHeading"), p("Open your interactive course at https://everygyan.com/learn-german. Free additional A1 practice: https://www.goethe.de/prj/dfd/en/home.cfm", "EGSmall"),
              p("Original EveryGyan teaching material. This worksheet is for personal learning; it is not an official CEFR examination or certificate.", "EGSmall")]
    decoration = page_decoration(lesson, number)
    doc.build(story, onFirstPage=decoration, onLaterPages=decoration)
    reader = PdfReader(path)
    assert len(reader.pages) == 4, (lesson["slug"], len(reader.pages))
    for page in reader.pages:
        text = page.extract_text()
        assert "EveryGyan.com" in text, lesson["slug"]
    text = "\n".join(page.extract_text() for page in reader.pages)
    assert clean(lesson["title"]) in text
    assert "Answer key and review" in text
print(f"Built and checked {len(lessons)} four-page PDFs ({len(lessons) * 4} pages), each with an EveryGyan.com watermark.")

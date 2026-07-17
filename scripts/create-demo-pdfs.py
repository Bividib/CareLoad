from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

OUT = Path("public/demo-documents")
OUT.mkdir(parents=True, exist_ok=True)
docs = {
    "cardiology-discharge-summary.pdf": (
        "Synthetic Cardiology Discharge Summary",
        "Riverside Cardiology Service (fictional)",
        [
            "Measure blood pressure each morning between 06:30 and 08:30.",
            "Record weight each morning between 06:30 and 08:30 using the scales at home.",
            "Complete the wellbeing questionnaire once each week, preferably on Friday.",
            "Cardiology appointment: Wednesday 15 July 2026 at 11:00, Riverside Clinic.",
            "Write a brief symptom log each evening between 18:00 and 22:00.",
            "Read the supplied heart-health education during one flexible 15-minute session this week.",
            "Eleanor confirms that her blood-pressure monitor and scales are kept at home.",
        ],
    ),
    "diabetes-medication-list.pdf": (
        "Synthetic Diabetes Medication List",
        "Meadow Diabetes Clinic (fictional)",
        [
            "Metformin: take with breakfast each day.",
            "Check feet each evening between 18:00 and 22:00.",
            "Diabetes review: Monday 13 July 2026 at 15:30, Meadow Clinic.",
        ],
    ),
    "gp-care-notes.pdf": (
        "Synthetic GP Care Notes",
        "Oak Street GP Practice (fictional)",
        [
            "Levothyroxine: take each day before breakfast, between 06:30 and 07:30.",
            "Atorvastatin: take each evening between 18:00 and 22:00.",
            "Collect the repeat prescription on Friday between 14:00 and 17:30.",
        ],
    ),
}
styles = getSampleStyleSheet()
title = ParagraphStyle("CareLoadTitle", parent=styles["Title"], textColor=HexColor("#0b1f4d"), fontSize=20, leading=25)
warning = ParagraphStyle("Warning", parent=styles["Normal"], textColor=HexColor("#9b5200"), backColor=HexColor("#fff6dd"), borderPadding=8, leading=16)
body = ParagraphStyle("Body", parent=styles["BodyText"], textColor=HexColor("#21304c"), fontSize=11, leading=17, spaceAfter=8)

for filename, (heading, service, instructions) in docs.items():
    story = [
        Paragraph("CareLoad synthetic demo document", warning), Spacer(1, 8 * mm),
        Paragraph(heading, title), Paragraph(service, styles["Heading2"]),
        Paragraph("Fictional patient: Eleanor Reed | Document date: July 2026", body),
        Spacer(1, 4 * mm), Paragraph("Explicit care instructions", styles["Heading2"]),
    ]
    story.extend(Paragraph(f"{index}. {text}", body) for index, text in enumerate(instructions, 1))
    story.extend([Spacer(1, 10 * mm), Paragraph("Synthetic information only. Not a medical record. Not for real patient care.", warning)])
    doc = SimpleDocTemplate(str(OUT / filename), pagesize=A4, rightMargin=20*mm, leftMargin=20*mm, topMargin=18*mm, bottomMargin=18*mm, title=heading, author="CareLoad hackathon prototype")
    doc.build(story)

"""Builds the free downloadable planning spreadsheets (xlsx + csv) into public/dl/<slug>/.

Run:  python3 scripts/build-spreadsheets.py
Needs openpyxl. Files are committed, so the site build never runs this.
Every workbook uses live formulas so totals, due dates and quantities update as planners type.
"""

import csv
import os
from datetime import date, timedelta

from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation

ROOT = os.path.join(os.path.dirname(__file__), "..", "public", "dl")
SITE = "beyondchiavari.com"
INK, BRASS, IVORY, SAND, LINE = "1D1A16", "8A6628", "FAF7F2", "F1EADF", "DDD3C4"

title_font = Font(name="Georgia", size=18, bold=True, color=INK)
sub_font = Font(name="Calibri", size=10, italic=True, color=BRASS)
head_font = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
head_fill = PatternFill("solid", fgColor=INK)
input_fill = PatternFill("solid", fgColor="FFF8E6")
band_fill = PatternFill("solid", fgColor=SAND)
total_font = Font(name="Calibri", size=11, bold=True, color=INK)
thin = Side(style="thin", color=LINE)
box = Border(left=thin, right=thin, top=thin, bottom=thin)
money = '"$"#,##0'
pct = "0%"


def out(slug, name):
    d = os.path.join(ROOT, slug)
    os.makedirs(d, exist_ok=True)
    return os.path.join(d, name)


def brand(ws, title, subtitle, width):
    """Title rows 1-3 on every sheet: name, how to use it, where it came from."""
    ws["A1"] = title
    ws["A1"].font = title_font
    ws["A2"] = subtitle
    ws["A2"].font = Font(name="Calibri", size=10, color="5B544B")
    ws["A3"] = f"Free from Beyond Chiavari · {SITE} · Get every rental on one quote at {SITE}/quote"
    ws["A3"].font = sub_font
    ws["A3"].hyperlink = f"https://{SITE}/quote"
    for r in (1, 2, 3):
        ws.merge_cells(start_row=r, start_column=1, end_row=r, end_column=width)
    ws.row_dimensions[1].height = 28
    ws.sheet_view.showGridLines = False


def header(ws, row, cols, widths=None):
    for i, c in enumerate(cols, 1):
        cell = ws.cell(row=row, column=i, value=c)
        cell.font = head_font
        cell.fill = head_fill
        cell.alignment = Alignment(vertical="center", wrap_text=True)
        cell.border = box
    ws.row_dimensions[row].height = 30
    if widths:
        for i, w in enumerate(widths, 1):
            ws.column_dimensions[get_column_letter(i)].width = w
    ws.freeze_panes = ws.cell(row=row + 1, column=1)


def grid(ws, r1, r2, c1, c2, fill=None):
    for r in range(r1, r2 + 1):
        for c in range(c1, c2 + 1):
            cell = ws.cell(row=r, column=c)
            cell.border = box
            if fill:
                cell.fill = fill


def dropdown(ws, options, rng):
    dv = DataValidation(type="list", formula1='"' + ",".join(options) + '"', allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(rng)


def write_csv(path, cols, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(cols)
        w.writerows(rows)


# ---------------------------------------------------------------- budget

BUDGET_LINES = [
    ("Venue", ["Venue rental fee", "Ceremony site fee", "Security or cleaning fee", "Permits"]),
    ("Food & drink", ["Catering (per guest x guests)", "Service staff", "Bar and bartenders", "Cake or desserts", "Late-night snack"]),
    ("Rentals", ["Chairs", "Tables", "Linens and napkins", "Dinnerware, flatware, glassware", "Tent, flooring, sidewalls", "Dance floor or stage", "Lighting and power", "Lounge furniture", "Delivery, setup and pickup"]),
    ("Decor & flowers", ["Centerpieces", "Ceremony or stage decor", "Signage and stationery on site", "Candles and votives"]),
    ("Entertainment", ["DJ or band", "Sound system and microphones", "Photo booth", "Games or activities"]),
    ("Photo & video", ["Photographer", "Videographer"]),
    ("Attire & beauty", ["Outfits", "Hair and makeup"]),
    ("Invitations & paper", ["Save the dates", "Invitations and postage", "Programs, menus, place cards"]),
    ("Guests & transport", ["Shuttle or parking", "Welcome bags", "Favors"]),
    ("Fees & extras", ["Gratuities", "Event insurance", "Contingency (5-10%)"]),
]

SHARES = {"Venue": 0.20, "Food & drink": 0.32, "Rentals": 0.12, "Decor & flowers": 0.08, "Entertainment": 0.07,
          "Photo & video": 0.08, "Attire & beauty": 0.04, "Invitations & paper": 0.02, "Guests & transport": 0.02, "Fees & extras": 0.05}


def budget_sheet(ws, title, lines=BUDGET_LINES, shares=SHARES, subtitle=None):
    cols = ["Category", "Line item", "Estimate", "Quote", "Actual", "Paid so far", "Balance due", "Due date", "Vendor", "Notes"]
    brand(ws, title, subtitle or "Type your total budget and guest count in the yellow cells. Totals, balances and cost per guest update on their own.", len(cols))
    ws["A5"], ws["A6"] = "Total budget", "Guest count"
    ws["B5"], ws["B6"] = 15000, 100
    for c in ("B5", "B6"):
        ws[c].fill = input_fill
        ws[c].border = box
    ws["B5"].number_format = money
    ws["D5"], ws["D6"] = "Planned spend (actual or quote or estimate)", "Cost per guest"
    ws["A5"].font = ws["A6"].font = ws["D5"].font = ws["D6"].font = total_font
    ws["D7"], ws["D7"].font = "Left in budget", total_font
    hr = 9
    header(ws, hr, cols, [18, 34, 12, 12, 12, 12, 13, 12, 22, 30])
    r = hr + 1
    first = r
    for cat, items in lines:
        for item in items:
            ws.cell(row=r, column=1, value=cat)
            ws.cell(row=r, column=2, value=item)
            ws.cell(row=r, column=7, value=f"=IF(E{r}>0,E{r},D{r})-F{r}")
            for c in range(3, 8):
                ws.cell(row=r, column=c).number_format = money
            ws.cell(row=r, column=8).number_format = "mmm d, yyyy"
            r += 1
    for _ in range(8):  # spare rows
        ws.cell(row=r, column=7, value=f"=IF(E{r}>0,E{r},D{r})-F{r}")
        for c in range(3, 8):
            ws.cell(row=r, column=c).number_format = money
        r += 1
    last = r - 1
    grid(ws, first, last, 1, len(cols))
    for rr in range(first, last + 1):
        for c in (3, 4, 5, 6, 8, 9, 10):
            ws.cell(row=rr, column=c).fill = input_fill
    ws.cell(row=r, column=2, value="TOTAL").font = total_font
    for c in range(3, 8):
        L = get_column_letter(c)
        cell = ws.cell(row=r, column=c, value=f"=SUM({L}{first}:{L}{last})")
        cell.font, cell.number_format, cell.fill = total_font, money, band_fill
    planned = f"SUMPRODUCT((E{first}:E{last}>0)*E{first}:E{last}+(E{first}:E{last}=0)*((D{first}:D{last}>0)*D{first}:D{last}+(D{first}:D{last}=0)*C{first}:C{last}))"
    ws["G5"] = f"={planned}"
    ws["G6"] = "=IF(B6>0,G5/B6,0)"
    ws["G7"] = "=B5-G5"
    for c in ("G5", "G6", "G7"):
        ws[c].number_format = money
        ws[c].font = total_font
    ws.conditional_formatting.add("G7", CellIsRule(operator="lessThan", formula=["0"], font=Font(color="B42318", bold=True)))

    # Category summary with suggested split
    s = r + 3
    for i, c in enumerate(["Category", "Suggested share", "Suggested $", "Planned $", "Difference"], 1):
        cell = ws.cell(row=s, column=i, value=c)
        cell.font, cell.fill = head_font, head_fill
    for j, (cat, _) in enumerate(lines, 1):
        rr = s + j
        ws.cell(row=rr, column=1, value=cat)
        ws.cell(row=rr, column=2, value=shares.get(cat, 0)).number_format = pct
        ws.cell(row=rr, column=3, value=f"=B{rr}*$B$5").number_format = money
        ws.cell(row=rr, column=4, value=(
            f'=SUMIFS(E{first}:E{last},A{first}:A{last},A{rr})'
            f'+SUMIFS(D{first}:D{last},A{first}:A{last},A{rr},E{first}:E{last},0)'
            f'+SUMIFS(C{first}:C{last},A{first}:A{last},A{rr},E{first}:E{last},0,D{first}:D{last},0)'
        )).number_format = money
        ws.cell(row=rr, column=5, value=f"=C{rr}-D{rr}").number_format = money
        ws.cell(row=rr, column=2).fill = input_fill
    grid(ws, s + 1, s + len(lines), 1, 5)
    ws.cell(row=s + len(lines) + 1, column=1, value="Suggested shares are a common starting split, not a rule. Change them to fit your event.").font = sub_font
    return first, last


def budget_rows(lines=BUDGET_LINES):
    return [[cat, item, "", "", "", "", "", "", "", ""] for cat, items in lines for item in items]


# ---------------------------------------------------------------- guests

def guest_sheet(ws, title, rows=200, extra_cols=None, subtitle=None):
    cols = ["Guest name", "Household / party", "Group or side", "Email", "Phone", "Mailing address", "Seats invited",
            "RSVP", "Seats attending", "Meal choice", "Dietary needs", "Table #", "Gift", "Thank-you sent"]
    if extra_cols:
        cols = cols[:9] + extra_cols + cols[9:]
    brand(ws, title, subtitle or "One row per invitation. RSVP, meal and thank-you columns have dropdowns. The summary tab counts everything for you.", len(cols))
    hr = 5
    widths = [24, 20, 16, 26, 15, 30, 9, 12, 10] + [11] * len(extra_cols or []) + [14, 18, 8, 18, 12]
    header(ws, hr, cols, widths)
    first, last = hr + 1, hr + rows
    grid(ws, first, last, 1, len(cols))
    ci = {c: get_column_letter(i) for i, c in enumerate(cols, 1)}
    dropdown(ws, ["Pending", "Yes", "No", "Maybe"], f"{ci['RSVP']}{first}:{ci['RSVP']}{last}")
    dropdown(ws, ["Option 1", "Option 2", "Option 3", "Kids meal", "Vendor meal"], f"{ci['Meal choice']}{first}:{ci['Meal choice']}{last}")
    dropdown(ws, ["Yes", "No"], f"{ci['Thank-you sent']}{first}:{ci['Thank-you sent']}{last}")
    for ec in extra_cols or []:
        dropdown(ws, ["Yes", "No"], f"{ci[ec]}{first}:{ci[ec]}{last}")
    ws.conditional_formatting.add(f"{ci['RSVP']}{first}:{ci['RSVP']}{last}", CellIsRule(operator="equal", formula=['"Yes"'], fill=PatternFill("solid", fgColor="E3F1E3")))
    ws.conditional_formatting.add(f"{ci['RSVP']}{first}:{ci['RSVP']}{last}", CellIsRule(operator="equal", formula=['"No"'], fill=PatternFill("solid", fgColor="F8E1DF")))
    examples = [["Example: The Rivera family", "Rivera", "Family", "name@example.com", "", "", 4, "Yes", 3]]
    for r, ex in enumerate(examples, first):
        for c, v in enumerate(ex, 1):
            ws.cell(row=r, column=c, value=v).font = Font(italic=True, color="8A8278")
    return cols, ci, first, last


def guest_summary(ws, gname, ci, first, last, extra_cols=None):
    brand(ws, "RSVP summary", "Everything on this tab is counted from the Guests tab.", 3)
    rng = lambda col: f"'{gname}'!{ci[col]}{first}:{ci[col]}{last}"
    rows = [
        ("Invitations sent (rows)", f"=COUNTA({rng('Guest name')})"),
        ("Seats invited", f"=SUM({rng('Seats invited')})"),
        ("RSVP yes (invitations)", f'=COUNTIF({rng("RSVP")},"Yes")'),
        ("RSVP no (invitations)", f'=COUNTIF({rng("RSVP")},"No")'),
        ("Still pending", f'=COUNTA({rng("Guest name")})-COUNTIF({rng("RSVP")},"Yes")-COUNTIF({rng("RSVP")},"No")'),
        ("Seats attending", f"=SUM({rng('Seats attending')})"),
        ("Response rate", f'=IF(B6>0,(B8+B9)/B6,0)'),
        ("Meal: Option 1", f'=COUNTIF({rng("Meal choice")},"Option 1")'),
        ("Meal: Option 2", f'=COUNTIF({rng("Meal choice")},"Option 2")'),
        ("Meal: Option 3", f'=COUNTIF({rng("Meal choice")},"Option 3")'),
        ("Kids meals", f'=COUNTIF({rng("Meal choice")},"Kids meal")'),
        ("Vendor meals", f'=COUNTIF({rng("Meal choice")},"Vendor meal")'),
        ("Dietary notes to send caterer", f"=COUNTA({rng('Dietary needs')})"),
        ("Thank-you notes sent", f'=COUNTIF({rng("Thank-you sent")},"Yes")'),
    ]
    for ec in extra_cols or []:
        rows.append((f"Invited to {ec}", f'=COUNTIF({rng(ec)},"Yes")'))
    header(ws, 5, ["Count", "Value"], [34, 14])
    for i, (k, f) in enumerate(rows, 6):
        ws.cell(row=i, column=1, value=k)
        ws.cell(row=i, column=2, value=f).font = total_font
    ws["B12"].number_format = pct
    grid(ws, 6, 5 + len(rows), 1, 2)
    ws.freeze_panes = None


# ---------------------------------------------------------------- timeline

GENERIC_TASKS = [
    (180, "Big picture", "Set the goal, date range, rough guest count and total budget"),
    (170, "Big picture", "Decide who decides: name the final approver and the helpers"),
    (160, "Venue", "Tour or shortlist venues; ask what tables, chairs and linens are included"),
    (150, "Venue", "Book the venue and get the contract, deposit date and load-in rules in writing"),
    (140, "Vendors", "Book caterer, then photographer and entertainment"),
    (120, "Guests", "Build the guest list with addresses and emails"),
    (110, "Rentals", "Request rental quotes (chairs, tables, linens, tent, dinnerware) and hold the date"),
    (100, "Guests", "Send save the dates for big or travel events"),
    (90, "Design", "Choose the look: colors, linens, chair style, centerpieces"),
    (75, "Vendors", "Book decor, florals and any lighting or tent"),
    (60, "Guests", "Send invitations with an RSVP deadline 3 to 4 weeks before the event"),
    (45, "Plan", "Draft the floor plan: tables, bar, buffet, dance floor, exits"),
    (40, "Rentals", "Confirm rental quantities from the floor plan"),
    (30, "Plan", "Write the day-of timeline and share it with every vendor"),
    (28, "Guests", "RSVP deadline: chase the missing replies"),
    (21, "Plan", "Make the seating chart and escort cards"),
    (14, "Vendors", "Give final headcount to caterer and rentals; confirm delivery windows"),
    (10, "Vendors", "Final payments schedule; collect certificates of insurance if the venue needs them"),
    (7, "Plan", "Confirm every vendor arrival time and on-site contact"),
    (5, "Plan", "Check the 5-day forecast and confirm the rain or heat plan"),
    (3, "Plan", "Pack the day-of kit and print the timeline, seating chart and contact sheet"),
    (2, "Rentals", "Clear the delivery path, parking and loading spot"),
    (1, "Plan", "Rentals delivered and set; walk the space"),
    (0, "Event day", "Enjoy it. One point person answers vendor questions"),
    (-1, "After", "Rental pickup: stack, count and bag linens as the contract asks"),
    (-7, "After", "Send thank-you notes and leave vendor reviews"),
]


def timeline_sheet(ws, title, tasks=GENERIC_TASKS, subtitle=None):
    cols = ["Due date", "Days before", "Area", "Task", "Owner", "Done?", "Notes"]
    brand(ws, title, subtitle or "Type your event date in the yellow cell. Every due date recalculates. Mark tasks done with the dropdown.", len(cols))
    ws["A5"], ws["B5"] = "Event date", date.today() + timedelta(days=180)
    ws["A5"].font = total_font
    ws["B5"].fill, ws["B5"].border, ws["B5"].number_format = input_fill, box, "mmm d, yyyy"
    ws["D5"] = "Tasks done"
    ws["D5"].font = total_font
    hr = 7
    header(ws, hr, cols, [14, 11, 13, 64, 14, 9, 30])
    first = hr + 1
    for i, (days, area, task) in enumerate(tasks):
        r = first + i
        ws.cell(row=r, column=1, value=f"=$B$5-B{r}").number_format = "ddd mmm d"
        ws.cell(row=r, column=2, value=days)
        ws.cell(row=r, column=3, value=area)
        ws.cell(row=r, column=4, value=task).alignment = Alignment(wrap_text=True)
    last = first + len(tasks) + 9
    for r in range(first + len(tasks), last + 1):
        ws.cell(row=r, column=1, value=f'=IF(B{r}="","",$B$5-B{r})').number_format = "ddd mmm d"
    grid(ws, first, last, 1, len(cols))
    dropdown(ws, ["Yes", "No"], f"F{first}:F{last}")
    ws.conditional_formatting.add(f"F{first}:F{last}", CellIsRule(operator="equal", formula=['"Yes"'], fill=PatternFill("solid", fgColor="E3F1E3")))
    ws["E5"] = f'=COUNTIF(F{first}:F{last},"Yes")&" of "&COUNTA(D{first}:D{last})'
    ws["E5"].font = total_font


# ---------------------------------------------------------------- vendors

VENDOR_CATS = ["Venue", "Caterer", "Bar service", "Rentals (chairs, tables, linens)", "Tent", "Florist", "Photographer", "Videographer",
               "DJ or band", "Officiant or MC", "Cake or desserts", "Hair and makeup", "Lighting and AV", "Transportation", "Photo booth", "Planner or coordinator"]


def vendor_sheet(ws, title):
    cols = ["Category", "Company", "Contact name", "Phone", "Email", "Website", "Quote", "Deposit", "Deposit due", "Balance", "Balance due",
            "Contract signed", "COI received", "Arrival time", "Rating (1-5)", "Status", "Notes"]
    brand(ws, title, "Track every vendor in one place. Balance and the totals row calculate for you. Use the Compare tab to weigh up to 3 quotes.", len(cols))
    hr = 5
    header(ws, hr, cols, [26, 22, 18, 15, 24, 22, 11, 11, 12, 11, 12, 10, 10, 11, 9, 13, 30])
    first = hr + 1
    for i, cat in enumerate(VENDOR_CATS):
        ws.cell(row=first + i, column=1, value=cat)
    last = first + len(VENDOR_CATS) + 8
    for r in range(first, last + 1):
        ws.cell(row=r, column=10, value=f"=G{r}-H{r}")
        for c in (7, 8, 10):
            ws.cell(row=r, column=c).number_format = money
        for c in (9, 11):
            ws.cell(row=r, column=c).number_format = "mmm d"
    grid(ws, first, last, 1, len(cols))
    dropdown(ws, ["Yes", "No", "N/A"], f"L{first}:M{last}")
    dropdown(ws, ["Researching", "Quote requested", "Quote in", "Booked", "Paid in full", "Passed"], f"P{first}:P{last}")
    dropdown(ws, ["1", "2", "3", "4", "5"], f"O{first}:O{last}")
    t = last + 1
    ws.cell(row=t, column=6, value="TOTAL").font = total_font
    for c in (7, 8, 10):
        L = get_column_letter(c)
        cell = ws.cell(row=t, column=c, value=f"=SUM({L}{first}:{L}{last})")
        cell.font, cell.number_format, cell.fill = total_font, money, band_fill


def compare_sheet(ws):
    brand(ws, "Compare 3 quotes", "Fill one block per category. Score each question 0 (no) to 2 (yes, in writing). Highest total wins on terms, not just price.", 5)
    questions = [
        "Price includes delivery, setup and pickup", "Exact items and quantities listed", "Delivery and pickup windows in writing",
        "Damage waiver or breakage policy clear", "Cancellation and date-change policy clear", "Rain or weather policy clear",
        "Certificate of insurance available for the venue", "Deposit amount and due dates clear", "Responds within one business day",
        "Photos of the actual items provided",
    ]
    r = 5
    for block in ("Rentals", "Caterer", "Entertainment"):
        header(ws, r, [f"{block}: question", "Quote A", "Quote B", "Quote C", "Notes"], [48, 12, 12, 12, 30])
        ws.cell(row=r + 1, column=1, value="Company name")
        ws.cell(row=r + 2, column=1, value="Total price")
        for c in (2, 3, 4):
            ws.cell(row=r + 2, column=c).number_format = money
        for i, q in enumerate(questions):
            ws.cell(row=r + 3 + i, column=1, value=q)
        tr = r + 3 + len(questions)
        ws.cell(row=tr, column=1, value="Score (higher is better)").font = total_font
        for c in (2, 3, 4):
            L = get_column_letter(c)
            cell = ws.cell(row=tr, column=c, value=f"=SUM({L}{r + 3}:{L}{tr - 1})")
            cell.font, cell.fill = total_font, band_fill
        grid(ws, r + 1, tr, 1, 5)
        dropdown(ws, ["0", "1", "2"], f"B{r + 3}:D{tr - 1}")
        r = tr + 3
    ws.freeze_panes = None


# ---------------------------------------------------------------- seating

def seating_book(slug):
    wb = Workbook()
    tables = wb.active
    tables.title = "Tables"
    brand(tables, "Seating chart planner: tables", "List your tables and seats. Assigned seats count from the Guests tab, so you see open seats as you plan.", 6)
    header(tables, 5, ["Table #", "Name or label", "Shape and size", "Seats", "Assigned", "Open seats"], [10, 22, 22, 9, 11, 11])
    for i in range(1, 41):
        r = 5 + i
        tables.cell(row=r, column=1, value=i)
        tables.cell(row=r, column=3, value='60" round' if i <= 10 else None)
        tables.cell(row=r, column=4, value=8 if i <= 10 else None)
        tables.cell(row=r, column=5, value=f"=COUNTIF(Guests!$C$6:$C$505,A{r})")
        tables.cell(row=r, column=6, value=f'=IF(D{r}="","",D{r}-E{r})')
    grid(tables, 6, 45, 1, 6)
    dropdown(tables, ['48" round', '60" round', '66" round', '72" round', "6 ft banquet", "8 ft banquet", "Farm table", "Head table", "Sweetheart", "Kids table"], "C6:C45")
    tables.conditional_formatting.add("F6:F45", CellIsRule(operator="lessThan", formula=["0"], fill=PatternFill("solid", fgColor="F8E1DF")))
    tables["H5"], tables["H6"], tables["H7"], tables["H8"] = "Total seats", "Assigned", "Unassigned guests", "Over-full tables"
    tables["I5"] = "=SUM(D6:D45)"
    tables["I6"] = "=SUM(E6:E45)"
    tables["I7"] = '=COUNTA(Guests!A6:A505)-COUNTIF(Guests!C6:C505,">0")'
    tables["I8"] = '=COUNTIF(F6:F45,"<0")'
    for c in ("H5", "H6", "H7", "H8"):
        tables[c].font = total_font
    tables.column_dimensions["H"].width = 20

    guests = wb.create_sheet("Guests")
    brand(guests, "Seating chart planner: guests", "One row per guest (not per household). Type a table number in column C.", 7)
    header(guests, 5, ["Guest name", "Group", "Table #", "Seat", "Meal", "Must sit near / away from", "Notes"], [26, 16, 9, 7, 14, 30, 26])
    grid(guests, 6, 505, 1, 7)
    dropdown(guests, ["Family", "Friends", "Work", "Plus one", "Kids", "VIP", "Vendor"], "B6:B505")

    cap = wb.create_sheet("Table sizes")
    brand(cap, "How many people fit at each table", "Comfortable counts for dinner. Squeeze counts work for short events with small place settings.", 4)
    header(cap, 5, ["Table", "Comfortable", "Squeeze", "Linen for floor length"], [22, 13, 11, 26])
    rows = [('48" round', 6, 8, '108" round'), ('60" round', 8, 10, '120" round'), ('66" round', 9, 11, '120" or 132" round'),
            ('72" round', 10, 12, '132" round'), ("6 ft banquet (30 in)", 6, 8, '90" x 132"'), ("8 ft banquet (30 in)", 8, 10, '90" x 156"'),
            ("8 ft farm table (40 in)", 8, 10, "Runner only, or 90 x 156 drop"), ("Sweetheart (4 ft)", 2, 2, '90" x 132"')]
    for i, row in enumerate(rows, 6):
        for c, v in enumerate(row, 1):
            cap.cell(row=i, column=c, value=v)
    grid(cap, 6, 5 + len(rows), 1, 4)
    wb.save(out(slug, "seating-chart-planner.xlsx"))
    write_csv(out(slug, "seating-guest-list.csv"), ["Guest name", "Group", "Table #", "Seat", "Meal", "Must sit near / away from", "Notes"],
              [["Example: Jordan Lee", "Friends", "4", "2", "Option 1", "Near Sam", ""]])


# ---------------------------------------------------------------- rental calculator

def rental_calculator(slug):
    wb = Workbook()
    ws = wb.active
    ws.title = "Calculator"
    brand(ws, "Rental order calculator", "Change the yellow cells. Every quantity below recalculates. Numbers include a small spare where planners usually add one.", 4)
    inputs = [
        ("Guest count", 120, None),
        ("Share of guests seated at once (100% for dinners, 50-60% for open houses)", 1.0, pct),
        ("Guests per round table (8 for 60\" rounds, 10 for 72\")", 8, None),
        ("Service style", "Buffet", None),
        ("Courses (salad, entree, dessert = 3)", 3, None),
        ("Hours of the event", 5, None),
        ("Full bar? (Yes/No)", "Yes", None),
        ("Cocktail hour before dinner? (Yes/No)", "Yes", None),
        ("Spare factor for plates and napkins", 0.1, pct),
    ]
    header(ws, 5, ["Your event", "Value", "", ""], [70, 14, 4, 50])
    for i, (k, v, fmt) in enumerate(inputs, 6):
        ws.cell(row=i, column=1, value=k)
        c = ws.cell(row=i, column=2, value=v)
        c.fill, c.border = input_fill, box
        if fmt:
            c.number_format = fmt
    dropdown(ws, ["Buffet", "Plated", "Family style", "Stations", "Cocktail only"], "B9")
    dropdown(ws, ["Yes", "No"], "B12:B13")
    G, SEAT, PER, STYLE, COURSES, HRS, BAR, CH, SP = (f"$B${i}" for i in range(6, 15))
    seated = f"ROUNDUP({G}*{SEAT},0)"
    results = [
        ("SEATING", None, None),
        ("Guest chairs", f"={seated}", "One per seated guest. Add ceremony chairs separately if the ceremony is in another spot."),
        ("Round tables for guests", f"=ROUNDUP({seated}/{PER},0)", "Seated guests divided by seats per table."),
        ("8 ft banquet tables for buffet, bar, cake, gifts, DJ", f'=IF({STYLE}="Buffet",ROUNDUP({G}/50,0)*2,1)+4', "Roughly two 8 ft tables per 50 buffet guests plus four utility tables."),
        ("Cocktail (highboy) tables", f'=IF({CH}="Yes",ROUNDUP({G}/12,0),0)', "One per 10 to 15 standing guests."),
        ("LINENS", None, None),
        ("Tablecloths for guest tables", "=B17", "One per guest table."),
        ("Tablecloths for utility tables", "=B18", ""),
        ("Cocktail table covers", "=B19", "Spandex covers or 120\" rounds tied at the waist."),
        ("Napkins", f"=ROUNDUP({G}*(1+{SP}),0)", "One per guest plus spares."),
        ("DINNERWARE", None, None),
        ("Dinner plates", f'=IF({STYLE}="Cocktail only",0,ROUNDUP({G}*IF({STYLE}="Buffet",1.5,1)*(1+{SP}),0))', "Buffets need about 1.5 per guest for second trips."),
        ("Salad or first-course plates", f'=IF({COURSES}>=2,ROUNDUP({G}*(1+{SP}),0),0)', ""),
        ("Dessert or cake plates", f'=IF({COURSES}>=3,ROUNDUP({G}*(1+{SP}),0),0)', ""),
        ("Appetizer plates", f'=IF({CH}="Yes",ROUNDUP({G}*2,0),0)', "About two small plates per guest for passed or displayed appetizers."),
        ("Bread and butter plates", f'=IF({STYLE}="Plated",{G},0)', "Usually only for plated dinners."),
        ("FLATWARE", None, None),
        ("Dinner forks", f"=ROUNDUP({G}*IF({STYLE}=\"Buffet\",1.5,1)*(1+{SP}),0)", ""),
        ("Salad forks", "=B30", ""),
        ("Dinner knives", f"=ROUNDUP({G}*(1+{SP}),0)", ""),
        ("Dessert forks or spoons", "=B31", ""),
        ("Teaspoons for coffee", f"=ROUNDUP({G}*0.6,0)", "About 60% of guests take coffee or tea."),
        ("GLASSWARE AND BAR", None, None),
        ("Water glasses", f"=ROUNDUP({G}*1.1,0)", ""),
        ("Wine glasses", f'=IF({BAR}="Yes",ROUNDUP({G}*1.5,0),0)', "1.5 per guest so the bar is not washing during service."),
        ("Champagne flutes for a toast", f"={G}", ""),
        ("Rocks or highball glasses", f'=IF({BAR}="Yes",ROUNDUP({G}*1.5,0),0)', ""),
        ("Ice (pounds)", f"=ROUNDUP({G}*1.5+{G}*0.25*{HRS},0)", "About 1.5 lb per guest for drinks plus extra for chilling on long or hot days."),
        ("SERVICE", None, None),
        ("Chafing dishes", f'=IF({STYLE}="Buffet",ROUNDUP({G}/25,0)+2,IF({STYLE}="Stations",ROUNDUP({G}/20,0),0))', "About one per hot dish per 25 guests."),
        ("Coffee urns (100 cup)", f"=ROUNDUP({G}*0.6*1.5/100,0)", ""),
        ("Beverage dispensers", f"=MAX(2,ROUNDUP({G}/50,0))", ""),
        ("Trash and recycling stations", f"=MAX(2,ROUNDUP({G}/50,0))", ""),
    ]
    header(ws, 16, ["Item", "Quantity", "", "How it is calculated"], None)
    r = 17
    # Shift so linen references (B17-B19) point at the right rows once section labels are inserted.
    row_of = {}
    for name, f, note in results:
        if f is None:
            c = ws.cell(row=r, column=1, value=name)
            c.font, c.fill = Font(bold=True, color=BRASS), band_fill
            ws.cell(row=r, column=2).fill = band_fill
        else:
            row_of[name] = r
            ws.cell(row=r, column=1, value=name)
            ws.cell(row=r, column=2, value=f).font = total_font
            ws.cell(row=r, column=4, value=note).font = Font(size=9, color="5B544B")
            ws.cell(row=r, column=2).border = box
        r += 1
    # Fix up the reference formulas to the real rows.
    fix = {
        "Tablecloths for guest tables": f"=B{row_of['Round tables for guests']}",
        "Tablecloths for utility tables": f"=B{row_of['8 ft banquet tables for buffet, bar, cake, gifts, DJ']}",
        "Cocktail table covers": f"=B{row_of['Cocktail (highboy) tables']}",
        "Salad forks": f"=B{row_of['Salad or first-course plates']}",
        "Dessert forks or spoons": f"=B{row_of['Dessert or cake plates']}",
    }
    for name, f in fix.items():
        ws.cell(row=row_of[name], column=2, value=f)
    ws.cell(row=r + 1, column=1, value=f"Send this list to {SITE}/quote and get every item priced on one quote.").font = sub_font
    ws.cell(row=r + 1, column=1).hyperlink = f"https://{SITE}/quote"
    ws.cell(row=r + 2, column=1, value="Rules of thumb only. Your caterer, bar and venue may need different counts, so confirm with them.").font = sub_font
    ws.freeze_panes = None
    wb.save(out(slug, "rental-order-calculator.xlsx"))


# ---------------------------------------------------------------- run of show

RUNS = {
    "4-hour party": [
        ("-3:00", 60, "Rentals delivered", "Chairs, tables, linens, tent set", "Host", "Yard", ""),
        ("-1:30", 60, "Decor and food setup", "Linens, centerpieces, buffet, drinks iced", "Helpers", "All", "Playlist on"),
        ("0:00", 30, "Guests arrive", "Welcome, drinks, appetizers", "Host", "Entrance", "Background music"),
        ("0:30", 60, "Food served", "Buffet opens, guests seated", "Caterer", "Buffet", ""),
        ("1:30", 15, "Toast or speeches", "2 to 3 short toasts", "MC", "Center", "Mic check"),
        ("1:45", 30, "Cake or dessert", "Cake cutting, dessert table", "Host", "Cake table", "Song cue"),
        ("2:15", 75, "Games, dancing or open time", "Activities", "Helpers", "Lawn", "Party playlist"),
        ("3:30", 30, "Wind down", "Favors out, leftovers boxed", "Host", "Exit", ""),
        ("4:00", 60, "Cleanup", "Stack chairs, bag linens for pickup", "Everyone", "All", ""),
    ],
    "Wedding day": [
        ("-6:00", 120, "Rentals and decor setup", "Tables, chairs, linens, place settings", "Rental crew, planner", "Reception", ""),
        ("-3:00", 120, "Getting ready", "Hair, makeup, detail photos", "Couple, photographer", "Suite", ""),
        ("-1:00", 45, "First look and family photos", "", "Photographer", "Garden", ""),
        ("-0:15", 15, "Guests seated", "Ushers seat family first", "Ushers", "Ceremony", "Prelude"),
        ("0:00", 30, "Ceremony", "Processional, vows, recessional", "Officiant", "Ceremony", "Processional cue"),
        ("0:30", 60, "Cocktail hour", "Flip ceremony chairs if same room", "Caterer, rental crew", "Lounge", "Cocktail set"),
        ("1:30", 15, "Grand entrance", "", "DJ", "Reception", "Entrance song"),
        ("1:45", 75, "Dinner and toasts", "Toasts between courses", "Caterer, MC", "Reception", "Mics"),
        ("3:00", 15, "First dance and parent dances", "", "DJ", "Dance floor", "Songs"),
        ("3:15", 120, "Open dancing, cake, late-night snack", "", "DJ, caterer", "All", ""),
        ("5:15", 15, "Last dance and send-off", "", "Planner", "Exit", "Last song"),
        ("5:30", 90, "Strike", "Personal items out, rentals counted for pickup", "Planner, crew", "All", ""),
    ],
    "Corporate evening": [
        ("-4:00", 120, "Load-in", "Staging, AV, chairs, registration table", "Venue, AV, rentals", "Ballroom", "Line check"),
        ("-1:00", 45, "Rehearsal", "Speakers walk the stage, slides tested", "Producer", "Stage", "Slides, mics"),
        ("0:00", 45, "Registration and reception", "Badges, check-in, drinks", "Registration team", "Foyer", "Walk-in music"),
        ("0:45", 15, "Doors to main room", "", "Ushers", "Ballroom", "Voice of God"),
        ("1:00", 10, "Welcome", "Host opens, safety note", "CEO or host", "Stage", "Mic 1"),
        ("1:10", 40, "Program", "Keynote, awards or panel", "Speakers", "Stage", "Slides"),
        ("1:50", 60, "Dinner", "Served or stations", "Caterer", "Ballroom", "Dinner music"),
        ("2:50", 60, "Networking or entertainment", "", "Host", "Lounge", ""),
        ("3:50", 10, "Close", "Thank sponsors, next steps", "Host", "Stage", "Exit music"),
        ("4:00", 90, "Load-out", "AV and rentals out, venue walk-through", "Producer", "All", ""),
    ],
}


def run_sheet(ws, name, rows):
    cols = ["Clock time", "Offset from start (h:mm)", "Minutes", "Segment", "What happens", "Lead", "Location", "Music, AV or cue", "Done"]
    brand(ws, f"Run of show: {name}", "Type your start time in the yellow cell. Clock times follow the offsets. Edit, add or delete rows freely.", len(cols))
    ws["A5"], ws["B5"] = "Start time", "18:00"
    ws["A5"].font = total_font
    ws["B5"].fill, ws["B5"].border = input_fill, box
    header(ws, 7, cols, [11, 12, 9, 28, 40, 22, 14, 20, 8])
    first = 8
    last = first + len(rows) + 6
    for r in range(first + len(rows), last + 1):
        ws.cell(row=r, column=1, value=f'=IF(B{r}="","",TEXT(MOD(TIMEVALUE($B$5)+IF(LEFT(B{r},1)="-",-1,1)*TIMEVALUE(SUBSTITUTE(B{r},"-","")),1),"h:mm AM/PM"))')
    for i, (off, mins, seg, what, lead, loc, cue) in enumerate(rows):
        r = first + i
        ws.cell(row=r, column=1, value=f'=IF(B{r}="","",TEXT(MOD(TIMEVALUE($B$5)+IF(LEFT(B{r},1)="-",-1,1)*TIMEVALUE(SUBSTITUTE(B{r},"-","")),1),"h:mm AM/PM"))')
        for c, v in enumerate([off, mins, seg, what, lead, loc, cue], 2):
            ws.cell(row=r, column=c, value=v)
    last = first + len(rows) + 6
    grid(ws, first, last, 1, len(cols))
    dropdown(ws, ["Yes", "No"], f"I{first}:I{last}")


def contacts_sheet(ws):
    cols = ["Role", "Name", "Company", "Mobile", "Arrival", "Departure", "Needs (power, parking, meal)"]
    brand(ws, "Day-of contact sheet", "Print this and give a copy to every vendor and your point person.", len(cols))
    header(ws, 5, cols, [22, 20, 22, 15, 10, 10, 34])
    roles = ["Point person (day-of)", "Host or couple", "Venue manager", "Caterer lead", "Rental company", "Bar lead", "Photographer", "DJ or band",
             "Florist", "Officiant or MC", "AV or lighting", "Transportation", "Backup helper"]
    for i, r in enumerate(roles, 6):
        ws.cell(row=i, column=1, value=r)
    grid(ws, 6, 6 + len(roles) + 4, 1, len(cols))


def run_of_show(slug):
    wb = Workbook()
    wb.remove(wb.active)
    for name, rows in RUNS.items():
        run_sheet(wb.create_sheet(name[:31]), name, rows)
    contacts_sheet(wb.create_sheet("Contacts"))
    wb.save(out(slug, "run-of-show-template.xlsx"))


# ---------------------------------------------------------------- books

def simple_budget_book(slug, fname, title, lines=BUDGET_LINES, shares=SHARES):
    wb = Workbook()
    ws = wb.active
    ws.title = "Budget"
    budget_sheet(ws, title, lines, shares)
    wb.save(out(slug, fname))


def guest_book(slug):
    wb = Workbook()
    ws = wb.active
    ws.title = "Guests"
    cols, ci, first, last = guest_sheet(ws, "Guest list and RSVP tracker", rows=300)
    guest_summary(wb.create_sheet("Summary"), "Guests", ci, first, last)
    wb.save(out(slug, "guest-list-rsvp-tracker.xlsx"))
    write_csv(out(slug, "guest-list-rsvp-tracker.csv"), cols, [["Example: The Rivera family", "Rivera", "Family", "name@example.com", "", "", 4, "Yes", 3]])


def vendor_book(slug):
    wb = Workbook()
    ws = wb.active
    ws.title = "Vendors"
    vendor_sheet(ws, "Vendor tracker")
    compare_sheet(wb.create_sheet("Compare quotes"))
    wb.save(out(slug, "vendor-tracker.xlsx"))
    write_csv(out(slug, "vendor-tracker.csv"),
              ["Category", "Company", "Contact name", "Phone", "Email", "Website", "Quote", "Deposit", "Deposit due", "Balance due", "Contract signed", "COI received", "Arrival time", "Notes"],
              [[c] + [""] * 13 for c in VENDOR_CATS])


def master_book(slug):
    wb = Workbook()
    ws = wb.active
    ws.title = "Timeline"
    timeline_sheet(ws, "Event planning timeline")
    budget_sheet(wb.create_sheet("Budget"), "Event budget")
    g = wb.create_sheet("Guests")
    cols, ci, first, last = guest_sheet(g, "Guest list and RSVPs", rows=250)
    guest_summary(wb.create_sheet("RSVP summary"), "Guests", ci, first, last)
    vendor_sheet(wb.create_sheet("Vendors"), "Vendors")
    contacts_sheet(wb.create_sheet("Day-of contacts"))
    wb.save(out(slug, "event-planning-workbook.xlsx"))


WEDDING_LINES = [
    ("Ceremony & reception venue", ["Reception venue", "Ceremony site", "Officiant fee", "Marriage license"]),
    ("Catering & bar", ["Dinner (per guest x guests)", "Cocktail hour", "Bar package or alcohol", "Bartenders and service staff", "Cake", "Late-night snack"]),
    ("Rentals", ["Guest chairs (ceremony + reception)", "Tables", "Linens and napkins", "Chargers, china, flatware, glassware", "Lounge furniture", "Dance floor", "Tent and flooring", "Lighting", "Delivery, setup, pickup"]),
    ("Flowers & decor", ["Bouquets and boutonnieres", "Ceremony flowers and arch", "Centerpieces", "Candles and decor"]),
    ("Photo & video", ["Photographer", "Videographer", "Engagement session"]),
    ("Music", ["Ceremony musicians", "DJ or band"]),
    ("Attire & beauty", ["Wedding attire", "Alterations", "Partner attire", "Hair and makeup", "Rings"]),
    ("Stationery", ["Save the dates", "Invitations and postage", "Day-of paper (menus, programs, signs)"]),
    ("Guests & transport", ["Welcome bags", "Shuttle", "Favors"]),
    ("Other", ["Planner or coordinator", "Gratuities", "Insurance", "Contingency (5-10%)"]),
]
WEDDING_SHARES = {"Ceremony & reception venue": 0.18, "Catering & bar": 0.30, "Rentals": 0.10, "Flowers & decor": 0.08, "Photo & video": 0.11,
                  "Music": 0.07, "Attire & beauty": 0.06, "Stationery": 0.02, "Guests & transport": 0.02, "Other": 0.06}

WEDDING_TASKS = [
    (365, "Big picture", "Agree on budget, guest count range, season and must-haves"), (350, "Big picture", "Draft the guest list to size the venue"),
    (330, "Venue", "Tour venues and book ceremony and reception"), (300, "Vendors", "Book planner or coordinator if using one"),
    (290, "Vendors", "Book photographer and videographer"), (280, "Vendors", "Book caterer and bar (if not venue)"),
    (270, "Vendors", "Book DJ or band"), (240, "Guests", "Book hotel room blocks"), (240, "Attire", "Shop for wedding attire"),
    (220, "Guests", "Send save the dates"), (200, "Rentals", "Request rental quotes and hold chairs, tables, linens, tent"),
    (180, "Vendors", "Book florist and officiant"), (150, "Design", "Finalize colors, linens, chair style and place settings"),
    (120, "Guests", "Order invitations"), (100, "Vendors", "Book hair and makeup, transportation"), (90, "Plan", "Menu tasting"),
    (60, "Guests", "Mail invitations (RSVP deadline about 4 weeks before)"), (45, "Plan", "Draft day-of timeline with photographer and planner"),
    (40, "Rentals", "Confirm rental quantities from the floor plan"), (30, "Legal", "Get the marriage license (check your county's timing rules)"),
    (28, "Guests", "RSVP deadline: chase missing replies"), (21, "Plan", "Seating chart and escort cards"),
    (14, "Vendors", "Final headcount to caterer and rentals"), (10, "Vendors", "Final payments and vendor tips in labeled envelopes"),
    (7, "Plan", "Confirm all arrival times; share the timeline"), (5, "Plan", "Check forecast; confirm rain plan"), (2, "Plan", "Rehearsal and rehearsal dinner"),
    (0, "Day of", "Get married"), (-1, "After", "Rental pickup and returns"), (-30, "After", "Thank-you notes sent"),
]


def wedding_book(slug):
    wb = Workbook()
    ws = wb.active
    ws.title = "Budget"
    budget_sheet(ws, "Wedding budget", WEDDING_LINES, WEDDING_SHARES)
    timeline_sheet(wb.create_sheet("Timeline"), "Wedding timeline", WEDDING_TASKS)
    g = wb.create_sheet("Guests")
    cols, ci, first, last = guest_sheet(g, "Wedding guest list", rows=350, extra_cols=["Rehearsal dinner", "Welcome party"])
    guest_summary(wb.create_sheet("RSVP summary"), "Guests", ci, first, last, ["Rehearsal dinner", "Welcome party"])
    vendor_sheet(wb.create_sheet("Vendors"), "Wedding vendors")
    wb.save(out(slug, "wedding-planning-workbook.xlsx"))


CORP_LINES = [
    ("Venue", ["Room rental or minimum", "Breakout rooms", "Security and cleaning"]),
    ("Food & beverage", ["Breakfast or coffee", "Lunch or dinner (per person)", "Reception and bar", "Service charge and tax"]),
    ("AV & production", ["Projectors and screens", "Microphones and sound", "Stage and lighting", "Livestream or recording", "Technician"]),
    ("Rentals & furniture", ["Chairs and tables", "Cocktail tables", "Lounge furniture", "Linens", "Registration counter"]),
    ("Speakers & content", ["Speaker fees and travel", "Printing and badges"]),
    ("Branding", ["Signage and step-and-repeat", "Swag"]),
    ("Travel & lodging", ["Hotel rooms", "Ground transport"]),
    ("Other", ["Insurance", "Photography", "Contingency (10%)"]),
]
CORP_SHARES = {"Venue": 0.18, "Food & beverage": 0.35, "AV & production": 0.15, "Rentals & furniture": 0.07, "Speakers & content": 0.08,
               "Branding": 0.05, "Travel & lodging": 0.07, "Other": 0.05}


def corporate_book(slug):
    wb = Workbook()
    ws = wb.active
    ws.title = "Budget"
    budget_sheet(ws, "Corporate event budget", CORP_LINES, CORP_SHARES, "Enter budget and expected attendees. Cost per attendee updates as quotes come in.")
    reg = wb.create_sheet("Registration")
    cols = ["Name", "Company", "Title", "Email", "Ticket type", "Registered", "Checked in", "Dietary", "Accessibility", "Session picks", "Follow-up owner"]
    brand(reg, "Registration and check-in", "Track who registered and who showed. Attendance rate calculates at the top.", len(cols))
    reg["A4"] = '="Registered: "&COUNTIF(F7:F606,"Yes")&"   Checked in: "&COUNTIF(G7:G606,"Yes")&"   Show rate: "&IF(COUNTIF(F7:F606,"Yes")>0,TEXT(COUNTIF(G7:G606,"Yes")/COUNTIF(F7:F606,"Yes"),"0%"),"-")'
    reg["A4"].font = total_font
    header(reg, 6, cols, [22, 20, 18, 26, 12, 11, 11, 16, 16, 18, 16])
    grid(reg, 7, 606, 1, len(cols))
    dropdown(reg, ["Yes", "No"], "F7:G606")
    dropdown(reg, ["General", "VIP", "Speaker", "Sponsor", "Staff", "Press"], "E7:E606")
    timeline_sheet(wb.create_sheet("Timeline"), "Corporate event timeline")
    wb.save(out(slug, "corporate-event-workbook.xlsx"))


def gala_book(slug):
    wb = Workbook()
    ws = wb.active
    ws.title = "Sponsors"
    cols = ["Sponsor", "Contact", "Email", "Tier", "Amount pledged", "Received", "Outstanding", "Benefits promised", "Logo received", "Tickets", "Thank-you sent"]
    brand(ws, "Sponsor tracker", "Pledged, received and outstanding totals calculate at the bottom.", len(cols))
    header(ws, 5, cols, [24, 18, 24, 12, 13, 12, 12, 30, 10, 9, 11])
    for r in range(6, 66):
        ws.cell(row=r, column=7, value=f"=E{r}-F{r}")
        for c in (5, 6, 7):
            ws.cell(row=r, column=c).number_format = money
    grid(ws, 6, 65, 1, len(cols))
    dropdown(ws, ["Presenting", "Gold", "Silver", "Bronze", "Table", "In-kind", "Media"], "D6:D65")
    dropdown(ws, ["Yes", "No"], "I6:I65")
    dropdown(ws, ["Yes", "No"], "K6:K65")
    ws["D66"] = "TOTAL"
    for c in "EFG":
        ws[f"{c}66"] = f"=SUM({c}6:{c}65)"
        ws[f"{c}66"].number_format, ws[f"{c}66"].font = money, total_font
    au = wb.create_sheet("Auction items")
    cols = ["#", "Item", "Donor", "Fair market value", "Opening bid", "Min raise", "Winning bidder", "Winning bid", "Paid", "Picked up", "Thank-you sent"]
    brand(au, "Auction item tracker", "Opening bid defaults to 40% of value, a common starting point. Change it per item.", len(cols))
    header(au, 5, cols, [6, 30, 20, 14, 12, 10, 22, 12, 8, 10, 11])
    for i in range(1, 81):
        r = 5 + i
        au.cell(row=r, column=1, value=i)
        au.cell(row=r, column=5, value=f'=IF(D{r}="","",ROUND(D{r}*0.4,-1))')
        au.cell(row=r, column=6, value=f'=IF(D{r}="","",MAX(10,ROUND(D{r}*0.1,-1)))')
        for c in (4, 5, 6, 8):
            au.cell(row=r, column=c).number_format = money
    grid(au, 6, 85, 1, len(cols))
    dropdown(au, ["Yes", "No"], "I6:K85")
    au["G86"], au["H86"] = "Raised", "=SUM(H6:H85)"
    au["H86"].number_format, au["H86"].font = money, total_font
    lines = [("Venue & food", ["Venue", "Dinner (per guest)", "Bar"]), ("Rentals & decor", ["Chairs, tables, linens", "Stage and lighting", "Centerpieces", "Lounge and auction display"]),
             ("Program", ["Emcee or auctioneer", "AV and sound", "Entertainment"]), ("Marketing", ["Invitations", "Printed program and bid sheets", "Signage"]),
             ("Other", ["Photography", "Insurance", "Contingency"])]
    budget_sheet(wb.create_sheet("Expenses"), "Gala expense budget", lines,
                 {"Venue & food": 0.5, "Rentals & decor": 0.2, "Program": 0.15, "Marketing": 0.07, "Other": 0.08},
                 "Keep the cost per guest well under your ticket price. Compare against the sponsor and auction totals.")
    timeline_sheet(wb.create_sheet("Timeline"), "Gala timeline")
    wb.save(out(slug, "gala-fundraiser-workbook.xlsx"))


def south_asian_book(slug):
    wb = Workbook()
    ws = wb.active
    ws.title = "Events"
    cols = ["Event", "Date", "Start time", "Venue", "Guests", "Hosted by", "Attire / colors", "Caterer", "Decor", "Rentals needed", "Budget", "Actual", "Difference", "Notes"]
    brand(ws, "Multi-event wedding planner", "One row per event. Budget totals and per-guest costs calculate below. Rename events to match your traditions.", len(cols))
    header(ws, 5, cols, [18, 12, 10, 22, 8, 14, 18, 18, 18, 26, 11, 11, 11, 26])
    events = ["Roka or engagement", "Mehndi", "Sangeet", "Haldi", "Baraat", "Ceremony (pheras, Anand Karaj or nikah)", "Reception", "Walima or post-wedding", "Welcome dinner"]
    for i, e in enumerate(events, 6):
        ws.cell(row=i, column=1, value=e)
        ws.cell(row=i, column=13, value=f"=K{i}-L{i}")
        ws.cell(row=i, column=2).number_format = "mmm d"
        for c in (11, 12, 13):
            ws.cell(row=i, column=c).number_format = money
    last = 5 + len(events) + 3
    for i in range(6 + len(events), last + 1):
        ws.cell(row=i, column=13, value=f"=K{i}-L{i}")
    grid(ws, 6, last, 1, len(cols))
    ws.cell(row=last + 1, column=10, value="TOTAL").font = total_font
    for c in "KLM":
        ws[f"{c}{last + 1}"] = f"=SUM({c}6:{c}{last})"
        ws[f"{c}{last + 1}"].number_format, ws[f"{c}{last + 1}"].font = money, total_font
    g = wb.create_sheet("Guests")
    extra = ["Mehndi", "Sangeet", "Ceremony", "Reception"]
    cols, ci, first, last = guest_sheet(g, "Guest list by event", rows=600, extra_cols=extra, subtitle="Mark Yes for each event a household is invited to. The summary counts every event.")
    guest_summary(wb.create_sheet("Summary"), "Guests", ci, first, last, extra)
    vendor_sheet(wb.create_sheet("Vendors"), "Vendors across all events")
    wb.save(out(slug, "south-asian-wedding-workbook.xlsx"))


def main():
    master_book("event-planning-kit")
    simple_budget_book("event-budget-spreadsheet", "event-budget-spreadsheet.xlsx", "Event budget")
    write_csv(out("event-budget-spreadsheet", "event-budget.csv"),
              ["Category", "Line item", "Estimate", "Quote", "Actual", "Paid so far", "Balance due", "Due date", "Vendor", "Notes"], budget_rows())
    guest_book("guest-list-rsvp-tracker")
    seating_book("seating-chart-planner")
    rental_calculator("rental-order-calculator")
    vendor_book("vendor-tracker")
    run_of_show("run-of-show-template")
    wedding_book("wedding-planning-kit")
    corporate_book("corporate-event-planning-kit")
    gala_book("gala-fundraiser-planning-kit")
    south_asian_book("south-asian-wedding-planner")
    for root, _, files in os.walk(ROOT):
        for f in sorted(files):
            if f.endswith((".xlsx", ".csv")):
                print(os.path.relpath(os.path.join(root, f), ROOT))


if __name__ == "__main__":
    main()

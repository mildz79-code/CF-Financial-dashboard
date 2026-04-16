# Prompt to Recreate 2026 Monthly Budget

Copy everything below this line and paste it into a new Claude conversation along with your two uploaded files (`2026_monthly_budget.xlsx` and `2026_monthly_budget_korean.xlsx`).

---

I have two 2026 monthly budget spreadsheets attached — one in English and one in Korean. These are for **Color Fashion Dye & Finishing**. They currently show only January 2026 actual data, with Feb-Dec cleared to $0.

Please update BOTH files (English and Korean) with the following:

## Structure (already in place — preserve it exactly):
- **Row 1**: Title — "COLOR FASHION DYE & FINISHING - 2026 YTD RESULTS (Jan Only)"
- **Row 2**: Subtitle — "Monthly P&L Analysis with Percentage Allocations (Jan-Feb Only)"
- **Row 4**: Headers — Category | Jan | Feb | Mar | Apr | May | Jun | Jul | Aug | Sep | Oct | Nov | Dec | TOTAL | % of Rev | Historic %
- **Row 5**: "REVENUE" section header, with "Jan vs Avg" under Historic % column
- **Row 6**: Total Revenue (Sales) — Jan = $844,680, Feb-Dec = $0
- **Rows 8-21**: COST OF GOODS SOLD (COGS) section:
  - Direct Labor - Samuel Hale: $191,612
  - Direct Labor - Workforce: $13,153
  - Payroll - Other: $1,126
  - Chemical & Dyestuffs: $104,446
  - Finishing Supplies - Paper Tube: $7,667
  - Lab Supplies (Testing): $1,365
  - Plant Supplies & Parts: $7,529
  - Freight and Shipping Costs: $3,850
  - Truck Repair: $560
  - Insurance - Liability & Property: $2,692
  - Utilities - Gas: $49,255
  - Utilities - Water: $25,988
  - Total COGS (sum formula): $409,243
- **Row 23**: GROSS PROFIT = Revenue - COGS (formula for each month)
- **Rows 25-50**: OPERATING EXPENSES section:
  - Payroll Expenses (Admin): $57,800
  - Payroll Taxes: $6,269
  - Employee Benefits: $2,863
  - Rent Expense: $87,672
  - Rent Management Fee: $16,764
  - Professional Fees - Legal: $2,059
  - Professional Fees - Other: $547
  - Sales Commission: $3,000
  - Sales Promotion: $1,069
  - Office Expense: $1,402
  - Office Supplies & Printing: $652
  - Computer and Internet: $1,065
  - Telephone Expense: $843
  - Automobile Expense: $1,728
  - Repairs - Computer: $800
  - Repairs - Equipment: $38,125
  - Insurance - Health: $3,849
  - Insurance - Truck: $1,924
  - Licenses - Permits: $600
  - Post Office Charge: $349
  - Equipment Rental: $108
  - Contract Labor: $10,000
  - Outside Service: $2,700
  - Bank Service Charges: $0
  - Total Operating Expenses (sum formula): $242,189
- **Row 52**: NET INCOME (Before Tax) = Gross Profit - Total OpEx
- **Row 53**: Other Income (Refunds): $0
- **Row 54**: NET INCOME (Final) = Net Income Before Tax + Other Income
- **Rows 57-67**: Financial Analysis section:
  - Gross Margin %, Net Margin % (Operating), Net Margin % (Final) — formulas
  - Expense Category Analysis: Total Payroll %, Materials & Chemicals %, Total Utilities %

## Key Formulas:
- **Column N (TOTAL)**: `=SUM(B:M)` for each row
- **Column O (% of Rev)**: `=N[row]/N$6` for each row (Revenue row is 6)
- **Column P (Historic %)**: `=IFERROR(B[row]/[Jan 2024-2025 average]*100, 0)` — compares Jan 2026 actual to the average of January 2024 and January 2025
- **Gross Profit (Row 23)**: `=B6-B21` across all months
- **Net Income Final (Row 54)**: `=B52+B53` across all months
- **Margin rows (60-62)**: `=IFERROR(profit/revenue, 0)` for each month

## Formatting Requirements:
- Professional color scheme with dark blue headers
- Currency format for dollar amounts (no decimals)
- Percentage format for margin rows and % of Rev column
- Yellow highlighted cells for revenue inputs (for scenario planning)
- Bold totals and section headers
- Frozen panes on Row 4 and Column A

## Korean Version:
Create the same spreadsheet translated to Korean (한국어) with identical structure, data, and formulas. Translate all category names, headers, and labels. Keep the same cell references and formulas.

## Important Notes:
- Feb through Dec should remain $0 (cleared) — only January has actual data
- All formulas must still work so that when future months are entered, totals auto-calculate
- The Historic % column compares January 2026 values against the 2-year January average (2024 + 2025 divided by 2)
- Total formulas should reference 197 formulas with 0 errors

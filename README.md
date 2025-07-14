# intake-automation

**Streamlined client onboarding system for Pure Earth Labs**

Automate the intake form → proposal → contract flow to eliminate sales bottlenecks.

## Project Status

**✅ COMPLETED:**
- Intake Forms board created in Monday.com CRM workspace
- 39 columns added matching PDF intake form structure
- Basic text/date/long_text columns working
- Board ID: 9579736643

**🔧 IN PROGRESS:**
- Dropdown column values (created columns but values failed to populate)
- Monday.com form view setup
- Export to signable document workflow

## Quick Start

```bash
# Setup
npm install
# Set MONDAY_API_KEY in your environment

# View current board structure
echo "Intake board: https://earthharbor.monday.com/boards/9579736643"

# Scripts available
npm run create-intake-board      # Already completed
npm run add-intake-columns       # Already completed  
npm run fix-dropdown-columns     # Needs Monday.com API research
```

## File Structure

```
intake-automation/
├── workspaces.json              # Monday.com workspace/board IDs
├── package.json                 # Scripts and dependencies
├── scripts/
│   ├── create-intake-board.js   # ✅ Creates board in CRM workspace
│   ├── add-intake-columns.js    # ✅ Adds 39 intake form columns
│   ├── fix-dropdown-columns.js  # 🔧 Needs API fix for dropdown values
│   └── discover-boards.js       # Planned
└── README.md
```

## Current Board Structure

**Intake Forms Board (9579736643)** has these sections:

### General Information
- Company Name, Product Name, Client Name
- Phone Number, Email Address, Shipping Address

### Product Description  
- Primary Description, Product Action, How to Use
- Physical Form (dropdown - needs values)
- Target Market (dropdown - needs values)
- Target Customer Demographics

### Product Specifications
- Category (dropdown - needs values)
- Benchmark Products, Ingredients Must-Haves/Avoid

### Optional Specifications
- Brand Claims, Differentiators, Hero Ingredients
- Scent Profile (dropdown - needs values)
- Color Profile, Shelf Life, On-Opening Life

### Packaging Requirements
- Packaging Type/Materials/Supplied By (dropdowns - need values)
- Label Requirements, Coding Requirements

### Pricing and Production
- Retail Price Range, Target Cost, Production Volume
- Target Launch Date

### Compliance and Distribution
- Market Compliance Requirements, Certifications
- Countries of Sale

### Tracking
- Status (dropdown - needs values)
- Date Submitted, Assigned To, Additional Notes

## Known Issues

**Dropdown Values Missing:** 
All dropdown columns created but values failed to populate due to Monday.com API property name issue. Need to research correct API approach.

**Affected Dropdowns:**
- Physical Form, Target Market, Category
- Scent Profile, Packaging Type/Materials/Supplied By
- Status

## Next Steps

1. **Fix dropdown API calls** - research Monday.com docs for correct property names
2. **Create Monday.com form view** - link to intake board
3. **Test form submission workflow** 
4. **Build export template** for signable documents
5. **Connect to existing CRM flow** (Contacts → Accounts)

## Configuration

**workspaces.json:**
```json
{
  "workspaces": {
    "CRM": "11007618",
    "LAB": "9736208", 
    "PRODUCTION": "10142622",
    "PURCHASING": "11346231"
  },
  "boards": {
    "contacts": "9161287505",
    "accounts": "9161287533",
    "intake": "9579736643"
  }
}
```

## The Vision

**Proposed Onboarding Flow:**
1. **Discovery call with Paul** → sends intake form link
2. **Client fills Monday.com form** → auto-populates Intake board
3. **Lucas reviews** → generates proposal with pricing/timeline
4. **Internal meeting** → feasibility check
5. **Final call** → sign contract  
6. **Invoice sent** → project kickoff with Mari

**Goal:** Stop losing deals to intake form friction. Make the sales process fast and professional.

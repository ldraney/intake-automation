#!/usr/bin/env node

import 'dotenv/config'
import { readFileSync } from 'fs'

const MONDAY_API_URL = 'https://api.monday.com/v2'

async function addColumn(boardId, column) {
  const { title, type, settings } = column
  
  const mutation = `
    mutation {
      create_column (
        board_id: ${boardId},
        title: "${title}",
        column_type: ${type}
        ${settings ? `, settings_str: "${settings.replace(/"/g, '\\"')}"` : ''}
      ) {
        id
        title
      }
    }
  `
  
  const response = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': process.env.MONDAY_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: mutation })
  })
  
  const result = await response.json()
  
  if (result.errors) {
    console.error(`Failed to create column ${title}:`, result.errors)
    return false
  } else {
    console.log(`✅ Created: ${title}`)
    return true
  }
}

const INTAKE_COLUMNS = [
  // General Information
  { title: "Company Name", type: "text" },
  { title: "Product Name", type: "text" },
  { title: "Client Name", type: "text" },
  { title: "Phone Number", type: "text" },
  { title: "Email Address", type: "text" },
  { title: "Shipping Address", type: "long_text" },
  
  // Product Description
  { title: "Primary Description", type: "long_text" },
  { 
    title: "Physical Form", 
    type: "dropdown", 
    settings: `{"values":[{"id":1,"value":"Liquid"},{"id":2,"value":"Balm"},{"id":3,"value":"Spray"},{"id":4,"value":"Bar"},{"id":5,"value":"Cream"},{"id":6,"value":"Serum"},{"id":7,"value":"Oil"},{"id":8,"value":"Powder"}]}`
  },
  { 
    title: "Target Market", 
    type: "dropdown", 
    settings: `{"values":[{"id":1,"value":"US"},{"id":2,"value":"EU"},{"id":3,"value":"Both"},{"id":4,"value":"Canada"},{"id":5,"value":"Global"}]}`
  },
  { title: "Product Action", type: "long_text" },
  { title: "Target Customer Demographics", type: "text" },
  { title: "How to Use", type: "long_text" },
  
  // Product Specifications
  { 
    title: "Category", 
    type: "dropdown", 
    settings: `{"values":[{"id":1,"value":"Skincare"},{"id":2,"value":"Haircare"},{"id":3,"value":"Bodycare"},{"id":4,"value":"Men's Care"},{"id":5,"value":"Baby Care"}]}`
  },
  { title: "Benchmark Products", type: "text" },
  { title: "Ingredients Must-Haves", type: "text" },
  { title: "Ingredients to Avoid", type: "text" },
  
  // Optional Specifications
  { title: "Brand Claims", type: "text" },
  { title: "Differentiators", type: "long_text" },
  { 
    title: "Scent Profile", 
    type: "dropdown", 
    settings: `{"values":[{"id":1,"value":"Spa-like"},{"id":2,"value":"Floral"},{"id":3,"value":"Fruity"},{"id":4,"value":"Unscented"},{"id":5,"value":"Citrus"},{"id":6,"value":"Herbal"},{"id":7,"value":"Woody"}]}`
  },
  { title: "Color Profile", type: "text" },
  { title: "Hero Ingredients", type: "text" },
  { title: "Shelf Life", type: "text" },
  { title: "On-Opening Life", type: "text" },
  
  // Packaging Requirements
  { 
    title: "Packaging Type", 
    type: "dropdown", 
    settings: `{"values":[{"id":1,"value":"Bottle"},{"id":2,"value":"Jar"},{"id":3,"value":"Spray"},{"id":4,"value":"Stick"},{"id":5,"value":"Tube"},{"id":6,"value":"Pump"},{"id":7,"value":"Dropper"}]}`
  },
  { 
    title: "Packaging Materials", 
    type: "dropdown", 
    settings: `{"values":[{"id":1,"value":"Glass"},{"id":2,"value":"Plastic"},{"id":3,"value":"Biodegradable"},{"id":4,"value":"Aluminum"},{"id":5,"value":"Mixed"}]}`
  },
  { 
    title: "Packaging Supplied By", 
    type: "dropdown", 
    settings: `{"values":[{"id":1,"value":"Client"},{"id":2,"value":"Manufacturer"},{"id":3,"value":"TBD"}]}`
  },
  { title: "Label Requirements", type: "text" },
  { title: "Coding Requirements", type: "text" },
  
  // Pricing and Production
  { title: "Retail Price Range", type: "text" },
  { title: "Target Cost", type: "text" },
  { title: "Production Volume", type: "text" },
  { title: "Target Launch Date", type: "date" },
  
  // Compliance and Certifications
  { title: "Market Compliance Requirements", type: "text" },
  { title: "Certifications", type: "text" },
  
  // Distribution Details
  { title: "Countries of Sale", type: "text" },
  
  // Additional
  { title: "Additional Notes", type: "long_text" },
  
  // Tracking fields
  { 
    title: "Status", 
    type: "dropdown", 
    settings: `{"values":[{"id":1,"value":"New"},{"id":2,"value":"Under Review"},{"id":3,"value":"Pricing"},{"id":4,"value":"Awaiting Approval"},{"id":5,"value":"Approved"},{"id":6,"value":"In Development"}]}`
  },
  { title: "Date Submitted", type: "date" },
  { title: "Assigned To", type: "text" }
]

async function main() {
  console.log('📋 Adding intake form columns to match PDF structure...\n')
  
  // Get board ID from config
  const workspaces = JSON.parse(readFileSync('workspaces.json', 'utf8'))
  const boardId = workspaces.boards.intake
  
  console.log(`Adding columns to Intake Forms board (${boardId})...\n`)
  
  let successCount = 0
  let failCount = 0
  
  for (const column of INTAKE_COLUMNS) {
    const success = await addColumn(boardId, column)
    if (success) {
      successCount++
    } else {
      failCount++
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200))
  }
  
  console.log(`\n📊 SUMMARY:`)
  console.log(`✅ Successfully created: ${successCount} columns`)
  console.log(`❌ Failed: ${failCount} columns`)
  
  console.log(`\n🎯 Next steps:`)
  console.log(`1. Visit board: https://earthharbor.monday.com/boards/${boardId}`)
  console.log(`2. Set up Monday form view`)
  console.log(`3. Test form submission`)
  console.log(`4. Create export template for signable documents`)
}

main()

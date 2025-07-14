#!/usr/bin/env node

import 'dotenv/config'
import { readFileSync } from 'fs'

const MONDAY_API_URL = 'https://api.monday.com/v2'

async function createDropdownColumn(boardId, title, values) {
  // Step 1: Create the column
  const createMutation = `
    mutation {
      create_column (
        board_id: ${boardId},
        title: "${title}",
        column_type: dropdown
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
    body: JSON.stringify({ query: createMutation })
  })
  
  const result = await response.json()
  
  if (result.errors) {
    console.error(`Failed to create ${title}:`, result.errors)
    return null
  }
  
  const columnId = result.data.create_column.id
  console.log(`✅ Created ${title} column (${columnId})`)
  
  // Step 2: Add dropdown values
  const settingsStr = JSON.stringify({
    values: values.map((value, index) => ({ id: index + 1, value }))
  })
  
  const updateMutation = `
    mutation {
      change_column_metadata (
        board_id: ${boardId},
        column_id: "${columnId}",
        column_property: "settings",
        value: "${settingsStr.replace(/"/g, '\\"')}"
      ) {
        id
      }
    }
  `
  
  const updateResponse = await fetch(MONDAY_API_URL, {
    method: 'POST',
    headers: {
      'Authorization': process.env.MONDAY_API_KEY,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: updateMutation })
  })
  
  const updateResult = await updateResponse.json()
  
  if (updateResult.errors) {
    console.error(`Failed to update ${title} settings:`, updateResult.errors)
  } else {
    console.log(`✅ Added dropdown values to ${title}`)
  }
  
  return columnId
}

const DROPDOWN_COLUMNS = [
  {
    title: "Physical Form",
    values: ["Liquid", "Balm", "Spray", "Bar", "Cream", "Serum", "Oil", "Powder"]
  },
  {
    title: "Target Market", 
    values: ["US", "EU", "Both", "Canada", "Global"]
  },
  {
    title: "Category",
    values: ["Skincare", "Haircare", "Bodycare", "Men's Care", "Baby Care"]
  },
  {
    title: "Scent Profile",
    values: ["Spa-like", "Floral", "Fruity", "Unscented", "Citrus", "Herbal", "Woody"]
  },
  {
    title: "Packaging Type",
    values: ["Bottle", "Jar", "Spray", "Stick", "Tube", "Pump", "Dropper"]
  },
  {
    title: "Packaging Materials",
    values: ["Glass", "Plastic", "Biodegradable", "Aluminum", "Mixed"]
  },
  {
    title: "Packaging Supplied By",
    values: ["Client", "Manufacturer", "TBD"]
  },
  {
    title: "Status",
    values: ["New", "Under Review", "Pricing", "Awaiting Approval", "Approved", "In Development"]
  }
]

async function main() {
  console.log('🔧 Fixing dropdown columns with proper two-step process...\n')
  
  // Get board ID from config
  const workspaces = JSON.parse(readFileSync('workspaces.json', 'utf8'))
  const boardId = workspaces.boards.intake
  
  console.log(`Adding dropdown columns to Intake Forms board (${boardId})...\n`)
  
  let successCount = 0
  let failCount = 0
  
  for (const column of DROPDOWN_COLUMNS) {
    const columnId = await createDropdownColumn(boardId, column.title, column.values)
    if (columnId) {
      successCount++
    } else {
      failCount++
    }
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log(`\n📊 DROPDOWN SUMMARY:`)
  console.log(`✅ Successfully created: ${successCount} dropdown columns`)
  console.log(`❌ Failed: ${failCount} columns`)
  
  console.log(`\n🎯 Total board now has: ${31 + successCount} columns`)
  console.log(`\n📋 Next steps:`)
  console.log(`1. Visit board: https://earthharbor.monday.com/boards/${boardId}`)
  console.log(`2. Set up Monday form view`)
  console.log(`3. Test form submission with dropdowns`)
  console.log(`4. Create export template`)
}

main()

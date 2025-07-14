#!/usr/bin/env node

import 'dotenv/config'
import { readFileSync } from 'fs'

const MONDAY_API_URL = 'https://api.monday.com/v2'

async function createDropdownColumnWithValues(boardId, title, values, description = '') {
  // Create the labels array in the correct format for dropdown columns
  const labels = values.map((value, index) => ({
    id: index + 1,
    name: value
  }))
  
  // Properly escape the JSON for the defaults parameter
  const defaultsJson = JSON.stringify({
    settings: {
      labels: labels
    }
  })
  
  // Escape the JSON string for GraphQL
  const escapedDefaults = defaultsJson.replace(/"/g, '\\"')
  
  const mutation = `
    mutation {
      create_column (
        board_id: ${boardId},
        title: "${title}",
        column_type: dropdown,
        description: "${description}",
        defaults: "${escapedDefaults}"
      ) {
        id
        title
        type
      }
    }
  `
  
  console.log(`Creating: ${title}...`)
  
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
    console.error(`❌ Failed to create ${title}:`, result.errors)
    return false
  } else {
    console.log(`✅ Created: ${title} (ID: ${result.data.create_column.id})`)
    return true
  }
}

// Define all dropdown columns that need to be created with their values
const DROPDOWN_COLUMNS_WITH_VALUES = [
  {
    title: "Physical Form v2",
    values: ["Liquid", "Balm", "Spray", "Bar", "Cream", "Serum", "Oil", "Powder"],
    description: "Physical form of the product"
  },
  {
    title: "Target Market v2", 
    values: ["US", "EU", "Both", "Canada", "Global"],
    description: "Target market for distribution"
  },
  {
    title: "Category v2",
    values: ["Skincare", "Haircare", "Bodycare", "Men's Care", "Baby Care"],
    description: "Product category"
  },
  {
    title: "Scent Profile v2",
    values: ["Spa-like", "Floral", "Fruity", "Unscented", "Citrus", "Herbal", "Woody"],
    description: "Scent profile preference"
  },
  {
    title: "Packaging Type v2",
    values: ["Bottle", "Jar", "Spray", "Stick", "Tube", "Pump", "Dropper"],
    description: "Type of packaging"
  },
  {
    title: "Packaging Materials v2",
    values: ["Glass", "Plastic", "Biodegradable", "Aluminum", "Mixed"],
    description: "Packaging materials"
  },
  {
    title: "Packaging Supplied By v2",
    values: ["Client", "Manufacturer", "TBD"],
    description: "Who supplies the packaging"
  },
  {
    title: "Status v2",
    values: ["New", "Under Review", "Pricing", "Awaiting Approval", "Approved", "In Development"],
    description: "Current status of the intake request"
  }
]

async function main() {
  console.log('🔧 Creating dropdown columns with values using the correct API approach...\n')
  
  // Get board ID from config
  const workspaces = JSON.parse(readFileSync('workspaces.json', 'utf8'))
  const boardId = workspaces.boards.intake
  
  console.log(`Adding dropdown columns to Intake Forms board (${boardId})...\n`)
  
  let successCount = 0
  let failCount = 0
  
  for (const column of DROPDOWN_COLUMNS_WITH_VALUES) {
    const success = await createDropdownColumnWithValues(
      boardId, 
      column.title, 
      column.values, 
      column.description
    )
    
    if (success) {
      successCount++
    } else {
      failCount++
    }
    
    // Delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  console.log(`\n📊 RESULTS:`)
  console.log(`✅ Successfully created: ${successCount} dropdown columns`)
  console.log(`❌ Failed: ${failCount} columns`)
  
  if (successCount > 0) {
    console.log(`\n🎯 SUCCESS! Your dropdown columns now have proper values.`)
    console.log(`\n📋 Next steps:`)
    console.log(`1. Visit board: https://earthharbor.monday.com/boards/${boardId}`)
    console.log(`2. Manually delete the old empty dropdown columns from the UI`)
    console.log(`3. Rename the new columns (remove "v2" suffix)`)
    console.log(`4. Set up Monday.com form view`)
    console.log(`5. Test form submission with working dropdowns`)
  }
  
  console.log(`\n💡 Why this works:`)
  console.log(`   - Uses create_column with defaults parameter`)
  console.log(`   - Proper JSON structure: {"settings":{"labels":[...]}}`)
  console.log(`   - Values are created at column creation time`)
}

main()

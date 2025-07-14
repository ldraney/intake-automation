#!/usr/bin/env node

import 'dotenv/config'
import { readFileSync, writeFileSync } from 'fs'

const MONDAY_API_URL = 'https://api.monday.com/v2'

async function createBoard() {
  const workspaces = JSON.parse(readFileSync('workspaces.json', 'utf8'))
  const crmWorkspaceId = workspaces.workspaces.CRM
  
  console.log(`🏗️  Creating fresh Intake Forms board in CRM workspace (${crmWorkspaceId})...\n`)
  
  const mutation = `
    mutation {
      create_board (
        board_name: "Intake Forms",
        board_kind: public,
        workspace_id: ${crmWorkspaceId}
      ) {
        id
        name
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
    console.error('❌ Failed to create board:', result.errors)
    return null
  }
  
  console.log(`✅ Created board: ${result.data.create_board.name} (ID: ${result.data.create_board.id})`)
  return result.data.create_board.id
}

async function addColumn(boardId, column) {
  const { title, type, settings, description = '' } = column
  
  let mutation
  
  if (type === 'dropdown' && settings) {
    // Create dropdown column with values using defaults parameter
    const escapedDefaults = settings.replace(/"/g, '\\"')
    mutation = `
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
  } else {
    // Create regular column
    mutation = `
      mutation {
        create_column (
          board_id: ${boardId},
          title: "${title}",
          column_type: ${type}
          ${description ? `, description: "${description}"` : ''}
        ) {
          id
          title
          type
        }
      }
    `
  }
  
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
    console.log(`✅ Created: ${title} (${type})`)
    return true
  }
}

// ALL 39 columns defined properly from the start
const ALL_INTAKE_COLUMNS = [
  // === GENERAL INFORMATION ===
  { title: "Company Name", type: "text", description: "Client company name" },
  { title: "Product Name", type: "text", description: "Name of the product being developed" },
  { title: "Client Name", type: "text", description: "Primary contact person" },
  { title: "Phone Number", type: "text", description: "Client contact phone" },
  { title: "Email Address", type: "text", description: "Client contact email" },
  { title: "Shipping Address", type: "long_text", description: "Where to ship samples/products" },
  
  // === PRODUCT DESCRIPTION ===
  { title: "Primary Description", type: "long_text", description: "Detailed product description" },
  { 
    title: "Physical Form", 
    type: "dropdown", 
    description: "Physical form of the product",
    settings: `{"settings":{"labels":[{"id":1,"name":"Liquid"},{"id":2,"name":"Balm"},{"id":3,"name":"Spray"},{"id":4,"name":"Bar"},{"id":5,"name":"Cream"},{"id":6,"name":"Serum"},{"id":7,"name":"Oil"},{"id":8,"name":"Powder"}]}}`
  },
  { 
    title: "Target Market", 
    type: "dropdown", 
    description: "Target market for distribution",
    settings: `{"settings":{"labels":[{"id":1,"name":"US"},{"id":2,"name":"EU"},{"id":3,"name":"Both"},{"id":4,"name":"Canada"},{"id":5,"name":"Global"}]}}`
  },
  { title: "Product Action", type: "long_text", description: "What the product does/how it works" },
  { title: "Target Customer Demographics", type: "text", description: "Who will use this product" },
  { title: "How to Use", type: "long_text", description: "Instructions for product use" },
  
  // === PRODUCT SPECIFICATIONS ===
  { 
    title: "Category", 
    type: "dropdown", 
    description: "Product category",
    settings: `{"settings":{"labels":[{"id":1,"name":"Skincare"},{"id":2,"name":"Haircare"},{"id":3,"name":"Bodycare"},{"id":4,"name":"Men's Care"},{"id":5,"name":"Baby Care"}]}}`
  },
  { title: "Benchmark Products", type: "text", description: "Competing or reference products" },
  { title: "Ingredients Must-Haves", type: "text", description: "Required ingredients" },
  { title: "Ingredients to Avoid", type: "text", description: "Ingredients to exclude" },
  
  // === OPTIONAL SPECIFICATIONS ===
  { title: "Brand Claims", type: "text", description: "Marketing claims for the product" },
  { title: "Differentiators", type: "long_text", description: "What makes this product unique" },
  { 
    title: "Scent Profile", 
    type: "dropdown", 
    description: "Desired scent profile",
    settings: `{"settings":{"labels":[{"id":1,"name":"Spa-like"},{"id":2,"name":"Floral"},{"id":3,"name":"Fruity"},{"id":4,"name":"Unscented"},{"id":5,"name":"Citrus"},{"id":6,"name":"Herbal"},{"id":7,"name":"Woody"}]}}`
  },
  { title: "Color Profile", type: "text", description: "Desired color/appearance" },
  { title: "Hero Ingredients", type: "text", description: "Key marketing ingredients" },
  { title: "Shelf Life", type: "text", description: "Required shelf life" },
  { title: "On-Opening Life", type: "text", description: "Stability after opening" },
  
  // === PACKAGING REQUIREMENTS ===
  { 
    title: "Packaging Type", 
    type: "dropdown", 
    description: "Type of packaging",
    settings: `{"settings":{"labels":[{"id":1,"name":"Bottle"},{"id":2,"name":"Jar"},{"id":3,"name":"Spray"},{"id":4,"name":"Stick"},{"id":5,"name":"Tube"},{"id":6,"name":"Pump"},{"id":7,"name":"Dropper"}]}}`
  },
  { 
    title: "Packaging Materials", 
    type: "dropdown", 
    description: "Packaging materials",
    settings: `{"settings":{"labels":[{"id":1,"name":"Glass"},{"id":2,"name":"Plastic"},{"id":3,"name":"Biodegradable"},{"id":4,"name":"Aluminum"},{"id":5,"name":"Mixed"}]}}`
  },
  { 
    title: "Packaging Supplied By", 
    type: "dropdown", 
    description: "Who supplies the packaging",
    settings: `{"settings":{"labels":[{"id":1,"name":"Client"},{"id":2,"name":"Manufacturer"},{"id":3,"name":"TBD"}]}}`
  },
  { title: "Label Requirements", type: "text", description: "Label specifications" },
  { title: "Coding Requirements", type: "text", description: "Batch coding requirements" },
  
  // === PRICING AND PRODUCTION ===
  { title: "Retail Price Range", type: "text", description: "Target retail price range" },
  { title: "Target Cost", type: "text", description: "Target manufacturing cost" },
  { title: "Production Volume", type: "text", description: "Expected production quantities" },
  { title: "Target Launch Date", type: "date", description: "When product should launch" },
  
  // === COMPLIANCE AND CERTIFICATIONS ===
  { title: "Market Compliance Requirements", type: "text", description: "Regulatory requirements" },
  { title: "Certifications", type: "text", description: "Required certifications" },
  
  // === DISTRIBUTION DETAILS ===
  { title: "Countries of Sale", type: "text", description: "Where product will be sold" },
  
  // === ADDITIONAL ===
  { title: "Additional Notes", type: "long_text", description: "Any other important information" },
  
  // === TRACKING FIELDS ===
  { 
    title: "Status", 
    type: "dropdown", 
    description: "Current status of the intake request",
    settings: `{"settings":{"labels":[{"id":1,"name":"New"},{"id":2,"name":"Under Review"},{"id":3,"name":"Pricing"},{"id":4,"name":"Awaiting Approval"},{"id":5,"name":"Approved"},{"id":6,"name":"In Development"}]}}`
  },
  { title: "Date Submitted", type: "date", description: "When intake was submitted" },
  { title: "Assigned To", type: "text", description: "Who is handling this intake" }
]

async function updateConfig(boardId) {
  const workspaces = JSON.parse(readFileSync('workspaces.json', 'utf8'))
  
  // Update the intake board ID
  workspaces.boards.intake = boardId
  
  // Write back to file
  writeFileSync('workspaces.json', JSON.stringify(workspaces, null, 2))
  console.log(`✅ Updated workspaces.json with new board ID`)
}

async function main() {
  console.log('🚀 ULTIMATE INTAKE BOARD SETUP')
  console.log('=====================================')
  console.log('Creating fresh board with ALL columns done right!\n')
  
  // Step 1: Create the board
  const boardId = await createBoard()
  if (!boardId) {
    console.error("❌ Cannot proceed without board")
    return
  }
  
  // Step 2: Update config immediately
  await updateConfig(boardId)
  
  // Step 3: Add all columns
  console.log('\n📋 Adding all 39 columns...\n')
  
  let successCount = 0
  let failCount = 0
  
  for (const column of ALL_INTAKE_COLUMNS) {
    const success = await addColumn(boardId, column)
    if (success) {
      successCount++
    } else {
      failCount++
    }
    
    // Rate limiting delay
    await new Promise(resolve => setTimeout(resolve, 300))
  }
  
  console.log('\n🎯 FINAL RESULTS:')
  console.log('=====================================')
  console.log(`✅ Successfully created: ${successCount}/${ALL_INTAKE_COLUMNS.length} columns`)
  console.log(`❌ Failed: ${failCount} columns`)
  
  if (successCount === ALL_INTAKE_COLUMNS.length) {
    console.log('\n🎉 PERFECT! Everything created successfully!')
    console.log('\n📋 Your board now has:')
    console.log('   • 31 text/date/long_text columns')
    console.log('   • 8 dropdown columns with proper values')
    console.log('   • All organized by logical sections')
    console.log('   • Ready for Monday.com form setup')
    
    console.log(`\n🔗 Board URL: https://earthharbor.monday.com/boards/${boardId}`)
    
    console.log('\n🎯 Next Steps:')
    console.log('1. Visit your board and verify everything looks good')
    console.log('2. Set up Monday.com form view')
    console.log('3. Test form submission')
    console.log('4. Create export template for contracts')
    console.log('5. Connect to your sales workflow')
    
    console.log('\n💪 Your intake automation is now BULLETPROOF!')
  } else {
    console.log(`\n⚠️  Some columns failed. Check the errors above and retry if needed.`)
  }
}

main()

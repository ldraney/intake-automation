#!/usr/bin/env node

import 'dotenv/config'
import { readFileSync, writeFileSync } from 'fs'

const MONDAY_API_URL = 'https://api.monday.com/v2'

async function createBoard() {
  // Read workspaces config
  const workspaces = JSON.parse(readFileSync('workspaces.json', 'utf8'))
  const crmWorkspaceId = workspaces.workspaces.CRM
  
  console.log(`Creating Intake Forms board in CRM workspace (${crmWorkspaceId})...\n`)
  
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
    console.error('Failed to create board:', result.errors)
    return null
  }
  
  return result.data.create_board
}

async function updateConfig(boardId) {
  const workspaces = JSON.parse(readFileSync('workspaces.json', 'utf8'))
  
  // Add boards section if it doesn't exist
  if (!workspaces.boards) {
    workspaces.boards = {}
  }
  
  // Add the new intake board
  workspaces.boards.intake = boardId
  
  // Write back to file
  writeFileSync('workspaces.json', JSON.stringify(workspaces, null, 2))
}

async function main() {
  const board = await createBoard()
  
  if (!board) {
    console.error("Failed to create board")
    return
  }
  
  console.log(`✅ Created board: ${board.name} (ID: ${board.id})\n`)
  
  // Update config file
  await updateConfig(board.id)
  console.log(`✅ Updated workspaces.json with new board ID\n`)
  
  console.log(`🎯 Next steps:`)
  console.log(`1. Add columns based on PDF intake form`)
  console.log(`2. Set up Monday form view`)
  console.log(`3. Test submission workflow`)
  console.log(`\n📋 Board URL: https://earthharbor.monday.com/boards/${board.id}`)
}

main()

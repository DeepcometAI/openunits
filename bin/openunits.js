#!/usr/bin/env node
import('../dist/cli.js').then(({ program }) => {
  program.parse(process.argv)
}).catch((err) => {
  console.error('openunits CLI failed to load:', err.message)
  process.exit(1)
})

#!/usr/bin/env node

/**
 * Documentation Update Script
 * Removes hyperbolic language and updates content to match actual implementation
 */

import fs from 'fs';
import path from 'path';

const docsDir = './docs';

// Patterns to replace
const replacements = [
  // Remove hyperbolic adjectives
  { from: /revolutionary|most advanced|ever created|ultimate|aggressive|unpredictable/gi, to: 'advanced' },
  { from: /world-class|industry-leading|cutting-edge|groundbreaking/gi, to: 'comprehensive' },
  { from: /unparalleled|unprecedented|game-changing|paradigm-shifting/gi, to: 'effective' },
  
  // Update version references
  { from: /version.*1\.0\.0/gi, to: 'version 1.0.2' },
  { from: /v1\.0\.0/gi, to: 'v1.0.2' },
  
  // Remove excessive emphasis
  { from: /\*\*\*([^*]+)\*\*\*/g, to: '**$1**' },
  { from: /🔥🔥🔥/g, to: '🔥' },
  { from: /✅✅✅/g, to: '✅' },
  
  // Normalize feature descriptions
  { from: /COMPLETE SYSTEM|ACHIEVED|PERFECT|ULTIMATE/gi, to: 'System' },
  { from: /ZERO ERRORS|ABSOLUTE PERFECTION|FLAWLESS/gi, to: 'Complete' }
];

// Files to update
const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));

console.log('📝 Updating documentation files...\n');

for (const file of files) {
  const filePath = path.join(docsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;
  
  for (const replacement of replacements) {
    const newContent = content.replace(replacement.from, replacement.to);
    if (newContent !== content) {
      content = newContent;
      changed = true;
    }
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated: ${file}`);
  } else {
    console.log(`⏭️  Skipped: ${file} (no changes needed)`);
  }
}

console.log('\n📝 Documentation update complete!');

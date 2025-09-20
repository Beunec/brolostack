#!/usr/bin/env node

/**
 * Documentation Validation Script
 * Validates all documentation for accuracy and completeness
 */

import fs from 'fs';
import path from 'path';

const docsDir = './docs';

console.log('📚 BROLOSTACK DOCUMENTATION VALIDATION\n');

// Check for required documentation files
const requiredDocs = [
  'GETTING_STARTED.md',
  'BROLOSTACK_FRAMEWORK_STATUS.md',
  'BROLOSTACK_AI_FRAMEWORK.md',
  'BROLOSTACK_DEVIL_SECURITY_FRAMEWORK.md',
  'BROLOSTACK_WEBSOCKET_FRAMEWORK.md',
  'BROLOSTACK_BACKEND_INTEGRATION.md',
  'BROLOSTACK_CLOUD_INTEGRATION_IMPLEMENTATION.md',
  'BROLOSTACK_CIAM_INTEGRATION_COMPLETE.md',
  'BROLOSTACK_WORKER_GUIDE.md'
];

console.log('📋 Checking required documentation files...');
let docsComplete = true;

for (const doc of requiredDocs) {
  const docPath = path.join(docsDir, doc);
  if (fs.existsSync(docPath)) {
    const stats = fs.statSync(docPath);
    console.log(`✅ ${doc} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ Missing: ${doc}`);
    docsComplete = false;
  }
}

// Check for hyperbolic language
console.log('\n🔍 Checking for hyperbolic language...');
const hyperbolics = [
  'revolutionary', 'most advanced', 'ever created', 'ultimate', 
  'aggressive', 'unpredictable', 'unparalleled', 'unprecedented'
];

let hyperbolicsFound = 0;
const files = fs.readdirSync(docsDir).filter(file => file.endsWith('.md'));

for (const file of files) {
  const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
  for (const term of hyperbolics) {
    const regex = new RegExp(term, 'gi');
    const matches = content.match(regex);
    if (matches) {
      console.log(`⚠️  ${file}: Found "${term}" (${matches.length} times)`);
      hyperbolicsFound += matches.length;
    }
  }
}

if (hyperbolicsFound === 0) {
  console.log('✅ No hyperbolic language detected');
}

// Check for accurate version references
console.log('\n🔢 Checking version references...');
let versionIssues = 0;

for (const file of files) {
  const content = fs.readFileSync(path.join(docsDir, file), 'utf8');
  
  // Check for old version references
  const oldVersions = content.match(/1\.0\.0|v1\.0\.0/g);
  if (oldVersions) {
    console.log(`⚠️  ${file}: Found old version references (${oldVersions.length})`);
    versionIssues += oldVersions.length;
  }
  
  // Check for current version
  const currentVersions = content.match(/1\.0\.2|v1\.0\.2/g);
  if (currentVersions) {
    console.log(`✅ ${file}: Current version referenced (${currentVersions.length} times)`);
  }
}

// Final assessment
console.log('\n🎯 DOCUMENTATION VALIDATION RESULTS');
console.log('======================================');

const checks = [
  { name: 'Required Documentation', status: docsComplete },
  { name: 'Language Quality', status: hyperbolicsFound === 0 },
  { name: 'Version Accuracy', status: versionIssues === 0 }
];

let allPassed = true;
for (const check of checks) {
  const status = check.status ? '✅ PASS' : '❌ FAIL';
  console.log(`${check.name}: ${status}`);
  if (!check.status) allPassed = false;
}

console.log('\n' + '='.repeat(50));

if (allPassed) {
  console.log('🎉 DOCUMENTATION IS EXCELLENT!');
  console.log('✅ All files present and accurate');
  console.log('✅ Professional language throughout');
  console.log('✅ Current version references');
  console.log('✅ Ready for production');
  process.exit(0);
} else {
  console.log('⚠️  DOCUMENTATION NEEDS ATTENTION');
  if (hyperbolicsFound > 0) {
    console.log(`❌ ${hyperbolicsFound} hyperbolic terms found`);
  }
  if (versionIssues > 0) {
    console.log(`❌ ${versionIssues} version reference issues`);
  }
  process.exit(1);
}

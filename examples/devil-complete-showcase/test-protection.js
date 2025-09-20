#!/usr/bin/env node

/**
 * 🔥 Brolostack Devil Protection Test Script
 * Demonstrates source code protection for all supported file types
 */

const fs = require('fs');
const path = require('path');

// Import Brolostack Devil (in real project: const { DevilSourceCode } = require('brolostack'))
const { DevilSourceCode } = require('../../src/security/BrolostackDevilSourceCode');

async function testFileProtection() {
  console.log('🔥 ====================================== 🔥');
  console.log('🔥  BROLOSTACK DEVIL PROTECTION TEST   🔥');
  console.log('🔥 ====================================== 🔥\n');

  const demoFiles = [
    { file: './src/demo-files/sample.html', type: 'HTML' },
    { file: './src/demo-files/sample.php', type: 'PHP' },
    { file: './src/demo-files/sample.css', type: 'CSS' }
  ];

  for (const { file, type } of demoFiles) {
    try {
      console.log(`🔥 Testing ${type} Protection: ${file}`);
      console.log('━'.repeat(50));

      // Read the original file
      const originalCode = fs.readFileSync(file, 'utf-8');
      console.log(`📄 Original ${type} size: ${originalCode.length} characters`);

      // Protect the code based on file type
      let result;
      switch (type) {
        case 'HTML':
          result = await DevilSourceCode.protectHTML(originalCode);
          break;
        case 'PHP':
          result = await DevilSourceCode.protectPHP(originalCode);
          break;
        case 'CSS':
          result = await DevilSourceCode.protectCSS(originalCode);
          break;
        default:
          result = await DevilSourceCode.protectJS(originalCode);
      }

      console.log(`🔥 Protected ${type} size: ${result.obfuscatedCode.length} characters`);
      console.log(`📊 Size change: ${((result.obfuscatedCode.length / originalCode.length) * 100).toFixed(1)}%`);
      console.log(`🛡️ Protection level: ${result.protectionLevel}`);
      console.log(`🔀 Obfuscation mappings: ${Object.keys(result.sourceMap).length}`);
      console.log(`🎭 Jargon mappings: ${Object.keys(result.jargonMap).length}`);

      // Save protected version
      const outputFile = file.replace('/demo-files/', '/protected-files/');
      const outputDir = path.dirname(outputFile);
      
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      fs.writeFileSync(outputFile, result.obfuscatedCode);
      console.log(`💾 Protected file saved: ${outputFile}`);

      // Show a sample of the obfuscated code
      console.log('\n📝 Sample of obfuscated code:');
      console.log('─'.repeat(40));
      console.log(result.obfuscatedCode.substring(0, 200) + '...');
      console.log('─'.repeat(40));

      console.log('\n✅ ' + type + ' protection completed successfully!\n');

    } catch (error) {
      console.error(`❌ Failed to protect ${type} file:`, error.message);
    }
  }

  // Test JavaScript protection
  console.log('🔥 Testing JavaScript Protection');
  console.log('━'.repeat(50));

  const jsCode = `
function calculateUserCreditScore(userData) {
  let score = 300;
  
  if (userData.income > 50000) score += 100;
  if (userData.age > 25) score += 50;
  if (userData.employment === 'stable') score += 75;
  
  return Math.min(score, 850);
}

const apiKey = 'sk-1234567890abcdef';
const secretPassword = 'ultra_secret_password_2024';

class PaymentProcessor {
  constructor(merchantId, secret) {
    this.merchantId = merchantId;
    this.secret = secret;
  }
  
  processPayment(cardData, amount) {
    const fee = amount * 0.029;
    return {
      status: 'approved',
      amount: amount,
      fee: fee,
      total: amount + fee
    };
  }
}
`;

  try {
    const jsResult = await DevilSourceCode.protectJS(jsCode);
    
    console.log(`📄 Original JavaScript size: ${jsCode.length} characters`);
    console.log(`🔥 Protected JavaScript size: ${jsResult.obfuscatedCode.length} characters`);
    console.log(`📊 Size change: ${((jsResult.obfuscatedCode.length / jsCode.length) * 100).toFixed(1)}%`);
    
    // Save protected JavaScript
    fs.writeFileSync('./src/protected-files/sample.js', jsResult.obfuscatedCode);
    
    console.log('\n📝 Original JavaScript:');
    console.log('─'.repeat(40));
    console.log(jsCode.substring(0, 200) + '...');
    
    console.log('\n🔥 Protected JavaScript (what hackers see):');
    console.log('─'.repeat(40));
    console.log(jsResult.obfuscatedCode.substring(0, 200) + '...');
    console.log('─'.repeat(40));
    
    console.log('\n✅ JavaScript protection completed successfully!\n');

  } catch (error) {
    console.error('❌ Failed to protect JavaScript:', error.message);
  }

  // Test TypeScript protection
  console.log('🔥 Testing TypeScript Protection');
  console.log('━'.repeat(50));

  const tsCode = `
interface UserData {
  name: string;
  email: string;
  creditScore: number;
  secretNotes: string;
}

class UserManager {
  private apiKey: string = 'sk-typescript-secret-key';
  private encryptionKey: string = 'ts-encryption-2024';
  
  constructor(private databaseUrl: string) {}
  
  async createUser(userData: UserData): Promise<boolean> {
    const encryptedData = this.encryptUserData(userData);
    return await this.saveToDatabase(encryptedData);
  }
  
  private encryptUserData(data: UserData): string {
    // Sensitive encryption logic (will be obfuscated)
    const jsonData = JSON.stringify(data);
    return btoa(jsonData + this.encryptionKey);
  }
  
  private async saveToDatabase(data: string): Promise<boolean> {
    // Database logic (will be obfuscated)
    console.log('Saving to:', this.databaseUrl);
    return true;
  }
}
`;

  try {
    const tsResult = await DevilSourceCode.protectTS(tsCode);
    
    console.log(`📄 Original TypeScript size: ${tsCode.length} characters`);
    console.log(`🔥 Protected TypeScript size: ${tsResult.obfuscatedCode.length} characters`);
    
    fs.writeFileSync('./src/protected-files/sample.ts', tsResult.obfuscatedCode);
    
    console.log('\n📝 Original TypeScript:');
    console.log('─'.repeat(40));
    console.log(tsCode.substring(0, 200) + '...');
    
    console.log('\n🔥 Protected TypeScript (what hackers see):');
    console.log('─'.repeat(40));
    console.log(tsResult.obfuscatedCode.substring(0, 200) + '...');
    console.log('─'.repeat(40));
    
    console.log('\n✅ TypeScript protection completed successfully!\n');

  } catch (error) {
    console.error('❌ Failed to protect TypeScript:', error.message);
  }

  console.log('🔥 ====================================== 🔥');
  console.log('🔥  ALL PROTECTION TESTS COMPLETED    🔥');
  console.log('🔥 ====================================== 🔥');
  console.log('\n📁 Protected files saved in: ./src/protected-files/');
  console.log('\n🔍 Compare original vs protected files to see the magic!');
  console.log('\n🛡️ Your code is now COMPLETELY UNREADABLE and UNREPLICATABLE!');
  console.log('\n🔥 THE DEVIL HAS PROTECTED YOUR SOURCE CODE! 🔥');
}

// Run the test
testFileProtection().catch(console.error);

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const fileManager = require('../utils/fileManager');

require('dotenv').config();

/**
 * Database and File Backup Script
 * Run this script periodically to ensure data integrity
 */

async function createFullBackup() {
  console.log('🚀 Starting full backup process...');

  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to database');

    // Create file backup
    console.log('📁 Creating file backup...');
    const fileBackup = fileManager.createBackup();

    if (!fileBackup.success) {
      throw new Error(`File backup failed: ${fileBackup.error}`);
    }

    // Create database backup
    console.log('💾 Creating database backup...');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, '..', 'backups', `db-backup-${timestamp}`);

    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    // Export users data
    const users = await User.find({}).lean();
    const usersBackupPath = path.join(backupDir, 'users.json');
    fs.writeFileSync(usersBackupPath, JSON.stringify(users, null, 2));

    // Create backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      totalUsers: users.length,
      fileBackup: {
        path: fileBackup.backupPath,
        filesBackedUp: fileBackup.filesBackedUp
      },
      databaseBackup: {
        path: backupDir,
        collections: ['users']
      }
    };

    const metadataPath = path.join(backupDir, 'backup-metadata.json');
    fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

    console.log('✅ Full backup completed successfully!');
    console.log(`📊 Backup Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Files backed up: ${fileBackup.filesBackedUp}`);
    console.log(`   - Backup location: ${backupDir}`);

    return {
      success: true,
      backupPath: backupDir,
      metadata
    };

  } catch (error) {
    console.error('❌ Backup failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.disconnect();
  }
}

/**
 * Data Integrity Check
 */
async function checkDataIntegrity() {
  console.log('🔍 Checking data integrity...');

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const users = await User.find({});
    let issues = [];

    for (const user of users) {
      // Check if files referenced in database actually exist
      if (user.aadhaarDocument) {
        const fileExists = fs.existsSync(path.join(__dirname, '..', user.aadhaarDocument));
        if (!fileExists) {
          issues.push({
            type: 'missing_file',
            userId: user._id,
            userName: user.fullName,
            file: user.aadhaarDocument
          });
        }
      }

      // Check file metadata consistency
      if (user.fileMetadata?.aadhaarDocument) {
        const metadata = user.fileMetadata.aadhaarDocument;
        if (!metadata.uploadDate || !metadata.size) {
          issues.push({
            type: 'incomplete_metadata',
            userId: user._id,
            userName: user.fullName,
            field: 'aadhaarDocument'
          });
        }
      }
    }

    console.log(`📊 Integrity check completed. Found ${issues.length} issues.`);

    if (issues.length > 0) {
      console.log('⚠️  Issues found:');
      issues.forEach(issue => console.log(`   - ${issue.type}: ${issue.userName} (${issue.file || issue.field})`));
    }

    return {
      success: true,
      totalUsers: users.length,
      issuesFound: issues.length,
      issues
    };

  } catch (error) {
    console.error('❌ Integrity check failed:', error);
    return {
      success: false,
      error: error.message
    };
  } finally {
    await mongoose.disconnect();
  }
}

// Run backup if script is executed directly
if (require.main === module) {
  const command = process.argv[2];

  if (command === 'backup') {
    createFullBackup().then(result => {
      process.exit(result.success ? 0 : 1);
    });
  } else if (command === 'check') {
    checkDataIntegrity().then(result => {
      process.exit(result.success ? 0 : 1);
    });
  } else {
    console.log('Usage: node backup.js [backup|check]');
    console.log('  backup: Create full backup of database and files');
    console.log('  check: Check data integrity');
    process.exit(1);
  }
}

module.exports = {
  createFullBackup,
  checkDataIntegrity
};
const fs = require('fs');
const path = require('path');

/**
 * File Management Utilities for Permanent Storage
 */

class FileManager {
  constructor() {
    this.baseDir = path.join(__dirname, '..', 'uploads');
    this.ensureDirectories();
  }

  // Ensure all necessary directories exist
  ensureDirectories() {
    const dirs = [
      this.baseDir,
      path.join(this.baseDir, 'documents'),
      path.join(this.baseDir, 'barcodes'),
      path.join(this.baseDir, 'temp'),
      path.join(this.baseDir, 'backups')
    ];

    dirs.forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
      }
    });
  }

  // Get file stats
  getFileStats(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', filePath);
      if (fs.existsSync(fullPath)) {
        const stats = fs.statSync(fullPath);
        return {
          exists: true,
          size: stats.size,
          created: stats.birthtime,
          modified: stats.mtime,
          path: filePath
        };
      }
      return { exists: false, path: filePath };
    } catch (error) {
      console.error('Error getting file stats:', error);
      return { exists: false, path: filePath, error: error.message };
    }
  }

  // Clean up orphaned files (files in uploads that don't have database references)
  async cleanupOrphanedFiles(userDocuments = []) {
    try {
      const allFiles = this.getAllFiles();
      const referencedFiles = new Set();

      // Add all referenced files to set
      userDocuments.forEach(doc => {
        if (doc.aadhaarDocument) referencedFiles.add(doc.aadhaarDocument);
        if (doc.profilePicture) referencedFiles.add(doc.profilePicture);
      });

      let cleanedCount = 0;
      for (const file of allFiles) {
        if (!referencedFiles.has(file)) {
          try {
            fs.unlinkSync(path.join(__dirname, '..', file));
            console.log(`Cleaned up orphaned file: ${file}`);
            cleanedCount++;
          } catch (error) {
            console.error(`Error deleting orphaned file ${file}:`, error);
          }
        }
      }

      return { cleanedCount, totalFiles: allFiles.length };
    } catch (error) {
      console.error('Error in cleanup:', error);
      return { error: error.message };
    }
  }

  // Get all files in uploads directory
  getAllFiles() {
    const files = [];

    const walkDir = (dir, relativePath = '') => {
      const items = fs.readdirSync(dir);
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const relPath = path.join(relativePath, item).replace(/\\/g, '/');
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          walkDir(fullPath, relPath);
        } else {
          files.push(relPath);
        }
      }
    };

    walkDir(this.baseDir, 'uploads');
    return files;
  }

  // Create backup of important files
  createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = path.join(this.baseDir, 'backups', `backup-${timestamp}`);

      fs.mkdirSync(backupDir, { recursive: true });

      // Copy all files to backup
      const allFiles = this.getAllFiles();
      let backedUpCount = 0;

      for (const file of allFiles) {
        const sourcePath = path.join(__dirname, '..', file);
        const destPath = path.join(backupDir, path.basename(file));

        if (fs.existsSync(sourcePath)) {
          fs.copyFileSync(sourcePath, destPath);
          backedUpCount++;
        }
      }

      return {
        success: true,
        backupPath: backupDir,
        filesBackedUp: backedUpCount
      };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error: error.message };
    }
  }

  // Validate file integrity
  validateFile(filePath) {
    try {
      const fullPath = path.join(__dirname, '..', filePath);
      if (!fs.existsSync(fullPath)) {
        return { valid: false, reason: 'File does not exist' };
      }

      const stats = fs.statSync(fullPath);
      if (stats.size === 0) {
        return { valid: false, reason: 'File is empty' };
      }

      // Check file extension
      const ext = path.extname(filePath).toLowerCase();
      const allowedExts = ['.pdf', '.jpg', '.jpeg', '.png'];
      if (!allowedExts.includes(ext)) {
        return { valid: false, reason: 'Invalid file extension' };
      }

      return { valid: true, size: stats.size, extension: ext };
    } catch (error) {
      return { valid: false, reason: error.message };
    }
  }
}

module.exports = new FileManager();
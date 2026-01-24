# Permanent Storage System Documentation

## Overview
This system ensures that all user data and uploaded documents are permanently stored and accessible even after long periods (years). The system includes automatic backups, file integrity checks, and cleanup mechanisms.

## Features

### 1. Organized File Storage
- **Directory Structure**:
  ```
  uploads/
  ├── documents/     # Aadhaar documents and other user files
  ├── barcodes/      # Generated barcode images
  ├── temp/          # Temporary files (auto-cleaned)
  └── backups/       # Automated backup archives
  ```

- **File Naming**: Unique timestamps + random strings to prevent conflicts
- **File Types**: PDF, JPEG, PNG (validated on upload)

### 2. Database Integration
- **File Metadata**: Stores original filename, upload date, size, and MIME type
- **Referential Integrity**: Database tracks all file paths
- **Audit Trail**: Creation and modification timestamps

### 3. Automatic Cleanup
- **Orphaned Files**: Removes files not referenced in database
- **Failed Uploads**: Cleans up files when registration fails
- **User Deletion**: Removes associated files when users are deleted

### 4. Backup System
- **Automated Backups**: Database + files in compressed archives
- **Integrity Checks**: Validates file existence and metadata
- **Recovery**: Backup archives for disaster recovery

## API Endpoints (Admin Only)

### File Management
```
GET  /api/admin/file-stats      # Get storage statistics
POST /api/admin/create-backup   # Create full backup
POST /api/admin/cleanup-files   # Remove orphaned files
GET  /api/admin/validate-files  # Check file integrity
```

### User Management
```
DELETE /api/admin/delete-tenant/:id  # Delete user + files
DELETE /api/admin/reject-tenant/:id  # Reject user + cleanup files
```

## Backup Script Usage

### Create Full Backup
```bash
cd backend
node scripts/backup.js backup
```

### Check Data Integrity
```bash
cd backend
node scripts/backup.js check
```

## File Access
- **Web Access**: Files served via `/uploads/` path
- **Security**: Files accessible only through authenticated sessions
- **Caching**: Files cached by browser for performance

## Maintenance Tasks

### Daily
- Run integrity check: `node scripts/backup.js check`

### Weekly
- Create backup: `node scripts/backup.js backup`
- Cleanup orphaned files: `POST /api/admin/cleanup-files`

### Monthly
- Validate all files: `GET /api/admin/validate-files`
- Review backup archives

## Storage Requirements
- **File Size Limit**: 10MB per file
- **Total Storage**: Depends on number of users
- **Backup Retention**: Keep last 12 months of backups
- **Cleanup**: Run orphaned file cleanup regularly

## Security Considerations
- Files stored outside web root for security
- File type validation prevents malicious uploads
- Access control through authentication
- File paths not directly accessible without proper routing

## Monitoring
- File upload success/failure rates
- Storage usage trends
- Backup completion status
- File integrity check results

## Troubleshooting

### Missing Files
1. Check file path in database
2. Verify file exists on disk
3. Run integrity check script
4. Restore from backup if needed

### Storage Full
1. Run cleanup script
2. Archive old backups
3. Consider increasing storage capacity

### Upload Failures
1. Check file size limits
2. Verify file type validation
3. Check server logs for errors
4. Ensure proper permissions on upload directory
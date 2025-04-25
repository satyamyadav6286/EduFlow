# EduFlow Certificate System

This document explains how the certificate system works in EduFlow.

## Overview

The certificate system provides users with PDF certificates upon course completion. Each certificate has a unique ID and can be downloaded, shared, and verified.

## How It Works

1. When a user completes a course, they can request a certificate
2. The system checks if a certificate already exists for the user and course
3. If no certificate exists, one is generated with a unique ID
4. The certificate is stored in the database and a PDF file is created
5. Users can download, view, and share their certificates

## Directory Structure

- `/server/certificates/` - Directory where certificate PDFs are stored
- `/server/controllers/certificate.controller.js` - API controllers for certificate operations
- `/server/tools/` - Contains utility scripts for managing certificates

## Certificate Files

Certificate files are named using their unique ID: `{certificateId}.pdf`

## Important Scripts

### fix-all-certificates.js

This script ensures all certificates in the database have corresponding PDF files:

```bash
node tools/fix-all-certificates.js
```

The script:
1. Connects to MongoDB
2. Fetches all certificates from the database
3. Ensures each certificate has a corresponding PDF file
4. Creates any missing PDF files as placeholders
5. Sets proper permissions on the certificates directory

## Certificate Generation

Certificates are generated on-demand. If a certificate is requested but the PDF doesn't exist:

1. The system checks if the certificate exists in the database
2. If yes, it creates a placeholder PDF file
3. When the user downloads/views the certificate, the actual PDF content is generated

## Troubleshooting

If certificates aren't working:

1. Check that the `/server/certificates/` directory exists and has proper permissions (777)
2. Run `node tools/fix-all-certificates.js` to ensure all certificate files exist
3. Verify that MongoDB has the certificate records
4. Check server logs for any errors during certificate generation or download

## Implementation Notes

- Certificates are accessible without authentication for sharing/verification purposes
- The certificate ID serves as a unique identifier and verification token
- PDF files are created as empty placeholders and populated on-demand 
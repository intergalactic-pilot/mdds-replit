# Creating Deployment Package

This guide explains how to create a deployment package (ZIP file) for the MDDS application that can be deployed on Windows or Linux servers.

## What to Include in the Package

The deployment package should include:

### Required Files and Folders
```
mdds-deployment.zip
├── client/                 # Frontend source code
├── server/                 # Backend source code
├── shared/                 # Shared types and schemas
├── package.json           # Dependencies manifest
├── package-lock.json      # Locked dependency versions
├── tsconfig.json          # TypeScript configuration
├── vite.config.ts         # Vite build configuration
├── tailwind.config.ts     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── drizzle.config.ts      # Database ORM configuration
├── .gitignore             # Git ignore rules
├── README.md              # Application overview
├── DEPLOYMENT.md          # Deployment instructions
└── PACKAGING.md           # This file
```

### Optional Files
- `.env.example` - Template for environment variables
- `ecosystem.config.js` - PM2 configuration (if using PM2)

### Files to EXCLUDE
❌ DO NOT include:
- `node_modules/` - Dependencies (will be installed on server)
- `.env` - Contains sensitive credentials
- `dist/` - Build artifacts (will be generated on server)
- `.git/` - Version control history
- `*.log` - Log files
- `.replit` - Replit-specific files
- `.cache/` - Cache directories

## Method 1: Using Git (Recommended)

If your code is in a Git repository:

```bash
# Clone the repository
git clone <repository-url> mdds-app
cd mdds-app

# Remove Git history (optional)
rm -rf .git

# Create .env.example
cat > .env.example << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/mdds
PGHOST=localhost
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=mdds
SESSION_SECRET=your-random-secret-key
NODE_ENV=production
EOF

# Create ZIP file
cd ..
zip -r mdds-deployment.zip mdds-app -x "mdds-app/node_modules/*" "mdds-app/dist/*" "mdds-app/.git/*"
```

## Method 2: Manual Packaging

### On Windows

1. **Prepare the folder:**
   - Copy all source files to a new folder `mdds-deployment`
   - Delete `node_modules` folder if present
   - Delete `dist` folder if present
   - Delete `.env` file if present

2. **Create .env.example:**
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/mdds
   PGHOST=localhost
   PGPORT=5432
   PGUSER=your_user
   PGPASSWORD=your_password
   PGDATABASE=mdds
   SESSION_SECRET=your-random-secret-key
   NODE_ENV=production
   ```

3. **Create ZIP file:**
   - Right-click the `mdds-deployment` folder
   - Select "Send to" → "Compressed (zipped) folder"
   - Rename to `mdds-deployment.zip`

### On Linux/Mac

```bash
# Prepare the folder
mkdir mdds-deployment
cp -r client server shared *.json *.ts *.js *.md mdds-deployment/

# Create .env.example
cat > mdds-deployment/.env.example << EOF
DATABASE_URL=postgresql://user:password@localhost:5432/mdds
PGHOST=localhost
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=mdds
SESSION_SECRET=your-random-secret-key
NODE_ENV=production
EOF

# Create ZIP file
zip -r mdds-deployment.zip mdds-deployment
```

## Method 3: Using NPM Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "package": "npm run clean && npm run build && node scripts/package.js",
    "clean": "rm -rf dist node_modules/.cache"
  }
}
```

Create `scripts/package.js`:

```javascript
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Files and folders to include
const includes = [
  'client',
  'server', 
  'shared',
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'drizzle.config.ts',
  'README.md',
  'DEPLOYMENT.md',
  'PACKAGING.md',
  '.env.example'
];

// Create temp directory
const tempDir = 'temp-package';
if (fs.existsSync(tempDir)) {
  fs.rmSync(tempDir, { recursive: true });
}
fs.mkdirSync(tempDir);

// Copy files
includes.forEach(item => {
  if (fs.existsSync(item)) {
    const dest = path.join(tempDir, item);
    if (fs.statSync(item).isDirectory()) {
      execSync(`cp -r ${item} ${dest}`);
    } else {
      execSync(`cp ${item} ${dest}`);
    }
  }
});

// Create .env.example if it doesn't exist
if (!fs.existsSync(path.join(tempDir, '.env.example'))) {
  fs.writeFileSync(
    path.join(tempDir, '.env.example'),
    `DATABASE_URL=postgresql://user:password@localhost:5432/mdds
PGHOST=localhost
PGPORT=5432
PGUSER=your_user
PGPASSWORD=your_password
PGDATABASE=mdds
SESSION_SECRET=your-random-secret-key
NODE_ENV=production`
  );
}

// Create ZIP
const zipName = `mdds-deployment-${new Date().toISOString().split('T')[0]}.zip`;
execSync(`cd ${tempDir} && zip -r ../${zipName} .`);

// Cleanup
fs.rmSync(tempDir, { recursive: true });

console.log(`✅ Package created: ${zipName}`);
```

Then run:
```bash
npm run package
```

## Verification Checklist

Before distributing the ZIP file, verify it contains:

- [ ] All source code files (`client/`, `server/`, `shared/`)
- [ ] Configuration files (`*.config.ts`, `*.config.js`)
- [ ] `package.json` with all dependencies
- [ ] `package-lock.json` for reproducible builds
- [ ] `README.md` with application overview
- [ ] `DEPLOYMENT.md` with deployment instructions
- [ ] `.env.example` with environment variable template
- [ ] TypeScript configuration (`tsconfig.json`)

And does NOT contain:

- [ ] `node_modules/` folder
- [ ] `dist/` or build artifacts
- [ ] `.env` file with real credentials
- [ ] `.git/` folder
- [ ] Log files or temporary files

## Distribution

### Upload to Server

**Via SCP (Linux/Mac):**
```bash
scp mdds-deployment.zip user@server:/var/www/
```

**Via SFTP:**
1. Connect to server using FileZilla or WinSCP
2. Upload `mdds-deployment.zip`
3. Extract on server

**Via Web Upload:**
1. Use hosting control panel file manager
2. Upload ZIP file
3. Extract using control panel

### Download Links

If hosting the ZIP file:
- Use a secure file hosting service
- Provide download link with checksum
- Include version number in filename

Example filename: `mdds-deployment-v1.0.0-2025-10-14.zip`

## Post-Packaging Instructions for Users

Include this message with the package:

```
MDDS Application Deployment Package
====================================

This ZIP file contains the MDDS application ready for deployment.

NEXT STEPS:
1. Extract this ZIP file on your server
2. Open README.md for application overview
3. Open DEPLOYMENT.md for step-by-step deployment instructions
4. Follow either Windows or Linux deployment guide
5. Configure .env file with your database credentials

REQUIREMENTS:
- Node.js 18 or higher
- PostgreSQL 14 or higher
- 2GB RAM minimum
- 5GB disk space

For detailed instructions, see DEPLOYMENT.md
For support, contact: [your-support-email]
```

## Security Best Practices

When distributing the package:

1. **Never include:**
   - Real database passwords
   - API keys or secrets
   - User data or session information
   - SSL certificates or private keys

2. **Always include:**
   - `.env.example` template
   - Clear documentation
   - Version information
   - Security warnings in README

3. **Verify before distribution:**
   - No sensitive data in files
   - No development credentials
   - No personal information
   - No internal URLs or IPs

## Checksum Verification

Generate checksum for integrity verification:

```bash
# SHA256
sha256sum mdds-deployment.zip > mdds-deployment.zip.sha256

# MD5
md5sum mdds-deployment.zip > mdds-deployment.zip.md5
```

Provide checksum to users so they can verify:
```bash
sha256sum -c mdds-deployment.zip.sha256
```

## Updating the Package

When creating a new version:

1. Update version in `package.json`
2. Update `README.md` with changes
3. Create new ZIP with version number
4. Generate new checksum
5. Document changes in release notes

Example version naming:
- `mdds-deployment-v1.0.0.zip` - Initial release
- `mdds-deployment-v1.1.0.zip` - Minor update
- `mdds-deployment-v2.0.0.zip` - Major update

---

For deployment instructions after extracting the package, see [DEPLOYMENT.md](DEPLOYMENT.md).

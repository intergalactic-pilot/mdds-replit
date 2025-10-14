# MDDS Application Deployment Guide

This guide provides step-by-step instructions for deploying the Multi Dimension Deterrence Strategy (MDDS) application on both Windows and Linux servers.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Windows Server Deployment](#windows-server-deployment)
- [Linux Server Deployment](#linux-server-deployment)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before deploying, ensure you have:
- **Node.js 18 or higher** installed
- **PostgreSQL 14 or higher** database
- **Git** (optional, for cloning the repository)
- At least **2GB RAM** and **5GB disk space**

---

## Windows Server Deployment

### Step 1: Install Node.js

1. Download Node.js from [https://nodejs.org](https://nodejs.org)
2. Choose the **LTS version** (18.x or higher)
3. Run the installer and follow the prompts
4. Check installation by opening **Command Prompt** and running:
   ```cmd
   node --version
   npm --version
   ```

### Step 2: Install PostgreSQL

1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer
3. Set a password for the `postgres` user (remember this!)
4. Keep the default port `5432`
5. Complete the installation

### Step 3: Create Database

1. Open **pgAdmin 4** (installed with PostgreSQL)
2. Connect to your PostgreSQL server
3. Right-click on **Databases** → **Create** → **Database**
4. Name it `mdds` and click **Save**

Alternatively, use Command Prompt:
```cmd
psql -U postgres
CREATE DATABASE mdds;
\q
```

### Step 4: Extract Application Files

1. Extract the application ZIP file to a folder, e.g., `C:\mdds-app`
2. Open **Command Prompt** and navigate to the folder:
   ```cmd
   cd C:\mdds-app
   ```

### Step 5: Install Dependencies

Run the following command:
```cmd
npm install
```

This will install all required packages (may take 2-5 minutes).

### Step 6: Configure Environment Variables

1. Create a file named `.env` in the application folder
2. Add the following content (replace values with your PostgreSQL credentials):

```env
DATABASE_URL=postgresql://postgres:your_password@localhost:5432/mdds
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=mdds
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=production
```

**Important:** Replace `your_password` with your actual PostgreSQL password and generate a random string for `SESSION_SECRET`.

### Step 7: Initialize Database

Run the database migration:
```cmd
npm run db:push
```

If you see a warning about data loss, run:
```cmd
npm run db:push --force
```

### Step 8: Build the Application

Build the production version:
```cmd
npm run build
```

This creates optimized files in the `dist` folder.

### Step 9: Start the Application

Start the server:
```cmd
npm start
```

Or for production with PM2 (recommended):
```cmd
npm install -g pm2
pm2 start npm --name "mdds" -- start
pm2 save
pm2 startup
```

The application will be available at `http://localhost:5000`

### Step 10: Configure Windows Firewall

1. Open **Windows Defender Firewall** → **Advanced Settings**
2. Click **Inbound Rules** → **New Rule**
3. Select **Port** → Click **Next**
4. Select **TCP** and enter port `5000` → Click **Next**
5. Select **Allow the connection** → Click **Next**
6. Check all profiles (Domain, Private, Public) → Click **Next**
7. Name it "MDDS Application" → Click **Finish**

### Step 11: Access the Application

- Local access: `http://localhost:5000`
- Network access: `http://YOUR_SERVER_IP:5000`
- Replace `YOUR_SERVER_IP` with your server's IP address

---

## Linux Server Deployment

### Step 1: Update System

Open terminal and run:
```bash
sudo apt update
sudo apt upgrade -y
```

For CentOS/RHEL:
```bash
sudo yum update -y
```

### Step 2: Install Node.js

**For Ubuntu/Debian:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**For CentOS/RHEL:**
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

Verify installation:
```bash
node --version
npm --version
```

### Step 3: Install PostgreSQL

**For Ubuntu/Debian:**
```bash
sudo apt install -y postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

**For CentOS/RHEL:**
```bash
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### Step 4: Create Database and User

Switch to postgres user:
```bash
sudo -u postgres psql
```

Run the following SQL commands:
```sql
CREATE DATABASE mdds;
CREATE USER mdds_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE mdds TO mdds_user;
\q
```

### Step 5: Configure PostgreSQL Authentication

Edit the PostgreSQL configuration:
```bash
sudo nano /etc/postgresql/14/main/pg_hba.conf
```

Find the line:
```
local   all             all                                     peer
```

Change it to:
```
local   all             all                                     md5
```

Restart PostgreSQL:
```bash
sudo systemctl restart postgresql
```

### Step 6: Extract Application Files

Upload the ZIP file to your server and extract:
```bash
cd /var/www
sudo mkdir mdds-app
sudo chown $USER:$USER mdds-app
cd mdds-app
unzip /path/to/mdds-app.zip
```

Or clone from Git (if available):
```bash
git clone <repository-url> /var/www/mdds-app
cd /var/www/mdds-app
```

### Step 7: Install Dependencies

```bash
npm install
```

### Step 8: Configure Environment Variables

Create `.env` file:
```bash
nano .env
```

Add the following:
```env
DATABASE_URL=postgresql://mdds_user:your_secure_password@localhost:5432/mdds
PGHOST=localhost
PGPORT=5432
PGUSER=mdds_user
PGPASSWORD=your_secure_password
PGDATABASE=mdds
SESSION_SECRET=your-random-secret-key-here
NODE_ENV=production
```

Save and exit (Ctrl+X, then Y, then Enter).

### Step 9: Initialize Database

```bash
npm run db:push
```

If needed:
```bash
npm run db:push --force
```

### Step 10: Build the Application

```bash
npm run build
```

### Step 11: Install PM2 (Process Manager)

```bash
sudo npm install -g pm2
```

### Step 12: Start the Application

```bash
pm2 start npm --name "mdds" -- start
pm2 save
pm2 startup
```

Follow the command output to set up PM2 to start on boot.

### Step 13: Configure Firewall

**For Ubuntu/Debian (UFW):**
```bash
sudo ufw allow 5000/tcp
sudo ufw reload
```

**For CentOS/RHEL (firewalld):**
```bash
sudo firewall-cmd --permanent --add-port=5000/tcp
sudo firewall-cmd --reload
```

### Step 14: Set Up Nginx Reverse Proxy (Optional but Recommended)

Install Nginx:
```bash
sudo apt install -y nginx  # Ubuntu/Debian
# OR
sudo yum install -y nginx  # CentOS/RHEL
```

Create Nginx configuration:
```bash
sudo nano /etc/nginx/sites-available/mdds
```

Add the following:
```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/mdds /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 15: Access the Application

- Direct access: `http://YOUR_SERVER_IP:5000`
- Via Nginx: `http://YOUR_SERVER_IP` or `http://your-domain.com`

---

## Post-Deployment Configuration

### Setting Up SSL/HTTPS (Linux with Nginx)

1. Install Certbot:
```bash
sudo apt install -y certbot python3-certbot-nginx
```

2. Obtain SSL certificate:
```bash
sudo certbot --nginx -d your-domain.com
```

3. Follow the prompts to complete setup

### Managing the Application

**View logs:**
```bash
pm2 logs mdds
```

**Restart application:**
```bash
pm2 restart mdds
```

**Stop application:**
```bash
pm2 stop mdds
```

**View status:**
```bash
pm2 status
```

**Monitor resources:**
```bash
pm2 monit
```

### Default Credentials and Passwords

- **Database Password**: Password for "MDDS" (database access settings dialog)
- **Single Player Password**: "MDDS"
- **Research Dashboard**: No password required
- **Analysis Dashboard**: No password required

---

## Troubleshooting

### Database Connection Issues

**Problem:** Cannot connect to database

**Solution:**
1. Check PostgreSQL is running:
   - Windows: Services → PostgreSQL
   - Linux: `sudo systemctl status postgresql`

2. Verify `.env` file has correct credentials
3. Test database connection:
   ```bash
   psql -U mdds_user -d mdds -h localhost
   ```

### Port Already in Use

**Problem:** Port 5000 is already taken

**Solution:**
1. Find what's using the port:
   - Windows: `netstat -ano | findstr :5000`
   - Linux: `sudo lsof -i :5000`

2. Change the port in the application by editing `server/index.ts`:
   ```typescript
   const PORT = process.env.PORT || 3000;  // Change from 5000
   ```

3. Rebuild and restart the application

### Application Crashes on Startup

**Problem:** Application fails to start

**Solution:**
1. Check logs:
   ```bash
   pm2 logs mdds --lines 50
   ```

2. Verify Node.js version:
   ```bash
   node --version  # Should be 18+
   ```

3. Reinstall dependencies:
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

### Memory Issues

**Problem:** Application runs out of memory

**Solution:**
1. Increase Node.js memory limit:
   ```bash
   pm2 delete mdds
   pm2 start npm --name "mdds" --node-args="--max-old-space-size=4096" -- start
   ```

2. Monitor memory usage:
   ```bash
   pm2 monit
   ```

### Missing Environment Variables

**Problem:** Environment variables not loading

**Solution:**
1. Ensure `.env` file is in the root directory
2. Check file permissions:
   ```bash
   chmod 600 .env
   ```

3. For PM2, use ecosystem file:
   ```bash
   pm2 ecosystem
   ```
   Edit `ecosystem.config.js` to include env variables

---

## Application Passwords Reference

| Feature | Password | Purpose |
|---------|----------|---------|
| Single Player Mode | `MDDS` | Access single-player AI game |
| Database Sessions | `MDDS` | View stored game sessions |
| Permanent Cards Logs | `MDDS` | View card purchase history |

---

## System Requirements

### Minimum Requirements
- **CPU:** 2 cores
- **RAM:** 2GB
- **Disk:** 5GB
- **OS:** Windows Server 2016+ or Ubuntu 18.04+

### Recommended Requirements
- **CPU:** 4 cores
- **RAM:** 4GB
- **Disk:** 10GB SSD
- **OS:** Windows Server 2019+ or Ubuntu 20.04+

---

## Support and Maintenance

### Regular Maintenance Tasks

1. **Update dependencies:**
   ```bash
   npm update
   npm audit fix
   ```

2. **Backup database:**
   ```bash
   pg_dump -U mdds_user mdds > backup_$(date +%Y%m%d).sql
   ```

3. **Monitor disk space:**
   - Windows: Check C:\ drive space
   - Linux: `df -h`

4. **Update Node.js when needed:**
   - Windows: Download new installer
   - Linux: Use NodeSource repository

### Log Rotation (Linux)

Create `/etc/logrotate.d/mdds`:
```
/var/www/mdds-app/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

---

## Additional Notes

- The application uses **port 5000** by default
- Session data is stored in PostgreSQL database
- Game sessions are automatically saved to the database
- The application supports multiple concurrent users
- All passwords are case-sensitive
- For production use, always use HTTPS with SSL certificate

---

## Quick Start Summary

### Windows
```cmd
# Install Node.js and PostgreSQL
# Create database
psql -U postgres -c "CREATE DATABASE mdds;"

# Extract files and install
cd C:\mdds-app
npm install
npm run db:push
npm run build
npm start
```

### Linux
```bash
# Install Node.js and PostgreSQL
sudo apt install -y nodejs postgresql

# Create database
sudo -u postgres psql -c "CREATE DATABASE mdds;"

# Extract and install
cd /var/www/mdds-app
npm install
npm run db:push
npm run build
pm2 start npm --name "mdds" -- start
```

---

For additional help or questions, refer to the application documentation or contact your system administrator.

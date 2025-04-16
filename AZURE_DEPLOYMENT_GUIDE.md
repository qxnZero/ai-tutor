# Deploying AI-Tutor to Azure VPS with Bun and NeonDB

This guide walks you through deploying your AI-Tutor application to an Azure VPS using Bun as the JavaScript runtime and package manager, while keeping your existing NeonDB database configuration.

## Prerequisites

1. An Azure VPS with Ubuntu/Debian Linux
2. SSH access to your VPS
3. Domain name (optional but recommended)
4. Your existing NeonDB database (already configured in your .env file)

## Step 1: Set Up Your VPS

1. **Update your system**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install dependencies**:
   ```bash
   sudo apt install -y curl unzip git
   ```

3. **Install Bun**:
   ```bash
   curl -fsSL https://bun.sh/install | bash
   source ~/.bashrc  # To use Bun in the current session
   ```

4. **Verify Bun installation**:
   ```bash
   bun --version
   ```

5. **Install PM2** (process manager):
   ```bash
   # Install Node.js first (PM2 requires it)
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt install -y nodejs
   
   # Install PM2
   npm install -g pm2
   ```

6. **Install Nginx** (for reverse proxy):
   ```bash
   sudo apt install -y nginx
   ```

## Step 2: Deploy Your Application

1. **Create a deployment directory**:
   ```bash
   sudo mkdir -p /var/www/aitutor
   sudo chown $USER:$USER /var/www/aitutor
   ```

2. **Clone your repository** (or upload your files):
   ```bash
   cd /var/www/aitutor
   git clone https://your-repository-url.git .
   ```

3. **Copy your existing .env file**:
   Simply copy your current .env file to the server. The only thing you'll need to update is the NEXTAUTH_URL to match your Azure VPS domain or IP:

   ```bash
   # Edit the .env file
   nano .env
   ```

   Update only these lines:
   ```
   NEXTAUTH_URL="https://your-azure-domain.com"  # Or your VPS IP if no domain
   GOOGLE_REDIRECT_URI="https://your-azure-domain.com/api/auth/callback/google"
   ```

4. **Install dependencies with Bun**:
   ```bash
   bun install
   ```

5. **Update package.json scripts** (optional):
   You might want to update your package.json to use Bun for scripts:
   ```bash
   nano package.json
   ```

   Update the scripts section to use Bun:
   ```json
   "scripts": {
     "dev": "bun --bun next dev",
     "build": "prisma generate && bun --bun next build",
     "start": "bun --bun next start",
     "lint": "bun --bun next lint"
   }
   ```

6. **Build the application with Bun**:
   ```bash
   bun run build
   ```

7. **Run database migrations** (if needed):
   ```bash
   bunx prisma migrate deploy
   ```

## Step 3: Set Up PM2 for Process Management

1. **Create a PM2 ecosystem file**:
   ```bash
   nano ecosystem.config.js
   ```

2. **Add the following content to use Bun**:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "ai-tutor",
         script: "bun",
         args: "run start",
         env: {
           NODE_ENV: "production",
         },
         instances: 1,  // Bun works best with a single instance
         autorestart: true,
         watch: false,
         max_memory_restart: "1G",
       },
     ],
   };
   ```

3. **Start your application with PM2**:
   ```bash
   pm2 start ecosystem.config.js
   ```

4. **Set PM2 to start on system boot**:
   ```bash
   pm2 startup
   pm2 save
   ```

## Step 4: Configure Nginx as a Reverse Proxy

1. **Create an Nginx configuration file**:
   ```bash
   sudo nano /etc/nginx/sites-available/aitutor
   ```

2. **Add the following content** (update with your domain or IP):
   ```nginx
   server {
       listen 80;
       server_name your-azure-domain.com;  # Or your VPS IP if no domain

       location / {
           proxy_pass http://localhost:3000;
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

3. **Enable the site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/aitutor /etc/nginx/sites-enabled/
   sudo nginx -t  # Test the configuration
   sudo systemctl restart nginx
   ```

## Step 5: Set Up SSL with Let's Encrypt (if you have a domain)

1. **Install Certbot**:
   ```bash
   sudo apt install -y certbot python3-certbot-nginx
   ```

2. **Obtain SSL certificate**:
   ```bash
   sudo certbot --nginx -d your-azure-domain.com
   ```

3. **Follow the prompts** to complete the SSL setup.

## Step 6: Update Google OAuth Settings (if using Google Auth)

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your project > APIs & Services > Credentials
3. Edit your OAuth 2.0 Client ID
4. Add your production domain to the Authorized JavaScript origins and Authorized redirect URIs:
   - Authorized JavaScript origins: `https://your-azure-domain.com`
   - Authorized redirect URIs: `https://your-azure-domain.com/api/auth/callback/google`

## Step 7: Basic Monitoring and Maintenance

1. **Monitor your application logs**:
   ```bash
   pm2 logs
   ```

2. **Restart services if needed**:
   ```bash
   pm2 restart ai-tutor
   sudo systemctl restart nginx
   ```

3. **Update your application**:
   ```bash
   cd /var/www/aitutor
   git pull
   bun install
   bun run build
   pm2 restart ai-tutor
   ```

## Additional Security Recommendations

1. **Set up a firewall**:
   ```bash
   sudo ufw allow 22
   sudo ufw allow 80
   sudo ufw allow 443
   sudo ufw enable
   ```

2. **Secure SSH** (optional but recommended):
   ```bash
   sudo nano /etc/ssh/sshd_config
   ```
   
   Make these changes:
   ```
   PermitRootLogin no
   PasswordAuthentication no  # Only if you're using SSH keys
   ```
   
   Restart SSH:
   ```bash
   sudo systemctl restart sshd
   ```

## Bun-specific Performance Tips

1. **Use Bun's built-in .env support**:
   Bun automatically loads environment variables from .env files, which can be more efficient.

2. **Leverage Bun's HTTP server for API routes**:
   For any standalone API endpoints, consider using Bun's native HTTP server which is significantly faster than Node.js.

3. **Use Bun's SQLite support** (if applicable):
   If you ever need a local database for caching or temporary storage, Bun has built-in SQLite support that's very fast.

## Troubleshooting

1. **If Bun has compatibility issues**:
   You can always fall back to Node.js by changing your PM2 configuration:
   ```javascript
   module.exports = {
     apps: [
       {
         name: "ai-tutor",
         script: "npm",
         args: "start",
         env: {
           NODE_ENV: "production",
         },
         instances: "max",
         exec_mode: "cluster",
         autorestart: true,
         watch: false,
         max_memory_restart: "1G",
       },
     ],
   };
   ```

2. **Check Bun-specific logs**:
   ```bash
   BUN_DEBUG=1 bun run start
   ```

This guide focuses on using Bun as your JavaScript runtime and package manager while deploying to Azure VPS with your existing NeonDB configuration.

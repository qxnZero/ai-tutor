# PHP-FPM Setup for AI Tutor

This document explains how to set up and use PHP-FPM with the AI Tutor application.

## Prerequisites

- PHP 8.0+ with FPM
- PostgreSQL PHP extension (pdo_pgsql)
- Nginx web server
- Node.js and Bun runtime

## Installation

1. Run the setup script to configure paths and check dependencies:

```bash
./setup-php-fpm.sh
```

2. Install the required PHP extensions:

```bash
# Ubuntu/Debian
sudo apt install php-fpm php-pgsql

# CentOS/RHEL
sudo yum install php-fpm php-pgsql

# Arch Linux
sudo pacman -S php-fpm php-pgsql
```

## Configuration

### PHP-FPM Configuration

The PHP-FPM configuration is located in `config/php-fpm.conf`. The setup script will update the paths automatically.

### Nginx Configuration

The Nginx configuration is located in `config/nginx.conf`. The setup script will update the paths automatically.

To use this configuration with Nginx:

1. Copy the configuration file to Nginx's sites-available directory:

```bash
sudo cp config/nginx.conf /etc/nginx/sites-available/ai-tutor.conf
```

2. Create a symlink to enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/ai-tutor.conf /etc/nginx/sites-enabled/
```

3. Test the Nginx configuration:

```bash
sudo nginx -t
```

4. Reload Nginx:

```bash
sudo systemctl reload nginx
```

### Systemd Service

A systemd service file is provided to run PHP-FPM as a service. The setup script will update the paths automatically.

To use this service:

1. Copy the service file to systemd's directory:

```bash
sudo cp config/ai-tutor-php-fpm.service /etc/systemd/system/
```

2. Reload systemd:

```bash
sudo systemctl daemon-reload
```

3. Enable the service to start on boot:

```bash
sudo systemctl enable ai-tutor-php-fpm.service
```

4. Start the service:

```bash
sudo systemctl start ai-tutor-php-fpm.service
```

## Running the Application

### Development Mode

For development, you can use the PHP development server:

```bash
bun run dev:all
```

This will start both the Next.js development server and the PHP development server.

### Production Mode

For production, you can use PHP-FPM:

```bash
bun run start:all
```

This will start both the Next.js production server and PHP-FPM.

### Using tmux (Recommended for VPS)

You can use tmux to run the servers in the background:

```bash
# Create a new tmux session for PHP-FPM
tmux new-session -d -s ai-tutor-php-fpm 'php-fpm -F -y ./config/php-fpm.conf'

# Create a new tmux session for Next.js
tmux new-session -d -s ai-tutor-next 'bun --bun next start'
```

## Troubleshooting

### PHP-FPM Logs

PHP-FPM logs are stored in `/var/log/php-fpm/` by default. You can check these logs for errors:

```bash
sudo tail -f /var/log/php-fpm/error.log
sudo tail -f /var/log/php-fpm/ai-tutor-error.log
```

### Nginx Logs

Nginx logs are stored in `/var/log/nginx/` by default. You can check these logs for errors:

```bash
sudo tail -f /var/log/nginx/ai-tutor-access.log
sudo tail -f /var/log/nginx/ai-tutor-error.log
```

### Common Issues

1. **"could not find driver" error**: This means the PostgreSQL PHP extension is not installed. Install it with:

```bash
sudo apt install php-pgsql  # Ubuntu/Debian
sudo yum install php-pgsql  # CentOS/RHEL
sudo pacman -S php-pgsql    # Arch Linux
```

2. **Permission issues**: Make sure the user running PHP-FPM has permission to access the files:

```bash
sudo chown -R www-data:www-data /path/to/AI-Tutor/php-backend
```

3. **Socket connection issues**: Make sure the PHP-FPM socket exists and has the correct permissions:

```bash
ls -la /run/php-fpm/
sudo chmod 660 /run/php-fpm/ai-tutor.sock
sudo chown www-data:www-data /run/php-fpm/ai-tutor.sock
```
e

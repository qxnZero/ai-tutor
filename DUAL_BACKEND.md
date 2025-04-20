# AI Tutor Dual Backend System

This project uses both Next.js and PHP backends working together, optimized for Azure VPS deployment.

## Quick Start

### Development

To run both backends simultaneously during development:

```bash
# Using the unified command system
./ai-tutor dev

# Or using npm/bun script
bun run dev:dual
```

This will start:
- Next.js on port 3000 (development mode)
- PHP backend on port 8000

### Production

To run both backends in production mode:

```bash
# Using the unified command system
./ai-tutor start

# Or using npm/bun script
bun run start:dual
```

### Azure VPS Deployment

To set up the application on an Azure VPS:

```bash
# Using the unified command system (requires root)
sudo ./ai-tutor azure

# Or using npm/bun script
bun run setup:azure
```

### Interactive Mode

For a more user-friendly experience, simply run:

```bash
./ai-tutor
```

This will launch an interactive menu where you can select options.

## Available Scripts

- `bun run dev:dual` - Run both backends in development mode
- `bun run dev:php` - Run only the PHP backend
- `bun run start:dual` - Run both backends in production mode
- `bun run setup:all` - Run the local setup script
- `bun run setup:azure` - Run the Azure VPS setup script (requires sudo)

## Command System Documentation

For detailed information about the unified command system, see [COMMAND_SYSTEM.md](COMMAND_SYSTEM.md).

## API Endpoints

The PHP backend handles these endpoints:

- `/api/test` - Test endpoint
- `/api/notes` - Manage user notes
- `/api/bookmarks` - Manage user bookmarks
- `/api/user-progress` - Track user progress
- `/api/knowledge-test` - Generate knowledge tests

All other routes are handled by the Next.js backend.

## Logs and Monitoring

Both backends include enhanced logging:

- PHP requests are prefixed with `[PHP]` in the console
- Next.js requests have no prefix
- In production mode with PM2, logs are stored in the `logs` directory

To monitor the application in production:

```bash
# Check status
pm2 status

# View logs
pm2 logs

# View specific backend logs
pm2 logs ai-tutor-nextjs
pm2 logs ai-tutor-php
```

## Configuration Files

All configuration files are stored in the `config` directory:

- `config/nginx.conf` - Nginx configuration optimized for Azure
- `config/ecosystem.config.js` - PM2 configuration for running both backends

## Troubleshooting

If you encounter issues:

1. Check that both services are running:
   ```bash
   # For development
   ps aux | grep php
   ps aux | grep bun

   # For production
   pm2 status
   ```

2. Check the logs:
   ```bash
   # Development logs are in the console

   # Production logs
   pm2 logs
   ```

3. Verify Nginx configuration:
   ```bash
   sudo nginx -t
   sudo systemctl status nginx
   ```

4. Check firewall settings:
   ```bash
   sudo ufw status
   ```

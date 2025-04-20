# AI Tutor Command System

The AI Tutor Command System provides a unified, intuitive interface for managing the dual-backend application.

## Quick Start

### Development Mode

```bash
# Start both backends in development mode
./ai-tutor dev

# Or using npm/bun script
bun run dev:dual
```

### Production Mode

```bash
# Start both backends in production mode
./ai-tutor start

# Or using npm/bun script
bun run start:dual
```

### Setup

```bash
# Set up configuration files
./ai-tutor setup

# Or using npm/bun script
bun run setup:all
```

### Azure VPS Deployment

```bash
# Set up on Azure VPS (requires root)
sudo ./ai-tutor azure

# Or using npm/bun script
bun run setup:azure
```

## Interactive Mode

For a more user-friendly experience, simply run the command without arguments:

```bash
./ai-tutor
```

This will launch the interactive menu where you can select options using numbered choices.

## Command Reference

| Command | Description |
|---------|-------------|
| `./ai-tutor dev` | Start both backends in development mode |
| `./ai-tutor start` | Start both backends in production mode |
| `./ai-tutor setup` | Set up configuration files |
| `./ai-tutor env` | Edit environment configuration (.env file) |
| `./ai-tutor azure` | Set up on Azure VPS (requires root) |
| `./ai-tutor help` | Show help information |
| `./ai-tutor version` | Show version information |

## Features

### Enhanced Visual Feedback

- Color-coded output for better readability
- Progress bars for long-running operations
- Spinners for background tasks
- Clear section headers

### Improved Error Handling

- Detailed error messages
- Proper exit codes
- Dependency checking

### Comprehensive Logging

- All operations are logged to `logs/ai-tutor.log`
- Color-coded log levels (INFO, WARNING, ERROR, SUCCESS)
- Timestamps for all log entries

### Unified Interface

- Single command for all operations
- Consistent command structure
- Interactive mode for easier use

## Configuration

### Environment Variables

The AI Tutor command system uses environment variables from a `.env` file for configuration. You can edit this file using:

```bash
./ai-tutor env
```

Key environment variables include:

| Variable | Description | Default |
|----------|-------------|--------|
| `APP_NAME` | Application name | AI Tutor |
| `APP_VERSION` | Application version | 1.0.0 |
| `APP_ENV` | Environment (development, production, testing) | development |
| `NEXTJS_PORT` | Port for Next.js server | 3000 |
| `PHP_PORT` | Port for PHP server | 8000 |
| `DOMAIN_NAME` | Domain name for production | example.com |
| `USE_HTTPS` | Whether to use HTTPS | false |
| `NGINX_SERVER_NAME` | Server name for Nginx | _ |
| `LOG_LEVEL` | Logging level | info |

See `.env.example` for a complete list of available environment variables.

### Configuration Files

Configuration files are stored in the `config` directory:

- `config/nginx.conf` - Nginx configuration for Azure
- `config/ecosystem.config.js` - PM2 configuration for production

## Troubleshooting

If you encounter issues:

1. Check the logs:
   ```bash
   cat logs/ai-tutor.log
   ```

2. Run the help command:
   ```bash
   ./ai-tutor help
   ```

3. Ensure all dependencies are installed:
   ```bash
   # The setup command will check dependencies
   ./ai-tutor setup
   ```

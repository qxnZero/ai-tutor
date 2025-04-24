#!/bin/bash
# Setup script for PHP-FPM configuration

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up PHP-FPM for AI Tutor...${NC}"

# Get the current directory
CURRENT_DIR=$(pwd)
echo -e "${YELLOW}Current directory: ${CURRENT_DIR}${NC}"

# Update paths in configuration files
echo -e "${YELLOW}Updating paths in configuration files...${NC}"

# Update PHP-FPM configuration
sed -i "s|/path/to/AI-Tutor|${CURRENT_DIR}|g" config/php-fpm.conf
echo -e "${GREEN}Updated PHP-FPM configuration.${NC}"

# Update Nginx configuration
sed -i "s|/path/to/AI-Tutor|${CURRENT_DIR}|g" config/nginx.conf
echo -e "${GREEN}Updated Nginx configuration.${NC}"

# Update systemd service file
sed -i "s|/path/to/AI-Tutor|${CURRENT_DIR}|g" config/ai-tutor-php-fpm.service
echo -e "${GREEN}Updated systemd service file.${NC}"

# Create logs directory if it doesn't exist
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo -e "${GREEN}Created logs directory.${NC}"
fi

# Check if PHP-FPM is installed
if command -v php-fpm &> /dev/null; then
    PHP_FPM_VERSION=$(php-fpm -v | head -n 1 | cut -d ' ' -f 2)
    echo -e "${GREEN}PHP-FPM ${PHP_FPM_VERSION} is installed.${NC}"
else
    echo -e "${RED}PHP-FPM is not installed. Please install PHP-FPM before continuing.${NC}"
    echo -e "${YELLOW}On Ubuntu/Debian: sudo apt install php-fpm${NC}"
    echo -e "${YELLOW}On CentOS/RHEL: sudo yum install php-fpm${NC}"
    echo -e "${YELLOW}On Arch Linux: sudo pacman -S php-fpm${NC}"
    exit 1
fi

# Check if PostgreSQL PHP extension is installed
PGSQL_INSTALLED=$(php -m | grep -q pgsql && echo "yes" || echo "no")
PDO_PGSQL_INSTALLED=$(php -m | grep -q pdo_pgsql && echo "yes" || echo "no")

if [ "$PGSQL_INSTALLED" = "yes" ]; then
    echo -e "${GREEN}PostgreSQL extension (pgsql) is installed.${NC}"
else
    echo -e "${YELLOW}PostgreSQL extension (pgsql) is not installed.${NC}"
fi

if [ "$PDO_PGSQL_INSTALLED" = "yes" ]; then
    echo -e "${GREEN}PDO PostgreSQL extension (pdo_pgsql) is installed.${NC}"
else
    echo -e "${YELLOW}PDO PostgreSQL extension (pdo_pgsql) is not installed.${NC}"
fi

# If either extension is missing, provide installation instructions
if [ "$PGSQL_INSTALLED" = "no" ] || [ "$PDO_PGSQL_INSTALLED" = "no" ]; then
    echo -e "${RED}One or more required PostgreSQL extensions are missing.${NC}"
    echo -e "${YELLOW}On Arch Linux, install both extensions with:${NC}"
    echo -e "${GREEN}sudo pacman -S php-pgsql php-pdo_pgsql${NC}"
    echo -e "${YELLOW}Or try:${NC}"
    echo -e "${GREEN}sudo pacman -S php-pgsql${NC}"

    # Continue anyway with a warning
    echo -e "${YELLOW}WARNING: Continuing setup without all PostgreSQL extensions.${NC}"
    echo -e "${YELLOW}The PHP backend may not work correctly until these are installed.${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
bun install
echo -e "${GREEN}Dependencies installed.${NC}"

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}To start the application in development mode:${NC}"
echo -e "  ${GREEN}bun run dev:all${NC}"
echo -e "${YELLOW}To start the application in production mode:${NC}"
echo -e "  ${GREEN}bun run start:all${NC}"
echo -e "${YELLOW}To use with Nginx:${NC}"
echo -e "  ${GREEN}1. Copy config/nginx.conf to /etc/nginx/sites-available/ai-tutor.conf${NC}"
echo -e "  ${GREEN}2. Create a symlink: sudo ln -s /etc/nginx/sites-available/ai-tutor.conf /etc/nginx/sites-enabled/${NC}"
echo -e "  ${GREEN}3. Test Nginx configuration: sudo nginx -t${NC}"
echo -e "  ${GREEN}4. Reload Nginx: sudo systemctl reload nginx${NC}"
echo -e "${YELLOW}To use with systemd:${NC}"
echo -e "  ${GREEN}1. Copy config/ai-tutor-php-fpm.service to /etc/systemd/system/${NC}"
echo -e "  ${GREEN}2. Reload systemd: sudo systemctl daemon-reload${NC}"
echo -e "  ${GREEN}3. Enable the service: sudo systemctl enable ai-tutor-php-fpm.service${NC}"
echo -e "  ${GREEN}4. Start the service: sudo systemctl start ai-tutor-php-fpm.service${NC}"

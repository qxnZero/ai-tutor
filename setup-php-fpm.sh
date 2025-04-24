#!/bin/bash
# Setup script for PHP-FPM configuration

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}Setting up PHP-FPM for AI Tutor...${NC}"

# Get the current directory
CURRENT_DIR=$(pwd)
echo -e "${YELLOW}Current directory: ${CURRENT_DIR}${NC}"

# Update paths in configuration files
echo -e "${YELLOW}Updating paths...${NC}"

# Update PHP-FPM configuration
sed -i "s|/home/antinomy/projects/SAAS/AI-Tutor|${CURRENT_DIR}|g" config/php-fpm.conf
echo -e "${GREEN}Updated PHP-FPM config${NC}"

# Update Nginx configuration
sed -i "s|/home/antinomy/projects/SAAS/AI-Tutor|${CURRENT_DIR}|g" config/nginx.conf
echo -e "${GREEN}Updated Nginx config${NC}"

# Update systemd service file
sed -i "s|/home/antinomy/projects/SAAS/AI-Tutor|${CURRENT_DIR}|g" config/ai-tutor-php-fpm.service
echo -e "${GREEN}Updated systemd service${NC}"

# Create logs directory
if [ ! -d "logs" ]; then
    mkdir -p logs
    echo -e "${GREEN}Created logs directory${NC}"
fi

# Check PHP-FPM
if command -v php-fpm &> /dev/null; then
    PHP_FPM_VERSION=$(php-fpm -v | head -n 1 | cut -d ' ' -f 2)
    echo -e "${GREEN}PHP-FPM ${PHP_FPM_VERSION} installed${NC}"
else
    echo -e "${RED}PHP-FPM not installed${NC}"
    echo -e "${YELLOW}On Arch Linux: sudo pacman -S php-fpm${NC}"
    exit 1
fi

# Check PostgreSQL extensions
PGSQL_INSTALLED=$(php -m | grep -q pgsql && echo "yes" || echo "no")
PDO_PGSQL_INSTALLED=$(php -m | grep -q pdo_pgsql && echo "yes" || echo "no")

if [ "$PGSQL_INSTALLED" = "yes" ]; then
    echo -e "${GREEN}PostgreSQL extension installed${NC}"
else
    echo -e "${YELLOW}PostgreSQL extension missing${NC}"
fi

if [ "$PDO_PGSQL_INSTALLED" = "yes" ]; then
    echo -e "${GREEN}PDO PostgreSQL extension installed${NC}"
else
    echo -e "${YELLOW}PDO PostgreSQL extension missing${NC}"
fi

if [ "$PGSQL_INSTALLED" = "no" ] || [ "$PDO_PGSQL_INSTALLED" = "no" ]; then
    echo -e "${RED}Missing PostgreSQL extensions${NC}"
    echo -e "${YELLOW}On Arch Linux: sudo pacman -S php-pgsql${NC}"
    echo -e "${YELLOW}WARNING: PHP backend may not work correctly${NC}"
fi

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
bun install
echo -e "${GREEN}Dependencies installed${NC}"

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}Development mode:${NC} ${GREEN}bun run dev:all${NC}"
echo -e "${YELLOW}Production mode:${NC} ${GREEN}bun run start:all${NC}"
echo -e "${YELLOW}Nginx setup:${NC}"
echo -e "  ${GREEN}1. Copy config/nginx.conf to /etc/nginx/sites-available/ai-tutor.conf${NC}"
echo -e "  ${GREEN}2. Link: sudo ln -s /etc/nginx/sites-available/ai-tutor.conf /etc/nginx/sites-enabled/${NC}"
echo -e "  ${GREEN}3. Test: sudo nginx -t${NC}"
echo -e "  ${GREEN}4. Reload: sudo systemctl reload nginx${NC}"
echo -e "${YELLOW}Systemd setup:${NC}"
echo -e "  ${GREEN}1. Copy config/ai-tutor-php-fpm.service to /etc/systemd/system/${NC}"
echo -e "  ${GREEN}2. Reload: sudo systemctl daemon-reload${NC}"
echo -e "  ${GREEN}3. Enable: sudo systemctl enable ai-tutor-php-fpm.service${NC}"
echo -e "  ${GREEN}4. Start: sudo systemctl start ai-tutor-php-fpm.service${NC}"

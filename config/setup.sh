#!/bin/bash

CURRENT_USER=$(whoami)
APP_PATH=$(pwd)

echo "Setting up AI Tutor with user: $CURRENT_USER"
mkdir -p logs

# Update configs
sed -i "s/%i/$CURRENT_USER/g" config/ai-tutor-php-fpm.service
sed -i "s|%h|$APP_PATH|g" config/ai-tutor-php-fpm.service
sed -i "s|/var/www/ai-tutor|$APP_PATH|g" config/nginx.conf
sed -i "s|/var/www/ai-tutor/php-backend|$APP_PATH/php-backend|g" config/nginx.conf

echo "=== MANUAL STEPS ==="
echo "1. Copy service file:"
echo "   sudo cp $APP_PATH/config/ai-tutor-php-fpm.service /etc/systemd/system/"
echo "2. Copy nginx config:"
echo "   sudo cp $APP_PATH/config/nginx.conf /etc/nginx/sites-available/ai-tutor"
echo "   sudo ln -s /etc/nginx/sites-available/ai-tutor /etc/nginx/sites-enabled/"
echo "3. Start services:"
echo "   sudo systemctl daemon-reload && sudo systemctl enable ai-tutor-php-fpm"
echo "   sudo systemctl start ai-tutor-php-fpm && sudo systemctl restart nginx"
echo "4. For manual PHP-FPM in tmux:"
echo "   /usr/sbin/php-fpm --nodaemonize --fpm-config $APP_PATH/config/php-fpm.conf"

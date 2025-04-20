module.exports = {
  apps: [
    {
      name: "ai-tutor-nextjs",
      script: "bun",
      args: "run start",
      env: {
        NODE_ENV: "production",
        PORT: 3000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      log_file: "logs/nextjs.log",
      out_file: "logs/nextjs-out.log",
      error_file: "logs/nextjs-error.log",
    },
    {
      name: "ai-tutor-php",
      script: "php",
      args: "-S localhost:8000 router.php",
      cwd: "./php-backend",
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "256M",
      log_date_format: "YYYY-MM-DD HH:mm:ss",
      merge_logs: true,
      log_file: "logs/php.log",
      out_file: "logs/php-out.log",
      error_file: "logs/php-error.log",
    },
  ],
};

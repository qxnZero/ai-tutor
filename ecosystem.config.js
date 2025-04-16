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

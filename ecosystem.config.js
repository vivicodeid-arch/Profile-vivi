module.exports = {
  apps: [
    {
      name: "vividev-backend",
      script: "dist/app.js",
      cwd: "/var/www/vividev-id/backend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/var/www/vividev-id/logs/error.log",
      out_file: "/var/www/vividev-id/logs/out.log",
      max_memory_restart: "500M",
      watch: false,
      autorestart: true,
    },
  ],
};

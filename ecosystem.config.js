module.exports = {
  apps: [
    {
      name: "vividev-backend",
      script: "dist/app.js",
      cwd: "/opt/vividev/backend",
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: 5000,
      },
      error_file: "/opt/vividev/logs/error.log",
      out_file: "/opt/vividev/logs/out.log",
      max_memory_restart: "500M",
      watch: false,
      autorestart: true,
    },
  ],
};

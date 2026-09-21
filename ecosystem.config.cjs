/** PM2 — Cofit ganzenbord (poort 3006). */
module.exports = {
  apps: [
    {
      name: "cofit",
      cwd: "/var/www/cofit",
      script: "npm",
      args: "start",
      env: {
        NODE_ENV: "production",
        PORT: 3006,
        TZ: "Europe/Amsterdam",
      },
    },
  ],
};

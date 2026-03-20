module.exports = {
  apps: [
    {
      name: 'ath-thariq-api',
      script: 'server/index.js',
      cwd: __dirname,
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        API_PORT: 3101,
      },
    },
    {
      name: 'ath-thariq-tunnel',
      script: 'cloudflared',
      args: 'tunnel --config /dev/null --origincert /dev/null --url http://localhost:3101 --no-autoupdate',
      cwd: __dirname,
      interpreter: 'none',
      instances: 1,
      autorestart: true,
      watch: false,
    },
  ],
};

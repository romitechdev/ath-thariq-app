module.exports = {
  apps: [
    {
      name: 'ath-thariq-api',
      script: 'server/index.js',
      cwd: __dirname,
      instances: 1,
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: 'production',
        API_PORT: 3001,
      },
    },
  ],
};

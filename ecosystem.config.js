module.exports = {
  apps: [
    {
      name: 'avegatasta',
      script: 'server.js',
      cwd: '/var/www/avegatasta',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3002,
        HOSTNAME: '0.0.0.0',
      },
      env_file: '/etc/avegatasta/.env.local',
      watch: false,
      max_memory_restart: '512M',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: '/var/log/avegatasta/err.log',
      out_file: '/var/log/avegatasta/out.log',
      merge_logs: true,
      restart_delay: 3000,
      max_restarts: 10,
    },
  ],
};

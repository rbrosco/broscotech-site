module.exports = {
  apps: [
    {
      name: 'EASYDEV',
      cwd: __dirname,
      // launcher uses node to spawn pnpm reliably
      script: './scripts/run-pnpm.js',
      interpreter: 'node',
      env: {
        NODE_ENV: 'development',
        PORT: '5090',
        PNPM_BIN: '/opt/nvm/versions/node/v22.22.3/bin/pnpm'
      }
    }
  ]
};

// PM2 process file for the InMotion VPS. The deploy workflow copies it into the standalone
// bundle (~/nextapp) and runs `pm2 startOrReload ecosystem.config.cjs`.
//
// Server-only secrets (SANITY_WRITE_TOKEN, SANITY_REVALIDATE_SECRET, VIDRYS_SIGNING_SECRET, ...)
// live in ~/getmeds.env on the server, outside ~/nextapp, so a deploy never overwrites them.
// Node loads that file itself (--env-file-if-exists, Node 22.9+).
const path = require('path');
const os = require('os');

module.exports = {
  apps: [
    {
      name: 'getmeds-web',
      script: 'server.js',
      cwd: __dirname,
      node_args: `--env-file-if-exists=${path.join(os.homedir(), 'getmeds.env')}`,
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        // Only Apache on the same machine talks to the app; it is not reachable from outside.
        HOSTNAME: '127.0.0.1',
      },
      // Restart instead of slowing to a crawl if memory ever creeps up.
      max_memory_restart: '700M',
      time: true,
    },
  ],
};

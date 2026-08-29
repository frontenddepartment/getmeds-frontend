const { execSync } = require('child_process');

// Ensure Windows shell environment variables are clean and valid
if (process.platform === 'win32') {
  process.env.ComSpec = process.env.ComSpec || 'C:\\Windows\\System32\\cmd.exe';
  process.env.SystemRoot = process.env.SystemRoot || 'C:\\Windows';
  
  // Ensure C:\Windows\System32 is included in PATH
  if (!process.env.PATH || !process.env.PATH.toLowerCase().includes('system32')) {
    process.env.PATH = `C:\\Windows\\System32;${process.env.PATH || ''}`;
  }
  
  // Clear SHELL variable if present in Windows environment (e.g. injected by VS Code Copilot extension)
  if (process.env.SHELL) {
    delete process.env.SHELL;
  }
}

try {
  console.log('[Deploy Refresh] Building local project for Vercel production...');
  execSync('npx --yes vercel build --prod', { stdio: 'inherit', env: process.env });
  
  console.log('\n[Deploy Refresh] Deploying prebuilt bundle to Vercel production...');
  execSync('npx --yes vercel deploy --prebuilt --prod', { stdio: 'inherit', env: process.env });
  
  console.log('\n[Deploy Refresh] ✅ Prebuilt deployment finished successfully!');
} catch (err) {
  console.error('\n[Deploy Refresh] ❌ Deployment error:', err.message);
  process.exit(1);
}

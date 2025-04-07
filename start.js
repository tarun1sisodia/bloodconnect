const { spawn } = require('child_process');
const path = require('path');

// Paths
const backendPath = path.join(__dirname, 'backend');
const frontendPath = path.join(__dirname, 'frontend');

console.log('Starting BloodConnect application...');

// Start backend server
const backendProcess = spawn('node', ['server.js'], {
  cwd: backendPath,
  shell: true,
  stdio: 'inherit'
});

backendProcess.on('error', (error) => {
  console.error(`Failed to start backend: ${error.message}`);
});

// Start frontend server
const frontendProcess = spawn('npx', ['http-server', frontendPath, '-p', '8081'], {
  shell: true,
  stdio: 'inherit'
});

frontendProcess.on('error', (error) => {
  console.error(`Failed to start frontend: ${error.message}`);
});

// Log server URLs
console.log('Backend running at: http://localhost:5000');
console.log('Frontend running at: http://localhost:8081');

// Handle process termination
process.on('SIGINT', () => {
  console.log('Shutting down servers...');
  backendProcess.kill();
  frontendProcess.kill();
  process.exit(0);
});

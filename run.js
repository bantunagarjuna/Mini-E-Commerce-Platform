// This script starts our application
const { execSync } = require('child_process');

console.log('Starting Mini E-Commerce Platform...');

try {
  // Run the server
  console.log('Starting server...');
  execSync('node server/server.js', { stdio: 'inherit' });
} catch (error) {
  console.error('Error starting the application:', error);
  process.exit(1);
}
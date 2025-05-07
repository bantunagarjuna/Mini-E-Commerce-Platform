// Simple script to run our Express.js server
import { exec } from 'child_process';

console.log("Starting Express.js server...");
exec('node express-server.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
});
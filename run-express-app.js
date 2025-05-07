// Master script to run the Express.js application
import { exec } from 'child_process';

console.log("Setting up database...");
exec('node setup-database.js', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error during database setup: ${error.message}`);
    return;
  }
  
  console.log(stdout);
  
  if (stderr) {
    console.error(`Database setup warnings: ${stderr}`);
  }
  
  console.log("\nStarting Express.js server...");
  
  // Start the Express.js server
  const server = exec('node express-server.js');
  
  // Forward stdout and stderr
  server.stdout.on('data', (data) => {
    console.log(data);
  });
  
  server.stderr.on('data', (data) => {
    console.error(data);
  });
  
  server.on('close', (code) => {
    console.log(`Express.js server process exited with code ${code}`);
  });
});
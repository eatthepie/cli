const { spawn } = require("child_process");
const path = require("path");

// Get all command line arguments after 'npm run start'
const args = process.argv.slice(2);

// If no arguments are provided, default to 'setup'
const finalArgs = args.length === 0 ? ["setup"] : args;

// Spawn a new process to run index.js with the provided arguments
const child = spawn("node", [path.join(__dirname, "index.js"), ...finalArgs], {
  stdio: "inherit",
  shell: true,
});

child.on("error", (error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});

child.on("close", (code) => {
  process.exit(code);
});

#!/usr/bin/env node

/**
 * Moodle Code Block Generator for JavaScript
 * Generates vanilla Moodle HTML with VS Code Dark+ syntax highlighting
 *
 * @license MIT
 * @see https://github.com/0x3st3/moodle-html-code-block-generator
 */

import fs from "fs";
import { fileURLToPath } from "url";
import { generateMoodleCodeBlock } from "../lib/lib.js";

// Design Tokens (from style.css)
// Primary: #C96442 (Orange) -> R:201 G:100 B:66
// Secondary: #666666 (Dim Grey) -> R:102 G:102 B:102
// Success: Green (Standard)
// Error: Red (Standard)

const C = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  // TrueColor (24-bit)
  primary: "\x1b[38;2;201;100;66m", // #C96442
  secondary: "\x1b[38;2;102;102;102m", // #666666

  // Standard Colors for status
  green: "\x1b[32m",
  red: "\x1b[31m",
};

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulated loading spinner
async function withSpinner(text, action) {
  let i = 0;
  process.stdout.write("\x1b[?25l"); // Hide cursor

  const interval = setInterval(() => {
    process.stdout.write(
      `\r${C.primary}${SPINNER_FRAMES[i]} ${C.reset}${text}`,
    );
    i = (i + 1) % SPINNER_FRAMES.length;
  }, 80);

  try {
    const result = await action();
    clearInterval(interval);
    process.stdout.write(
      `\r${C.green}✔ ${C.reset}${text} ${C.dim}Done${C.reset}\n`,
    );
    process.stdout.write("\x1b[?25h"); // Show cursor
    return result;
  } catch (err) {
    clearInterval(interval);
    process.stdout.write(
      `\r${C.red}✖ ${C.reset}${text} ${C.red}Failed${C.reset}\n`,
    );
    process.stdout.write("\x1b[?25h"); // Show cursor
    throw err;
  }
}

function printHeader() {
  console.log("");
  console.log(
    `${C.primary}  __  __  ____   ____  _____  _      ______${C.reset}`,
  );
  console.log(
    `${C.primary} |  \\/  |/ __ \\ / __ \\|  __ \\| |    |  ____|${C.reset}`,
  );
  console.log(
    `${C.primary} | \\  / | |  | | |  | | |  | | |    | |__${C.reset}`,
  );
  console.log(
    `${C.primary} | |\\/| | |  | | |  | | |  | | |    |  __|${C.reset}`,
  );
  console.log(
    `${C.primary} | |  | | |__| | |__| | |__| | |____| |____${C.reset}`,
  );
  console.log(
    `${C.primary} |_|  |_|\\____/ \\____/|_____/|______|______|${C.reset}`,
  );
  console.log(
    `${C.secondary}  CODE BLOCK GENERATOR                  v1.0.0${C.reset}`,
  );
  console.log("");
}

function printHelp() {
  printHeader();
  console.log(`
${C.bold}USAGE${C.reset}
  ${C.primary}moodle-code-block${C.reset} <input> [output] [options]

${C.bold}OPTIONS${C.reset}
  ${C.primary}-f, --filename${C.reset} ${C.secondary}<name>${C.reset}   Display a custom filename in the header
  ${C.primary}-h, --help${C.reset}              Show this help message

${C.bold}SUPPORTED LANGUAGES${C.reset}
  JavaScript, TypeScript, JSX, TSX, HTML

${C.bold}EXAMPLES${C.reset}
  ${C.secondary}# Output to stdout${C.reset}
  moodle-code-block app.js

  ${C.secondary}# Save to file with custom name${C.reset}
  moodle-code-block app.js output.html -f "Solution.js"
  `);
}

function printError(msg) {
  console.error(`\n${C.red}Error:${C.reset} ${msg}\n`);
}

// MAIN EXECUTION
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);

  // Show help if no args or help flag
  if (args.length === 0 || args.includes("-h") || args.includes("--help")) {
    printHelp();
    process.exit(0);
  }

  // Parse arguments
  let inputFile = null;
  let outputFile = null;
  let filename = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === "-f" || arg === "--filename") {
      if (i + 1 < args.length) {
        filename = args[i + 1];
        i++; // Skip next arg
      } else {
        printError("Missing value for --filename argument");
        process.exit(1);
      }
    } else if (arg.startsWith("-")) {
      printError(`Unknown option: ${arg}`);
      printHelp();
      process.exit(1);
    } else if (!inputFile) {
      inputFile = arg;
    } else if (!outputFile) {
      outputFile = arg;
    }
  }

  if (!inputFile) {
    printError("Input file is required");
    printHelp();
    process.exit(1);
  }

  if (!fs.existsSync(inputFile)) {
    printError(`File not found: ${inputFile}`);
    process.exit(1);
  }

  (async () => {
    try {
      // 1. Read File
      const code = await withSpinner(`Reading ${inputFile}...`, async () => {
        await sleep(300); // Simulate tiny delay for UX
        return fs.readFileSync(inputFile, "utf-8");
      });

      // 2. Generate HTML
      const html = await withSpinner("Generating code block...", async () => {
        await sleep(400); // Simulate processing time
        return generateMoodleCodeBlock(code, "JavaScript", filename);
      });

      // 3. Output
      if (outputFile) {
        await withSpinner(`Writing to ${outputFile}...`, async () => {
          await sleep(200);
          fs.writeFileSync(outputFile, html, "utf-8");
        });
        console.log(`\n${C.primary}✨ Ready to paste into Moodle!${C.reset}\n`);
      } else {
        console.log("\n" + html);
      }
    } catch (err) {
      // Error already handled in spinner
      process.exit(1);
    }
  })();
}

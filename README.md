# Moodle Code Block Generator

A tool that generates **Moodle-compatible HTML code blocks** with VS Code Dark+ syntax highlighting. Perfect for educators and content creators who want beautiful, professional-looking code snippets in their Moodle courses.

![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Python](https://img.shields.io/badge/Python-3776AB?style=flat&logo=python&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-blue.svg)

## Try it Online

Use the web version directly in your browser - no installation required:

**[Open Moodle Code Block Generator](https://0x3st3.github.io/moodle-html-code-block-gen/)**

## Features

- **VS Code Dark+ Theme** - Beautiful syntax highlighting matching the popular VS Code theme
- **Multi-Language Support** - JavaScript, TypeScript, Python, HTML, JSX, and TSX
- **One-Click Copy** - Copy button that copies only the code (without line numbers)
- **Line Numbers** - Non-selectable line numbers for easy reference
- **Custom Filename** - Display the filename inside the code block
- **Moodle Compatible** - Pure inline HTML/CSS that works perfectly in Moodle's HTML editor
- **Zero Dependencies** - Only uses Node.js built-in modules (for CLI)

## Project Structure

This project provides two ways to use the generator:

| Component        | Files                               | Description                                   |
| ---------------- | ----------------------------------- | --------------------------------------------- |
| **Web App**      | `index.html`, `style.css`, `app.js` | Browser-based UI, hosted on GitHub Pages      |
| **CLI Tool**     | `generator.js`                      | Node.js command-line interface                |
| **Core Library** | `lib.js`                            | Shared syntax highlighting logic used by both |

## Installation (CLI)

```bash
# Clone the repository
git clone https://github.com/0x3st3/moodle-html-code-block-gen.git

# Navigate to the directory
cd moodle-html-code-block-gen
```

No additional dependencies required! Just Node.js.

## Usage

### Web App

Simply visit **[https://0x3st3.github.io/moodle-html-code-block-gen/](https://0x3st3.github.io/moodle-html-code-block-gen/)** and:

1. Paste your code
2. Select the language
3. Optionally add a filename
4. Click "Generate HTML"
5. Copy the output and paste into Moodle

### CLI Usage

```bash
# Output to stdout
node generator.js input.js

# Save to file
node generator.js input.js output.html

# With custom filename badge
node generator.js input.js output.html -f "myScript.js"
```

### Command Line Options

| Option                  | Description                                                               |
| ----------------------- | ------------------------------------------------------------------------- |
| `<input_file>`          | Path to the file to highlight (required)                                  |
| `[output_file]`         | Path for the generated HTML file (optional, outputs to stdout if omitted) |
| `-f, --filename <name>` | Custom filename to display in the code block badge                        |

## API Usage

You can also use the generator programmatically:

```javascript
import { generateMoodleCodeBlock } from "./lib.js";

const code = `
function hello() {
  console.log("Hello, World!");
}
`;

// Without filename (shows "JavaScript")
const html1 = generateMoodleCodeBlock(code);

// With custom filename
const html2 = generateMoodleCodeBlock(code, "JavaScript", "hello.js");

console.log(html2);
```

### API Reference

#### `generateMoodleCodeBlock(code, language?, filename?)`

| Parameter  | Type             | Default        | Description                                      |
| ---------- | ---------------- | -------------- | ------------------------------------------------ |
| `code`     | `string`         | -              | The source code to highlight                     |
| `language` | `string`         | `"JavaScript"` | The language name (used if no filename provided) |
| `filename` | `string \| null` | `null`         | Optional filename to display instead of language |

**Returns:** `string` - The generated HTML code block

## Syntax Highlighting Colors

The generator uses VS Code's Dark+ theme colors:

| Token Type     | Color     | Example                                |
| -------------- | --------- | -------------------------------------- |
| Keywords       | `#569cd6` | `function`, `const`, `return`, `if`    |
| Control Flow   | `#c586c0` | `if`, `else`, `for`, `return`          |
| Strings        | `#ce9178` | `"hello"`, `'world'`, `` `template` `` |
| Numbers        | `#b5cea8` | `42`, `3.14`, `0xFF`                   |
| Variables      | `#9cdcfe` | `myVar`, `data`, `result`              |
| Function Calls | `#dcdcaa` | `console.log()`, `fetch()`             |
| Types          | `#4ec9b0` | `interface`, `type`, `Promise`         |
| Comments       | `#6a9955` | `// comment`, `/* block */`            |

## How to Use in Moodle

1. Generate the HTML using the web app or CLI
2. In Moodle, edit your content (e.g., a Page, Label, or Quiz question)
3. Click the HTML button (`<>`) in the editor toolbar
4. Paste the generated HTML
5. Save and view your beautifully formatted code!

## Contributing

Contributions are welcome! Here are some ways you can contribute:

- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation
- Add support for other languages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by VS Code's Dark+ theme
- Built for the ESGI FYC to help students with their Moodle courses

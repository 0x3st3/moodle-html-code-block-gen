/**
 * Moodle Code Block Generator - Core Logic
 */

// VS Code Dark+ Theme Colors (Official)
const COLORS = {
  default: "#d4d4d4", // Default text / punctuation
  keyword: "#569cd6", // function, var, const, this, typeof, new, class, etc.
  controlFlow: "#c586c0", // if, else, for, while, return, switch, try, catch, etc.
  string: "#ce9178", // Strings
  number: "#b5cea8", // Numbers
  variable: "#9cdcfe", // Variables, parameters, identifiers
  functionCall: "#dcdcaa", // Function calls and declarations
  comment: "#6a9955", // Comments
  tag: "#569cd6", // HTML tags
  attribute: "#9cdcfe", // HTML attributes
  delimiter: "#808080", // HTML brackets <>
  lineNumber: "#858585", // Line numbers (dimmed)
  type: "#4ec9b0", // TypeScript types, interfaces, type aliases, classes
  constant: "#4fc1ff", // Constants (UPPER_CASE) and enum members
  regex: "#d16969", // Regular expressions
  jsxTag: "#4ec9b0", // JSX component tags (PascalCase)
  operator: "#d4d4d4", // Operators like =, +, -, etc.
  punctuation: "#d4d4d4", // Punctuation like (), {}, [], etc.
};

// Control flow keywords (highlighted in pink/magenta #C586C0)
const CONTROL_FLOW_KEYWORDS = new Set([
  "if",
  "else",
  "for",
  "while",
  "do",
  "switch",
  "case",
  "break",
  "continue",
  "return",
  "try",
  "catch",
  "finally",
  "throw",
  "yield",
  "await",
]);

const JS_KEYWORDS = new Set([
  "function",
  "var",
  "let",
  "const",
  "new",
  "delete",
  "typeof",
  "instanceof",
  "void",
  "this",
  "class",
  "extends",
  "super",
  "import",
  "export",
  "default",
  "from",
  "as",
  "async",
  "of",
  "in",
  "true",
  "false",
  "null",
  "undefined",
  // TypeScript keywords
  "interface",
  "type",
  "namespace",
  "declare",
  "module",
  "implements",
  "public",
  "private",
  "protected",
  "readonly",
  "keyof",
  "unique",
  "infer",
  "satisfies",
  "is",
  "asserts",
  "enum",
  "abstract",
  "override",
  "static",
  "get",
  "set",
]);

// TypeScript built-in types (highlighted as type keywords)
const TS_BUILTIN_TYPES = new Set([
  "any",
  "boolean",
  "string",
  "number",
  "void",
  "never",
  "unknown",
  "object",
  "symbol",
  "bigint",
  "undefined",
  "null",
  "Array",
  "Promise",
  "Record",
  "Partial",
  "Required",
  "Readonly",
  "Pick",
  "Omit",
  "Exclude",
  "Extract",
  "NonNullable",
  "ReturnType",
  "Parameters",
  "ConstructorParameters",
  "InstanceType",
  "ThisType",
]);

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * Create a colored span
 */
function span(text, color) {
  return `<span style="color: ${color};">${text}</span>`;
}

/**
 * Tokenize JavaScript/TypeScript/JSX/TSX
 * Enhanced with proper type annotation and generic support
 */
function tokenizeJS(code) {
  const tokens = [];
  let i = 0;

  // Context tracking for type annotations
  let inTypeContext = false;
  let angleDepth = 0;

  // JSX depth tracking - when > 0, we're inside JSX elements
  let jsxDepth = 0;

  // JSX expression depth tracking - when > 0, we're inside JSX expressions {expr}
  let jsxExprDepth = 0;

  // Helper to check if we're after a colon that indicates a type annotation
  function isTypeAnnotationContext() {
    // Look back at previous non-whitespace tokens
    for (let t = tokens.length - 1; t >= 0; t--) {
      if (tokens[t].type === "whitespace") continue;
      // After : (type annotation), after < (generic), extends, implements, as
      if (
        tokens[t].value === ":" ||
        tokens[t].value === "<" ||
        tokens[t].value === "extends" ||
        tokens[t].value === "implements" ||
        tokens[t].value === "as" ||
        tokens[t].value === "," ||
        tokens[t].value === "|" ||
        tokens[t].value === "&"
      ) {
        return true;
      }
      // After interface or type keywords
      if (
        tokens[t].type === "keyword" &&
        (tokens[t].value === "interface" || tokens[t].value === "type")
      ) {
        return true;
      }
      break;
    }
    return inTypeContext || angleDepth > 0;
  }

  // Helper to check if identifier is PascalCase (likely a type/component)
  function isPascalCase(str) {
    return /^[A-Z][a-zA-Z0-9]*$/.test(str);
  }

  // Helper to check if identifier is UPPER_SNAKE_CASE (likely a constant)
  function isUpperCase(str) {
    // Must be at least 2 chars, all uppercase letters, numbers, or underscores
    return str.length >= 2 && /^[A-Z][A-Z0-9_]*$/.test(str);
  }

  // Helper to check if we're in JSX context
  function isJSXContext() {
    // If we're inside JSX elements, we're in JSX context
    if (jsxDepth > 0) return true;

    // Check if we're after ( or after return keyword or at start of expression
    for (let t = tokens.length - 1; t >= 0; t--) {
      if (tokens[t].type === "whitespace") continue;
      if (
        tokens[t].value === "(" ||
        tokens[t].value === "return" ||
        tokens[t].value === "=>" ||
        tokens[t].value === "?" ||
        tokens[t].value === ":" ||
        tokens[t].value === "{"
      ) {
        return true;
      }
      break;
    }
    return false;
  }

  while (i < code.length) {
    // White space
    if (/\s/.test(code[i])) {
      let value = code[i++];
      while (i < code.length && /\s/.test(code[i])) value += code[i++];
      tokens.push({ type: "whitespace", value });
      continue;
    }

    // JSX text content - when inside JSX elements and NOT inside a JSX expression {expr}
    // This handles text like "Increment" inside <button>Increment</button>
    // but NOT code inside {count} which should be parsed as JavaScript
    if (
      jsxDepth > 0 &&
      jsxExprDepth === 0 &&
      code[i] !== "<" &&
      code[i] !== "{"
    ) {
      let textContent = "";
      while (
        i < code.length &&
        code[i] !== "<" &&
        code[i] !== "{" &&
        !/\s/.test(code[i])
      ) {
        textContent += code[i++];
      }
      if (textContent) {
        tokens.push({ type: "default", value: textContent });
        continue;
      }
    }

    // Comments (Multi-line)
    if (code[i] === "/" && code[i + 1] === "*") {
      let value = "/*";
      i += 2;
      while (i < code.length && !(code[i] === "*" && code[i + 1] === "/")) {
        value += code[i++];
      }
      if (i < code.length) {
        value += "*/";
        i += 2;
      }
      tokens.push({ type: "comment", value });
      continue;
    }

    // Comments (Single-line)
    if (code[i] === "/" && code[i + 1] === "/") {
      let value = "//";
      i += 2;
      while (i < code.length && code[i] !== "\n") {
        value += code[i++];
      }
      tokens.push({ type: "comment", value });
      continue;
    }

    // Strings (Double quotes)
    if (code[i] === '"') {
      let value = '"';
      i++;
      while (i < code.length && code[i] !== '"' && code[i] !== "\n") {
        if (code[i] === "\\" && i + 1 < code.length) {
          value += code[i++] + code[i++];
        } else {
          value += code[i++];
        }
      }
      if (i < code.length && code[i] === '"') value += code[i++];
      tokens.push({ type: "string", value });
      continue;
    }

    // Strings (Single quotes)
    if (code[i] === "'") {
      let value = "'";
      i++;
      while (i < code.length && code[i] !== "'" && code[i] !== "\n") {
        if (code[i] === "\\" && i + 1 < code.length) {
          value += code[i++] + code[i++];
        } else {
          value += code[i++];
        }
      }
      if (i < code.length && code[i] === "'") value += code[i++];
      tokens.push({ type: "string", value });
      continue;
    }

    // Template Literals
    if (code[i] === "`") {
      let value = "`";
      i++;
      while (i < code.length && code[i] !== "`") {
        if (code[i] === "\\" && i + 1 < code.length) {
          value += code[i++] + code[i++];
        } else {
          value += code[i++];
        }
      }
      if (i < code.length && code[i] === "`") value += code[i++];
      tokens.push({ type: "string", value });
      continue;
    }

    // Numbers
    if (/[0-9]/.test(code[i])) {
      let value = code[i++];
      while (i < code.length && /[0-9a-fA-F\.xob_n]/.test(code[i])) {
        value += code[i++];
      }
      tokens.push({ type: "number", value });
      continue;
    }

    // Type annotation colon detection
    if (code[i] === ":") {
      tokens.push({ type: "punctuation", value: code[i++] });
      // Check if this is a type annotation (not object property or ternary)
      // Look ahead to see if followed by a type
      let j = i;
      while (j < code.length && /\s/.test(code[j])) j++;
      if (j < code.length && /[a-zA-Z_$<({[]/.test(code[j])) {
        inTypeContext = true;
      }
      continue;
    }

    // JSX Tag detection - check if we're looking at a JSX element
    if (code[i] === "<") {
      let j = i + 1;
      while (j < code.length && /\s/.test(code[j])) j++;

      // Check if it's a JSX closing tag </tagname> or self-closing check
      const isClosingTag = code[j] === "/";

      // Check if this looks like a JSX tag (followed by identifier)
      // JSX tags are lowercase for HTML elements, PascalCase for components
      if (isClosingTag || /[a-zA-Z]/.test(code[j])) {
        // Lookahead to determine if this is really JSX vs comparison operator
        // JSX: <div>, <Component>, </div>, < Component />
        // Not JSX: a < b, Set<T>

        // Check context - are we in a place where JSX makes sense?
        const isLikelyJSX = isJSXContext() || isClosingTag;

        // Also check if it looks like a generic type (Set<T>) vs JSX
        // In generics, < is usually preceded by an identifier without space
        let prevNonWs = tokens.length - 1;
        while (prevNonWs >= 0 && tokens[prevNonWs].type === "whitespace")
          prevNonWs--;

        const prevToken = prevNonWs >= 0 ? tokens[prevNonWs] : null;
        const isAfterIdentifier =
          prevToken &&
          (prevToken.type === "variable" ||
            prevToken.type === "functionCall" ||
            prevToken.type === "type");

        // If we're after an identifier with no whitespace, likely a generic
        const hasSpaceBefore =
          tokens.length > 0 && tokens[tokens.length - 1].type === "whitespace";
        const isGenericContext = isAfterIdentifier && !hasSpaceBefore;

        if (isLikelyJSX && !isGenericContext) {
          // Parse as JSX tag
          tokens.push({ type: "delimiter", value: "<" });
          i++;

          // Check if this is a closing tag </tagname>
          const isClosingTagParsing = code[i] === "/";

          // Handle closing tag slash
          if (isClosingTagParsing) {
            tokens.push({ type: "delimiter", value: "/" });
            i++;
          }

          // Skip whitespace
          while (i < code.length && /\s/.test(code[i])) {
            tokens.push({ type: "whitespace", value: code[i++] });
          }

          // Parse tag name
          if (/[a-zA-Z_$]/.test(code[i])) {
            let tagName = "";
            while (i < code.length && /[a-zA-Z0-9_$\.\-]/.test(code[i])) {
              tagName += code[i++];
            }
            // Determine if it's a component (PascalCase) or HTML tag (lowercase)
            if (isPascalCase(tagName.split(".")[0])) {
              tokens.push({ type: "jsxTag", value: tagName });
            } else {
              tokens.push({ type: "tag", value: tagName });
            }
          }

          // Track if this tag is self-closing
          let isSelfClosing = false;

          // Parse attributes until we hit > or />
          while (i < code.length && code[i] !== ">") {
            // Whitespace
            if (/\s/.test(code[i])) {
              let ws = "";
              while (i < code.length && /\s/.test(code[i])) ws += code[i++];
              tokens.push({ type: "whitespace", value: ws });
              continue;
            }

            // Self-closing /
            if (code[i] === "/" && code[i + 1] === ">") {
              tokens.push({ type: "delimiter", value: "/" });
              i++;
              isSelfClosing = true;
              break;
            }

            // JSX expression {expr}
            if (code[i] === "{") {
              tokens.push({ type: "punctuation", value: code[i++] });
              // Parse nested expression - need to track brace depth
              let braceDepth = 1;
              let exprStart = i;
              while (i < code.length && braceDepth > 0) {
                if (code[i] === "{") braceDepth++;
                else if (code[i] === "}") braceDepth--;
                if (braceDepth > 0) i++;
              }
              // Recursively tokenize the expression content
              const exprContent = code.slice(exprStart, i);
              const exprTokens = tokenizeJS(exprContent);
              tokens.push(...exprTokens);
              if (i < code.length && code[i] === "}") {
                tokens.push({ type: "punctuation", value: code[i++] });
              }
              continue;
            }

            // Attribute name
            if (/[a-zA-Z_$]/.test(code[i])) {
              let attrName = "";
              while (i < code.length && /[a-zA-Z0-9_$\-]/.test(code[i])) {
                attrName += code[i++];
              }
              tokens.push({ type: "attribute", value: attrName });
              continue;
            }

            // Attribute value assignment
            if (code[i] === "=") {
              tokens.push({ type: "delimiter", value: code[i++] });
              continue;
            }

            // String attribute value
            if (code[i] === '"' || code[i] === "'") {
              const quote = code[i];
              let strVal = quote;
              i++;
              while (i < code.length && code[i] !== quote) {
                if (code[i] === "\\" && i + 1 < code.length) {
                  strVal += code[i++] + code[i++];
                } else {
                  strVal += code[i++];
                }
              }
              if (i < code.length && code[i] === quote) strVal += code[i++];
              tokens.push({ type: "string", value: strVal });
              continue;
            }

            // Any other character (shouldn't happen often in valid JSX)
            tokens.push({ type: "punctuation", value: code[i++] });
          }

          // Closing >
          if (code[i] === ">") {
            tokens.push({ type: "delimiter", value: code[i++] });
          }

          // Update JSX depth based on tag type
          if (isClosingTagParsing) {
            // Closing tag decrements depth
            if (jsxDepth > 0) jsxDepth--;
          } else if (!isSelfClosing) {
            // Opening tag (not self-closing) increments depth
            jsxDepth++;
          }
          // Self-closing tags don't change depth

          continue;
        }
      }

      // Not JSX - handle as generic type or comparison
      if (/[a-zA-Z_$]/.test(code[j])) {
        angleDepth++;
        tokens.push({ type: "punctuation", value: code[i++] });
        continue;
      }

      tokens.push({ type: "punctuation", value: code[i++] });
      continue;
    }

    if (code[i] === ">") {
      if (angleDepth > 0) angleDepth--;
      if (angleDepth === 0) inTypeContext = false;
      tokens.push({ type: "punctuation", value: code[i++] });
      continue;
    }

    // Reset type context on certain tokens
    if (code[i] === "=" || code[i] === ";") {
      inTypeContext = false;
      angleDepth = 0;
      tokens.push({ type: "punctuation", value: code[i++] });
      continue;
    }

    // Handle { - could be object or JSX expression start
    if (code[i] === "{") {
      inTypeContext = false;
      angleDepth = 0;
      // Track JSX expression depth when inside JSX elements
      if (jsxDepth > 0) {
        jsxExprDepth++;
      }
      tokens.push({ type: "punctuation", value: code[i++] });
      continue;
    }

    // Handle } - could be object end or JSX expression end
    if (code[i] === "}") {
      // Track JSX expression depth when inside JSX elements
      if (jsxExprDepth > 0) {
        jsxExprDepth--;
      }
      tokens.push({ type: "punctuation", value: code[i++] });
      continue;
    }

    // Handle | and & for union/intersection types
    if (code[i] === "|" || code[i] === "&") {
      if (inTypeContext || angleDepth > 0) {
        // Stay in type context
      }
      tokens.push({ type: "punctuation", value: code[i++] });
      continue;
    }

    // Identifiers
    if (/[a-zA-Z_$]/.test(code[i])) {
      let value = code[i++];
      while (i < code.length && /[a-zA-Z0-9_$]/.test(code[i])) {
        value += code[i++];
      }

      // Determine token type based on context
      const isInTypeContext = isTypeAnnotationContext();

      // Check control flow keywords first (pink/magenta)
      if (CONTROL_FLOW_KEYWORDS.has(value)) {
        tokens.push({ type: "controlFlow", value });
      } else if (JS_KEYWORDS.has(value)) {
        tokens.push({ type: "keyword", value });
        // Keywords like interface, type, enum start type context
        if (value === "interface" || value === "type" || value === "enum") {
          inTypeContext = true;
        }
      } else if (TS_BUILTIN_TYPES.has(value)) {
        // Built-in types like string, number, boolean, Array, Promise, etc.
        tokens.push({ type: "type", value });
      } else if (isInTypeContext && isPascalCase(value)) {
        // PascalCase identifiers in type context are types
        tokens.push({ type: "type", value });
      } else if (isUpperCase(value)) {
        // UPPER_CASE identifiers are constants or enum members
        tokens.push({ type: "constant", value });
      } else if (isPascalCase(value)) {
        // Lookahead for function call with generic or JSX
        let j = i;
        while (j < code.length && /\s/.test(code[j])) j++;

        if (code[j] === "<") {
          // Could be generic function call or JSX
          // Look further to determine
          let k = j + 1;
          let depth = 1;
          let isJSX = false;
          while (k < code.length && depth > 0) {
            if (code[k] === "<") depth++;
            else if (code[k] === ">") depth--;
            else if (code[k] === "/" && depth === 1) isJSX = true;
            k++;
          }
          // Check what follows the >
          while (k < code.length && /\s/.test(code[k])) k++;
          if (code[k] === "(" || isJSX) {
            // JSX component or generic function call
            tokens.push({ type: "jsxTag", value });
          } else {
            // Type reference
            tokens.push({ type: "type", value });
          }
        } else if (code[j] === "(") {
          // Function call or component
          tokens.push({ type: "functionCall", value });
        } else if (code[j] === ".") {
          // Object/namespace access - could be React.FC etc.
          tokens.push({ type: "type", value });
        } else {
          // Default to type for PascalCase
          tokens.push({ type: "type", value });
        }
      } else {
        // Lookahead for function call
        let j = i;
        while (j < code.length && /\s/.test(code[j])) j++;
        if (code[j] === "(" || code[j] === "<") {
          tokens.push({ type: "functionCall", value });
        } else {
          tokens.push({ type: "variable", value });
        }
      }
      continue;
    }

    // Punctuation / Operators
    tokens.push({ type: "punctuation", value: code[i++] });
  }

  return tokens;
}

/**
 * Tokenize HTML
 */
function tokenizeHTML(code) {
  const tokens = [];
  let i = 0;

  while (i < code.length) {
    if (code[i] === "<") {
      // Tag Start
      tokens.push({ type: "delimiter", value: "<" });
      i++;

      // Comment <!-- -->
      if (code.startsWith("!--", i)) {
        let value = "!--";
        i += 3;
        while (i < code.length && !code.startsWith("-->", i)) {
          value += code[i++];
        }
        if (code.startsWith("-->", i)) {
          value += "-->";
          i += 3;
        }
        tokens.push({ type: "comment", value });
        continue;
      }

      // Closing Tag </
      if (code[i] === "/") {
        tokens.push({ type: "delimiter", value: "/" });
        i++;
      }

      // Tag Name
      let tagName = "";
      while (i < code.length && /[a-zA-Z0-9\-]/.test(code[i])) {
        tagName += code[i++];
      }
      if (tagName) tokens.push({ type: "tag", value: tagName });

      // Attributes
      while (i < code.length && code[i] !== ">") {
        if (/\s/.test(code[i])) {
          let ws = "";
          while (i < code.length && /\s/.test(code[i])) ws += code[i++];
          tokens.push({ type: "whitespace", value: ws });
          continue;
        }

        if (code[i] === "=") {
          tokens.push({ type: "delimiter", value: "=" });
          i++;
          continue;
        }

        // Attribute Value (quoted)
        if (code[i] === '"' || code[i] === "'") {
          let quote = code[i];
          let val = quote;
          i++;
          while (i < code.length && code[i] !== quote) {
            val += code[i++];
          }
          if (i < code.length && code[i] === quote) val += code[i++];
          tokens.push({ type: "string", value: val });
          continue;
        }

        // Attribute Name
        if (/[a-zA-Z0-9\-]/.test(code[i])) {
          let attr = "";
          while (i < code.length && /[a-zA-Z0-9\-]/.test(code[i]))
            attr += code[i++];
          tokens.push({ type: "attribute", value: attr });
          continue;
        }

        // Catch-all
        tokens.push({ type: "delimiter", value: code[i++] });
      }

      if (code[i] === ">") {
        tokens.push({ type: "delimiter", value: ">" });
        i++;
      }
      continue;
    }

    // Text content
    let text = "";
    while (i < code.length && code[i] !== "<") {
      text += code[i++];
    }
    if (text) tokens.push({ type: "default", value: text });
  }

  return tokens;
}

/**
 * Generate highlighted code with line numbers
 */
export function highlightCodeWithLineNumbers(code, language = "JavaScript") {
  let tokens;
  if (language === "HTML") {
    tokens = tokenizeHTML(code);
  } else {
    // Default to JS/TS tokenizer
    tokens = tokenizeJS(code);
  }

  // First, map tokens to styled HTML spans
  // If a token contains newlines, we must split it so line numbers work
  let lines = [""];
  let currentLineIndex = 0;

  for (const token of tokens) {
    const color = COLORS[token.type] || COLORS.default;
    const parts = token.value.split("\n");

    for (let j = 0; j < parts.length; j++) {
      const part = parts[j];
      if (part) {
        lines[currentLineIndex] += span(escapeHtml(part), color);
      }

      // If we have more parts, it means there was a newline
      if (j < parts.length - 1) {
        lines.push("");
        currentLineIndex++;
      }
    }
  }

  // Now assemble the lines with line numbers
  const lineCount = lines.length;
  const lineNumberWidth = String(lineCount).length;
  let result = "";

  for (let i = 0; i < lines.length; i++) {
    const lineNum = String(i + 1).padStart(lineNumberWidth, " ");
    const lineNumSpan = `<span style="color: ${COLORS.lineNumber}; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; pointer-events: none; display: inline-block; width: ${lineNumberWidth + 1}ch; text-align: right; margin-right: 1.5ch; border-right: 1px solid #404040; padding-right: 1ch;">${lineNum}</span>`;

    result += lineNumSpan + lines[i];
    if (i < lines.length - 1) result += "\n";
  }

  return result;
}

/**
 * Generate Moodle-compatible HTML code block with line numbers
 * @param {string} code - The source code to highlight
 * @param {string} language - The language name (default: "JavaScript")
 * @param {string|null} filename - Optional filename to display instead of language
 */
export function generateMoodleCodeBlock(
  code,
  language = "JavaScript",
  filename = null,
) {
  const highlightedCode = highlightCodeWithLineNumbers(code, language);

  const escapedCodeForAttr = code
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const displayLabel = filename || language;

  const badgeHtml = `<span style="position: absolute; top: 10px; left: 16px; color: #858585; font-size: 12px; font-family: Consolas, Monaco, 'Courier New', monospace; user-select: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none;">${displayLabel}</span>`;

  const html = `<div style="position: relative;" data-code="${escapedCodeForAttr}"><button onclick="
  const code = this.parentElement.getAttribute('data-code');
  navigator.clipboard.writeText(code);
  this.innerText='✓ Copied';
  setTimeout(()=>this.innerText='Copy',1500);
" style="position: absolute; top: 10px; right: 10px; background: #2d2d2d; color: #fff; border: 1px solid #404040; border-radius: 4px; padding: 4px 10px; font-size: 12px; cursor: pointer; z-index: 10; font-family: sans-serif;">Copy</button>
<pre style="background: #1e1e1e; color: #d4d4d4; padding: 40px 16px 16px 16px; border-radius: 6px; font-family: Consolas, Monaco, 'Courier New', monospace; font-size: 14px; line-height: 1.55; overflow-x: auto; white-space: pre; border: 1px solid #333; position: relative;">${badgeHtml}<code>${highlightedCode}</code></pre></div>`;

  return html;
}

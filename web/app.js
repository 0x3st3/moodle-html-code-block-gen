import { generateMoodleCodeBlock } from "../lib/lib.js";

// DOM Elements
const codeInput = document.getElementById("code-input");
const filenameInput = document.getElementById("filename-input");
const generateBtn = document.getElementById("generate-btn");
const clearBtn = document.getElementById("clear-btn");
const previewPanel = document.getElementById("preview-panel");
const previewContainer = document.getElementById("preview-container");
const outputPanel = document.getElementById("output-panel");
const htmlOutput = document.getElementById("html-output");
const copyBtn = document.getElementById("copy-btn");
const fileUpload = document.getElementById("file-upload");
const importBtn = document.getElementById("import-btn");
const languageSelect = document.getElementById("language-select");

/**
 * Helper to set loading state
 */
function setLoading(isLoading) {
  if (isLoading) {
    generateBtn.classList.add("btn-loading");
    generateBtn.disabled = true;
  } else {
    generateBtn.classList.remove("btn-loading");
    generateBtn.disabled = false;
  }
}

/**
 * Generate and display the code block
 */
function generate() {
  const code = codeInput.value.trim();

  if (!code) {
    previewPanel.style.display = "none";
    outputPanel.style.display = "none";
    return;
  }

  // Set loading state
  setLoading(true);

  // Simulate processing time for better UX (Claude vibe)
  setTimeout(() => {
    const filename = filenameInput.value.trim() || null;
    const language = languageSelect.value;
    const html = generateMoodleCodeBlock(code, language, filename);

    // Show preview
    previewPanel.style.display = "block";
    previewContainer.innerHTML = html;

    // Show output
    outputPanel.style.display = "block";
    htmlOutput.value = html;

    // Reset copy button
    copyBtn.textContent = "Copy HTML";

    // Reset loading state
    setLoading(false);
  }, 600);
}

/**
 * Clear all inputs and outputs
 */
function clear() {
  codeInput.value = "";
  filenameInput.value = "";
  previewPanel.style.display = "none";
  outputPanel.style.display = "none";
  htmlOutput.value = "";
  copyBtn.textContent = "Copy HTML";
  fileUpload.value = ""; // Reset file input
}

/**
 * Copy HTML to clipboard
 */
async function copyHtml() {
  try {
    await navigator.clipboard.writeText(htmlOutput.value);
    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = "Copy HTML";
    }, 2000);
  } catch (err) {
    console.error("Failed to copy:", err);
    // Fallback for older browsers
    htmlOutput.select();
    document.execCommand("copy");
    copyBtn.textContent = "Copied!";

    setTimeout(() => {
      copyBtn.textContent = "Copy HTML";
    }, 2000);
  }
}

/**
 * Handle file upload
 */
function handleFileUpload(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    codeInput.value = e.target.result;
    filenameInput.value = file.name;

    // Auto-detect language
    if (file.name.endsWith(".ts")) {
      languageSelect.value = "TypeScript";
    } else if (file.name.endsWith(".html") || file.name.endsWith(".htm")) {
      languageSelect.value = "HTML";
    } else if (file.name.endsWith(".jsx")) {
      languageSelect.value = "JSX";
    } else if (file.name.endsWith(".tsx")) {
      languageSelect.value = "TSX";
    } else {
      languageSelect.value = "JavaScript";
    }

    // Sync custom UI
    customSelectTrigger.textContent = languageSelect.value;
    customOptions.forEach((opt) => {
      if (opt.getAttribute("data-value") === languageSelect.value) {
        opt.classList.add("selected");
      } else {
        opt.classList.remove("selected");
      }
    });

    generate();
  };
  reader.readAsText(file);
}

// Event Listeners
generateBtn.addEventListener("click", generate);
clearBtn.addEventListener("click", clear);
copyBtn.addEventListener("click", copyHtml);
importBtn.addEventListener("click", () => fileUpload.click());
fileUpload.addEventListener("change", handleFileUpload);
languageSelect.addEventListener("change", generate);

// Custom Select Logic
const customSelectContainer = document.querySelector(
  ".custom-select-container",
);
const customSelectTrigger = document.querySelector(".custom-select-trigger");
const customOptions = document.querySelectorAll(".custom-option");

// Toggle dropdown
customSelectTrigger.addEventListener("click", (e) => {
  e.stopPropagation(); // Prevent document click from closing immediately
  customSelectContainer.classList.toggle("open");
});

// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!customSelectContainer.contains(e.target)) {
    customSelectContainer.classList.remove("open");
  }
});

// Handle option selection
customOptions.forEach((option) => {
  option.addEventListener("click", () => {
    const value = option.getAttribute("data-value");

    // Update native select
    languageSelect.value = value;

    // Update trigger text
    customSelectTrigger.textContent = option.textContent;

    // Update selected class
    customOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");

    // Close dropdown
    customSelectContainer.classList.remove("open");

    // Trigger generation
    generate();
  });
});

/**
 * Detect language from code content
 */
function detectLanguage(code) {
  if (
    code.includes("<!DOCTYPE html") ||
    code.includes("<html") ||
    (code.includes("</div>") && code.includes("class="))
  ) {
    return "HTML";
  }
  if (
    code.includes("import React") ||
    code.includes("className=") ||
    (code.includes("</") && !code.includes("<html"))
  ) {
    if (
      code.includes("interface ") ||
      code.includes("type ") ||
      code.includes(": string") ||
      code.includes(": number")
    ) {
      return "TSX";
    }
    return "JSX";
  }
  if (
    code.includes("interface ") ||
    code.includes("type ") ||
    code.includes(": string") ||
    code.includes(": number") ||
    code.includes(": boolean") ||
    code.includes("public ") ||
    code.includes("private ")
  ) {
    return "TypeScript";
  }
  return "JavaScript";
}

// Auto-detect language on input
codeInput.addEventListener("input", () => {
  const code = codeInput.value;
  if (code.length > 20) {
    const detected = detectLanguage(code);
    // Only change if not manually set to something else that makes sense?
    // For now just auto-switch if detecting non-JS
    if (
      detected !== languageSelect.value &&
      languageSelect.value === "JavaScript"
    ) {
      languageSelect.value = detected;

      // Sync custom UI
      customSelectTrigger.textContent = detected;
      customOptions.forEach((opt) => {
        if (opt.getAttribute("data-value") === detected) {
          opt.classList.add("selected");
        } else {
          opt.classList.remove("selected");
        }
      });

      generate(); // Re-generate with new syntax highlighting
    }
  }
});

// Generate on Ctrl/Cmd + Enter
codeInput.addEventListener("keydown", (e) => {
  if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
    e.preventDefault();
    generate();
  }
});

// Auto-generate on input change (debounced)
let debounceTimer;
function debounceGenerate() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (codeInput.value.trim()) {
      generate();
    }
  }, 500);
}

codeInput.addEventListener("input", debounceGenerate);
filenameInput.addEventListener("input", debounceGenerate);

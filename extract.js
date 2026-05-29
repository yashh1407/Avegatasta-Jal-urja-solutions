const fs = require("fs");
let html = fs.readFileSync("C:/Users/Yash.Mali/.gemini/antigravity/brain/ca586621-2e7f-4c8a-a8f0-c3fdd1070275/.system_generated/steps/1558/content.md", "utf8");

// Remove scripts and styles
html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "");
// Strip tags
const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

// Look for "SALIENT FEATURES" or similar
const match = text.match(/.{0,200}Features.{0,500}/i);
console.log(match ? match[0] : "Not found");

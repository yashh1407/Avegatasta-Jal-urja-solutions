const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "lib", "data.ts");
let content = fs.readFileSync(dataPath, "utf8");

// The IDs of the 6 added inverters
const ids = [
  "vguard-prime-1150-mili",
  "vguard-prime-1150-pure",
  "aviolux-800-square",
  "vguard-prime-750-pure",
  "smart-pro-1200",
  "aviolux-1100-square"
];

// Read the file as text and process it
// We will replace "Price": "..." with nothing
// And we will append the 3 offers to the features array.

ids.forEach(id => {
  // Regex to find the product block
  const blockRegex = new RegExp(`(\\"id\\"\\s*:\\s*\\"${id}\\"[\\s\\S]*?\\})\\s*(,|$|\\n)`, "g");
  content = content.replace(blockRegex, (match, block, suffix) => {
    // Remove Price from specs
    block = block.replace(/"Price"\s*:\s*"[^"]+",?\s*/g, "");
    
    // Add the key features if not already present
    if (!block.includes("5% Instant discount on EMI*")) {
      // Find the features array and append to it
      block = block.replace(/"features"\s*:\s*\[([\s\S]*?)\]/, (featureMatch, featuresContent) => {
        // Strip trailing spaces and newlines from the existing features content
        let newContent = featuresContent.trim();
        // Add a comma if there are already features and no trailing comma
        if (newContent.length > 0 && !newContent.endsWith(',')) {
          newContent += ',';
        }
        
        return `"features": [
      ${newContent ? newContent + '\n      ' : ''}"5% Instant discount on EMI*",
      "1% Instant discount on UPI*",
      "No Cost EMI available*"
    ]`;
      });
    }
    
    return block + suffix;
  });
});

fs.writeFileSync(dataPath, content, "utf8");
console.log("Removed Price and added key features from the original website");

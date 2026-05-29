const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "lib", "data.ts");
let content = fs.readFileSync(dataPath, "utf8");

// Correct mapping based on visual evidence
const imageMap = {
  "aviolux-800-square": "/Inverter/INVH63KEMJVN5NE8_1.webp",
  "vguard-prime-750-pure": "/Inverter/New_Project_3.webp",
  "smart-pro-1200": "/Inverter/INVFE6KNMZSFZYCG_1.webp",
  "aviolux-1100-square": "/Inverter/INVH63MTRANFGBYD_1.webp"
};

// Replace image strings for these specific products
for (const [id, imagePath] of Object.entries(imageMap)) {
  const regex = new RegExp(`("id":\\s*"${id}"[\\s\\S]*?"image":\\s*")([^"]+)(")`, "g");
  content = content.replace(regex, `$1${imagePath}$3`);
}

fs.writeFileSync(dataPath, content, "utf8");
console.log("Fixed image mappings in lib/data.ts");

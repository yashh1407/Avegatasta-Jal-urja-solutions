const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "lib", "data.ts");
let content = fs.readFileSync(dataPath, "utf8");

// Map product IDs to their corresponding image paths
const imageMap = {
  "vguard-prime-1150-mili": "/Inverter/Prime1150MiLi.webp",
  "vguard-prime-1150-pure": "/Inverter/INVFE56MKKQHMJEP_1.webp",
  "aviolux-800-square": "/Inverter/INVFE6KNMZSFZYCG_1.webp",
  "vguard-prime-750-pure": "/Inverter/INVH63KEMJVN5NE8_1.webp",
  "smart-pro-1200": "/Inverter/INVH63MTRANFGBYD_1.webp",
  "aviolux-1100-square": "/Inverter/New_Project_3.webp"
};

// Replace image strings for these specific products
for (const [id, imagePath] of Object.entries(imageMap)) {
  const regex = new RegExp(`("id":\\s*"${id}"[\\s\\S]*?"image":\\s*")([^"]+)(")`, "g");
  content = content.replace(regex, `$1${imagePath}$3`);
}

fs.writeFileSync(dataPath, content, "utf8");
console.log("Updated image paths in lib/data.ts");

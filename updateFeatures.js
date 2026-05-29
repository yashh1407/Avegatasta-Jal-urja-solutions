const fs = require("fs");
const path = require("path");

const dataPath = path.join(__dirname, "lib", "data.ts");
let content = fs.readFileSync(dataPath, "utf8");

const updates = {
  "vguard-prime-1150-mili": [
    "Pure Sine Wave Output",
    "1000VA / 12V Capacity",
    "LED Display for Status",
    "Reliable Power Backup",
    "3-Year Warranty"
  ],
  "vguard-prime-1150-pure": [
    "Digital Inverter UPS",
    "Pure Sinewave Output",
    "In-built Battery Gravity Builder",
    "High Load Handling Capacity"
  ],
  "aviolux-800-square": [
    "12V DC Square Wave Inverter",
    "Thermal Protection",
    "Overload Protection",
    "Compact & Rugged Design"
  ],
  "vguard-prime-750-pure": [
    "Pure Sinewave Technology",
    "Silent Operation",
    "Selectable Charging Modes",
    "Battery Water Topping Reminder"
  ],
  "smart-pro-1200": [
    "IoT Enabled (Wi-Fi App Control)",
    "Pure Sine Wave 1000VA",
    "Advanced Appliance Protection",
    "Turbo Charge Technology"
  ],
  "aviolux-1100-square": [
    "12V DC Square Wave Inverter",
    "Extra Backup Performance",
    "Thermal & Overload Protection",
    "Rugged & Durable Build"
  ]
};

for (const [id, features] of Object.entries(updates)) {
  const blockRegex = new RegExp(`(\\"id\\"\\s*:\\s*\\"${id}\\"[\\s\\S]*?\\"features\\"\\s*:\\s*\\[)([\\s\\S]*?)(\\][\\s\\S]*?\\})\\s*(,|$|\\n)`, "g");
  content = content.replace(blockRegex, (match, before, oldFeatures, after, suffix) => {
    const newFeaturesStr = features.map(f => `\n      "${f}"`).join(",") + "\n    ";
    return before + newFeaturesStr + after + suffix;
  });
}

fs.writeFileSync(dataPath, content, "utf8");
console.log("Updated features with actual product specs");

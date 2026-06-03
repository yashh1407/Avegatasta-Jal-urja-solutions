const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "app", "admin", "quotations", "page.tsx");
let content = fs.readFileSync(file, "utf8");

// The broken character is usually "â‚¹"
content = content.replace(/â‚¹/g, "₹");
// Sometimes it's the replacement character if previously mangled
content = content.replace(/,1/g, "₹");

fs.writeFileSync(file, content, "utf8");
console.log("Fixed Rupee symbols via Node");

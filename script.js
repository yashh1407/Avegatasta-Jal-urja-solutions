const fs = require("fs");
const path = require("path");

const productsToAdd = [
  {
    id: "vguard-prime-1150-mili",
    name: "V-Guard Prime 1150 MILI Inverter for Home, Office",
    brand: "V-Guard",
    category: "Inverter",
    subCategory: "Inverter",
    description: "Premium digital sinewave inverter with superior performance. Provides long power backup for homes and offices.",
    image: "https://vguard.com/storage/uploads/images/product-categories/inverters.jpg",
    features: ["Digital Sinewave", "Quick Charge Technology", "Advanced Battery Management"],
    specs: {
      "Price": "₹ 6,799",
      "Capacity": "1000VA"
    },
    inStock: true
  },
  {
    id: "vguard-prime-1150-pure",
    name: "Prime 1150 Pure Sinewave 1000VA Inverter",
    brand: "V-Guard",
    category: "Inverter",
    subCategory: "Inverter",
    description: "Pure sinewave inverter delivering clean power suitable for sensitive electronics.",
    image: "https://vguard.com/storage/uploads/images/product-categories/inverters.jpg",
    features: ["Pure Sinewave Output", "In-built Battery Gravity Builder", "High Load Handling"],
    specs: {
      "Price": "₹ 6,699",
      "Capacity": "1000VA"
    },
    inStock: true
  },
  {
    id: "aviolux-800-square",
    name: "Aviolux 800 Square Wave 775VA Inverter",
    brand: "V-Guard",
    category: "Inverter",
    subCategory: "Inverter",
    description: "Economical and reliable square wave inverter designed to handle heavy loads with ease.",
    image: "https://vguard.com/storage/uploads/images/product-categories/inverters.jpg",
    features: ["Square Wave Technology", "Overload Protection", "Compact Design"],
    specs: {
      "Price": "₹ 4,729",
      "Capacity": "775VA"
    },
    inStock: true
  },
  {
    id: "vguard-prime-750-pure",
    name: "V-Guard Prime 750 Pure Sinewave Inverter",
    brand: "V-Guard",
    category: "Inverter",
    subCategory: "Inverter",
    description: "High-efficiency pure sinewave inverter that runs fans silently and protects sensitive gadgets.",
    image: "https://vguard.com/storage/uploads/images/product-categories/inverters.jpg",
    features: ["Silent Operation", "Selectable Charging", "Battery Water Topping Reminder"],
    specs: {
      "Price": "₹ 4,949",
      "Capacity": "750VA"
    },
    inStock: true
  },
  {
    id: "smart-pro-1200",
    name: "Smart Pro 1200 S Pure Sine Wave 1000VA IoT",
    brand: "V-Guard",
    category: "Inverter",
    subCategory: "Inverter",
    description: "Smart IoT enabled pure sine wave inverter. Monitor and control your inverter from your smartphone.",
    image: "https://vguard.com/storage/uploads/images/product-categories/inverters.jpg",
    features: ["IoT Enabled (Wi-Fi)", "App Control", "Appliance Protection", "Turbo Charge"],
    specs: {
      "Price": "₹ 8,599",
      "Capacity": "1000VA"
    },
    inStock: true
  },
  {
    id: "aviolux-1100-square",
    name: "Aviolux 1100 Square Wave 950VA Inverter",
    brand: "V-Guard",
    category: "Inverter",
    subCategory: "Inverter",
    description: "Powerful square wave inverter that ensures longer backup and reliable performance during power cuts.",
    image: "https://vguard.com/storage/uploads/images/product-categories/inverters.jpg",
    features: ["Rugged Design", "Thermal Protection", "Extra Backup"],
    specs: {
      "Price": "₹ 5,349",
      "Capacity": "950VA"
    },
    inStock: true
  }
];

const dataPath = path.join(__dirname, "lib", "data.ts");
let content = fs.readFileSync(dataPath, "utf8");

// Remove the closing bracket and semi-colon at the end of the products array
content = content.trim().replace(/\];$/, "");
// Make sure there is a trailing comma
if (!content.endsWith(",")) {
  content += ",\n";
} else {
  content += "\n";
}

// Map products to string representation
const productsStr = productsToAdd.map(p => "  " + JSON.stringify(p, null, 2).split("\n").join("\n  ")).join(",\n");

content += productsStr + "\n];\n";

fs.writeFileSync(dataPath, content, "utf8");
console.log("Added 6 inverters to lib/data.ts");

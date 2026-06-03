const fs = require("fs");
const path = require("path");

const file = path.join(__dirname, "components", "AdminSidebar.tsx");
let content = fs.readFileSync(file, "utf8");

const toInsert = `
  {
    label: 'Quotations',
    href: '/admin/quotations',
    icon: FileText,
    category: 'main'
  },`;

content = content.replace("category: 'main'\n  },", "category: 'main'\n  }," + toInsert);
fs.writeFileSync(file, content, "utf8");
console.log("Updated AdminSidebar.tsx");

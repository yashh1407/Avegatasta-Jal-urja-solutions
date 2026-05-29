export interface Product {
  id: string;
  name: string;
  brand: "V-Guard" | "Zero B" | "Wilo" | "Bluewave India" | "Pure Energy";
  category: string;
  subCategory?: string;
  description: string;
  image: string;
  features: string[];
  specs: Record<string, string>;
  inStock: boolean;
}

export const categories = [
  {
    "name": "Water Heating Solutions",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuqKHzpxoP6eGxH8zWzcjRplIVAUw3RJRAH4aZ6r4q3Zw6HO8qpLhFXgE1LN9wUBcAO8xeMMpgW3dwWM1STm5z13BA=w800-h800"
  },
  {
    "name": "Pumping Solutions",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuqfFcYKIPf0ncG4hrGpyN1srZ2aJttbssIID5oA44ReNKpROifMEuK6E2H-F_9mG1hpxTK1oTEkIXohXIWnEmIU1Q=w800-h800"
  },
  {
    "name": "Water Treatment Solutions",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoxC9D3xyp-XyfGvBo7Z5fNTM9OONgYXl7vWGoxaRbHV5Mh2AfoqZEqItcpSyglOIEgL3qqdY2lyDP2hLaQdogs2A=w800-h800"
  },
  {
    "name": "Swimming Pool Solutions",
    "image": "/logo.webp"
  },
  {
    "name": "Solar Power Systems",
    "image": "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&q=80&w=800&h=800"
  }
];

export const products: Product[] = [
  {
    "id": "wilo-wbw3-sub",
    "name": "Borewell submersible pumpset 75 mm - (WBW3â€)",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "75mm borewell submersible pumpset designed for narrow borewells. Features high grade engineered polymer virgin noryl.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoDlr-LOhyZasO9yOhdQBZF3SquBP4KTEzRYUp6RXiet7v179vBXUvwRHg3bxpBkmnQrR2rUfzqqmWBiVHRCZTTcA=w800-h800",
    "features": [
      "Slim 75mm Design",
      "Virgin Noryl Impellers",
      "Wide Voltage Range",
      "Adequate Bearing Support"
    ],
    "specs": {
      "Size": "75mm",
      "Type": "Water Filled",
      "Power": "Up to 1 HP"
    },
    "inStock": true
  },
  {
    "id": "wilo-wbw4-panel",
    "name": "Wilo Control Panel for Borewell submersible pumpset - WBW4",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Control panel for borewell submersible pumpsets with robust construction, digital display and motor protection. Designed for domestic household water supply, high-rise buildings, farms, gardens, nurseries and fountain applications.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcup62hcQK0IWY4TUphu-whFmCQgiaZMDa3uJqRG1udNBoXXhvizUegA6DbSjLKrkusg_nnu1z7HO3Ls5efdMk2fVoQ=w800-h800",
    "features": [
      "Designed with robust construction",
      "Wall-mounted / floor-mounted powder-coated sheet metal enclosure with earth terminal",
      "Fitted with 4-pole heavy duty contactor for wide voltage operation",
      "Easy to install, operate and maintain",
      "Highly precise digital display unit for full-fledged motor protection",
      "Inbuilt short-circuit protection"
    ],
    "specs": {
      "Model": "WBW4 Control Panel",
      "Power Range": "0.37 kW (0.5 HP) to 2.2 kW (3 HP)",
      "Phase": "1 Ph",
      "Application": "Domestic household water supply; high-rise buildings, housing complexes, villas, farm houses, gardens and nurseries; washing, garages, poultry, cattle and stud farms; fountains",
      "Construction": "Powder-coated sheet metal enclosure",
      "Protection": "Digital motor protection and inbuilt short-circuit protection",
      "Contactor": "4-pole heavy duty contactor"
    },
    "inStock": true
  },
  {
    "id": "wilo-initial-drain",
    "name": "Submersible (Polypropylene) pump - Initial Drain 10.7",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Submersible pump for lifting waste water even with suspended solids. Features IP68 protection class.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcupGXSsJPCyykt2bJRU_Qfq-liN_dJP1UsV-EMSnwkH35bCeYcC7-JDW6tFkZVgOQrozFTFD3kEfq_NErey0VQKx_Q=w800-h800",
    "features": [
      "IP68 Protection",
      "10m Cable",
      "Lifting Waste Water",
      "Single Phase"
    ],
    "specs": {
      "Flow": "235 LPM",
      "Head": "8 m",
      "Power": "1 HP"
    },
    "inStock": true
  },
  {
    "id": "wilo-fmhil-booster",
    "name": "Single pump booster (SS Impeller) - FMHIL",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Premium single pump booster with SS impeller and wetted parts. Silent in operation and easy to carry.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoGuG4feep68f406AsmX0ZjsKg9LfyMQ1awz4ajajgF2bU_bQ8J0wfApkdKB7m13jGRVG0HpRcRgy0BmLYCLgQkZQ=w800-h800",
    "features": [
      "SS Impeller",
      "Silent Operation",
      "Electronic Control",
      "Anti-Rust"
    ],
    "specs": {
      "Flow": "215 LPM",
      "Head": "62 m",
      "Voltage": "230V"
    },
    "inStock": true
  },
  {
    "id": "wilo-fas-fac-dewatering",
    "name": "Wilo De-watering pump - FAS / FAC",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Robust high efficiency motor with IP68 protection. Integrated motor control for current overload.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuqYwljwHMGHwvGirgfT1lvhCvhdmAV-E1p_eNqwoBAMbL-cIL8PVxvaXUBYKUdWl2XhK3OmdkJ8aEVEvYulN7FSvA=w800-h800",
    "features": [
      "Float Switch",
      "IP68 Protection",
      "Overload Protection",
      "Robust Design"
    ],
    "specs": {
      "Flow": "1700 LPM",
      "Head": "30 m",
      "Solid Passage": "56 mm"
    },
    "inStock": true
  },
  {
    "id": "wilo-mini-crown",
    "name": "Self-priming mini pumpset - Wilo Mini / Wilo Crown",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Suitable for wide band of voltage (160V-250V). Features built-in thermal overload protection.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcurokt7LKAZOkzHIAaMLvgSvz_RSik9x1RPOFhg07wJwj9sVTEkDQFS0xZbKGCPxo_w3peOH0s23IoIOiAnywZXqjg=w800-h800",
    "features": [
      "Wide Voltage Range",
      "Thermal Protection",
      "Compact Design",
      "Low Maintenance"
    ],
    "specs": {
      "Flow": "63 LPM",
      "Head": "45 m",
      "Power": "1 HP"
    },
    "inStock": true
  },
  {
    "id": "wilo-mhil-twin",
    "name": "Horizontal twin pump booster (SS impeller) - MHIL / MHI -",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Factory assembled system with control panel. Automatic pump cascading and alteration.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuqmXIDsk4FZEgsMafWJh0uFh039vaA_KeZv0bcoeXjlVus6Igbc5ERsYPNMreGuvVw7CdO4b1k2PAmLktiBtrjfgA=w800-h800",
    "features": [
      "Twin Pump System",
      "Automatic Cascading",
      "Control Panel Included",
      "Dry Run Protection"
    ],
    "specs": {
      "Flow": "430 LPM",
      "Head": "65 m",
      "Type": "Multistage SS"
    },
    "inStock": true
  },
  {
    "id": "wilo-wbw4-sub",
    "name": "Borewell submersible pumpset 100 mm - WBW4- Water filled",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "100mm borewell submersible pumpset with high grade engineered polymer virgin noryl.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcup0o47YmnvAC6v_WRRCZbboEFCSY9WlsB0E3ltSsZBNiMMK7nAST6mji3eCl7bPmqdgL0zn1iIPfGiTgiF-wk_vDg=w800-h800",
    "features": [
      "100mm Design",
      "High Head 1142 ft",
      "Sand Resistant",
      "Wide Voltage Range"
    ],
    "specs": {
      "Size": "100mm",
      "Head": "Up to 1142 ft",
      "Power": "Up to 5 HP"
    },
    "inStock": true
  },
  {
    "id": "wilo-whs-sm",
    "name": "Wilo Self-priming high suction pumpset - WHS S / WHS M",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "High suction lift up to 8.5 m at 240V. Features single shaft for pump & motor for correct alignment.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuofeMTCOFAaccPHD00d8yBFEhsJlpyPAzXyDL2FJq2EiXcnM5vr6xORCUA0JA7pj7uK9pLeKypanojl2s5MhbrS7w=w800-h800",
    "features": [
      "8.5m Suction Lift",
      "Single Shaft Design",
      "Mech Seal",
      "TEFC Motor"
    ],
    "specs": {
      "Suction": "8.5 m",
      "Flow": "53 LPM",
      "Head": "42 m"
    },
    "inStock": true
  },
  {
    "id": "vg-vcsw-jet",
    "name": "VCSW Series (Self-priming centrifugal jet)",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Increased vertical suction capacity up to 9 m. Self-priming capabilities that ensure improved efficiency.",
    "image": "https://www.vguard.in/uploads/product/vcsw-sm.jpg",
    "features": [
      "9m Suction Capacity",
      "Self-priming",
      "Noryl Impellers",
      "12 months warranty"
    ],
    "specs": {
      "Type": "Jet Centrifugal",
      "Suction": "9m",
      "Insulation": "B-Class"
    },
    "inStock": true
  },
  {
    "id": "vg-vbs2-sub",
    "name": "VBS2 Series / BOREWELL SUBMERSIBLE PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Water cooled borewell submersible pumpset. Features high quality alloy steel motor shaft and energy efficient motor.",
    "image": "https://www.vguard.in/uploads/product/4-vbs2-sereis-sm.jpg",
    "features": [
      "Water Cooled",
      "Alloy Steel Shaft",
      "Energy Efficient",
      "Durable Design"
    ],
    "specs": {
      "Type": "Borewell Submersible",
      "Size": "100mm",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vos-openwell",
    "name": "VOS & VOSS Series / OPEN WELL SUBMERSIBLE PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Water cooled open well submersible pumpset. Ideal for lifting water from open wells or tanks.",
    "image": "https://www.vguard.in/uploads/product/vos-voss-sm.jpg",
    "features": [
      "Water Cooled",
      "Open Well Application",
      "High Flow",
      "Robust Construction"
    ],
    "specs": {
      "Type": "Open Well Submersible",
      "Phase": "1 Phase",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-fountain-pump",
    "name": "Fountain Pumps / FEATURED PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Specialized pumps for fountain applications. Features compact design and efficient operation.",
    "image": "https://www.vguard.in/uploads/product/featured-pumps-sm.jpg",
    "features": [
      "Fountain Application",
      "Compact Design",
      "Silent Operation",
      "Easy Maintenance"
    ],
    "specs": {
      "Type": "Fountain Pump",
      "Application": "Decorative",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-solar-aux-pro",
    "name": "V Guar Solar Water Heaters-WIN-HOT (AUX)-PRO SERIES",
    "brand": "V-Guard",
    "category": "Solar Water Heaters",
    "description": "Premium solar water heater that does not require an air vent. Features 3 layered vacuum tubes made from Borosilicate.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoxSgMfNZZ8Lnw85fv0BQSimEAN0QYnHDqpp9IIe1xczzNLo3gDEsgM3z8VASTYhuwloU9X52KN6b4E9HdQs0ZUdg=w800-h800",
    "features": [
      "No Air Vent Required",
      "SS 304 L Inner Tank",
      "3 Layered Vacuum Tubes",
      "5 Years Warranty"
    ],
    "specs": {
      "Series": "AUX-PRO",
      "Capacity": "100-200L",
      "Material": "Stainless Steel"
    },
    "inStock": true
  },
  {
    "id": "zb-zenora-ro-uf",
    "name": "ZENORA RO + UF + MB Water Purifier",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "7-stage purification with World-Class RO Membrane and Advanced Hollow-Fiber UF Membrane for safe drinking water.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuqhr0igLQxJ5c_etnSB7d4yUr1LuaXtx934t0C5Io8PaOmBRRqWLn4eKK0Cm93g-IuNOYjvs0BtItOU4mXIW4lc6g=w800-h800",
    "features": [
      "7 Stage Purification",
      "Hollow-Fiber UF",
      "7L Storage",
      "LED Indicators"
    ],
    "specs": {
      "Type": "RO + UF + MB",
      "TDS Removal": "Up to 2000ppm",
      "Warranty": "1 Year"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp150",
    "name": "V Guard Domestic Heat Pump Water Heater - V-HP 150",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Domestic",
    "description": "Advanced technology to provide consistent hot water while minimizing energy consumption. 150-liter model designed for residential needs.",
    "image": "/products/vg-hp-domestic-cover.webp",
    "features": [
      "150L Capacity",
      "High Energy Savings",
      "Advanced Technology",
      "Reliable Performance"
    ],
    "specs": {
      "Capacity": "150L",
      "Type": "Air Source",
      "Application": "Residential"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-commercial",
    "name": "V Guard Commercial Heat Pump Water Heater Series",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "Designed for commercial environments such as hospitals, swimming pools, hotels, and resorts. Constant temperature output 55-60Â°C.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "High Capacity",
      "Constant Temp 55-60Â°C",
      "Easy Installation",
      "Commercial Grade"
    ],
    "specs": {
      "Type": "ASHPWH",
      "Application": "Industrial/Commercial",
      "Warranty": "Standard"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp200",
    "name": "V Guard Domestic Heat Pump Water Heater - V-HP 200",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Domestic",
    "description": "Domestic air source heat pump water heater engineered for efficient hot water generation with low power consumption.",
    "image": "/products/vg-hp-domestic-cover.webp",
    "features": [
      "210L tank volume",
      "3.5 kW heating capacity",
      "R410a refrigerant",
      "Backup electric heater included"
    ],
    "specs": {
      "Tank Volume": "210L",
      "Heating Capacity": "3500 W",
      "Rated Power Input": "810 W",
      "COP": "4.32",
      "Max Water Temperature": "60Â°C"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp300",
    "name": "V Guard Domestic Heat Pump Water Heater - V-HP 300",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Domestic",
    "description": "High-capacity domestic heat pump water heater designed for homes requiring greater hot water storage and dependable performance.",
    "image": "/products/vg-hp-domestic-cover.webp",
    "features": [
      "320L tank volume",
      "3.5 kW heating capacity",
      "R410a refrigerant",
      "Enamel coated steel inner tank"
    ],
    "specs": {
      "Tank Volume": "320L",
      "Heating Capacity": "3500 W",
      "Rated Power Input": "810 W",
      "COP": "4.32",
      "Max Water Temperature": "60Â°C"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp500",
    "name": "V Guard Domestic Heat Pump Water Heater - V-HP 500",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Domestic",
    "description": "Large-capacity domestic heat pump water heater suited for higher hot water demand while maintaining energy-efficient operation.",
    "image": "/products/vg-hp-domestic-cover.webp",
    "features": [
      "500L tank volume",
      "5.8 kW heating capacity",
      "R410a refrigerant",
      "2000W backup electric heater"
    ],
    "specs": {
      "Tank Volume": "500L",
      "Heating Capacity": "5800 W",
      "Rated Power Input": "1320 W",
      "COP": "4.38",
      "Max Water Temperature": "60Â°C"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp1t",
    "name": "V Guard Commercial Heat Pump Water Heater - V-HP 1T",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "Commercial air source heat pump for centralized hot water applications in hospitality, healthcare, and institutional projects.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "4.1 kW heating capacity",
      "100 L/h rated hot water",
      "R410a refrigerant",
      "Horizontal airflow direction"
    ],
    "specs": {
      "Model": "V-HP 1T",
      "Heating Capacity": "4.1 kW",
      "Power Input": "0.97 kW",
      "COP": "4.21",
      "Power Supply": "220V/50Hz"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp15t",
    "name": "V Guard Commercial Heat Pump Water Heater - V-HP 1.5T",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "Commercial heat pump water heater for efficient bulk hot water generation with stable performance in varied ambient conditions.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "6.2 kW heating capacity",
      "150 L/h rated hot water",
      "R410a refrigerant",
      "Horizontal airflow direction"
    ],
    "specs": {
      "Model": "V-HP 1.5T",
      "Heating Capacity": "6.2 kW",
      "Power Input": "1.46 kW",
      "COP": "4.26",
      "Power Supply": "220V/50Hz"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp2t",
    "name": "V Guard Commercial Heat Pump Water Heater - V-HP 2T",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "Commercial heat pump water heater designed for medium-capacity hot water applications with energy-efficient performance.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "8.6 kW heating capacity",
      "200 L/h rated hot water",
      "R410a refrigerant",
      "Electronic expansion valve"
    ],
    "specs": {
      "Model": "V-HP 2T",
      "Heating Capacity": "8.6 kW",
      "Power Input": "2.03 kW",
      "COP": "4.24",
      "Power Supply": "220V/50Hz"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp3t",
    "name": "V Guard Commercial Heat Pump Water Heater - V-HP 3T",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "Commercial-grade heat pump water heater suitable for apartments, hotels, and shared hot water systems.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "12.0 kW heating capacity",
      "300 L/h rated hot water",
      "R410a refrigerant",
      "Electronic expansion valve"
    ],
    "specs": {
      "Model": "V-HP 3T",
      "Heating Capacity": "12.0 kW",
      "Power Input": "2.82 kW",
      "COP": "4.25",
      "Power Supply": "220V/50Hz"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp5t",
    "name": "V Guard Commercial Heat Pump Water Heater - V-HP 5T",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "High-capacity commercial heat pump water heater built for demanding hot water loads across commercial facilities.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "21 kW heating capacity",
      "515 L/h rated hot water",
      "R410a refrigerant",
      "Vertical airflow direction"
    ],
    "specs": {
      "Model": "V-HP 5T",
      "Heating Capacity": "21 kW",
      "Power Input": "4.9 kW",
      "COP": "4.29",
      "Power Supply": "380V/3/50Hz"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp6t",
    "name": "V Guard Commercial Heat Pump Water Heater - V-HP 6T",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "Commercial water heating solution optimized for continuous operation and reliable large-volume hot water production.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "28 kW heating capacity",
      "690 L/h rated hot water",
      "R410a refrigerant",
      "Vertical airflow direction"
    ],
    "specs": {
      "Model": "V-HP 6T",
      "Heating Capacity": "28 kW",
      "Power Input": "6.5 kW",
      "COP": "4.28",
      "Power Supply": "380V/3/50Hz"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp10t",
    "name": "V Guard Commercial Heat Pump Water Heater - V-HP 10T",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "Heavy-duty commercial heat pump system for institutional and industrial hot water requirements.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "43 kW heating capacity",
      "1050 L/h rated hot water",
      "R410a refrigerant",
      "Vertical airflow direction"
    ],
    "specs": {
      "Model": "V-HP 10T",
      "Heating Capacity": "43 kW",
      "Power Input": "9.9 kW",
      "COP": "4.34",
      "Power Supply": "380V/3/50Hz"
    },
    "inStock": true
  },
  {
    "id": "vg-hp-vhp15t-commercial",
    "name": "V Guard Commercial Heat Pump Water Heater - V-HP 15T",
    "brand": "V-Guard",
    "category": "Heat Pumps",
    "subCategory": "Commercial",
    "description": "Top-capacity commercial heat pump water heater for large projects requiring dependable hot water output and energy savings.",
    "image": "/products/vg-hp-commercial-cover.webp",
    "features": [
      "55 kW heating capacity",
      "1380 L/h rated hot water",
      "R410a refrigerant",
      "Vertical airflow direction"
    ],
    "specs": {
      "Model": "V-HP 15T",
      "Heating Capacity": "55 kW",
      "Power Input": "12.3 kW",
      "COP": "4.47",
      "Power Supply": "380V/3/50Hz"
    },
    "inStock": true
  },
  {
    "id": "vg-solar-aux",
    "name": "V Guard Solar Water Heaters - WIN-HOT ECO AUX SERIES",
    "brand": "V-Guard",
    "category": "Solar Water Heaters",
    "description": "Efficient and eco-friendly heating solution. Features high density PUF insulation to minimize heat loss and sacrificial anodic protection.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcur0mrLHZB5icM1XnB183dcYf0eYzqmx6Dk5pxYEOShhMs5pBAkzJy8qYqktKCw3enEfQxzVM7gYKrTIzrxm0gMWVg=w800-h800",
    "features": [
      "SS 304 L Inner Tank",
      "PUF Insulation",
      "Anodic Corrosion Protection",
      "Works up to 10m OHT"
    ],
    "specs": {
      "Series": "ECO AUX",
      "Material": "Stainless Steel",
      "Certification": "ISO 9001:2015"
    },
    "inStock": true
  },
  {
    "id": "vg-solar-pro",
    "name": "V Guard Solar Water Heaters-WIN-HOT ECO PRO SERIES",
    "brand": "V-Guard",
    "category": "Solar Water Heaters",
    "description": "Available in 100, 150, and 200 liters. 3 layered borosilicate tubes for maximum heat absorption. Saves power and money.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcureSN6cuyyXPd4OUUtLlgyx6M3FkrgG5lU-W3GK_pwLv4rcx1YN6m461P8CFYmed5cYCZE0LWlMf5o0E3vXEAB2lQ=w800-h800",
    "features": [
      "Borosilicate Tubes",
      "PUF Insulation",
      "SS 304 L Tank",
      "5 Years Warranty"
    ],
    "specs": {
      "Type": "Evacuated Tube",
      "Pressure": "Max 0.4 kg/cm2",
      "Warranty": "5 Years"
    },
    "inStock": true
  },
  {
    "id": "vg-solar-za",
    "name": "V Guard Solar Water Heaters-WIN-HOT ZA SERIES",
    "brand": "V-Guard",
    "category": "Solar Water Heaters",
    "description": "Premium ZA Series solar water heater with advanced heat retention technology. Features Zn Al outer coating for supreme corrosion protection.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcup-Deq-Do7paeTGijYrR6ExAVBDZQCG7RFRiStJtBE9ILdzPBzuhdXcoIWa9618FKwD4vgZpx20FCBmPnULZDQJRA=w800-h800",
    "features": [
      "Zn Al Outer Coating",
      "Sacrificial Anode",
      "AlN-SS-Cu Coating",
      "High Absorption"
    ],
    "specs": {
      "Type": "Evacuated Tube",
      "Capacity": "100-200L",
      "Warranty": "5 Years"
    },
    "inStock": true
  },
  {
    "id": "vg-tru-hot-pro-solar",
    "name": "V-Guard Tru-Hot Pro Solar Water Heater",
    "brand": "V-Guard",
    "category": "Solar Water Heaters",
    "description": "Pressurized solar water heater designed for dependable hot water generation with efficient solar thermal performance.",
    "image": "/products/vg-solar-tru-hot-pro.webp",
    "features": [
      "Solar-powered heating",
      "Pressurized operation",
      "Reliable daily hot water",
      "V-Guard build quality"
    ],
    "specs": {
      "Series": "Tru-Hot Pro",
      "Type": "Pressurized Solar Water Heater",
      "Application": "Residential / Commercial"
    },
    "inStock": true
  },
  {
    "id": "vg-v-hot-al8-pr",
    "name": "V-Guard V-Hot AL-8 PR Pressurized Solar Water Heater",
    "brand": "V-Guard",
    "category": "Solar Water Heaters",
    "description": "Pressurized solar water heater built for efficient solar hot water generation and dependable long-term use.",
    "image": "/products/vg-solar-v-hot-al8-pr.webp",
    "features": [
      "Pressurized system",
      "Solar thermal heating",
      "Durable construction",
      "Suitable for daily use"
    ],
    "specs": {
      "Series": "V-Hot AL-8 PR",
      "Type": "Pressurized Solar Water Heater",
      "Application": "Residential / Commercial"
    },
    "inStock": true
  },
  {
    "id": "zb-rejive-ro",
    "name": "REJIVE RO + UF + HEALTH CHARGER (MINERAL)â€‹",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "7-stage purification with Mineral Health Charger that adds essential minerals like calcium and magnesium, reviving the natural taste of water.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoxC9D3xyp-XyfGvBo7Z5fNTM9OONgYXl7vWGoxaRbHV5Mh2AfoqZEqItcpSyglOIEgL3qqdY2lyDP2hLaQdogs2A=w800-h800",
    "features": [
      "7 Stage Purification",
      "Mineral Health Charger",
      "Suitable for up to 2000ppm TDS",
      "6.5L Storage"
    ],
    "specs": {
      "Type": "RO + UF",
      "Installation": "Wall Mount",
      "Warranty": "1 Year Comprehensive"
    },
    "inStock": true
  },
  {
    "id": "zb-zenora-ro-uv",
    "name": "ZENORA RO + UV + MB Water Purifier",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "8-stage purification with World Class RO Membrane and Next Generation UV Chamber for the purest drinking water.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcup7arrZZDASvjTZWZNrncP6S5eZWWXsAzZI0UaEJecyb6254uJEMJY-yRw4S-cL8wW5Hc0XCRiDKu-sMIfYmdspiA=w800-h800",
    "features": [
      "8 Stage Purification",
      "UV Sterilization",
      "7L Large Storage",
      "LED Indicators"
    ],
    "specs": {
      "Type": "RO + UV + MB",
      "TDS Removal": "Up to 2000ppm",
      "Mounting": "Wall/Tabletop"
    },
    "inStock": true
  },
  {
    "id": "zb-ignite-hot-normal",
    "name": "Ignite Hot & Normal RO / UF+UV",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "Hot and normal water purifier range available in RO and UF+UV variants. It provides purified water at hot, warm, and normal/cold dispensing modes from a single space-saving appliance.",
    "image": "/products/water-treatment/ignite-hot-normal-ro-uf-uv.webp",
    "features": [
      "RO or UF+UV variants",
      "Hot, warm, and normal/cold dispensing",
      "Online continuous-flow configuration",
      "Dry-run heater protection",
      "Overload protection",
      "Single appliance for purification and hot water"
    ],
    "specs": {
      "Variants": "Ignite Hot & Normal RO (HN2 Series) and Ignite Hot & Normal UF+UV (HN2 Series)",
      "Purification Technology": "RO (for RO variant) or UF+UV (for UF+UV variant)",
      "Water Dispensing": "Hot water, warm water, and normal/cold water dispensing modes",
      "Online Availability": "Available in Online (continuous flow) configuration",
      "Safety": "Dry-run protection for heater; overload protection",
      "Application": "Modern kitchens, offices, and homes requiring both purification and instant hot water",
      "Key Benefits": "Eliminates need for separate water heater; single appliance provides purified water at all temperatures; space-saving design"
    },
    "inStock": true
  },
  {
    "id": "zb-kitchenmate-ro",
    "name": "Kitchenmate RO+ESS (Under the Sink)",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "Under-the-sink RO + ESS purifier with 7-stage purification, 8-litre pressurized HN tank, and long-reach faucet. ESS technology provides post-RO microbiological protection without separate UV or UF stage.",
    "image": "/products/water-treatment/kitchenmate-ro-ess-under-the-sink.webp",
    "features": [
      "RO + ESS Active Silver purification",
      "7-stage system",
      "8-litre pressurized HN tank",
      "9 litres/hour dispensing flow",
      "Under-sink installation",
      "Auto tank fill"
    ],
    "specs": {
      "Purification Technology": "RO + ESS (Electrolytic Sanitizing System â€” Active Silver Technology)",
      "Purification Stages": "7 stages",
      "Dispensing Flow Rate": "9 litres/hour",
      "Storage Capacity": "8 litres (Hydropneumatic / HN Tank for pressurized water)",
      "RO Membrane": "1810 Ã— 1 type",
      "Carbon Filter": "Bacteriostatic Activated Carbon",
      "Sediment Filter": "Filter bag + Hi-Q filtration with ACF",
      "Installation": "Under-the-sink; only long-reach faucet visible on platform",
      "Auto Tank Fill": "Yes â€” purifier never runs out of pure water",
      "Post-RO Protection": "ESS Technology provides complete microbiological protection post-RO without separate UV or UF stage",
      "Standards": "USEPA and IS 10500 certified"
    },
    "inStock": true
  },
  {
    "id": "zb-as8-softener",
    "name": "Autosoft-8",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Softeners",
    "description": "High-capacity 8000 LPH automatic softener for large homes, apartment complexes, and small industries. It replaces calcium and magnesium ions with sodium ions to deliver scale-free water across the premises.",
    "image": "/products/water-treatment/autosoft-8.webp",
    "features": [
      "8000 LPH flow rate",
      "Timer or volume based automatic regeneration",
      "Corrosion-resistant tanks",
      "Low water and salt usage",
      "Large home and apartment use",
      "Protects appliances and plumbing"
    ],
    "specs": {
      "Flow Rate": "8000 LPH (8 mÂ³/hour)",
      "Technology": "Ion Exchange Resin â€” replaces calcium and magnesium ions with sodium ions",
      "Regeneration Type": "Timer-based or volume-based automatic regeneration",
      "Construction": "Corrosion-resistant tanks for long-term durability",
      "Maintenance": "Simple and hassle-free; only periodic refilling of salt tank required",
      "Application": "Large homes, big apartment complexes, small industries",
      "Key Benefits": "Soft, scale-free water for entire premises; protects all water-based appliances; improves skin and hair health; eco-friendly â€” uses minimal water and salt during regeneration"
    },
    "inStock": true
  },
  {
    "id": "zb-bathroom-softener",
    "name": "Mini Soft Bathroom Softener",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Softeners",
    "description": "Point-of-use bathroom softener designed to reduce hardness at the shower, geyser inlet, washing machine, or laundry point. It uses ion exchange resin media and helps protect skin, hair, fabric, bathroom fittings, and appliances from hard-water scale.",
    "image": "/products/water-treatment/mini-soft-bathroom-softener.webp",
    "features": [
      "Point-of-use hardness reduction",
      "Ion exchange resin media",
      "Wall-mounted installation",
      "Manual salt regeneration",
      "Reduces hard-water scale",
      "Helps reduce soap and shampoo consumption"
    ],
    "specs": {
      "Type": "Point-of-Use (POU) Softenizer",
      "Technology": "Ion Exchange Resin Media",
      "Installation": "Wall-mounted; can be attached directly to geysers, washing machines, or showers",
      "Operation": "Semi-automatic with manual regeneration using salt",
      "Application": "Bathroom, laundry, geyser inlet â€” point-of-use hardness reduction",
      "Key Benefits": "Reduces hair loss and skin ailments caused by hard water; prevents scale on bathroom fittings and appliances; retains fabric colour and reduces soap/shampoo consumption"
    },
    "inStock": true
  },
  {
    "id": "zb-eco-smart-ro-v2",
    "name": "Eco Smart RO 50LPH to 500LPH",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Commercial RO",
    "description": "Scalable High Recovery RO system for 50 to 500 LPH output with ESS Active Silver Technology and up to 70% water recovery. Designed for malls, restaurants, hospitals, factories, and institutions.",
    "image": "/products/water-treatment/eco-smart-ro-50lph-to-500lph.webp",
    "features": [
      "50 LPH to 500 LPH output range",
      "Up to 70% water recovery",
      "NOVA pre-treatment filter",
      "Automatic ESS tank sanitization every 24 hours",
      "Visual maintenance alerts",
      "Low operating cost"
    ],
    "specs": {
      "Purification Technology": "HRR (High Recovery RO) + ESS Active Silver Technology",
      "Output Capacity": "50 LPH to 500 LPH (scalable range)",
      "Water Recovery": "Up to 70% â€” approximately 3Ã— higher than conventional RO systems",
      "NOVA Filter": "Proprietary pre-treatment filter that prevents membrane fouling and scaling, enabling high water recovery",
      "Tank Sanitization": "Automatic ESS sanitization every 24 hours",
      "Smart Alerts": "Visual alert indicators for maintenance, filter change, and system performance monitoring",
      "Application": "Malls, multiplexes, restaurants, hospitals, factories, institutions",
      "Key Benefits": "Significantly less water wastage; continuous high-volume output; low operating cost due to high recovery efficiency"
    },
    "inStock": true
  },
  {
    "id": "zb-indromatic-ro",
    "name": "Indromatic RO Purifiers",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Commercial RO",
    "description": "Industrial-grade automatic RO purifiers designed for high-volume commercial water purification needs.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2024/08/imgpsh_fullsize_anim-27.png-1-300x300.png",
    "features": [
      "Industrial Grade",
      "Automatic Operation",
      "High Volume",
      "Robust Performance"
    ],
    "specs": {
      "Type": "Industrial RO",
      "Operation": "Automatic",
      "Capacity": "High Volume"
    },
    "inStock": true
  },
  {
    "id": "zb-ultra-uv",
    "name": "ZeroB ULTRA UV",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "UV Purifiers",
    "description": "Compact and efficient UV + UF water purifier with dual-layer purification that removes bacteria, viruses, and invisible impurities. Features a detachable 6-litre storage tank, smart LED indicators, wall-mountable design, and low power consumption.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2025/06/ZeroB-ULTRA-UV-300x300.webp",
    "features": [
      "UV + UF Purification",
      "6L Detachable Tank",
      "Smart LED Indicators",
      "Low Power Consumption"
    ],
    "specs": {
      "Type": "UV + UF",
      "Storage": "6 Litres",
      "MRP": "â‚¹7,492"
    },
    "inStock": true
  },
  {
    "id": "zb-uv-lite",
    "name": "ZeroB UV Lite",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "UV Purifiers",
    "description": "Multi-stage UV water purifier with an electronics circuit that allows water to flow only when the UV lamp is ON â€” ensuring pure or no water. Includes sediment filter, carbon filter, and UV purification.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2025/06/ZeroB-ULTRA-UV-300x300.webp",
    "features": [
      "UV Lamp Sensing",
      "Multi-stage Filtration",
      "Space-saving Design",
      "Wall Mountable"
    ],
    "specs": {
      "Type": "UV Purifier",
      "Filters": "Sediment, Carbon, UV",
      "Installation": "Wall Mount"
    },
    "inStock": true
  },
  {
    "id": "zb-uv-grande-silver",
    "name": "ZeroB UV Grande (UV + Active Silver Technology)",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "UV Purifiers",
    "description": "Commercial-grade UV purifier with Active Silver Technology for additional antibacterial protection. Ideal for larger households and offices requiring high-volume purified water.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2023/08/uv-grande-1-300x300.png",
    "features": [
      "Active Silver Technology",
      "Commercial Grade",
      "High Volume",
      "Antibacterial Protection"
    ],
    "specs": {
      "Type": "UV + Active Silver",
      "Application": "Large Households/Offices"
    },
    "inStock": true
  },
  {
    "id": "zb-uv-grande-2x",
    "name": "UV Grande 2X UV+UF",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "UV Purifiers",
    "description": "UV + UF purifier with 5 to 6 purification stages, an 11W UV lamp, detachable 6-litre tank, and smart LED indicators. Suitable for municipal and pre-treated water sources.",
    "image": "/products/water-treatment/uv-grande-2x-uv-uf.webp",
    "features": [
      "UV + UF purification",
      "5 to 6 stages",
      "6-litre detachable tank",
      "11W UV lamp",
      "LED smart indicators",
      "Wall-mounted kitchen-saving design"
    ],
    "specs": {
      "Purification Technology": "UV + UF (Ultra-Filtration)",
      "Purification Stages": "5 to 6 stages",
      "Storage Tank": "6 litres detachable tank (easy cleaning and maintenance)",
      "UV Lamp": "11 Watt â€” next-gen UV that deactivates bacteria and viruses",
      "UF Membrane": "Removes microbes and prevents particulate buildup on the UV lamp's quartz glass (prevents shielding effect)",
      "Indicators": "LED Smart Indicators â€” Power ON, Process ON, Tank Full",
      "Mounting": "Wall-mounted to save kitchen counter space",
      "Suitable For": "Municipal corporation water and pre-treated water sources",
      "Standards": "Certified to USEPA and IS 10500 drinking water standards"
    },
    "inStock": true
  },
  {
    "id": "zb-kitchenmate-uv-new",
    "name": "New Kitchenmate UV (Under the Sink)",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "UV Purifiers",
    "description": "Compact UV + UF under-the-sink purifier with long-reach faucet and electronic UV lamp monitoring. Designed for modular kitchens and homes with limited counter space.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2022/09/New-Kitchenmate-UV-Under-the-Sink-Purifier_01.png",
    "features": [
      "UV + UF under-sink system",
      "Long-reach faucet",
      "Instant purification",
      "Electronic UV lamp monitoring",
      "Auto flow stop on UV failure",
      "Ideal for modular kitchens"
    ],
    "specs": {
      "Purification Technology": "UV + UF under-the-sink system",
      "Installation": "Under-the-sink; compact design with long-reach faucet on platform",
      "Operation": "Instant purification; SMPS ensures consistent performance during voltage fluctuations",
      "Safety": "Electronic UV lamp monitoring â€” water flow stops automatically if lamp fails",
      "Standards": "USEPA and IS 10500 compliant",
      "Suitable For": "Modular kitchens; ideal for homes with limited counter space"
    },
    "inStock": true
  },
  {
    "id": "zb-kitchenmate-uv-2lpm",
    "name": "Kitchenmate UV (Under the Sink)",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "UV Purifiers",
    "description": "Under-the-sink UV purifier with instant purification and 2 LPM flow. Only the faucet remains visible on the kitchen platform, keeping counter space free.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2020/03/ZeroB-Kitchenmate-UV-Under-the-Sink-2LPM_01-Photoroom.png",
    "features": [
      "Under-the-sink UV purifier",
      "2 LPM flow rate",
      "Instant purification",
      "UV lamp fail-safe flow stop",
      "SMPS voltage fluctuation protection",
      "Space-saving faucet-only design"
    ],
    "specs": {
      "Purification Technology": "UV with multi-stage filtration",
      "Installation": "Under-the-sink; only faucet visible on kitchen platform â€” saves counter space",
      "Flow Rate": "2 LPM (litres per minute)",
      "Operation": "Instant purification â€” no waiting time; SMPS for stable performance during voltage fluctuations",
      "Safety": "Water flows only when UV lamp is confirmed ON; flow auto-stops if UV lamp fails",
      "Standards": "Meets USEPA and IS 10500 drinking water standards"
    },
    "inStock": true
  },
  {
    "id": "zb-uv-grande-4l",
    "name": "ZeroB UV Grande 4 Ltr",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "UV Purifiers",
    "description": "UV water purifier with a 4-litre storage capacity, designed for compact homes requiring reliable UV-based biological purification for everyday drinking water needs.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2023/08/uv-grande-1-300x300.png",
    "features": [
      "4L Storage Capacity",
      "Compact Design",
      "Biological Purification",
      "Reliable UV"
    ],
    "specs": {
      "Type": "UV Purifier",
      "Storage": "4 Litres",
      "Application": "Compact Homes"
    },
    "inStock": true
  },
  {
    "id": "zb-magna-plus",
    "name": "Magna Plus RO+UV+UF",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "Triple-X purifier combining RO, UV, and UF across 7 purification stages. It removes dissolved salts, microbes, heavy metals, pesticides, and harmful chemicals while offering a detachable 6-litre tank.",
    "image": "/products/water-treatment/magna-plus-ro-uv-uf.webp",
    "features": [
      "RO + UV + UF purification",
      "7-stage purification",
      "10 litres/hour flow rate",
      "6-litre detachable tank",
      "90â€“95% salt rejection",
      "IS 10500 and USEPA certified"
    ],
    "specs": {
      "Purification Technology": "Triple-X: RO + UV + UF",
      "Purification Stages": "7 stages",
      "Purification Flow Rate": "10 litres/hour",
      "Storage Tank": "6 litres (detachable, transparent, washable)",
      "Water Recovery": "40â€“50%",
      "Salt Rejection": "90â€“95%",
      "Dimensions (L Ã— W Ã— H)": "28 Ã— 20 Ã— 37 cm",
      "Indicators": "LED Smart Indicators â€” Power ON, Process ON, Tank Full",
      "Mounting": "Wall-mounted",
      "Standards": "IS 10500 and USEPA certified",
      "What it Removes": "Bacteria, viruses, heavy metals (arsenic, lead, fluoride), excess dissolved salts, pesticides, and harmful chemicals"
    },
    "inStock": true
  },
  {
    "id": "zb-uv-grande-plus",
    "name": "UV Grande Plus (UV + Active Silver Technology)",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "UV Purifiers",
    "description": "UV + ESS purifier with Active Silver Technology to prevent microbial reactivation and recontamination for up to 7 days after UV purification.",
    "image": "/products/water-treatment/uv-grande-plus-uv-active-silver-technology.webp",
    "features": [
      "UV + ESS Active Silver purification",
      "5 to 6 stages",
      "6-litre detachable tank",
      "Prevents microbial reactivation",
      "LED smart indicators",
      "USEPA and IS 10500 certified"
    ],
    "specs": {
      "Purification Technology": "UV + ESS (Electrolytic Sanitizing System â€” Active Silver Technology)",
      "Purification Stages": "5 to 6 stages",
      "Storage Tank": "6 litres detachable tank",
      "ESS Technology": "Active Silver releases ions post-UV purification; prevents microbial reactivation and recontamination for up to 7 days",
      "Water Purity Equivalent": "Equivalent to water boiled for 25 minutes (ESS + UV combined)",
      "Indicators": "LED Smart Indicators",
      "Mounting": "Wall-mounted",
      "Suitable For": "Municipal and tank (stored) water sources",
      "Standards": "USEPA and IS 10500 certified"
    },
    "inStock": true
  },
  {
    "id": "zb-icy-hot-dispensers",
    "name": "Icy Hot Specialized Range of Dispensers",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Dispensers",
    "description": "Multi-function hot and cold water dispensers for commercial spaces â€” available in Neo, Jumbo, and Pro variants for different capacity requirements.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2024/08/imgpsh_fullsize_anim-23.png-1-300x300.png",
    "features": [
      "Hot & Cold Water",
      "Multiple Variants (Neo, Jumbo, Pro)",
      "Commercial Design",
      "High Capacity"
    ],
    "specs": {
      "Type": "Water Dispenser",
      "Variants": "Neo, Jumbo, Pro",
      "Water Temp": "Hot & Cold"
    },
    "inStock": true
  },
  {
    "id": "zb-pre-treatment-filters",
    "name": "Pre Treatment Filters",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Filters",
    "description": "Pre-treatment solutions including Manual Softener, Carbon Filter, and Sand Filter to prepare water before main purification stages.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2023/08/imgpsh_fullsize_anim-28-min-300x300.png",
    "features": [
      "Manual Softener",
      "Carbon Filter",
      "Sand Filter",
      "Multi-Stage Pre-treatment"
    ],
    "specs": {
      "Type": "Pre-Treatment",
      "Components": "Softener, Carbon, Sand Filters"
    },
    "inStock": true
  },
  {
    "id": "zb-lab-q",
    "name": "Lab Q",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Laboratory Systems",
    "description": "High-purity laboratory-grade water purification system designed for scientific and research applications.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2024/08/lab-q-spectra-1-300x300.png",
    "features": [
      "High Purity",
      "Laboratory Grade",
      "Scientific Applications",
      "Research Ready"
    ],
    "specs": {
      "Type": "Lab Water System",
      "Grade": "High Purity",
      "Application": "Scientific/Research"
    },
    "inStock": true
  },
  {
    "id": "zb-integrated-dispensers",
    "name": "Integrated Water Dispensers / Coolers",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Dispensers",
    "description": "All-in-one RO and UV water coolers and dispensers that purify and dispense chilled drinking water â€” ideal for offices, schools, and public spaces.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2024/08/imgpsh_fullsize_anim-4-300x300.png",
    "features": [
      "Integrated RO + UV",
      "Water Cooler",
      "Chilled Water",
      "Public Space Friendly"
    ],
    "specs": {
      "Type": "Integrated Cooler",
      "Purification": "RO + UV",
      "Application": "Offices/Schools"
    },
    "inStock": true
  },
  {
    "id": "zb-commercial-ro-skid",
    "name": "Commercial RO Purifiers",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Commercial RO",
    "description": "Heavy-duty commercial RO purifiers built for large-scale industrial and institutional water treatment requirements.",
    "image": "https://www.zerobonline.com/wp-content/uploads/2020/03/skid-ro-water-purifier-300x300.png",
    "features": [
      "Heavy Duty",
      "Large Scale",
      "Industrial/Institutional",
      "Skid Mounted"
    ],
    "specs": {
      "Type": "Skid RO",
      "Scale": "Industrial",
      "Application": "Institutional"
    },
    "inStock": true
  },
  {
    "id": "wilo-pw-booster",
    "name": "Peripheral inline booster - PW 122 / PW 175 / PW 252",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "Boosting water pressure at taps and showers. Features self-priming function and automatic operation with thermal protection.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcupHBswpSM3PLTLM42UnvxTFz3bnlw8IrzHGBEN-N9xffkvB4qF6SYEjpedliD0L4m8KyLRXx4hdNF-49MG_LUMe9Q=w800-h800",
    "features": [
      "Self Priming",
      "Automatic Operation",
      "Thermal Protector",
      "Efficient Cooling"
    ],
    "specs": {
      "Flow": "40 LPM",
      "Head": "45 mts",
      "Technology": "German"
    },
    "inStock": true
  },
  {
    "id": "wilo-pd300-dewatering",
    "name": "De-watering (Polypropylene) pump - PD 300",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Corrosion-resistant polypropylene de-watering pump for building basements and drainage to prevent flooding.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcur69veEdL4xV9osUX32M9Cr09GAtGVnXMnD9_X0u3JKIf93OQaCKfovtPi-l98K20JcS31lUWeqjL3R-YARW2nHzg=w800-h800",
    "features": [
      "Turbulator (TMW)",
      "Minimal residual level 2mm",
      "Float Switch",
      "10m Cable"
    ],
    "specs": {
      "Flow": "160 LPM",
      "Head": "7.5 m",
      "Material": "Polypropylene"
    },
    "inStock": true
  },
  {
    "id": "wilo-sts-sewage",
    "name": "Sewage pump - STS/PDV/TC",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Professional sewage and wastewater pump. Features non-clog impeller and robust construction for residential and commercial drainage.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcupgrerKowPsEoviNX3noPXnQe52egA7taJlMIjFlUV8bpgHWjiwLQms-SbYHznrdUfwywL840F9gJ3pB-Wx22O5hQ=w800-h800",
    "features": [
      "Non-Clog Impeller",
      "IP68 Protection",
      "Float Switch Included",
      "Thermal Protection"
    ],
    "specs": {
      "Flow": "1500 LPM",
      "Head": "32 m",
      "Solid Passage": "35 mm"
    },
    "inStock": true
  },
  {
    "id": "vg-iris-metro",
    "name": "Iris Metro / INSTANT WATER HEATER",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "Compact instant water heater with 2-year product warranty & 5-year inner tank warranty. Ideal for tight spaces.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuqA_FtogDiOFwGp8nZYpl-wjkLK2jQFXvmEO-j2Bg7n_xD57oxD8NVF41fjO2vv-1xUcROqti_boEIP2ze0tdGlwQ=w800-h800",
    "features": [
      "Instant Heating",
      "Rust Proof Body",
      "Energy Efficient",
      "Compact Design"
    ],
    "specs": {
      "Capacity": "1-3L",
      "Warranty": "2 Years",
      "Tank Warranty": "5 Years"
    },
    "inStock": true
  },
  {
    "id": "vg-pebble-insta",
    "name": "PEBBLE INSTA / INSTANT WATER HEATER",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "Premium instant water heater with rust-proof ABS outer cover and special PUF insulation to minimize heat loss.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuqKzNl8DaULShvEnPnBhquF0lMSNWlnOe_loMrP2rwekUmjQEbsP3qQ8IIHJ_oSJxES0CPHl7BZJmZp0IMYYhc68Q=w800-h800",
    "features": [
      "ABS Rust Proof Body",
      "PUF Insulation",
      "ISI Marked Element",
      "Multiple Color Panels"
    ],
    "specs": {
      "Type": "Instant",
      "Material": "ABS",
      "Pressure": "High Pressure Compatible"
    },
    "inStock": true
  },
  {
    "id": "vg-contino",
    "name": "CONTINO - TANKLESS WATER HEATER",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "Advanced tankless water heater for continuous hot water supply. Energy efficient and space saving.",
    "image": "/products/electric-geysers/contino.webp",
    "features": [
      "Tankless Design",
      "Continuous Hot Water",
      "Digital Temp Control",
      "Compact Size"
    ],
    "specs": {
      "Type": "Tankless",
      "Power": "3-6 kW",
      "Warranty": "2 Years"
    },
    "inStock": true
  },
  {
    "id": "vg-vinsta",
    "name": "Vinsta / INSTANT WATER HEATER (1 3 LITRES)",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "Reliable instant water heater with high quality heating element and rust proof body.",
    "image": "https://www.vguard.in/uploads/product/vinsta-sm.jpg",
    "features": [
      "Instant Heating",
      "Rust Proof Body",
      "ISI Marked Element",
      "Safety Valve"
    ],
    "specs": {
      "Capacity": "1-3L",
      "Warranty": "2 Years",
      "Pressure": "6.5 Bar"
    },
    "inStock": true
  },
  {
    "id": "vg-maha-insta",
    "name": "V-Guard MAHA Instate Series 3 L & 5 L",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "Compact instant water heater series available in 3L and 5L capacities for quick hot water delivery.",
    "image": "/products/electric-geysers/maha-instate.webp",
    "features": [
      "3L & 5L options",
      "Instant heating",
      "Compact design",
      "Suitable for kitchens and bathrooms"
    ],
    "specs": {
      "Series": "MAHA Instate",
      "Type": "Instant Water Heater",
      "Capacity": "3L / 5L"
    },
    "inStock": true
  },
  {
    "id": "vg-ec-pro-storage",
    "name": "V-Guard EC PRO Storage Series 10 â€“ 100 L",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "Storage water heater series designed for efficient daily hot water use across multiple capacity options.",
    "image": "/products/electric-geysers/ec-pro-storage.webp",
    "features": [
      "Storage water heater",
      "10L to 100L range",
      "Reliable hot water supply",
      "Designed for household use"
    ],
    "specs": {
      "Series": "EC PRO",
      "Type": "Storage Water Heater",
      "Capacity": "10L - 100L"
    },
    "inStock": true
  },
  {
    "id": "vg-valco-storage",
    "name": "V-Guard VALCO Storage Series 6,10,15 & 25 L",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "Storage geyser series available in multiple capacities for residential hot water requirements.",
    "image": "/products/electric-geysers/valco-storage.webp",
    "features": [
      "6L, 10L, 15L & 25L options",
      "Storage type",
      "Reliable heating",
      "Residential use"
    ],
    "specs": {
      "Series": "VALCO",
      "Type": "Storage Water Heater",
      "Capacity": "6L / 10L / 15L / 25L"
    },
    "inStock": true
  },
  {
    "id": "vg-luxecube-storage",
    "name": "V-Guard LUXECUBE Storage Series 10, 15 & 25 L",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "LUXECUBE storage water heater series with compact styling and multiple household-friendly capacities.",
    "image": "/products/electric-geysers/luxecube-storage.webp",
    "features": [
      "10L, 15L & 25L options",
      "Storage type",
      "Compact styling",
      "Daily use ready"
    ],
    "specs": {
      "Series": "LUXECUBE",
      "Type": "Storage Water Heater",
      "Capacity": "10L / 15L / 25L"
    },
    "inStock": true
  },
  {
    "id": "vg-luxecube-smart-storage",
    "name": "V-Guard LUXECUBE SMART Storage Series 15 & 25 L",
    "brand": "V-Guard",
    "category": "Water Heaters",
    "description": "Smart storage water heater series with 15L and 25L variants for convenient household hot water usage.",
    "image": "/products/electric-geysers/luxecube-smart-storage.webp",
    "features": [
      "15L & 25L options",
      "Smart storage heater",
      "Reliable heating",
      "Modern design"
    ],
    "specs": {
      "Series": "LUXECUBE SMART",
      "Type": "Storage Water Heater",
      "Capacity": "15L / 25L"
    },
    "inStock": true
  },
  {
    "id": "zb-softener-as1",
    "name": "Autosoft-1",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Softeners",
    "description": "Fully automatic 1000 LPH water softener for individual homes and bathrooms in hard-water areas. It uses food-grade Purple Resin media and automatic regeneration to reduce scale build-up without manual intervention.",
    "image": "/products/water-treatment/autosoft-1.webp",
    "features": [
      "1000 LPH flow rate",
      "Food-grade Purple Resin media",
      "Fully automatic operation",
      "Timer or volume based regeneration",
      "Protects geysers and washing machines",
      "Improves bathing and laundering experience"
    ],
    "specs": {
      "Flow Rate": "1000 LPH (1 mÂ³/hour)",
      "Technology": "Ion Exchange with Purple Resin Media (food-grade, patent technology)",
      "Operation": "Fully automatic â€” no manual intervention required",
      "Regeneration": "Automatic, timer-based or volume-based",
      "Resin Type": "Food-grade Purple Resin (does not leach harmful chemicals)",
      "Application": "Ideal for individual homes and bathrooms in areas with hard water",
      "Key Benefits": "Eliminates scale build-up in pipes and appliances; extends life of geysers and washing machines; improves bathing, washing, and laundering experience"
    },
    "inStock": true
  },
  {
    "id": "vg-vb1-h1s-lite",
    "name": "VB1-H1S Lite / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Reliable 0.5HP Regenerative Mini Booster Pump designed for domestic pressure boosting. Delivers pressurized water between 1.5 and 2.5 bar, ideal for single bathroom outlets, gardens, and lawn sprinklers.",
    "image": "https://www.vguard.in/uploads/product/vb1-h1s-lite-pump-bg.jpg",
    "features": [
      "99.99% pure super enamelled copper windings",
      "High quality mechanical seal with graphite face",
      "Wide voltage range of operation",
      "Rust-preventive aluminium extruded body",
      "Built-in thermal overload protector",
      "Pressure tank for consistent delivery",
      "Superior quality electrical stampings",
      "Rust-preventive powder-coated castings"
    ],
    "specs": {
      "Power": "0.5 HP",
      "Pressure Range": "1.5 - 2.5 bar",
      "Body Material": "Aluminium Extruded",
      "Windings": "99.99% Pure Copper",
      "Seal Type": "Mechanical with Graphite Face",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vb1-h1s-pro",
    "name": "VB1-H1S Pro / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Intelligent domestic water pump with stepless pressure regulation and water shortage sensor for smart home water management.",
    "image": "https://www.vguard.in/uploads/product/vb1-h1s-pro-pump-bg.jpg",
    "features": [
      "Stepless pressure regulation",
      "Intelligent pressure and flow identification",
      "Water shortage sensor",
      "Energy efficient"
    ],
    "specs": {
      "Type": "Smart Pump",
      "Control": "Intelligent",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-neon-rf150",
    "name": "NEON-RF150 / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Durable domestic pump featuring an aluminium extruded motor body and forged brass impeller for reliable performance.",
    "image": "https://www.vguard.in/uploads/product/neon-rf-150-pump-bg.jpg",
    "features": [
      "Aluminium extruded motor body",
      "Forged brass impeller",
      "High quality alloy steel motor shaft"
    ],
    "specs": {
      "Series": "NEON",
      "Body": "Aluminium",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-aquasmart-plus",
    "name": "AQUASMART+ / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Smart domestic pump with Wi-Fi & Bluetooth connectivity. Control your water supply remotely via smart app or voice commands.",
    "image": "https://www.vguard.in/uploads/product/aquasmart_plus_sm.jpg",
    "features": [
      "Wi-Fi & Bluetooth connectivity",
      "Voice & Smart App-controlled",
      "Dry-run & overload protection"
    ],
    "specs": {
      "Connectivity": "Wi-Fi/Bluetooth",
      "Protection": "Dry-run/Overload",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-aquasmart",
    "name": "AQUASMART / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Futuristic design domestic pump with anti-theft lock and wide voltage range operation for enhanced security and convenience.",
    "image": "https://www.vguard.in/uploads/product/aquasmart_sm.jpg",
    "features": [
      "Anti-theft lock",
      "Futuristic design",
      "Works in wide voltage range"
    ],
    "specs": {
      "Security": "Anti-theft Lock",
      "Design": "Futuristic",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vosv-series-dom",
    "name": "VOSV Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Versatile pump suitable for both Openwell & 150 mm (V6) borewell applications. Features rust-preventive SS body.",
    "image": "https://www.vguard.in/uploads/product/vosv-sereis-sm.jpg",
    "features": [
      "Suitable for Openwell & V6 Borewell",
      "Rust preventive SS BODY",
      "Noryl impeller and diffuser"
    ],
    "specs": {
      "Body": "Stainless Steel",
      "Application": "Openwell/Borewell",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-voso-series-dom",
    "name": "VOSO Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Oil cooled motor domestic pump for prolonged product life. Features double sealed ball bearings for reliability.",
    "image": "https://www.vguard.in/uploads/product/voso-sereis-sm.jpg",
    "features": [
      "Oil cooled motor",
      "Double sealed ball bearings",
      "Highly reliable motor"
    ],
    "specs": {
      "Cooling": "Oil Cooled",
      "Bearings": "Double Sealed",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vbs3-series-dom",
    "name": "75 mm - VBS3 & VBS3AM Series",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Premium quality 75mm borewell submersible pumps with rust-preventive SS body and rigid cast iron housing.",
    "image": "https://www.vguard.in/uploads/product/3-VBS3-sm.jpg",
    "features": [
      "75 mm Pump OD",
      "Rust preventive SS BODY",
      "Rigid built cast iron housing"
    ],
    "specs": {
      "Size": "75mm",
      "Body": "Stainless Steel",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vbs4sam-series-dom",
    "name": "90 mm VBS4SAM Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "High quality alloy steel SS body pump and motor with dynamically balanced copper rotor for superior performance.",
    "image": "https://www.vguard.in/uploads/product/3-5-vbs4sam-sm.jpg",
    "features": [
      "SS body for pump and motor",
      "Rigid cast iron housing",
      "Dynamically balanced copper rotor"
    ],
    "specs": {
      "Size": "90mm",
      "Material": "Stainless Steel",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vbs-series-100-dom",
    "name": "100 mm VBS Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Aluminium rotor model with enhanced low voltage performance and rust-preventive SS body with mat finish.",
    "image": "https://www.vguard.in/uploads/product/4-vbs-sereis-sm.jpg",
    "features": [
      "Enhanced low voltage performance",
      "Rust preventive SS BODY",
      "Rigid cast iron housing"
    ],
    "specs": {
      "Size": "100mm",
      "Rotor": "Aluminium",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vbsr-series-dom",
    "name": "100 mm VBSR & VBSRAM Series",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Energy efficient BEE star rated and ISI models available. Features rust-preventive SS body and rigid cast iron housing.",
    "image": "https://www.vguard.in/uploads/product/4-vbsr-sereis-sm.jpg",
    "features": [
      "Energy efficient BEE star rated",
      "Rust preventive SS BODY",
      "Rigid built cast iron housing"
    ],
    "specs": {
      "Size": "100mm",
      "Efficiency": "BEE Star Rated",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-neon-100-dom",
    "name": "100 mm - NEON Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Rust preventive SS body with mat finish and rigid built cast iron housing parts for long-lasting performance.",
    "image": "https://www.vguard.in/uploads/product/4-neon-series-sm.jpg",
    "features": [
      "Rust preventive SS body",
      "Rigid built cast iron housing",
      "Dynamically balanced copper rotor"
    ],
    "specs": {
      "Size": "100mm",
      "Material": "Stainless Steel",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vbso3-series-dom",
    "name": "75 mm - VBSO3 Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Oil filled borewell submersible pump with food grade paraffin oil and dynamically balanced rotor.",
    "image": "https://www.vguard.in/uploads/product/3-vbso3-sm.jpg",
    "features": [
      "Food grade paraffin oil pre-filled",
      "Dynamically balanced rotor",
      "High quality alloy steel SS body"
    ],
    "specs": {
      "Size": "75mm",
      "Cooling": "Oil Filled",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vbso-series-dom-100",
    "name": "100 mm - VBSO Series (VBSO, VBSOAM)",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Premium oil filled borewell submersible pump with BEE Star rated models available for energy efficiency.",
    "image": "https://www.vguard.in/uploads/product/4-vbso-sereis-sm.jpg",
    "features": [
      "BEE Star rated models available",
      "Food grade paraffin oil pre-filled",
      "High quality alloy steel SS body"
    ],
    "specs": {
      "Size": "100mm",
      "Efficiency": "BEE Star Rated",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-belt-compressor",
    "name": "Belt Driven Compressor Pumps",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Available in twin stage & single stage models. Features lower operation temperature and vibration absorption.",
    "image": "https://www.vguard.in/uploads/product/belt-driven-sm.jpg",
    "features": [
      "Twin stage & single stage available",
      "Lower operation temperature",
      "Vibration absorption"
    ],
    "specs": {
      "Type": "Belt Driven",
      "Stages": "Single/Twin",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-prime-vp",
    "name": "Prime Models VP Series",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "ISI certified energy efficient motor with aluminium extruded motor body for superior heat dissipation.",
    "image": "https://www.vguard.in/uploads/product/prime-models-sm.jpg",
    "features": [
      "ISI certified Energy efficient motor",
      "Aluminum extruded Motor body",
      "TEFC Induction motor"
    ],
    "specs": {
      "Series": "Prime VP",
      "Body": "Aluminium",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-nova-neon-n",
    "name": "NOVA & NEON - N Series",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Economic pumpset with aluminium extruded motor body and high quality alloy steel motor shaft.",
    "image": "https://www.vguard.in/uploads/product/nova-neon-sm.jpg",
    "features": [
      "Economic pumpset",
      "Aluminium extruded motor body",
      "High Quality alloy steel motor shaft"
    ],
    "specs": {
      "Series": "NOVA/NEON-N",
      "Type": "Economic",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vb-series-dom",
    "name": "VB Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Premium quality pump sets with rust preventive aluminium die-casted motor body.",
    "image": "https://www.vguard.in/uploads/product/vb-series-sm.jpg",
    "features": [
      "Rust preventive Aluminum die-casted motor body",
      "Rigid built cast iron castings",
      "Premium quality"
    ],
    "specs": {
      "Series": "VB",
      "Body": "Aluminium Die-cast",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-regen-mini-booster",
    "name": "Regenerative Mini Booster Pumps",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Compact regenerative mini booster pumps for domestic pressure boosting applications.",
    "image": "https://www.vguard.in/uploads/product/mini-booster-pumps-sm.jpg",
    "features": [
      "Premium quality pump sets",
      "Rust preventive Aluminum die casted body",
      "Rigid built cast iron castings"
    ],
    "specs": {
      "Type": "Regenerative",
      "Application": "Booster",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-circulatory-dom",
    "name": "Circulatory Pumps / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "High efficiency inline circulating pump for vibrationless and noiseless operation.",
    "image": "https://www.vguard.in/uploads/product/circulatory-pumps-sm.jpg",
    "features": [
      "High efficiency Inline circulating pump",
      "Vibration less, noiseless operation",
      "Generates constant pressure"
    ],
    "specs": {
      "Type": "Circulatory",
      "Operation": "Noiseless",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vosr-series-dom",
    "name": "VOSR Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Semi premium quality pump sets with BEE 5 star rated models available for energy savings.",
    "image": "https://www.vguard.in/uploads/product/vosr-sereis-sm.jpg",
    "features": [
      "Semi Premium quality",
      "BEE 5 star rated Models available",
      "Rust preventive SS BODY"
    ],
    "specs": {
      "Series": "VOSR",
      "Efficiency": "BEE 5 Star",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-revo-series-dom",
    "name": "REVO Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Optimized motor design with rust preventive SS body and stainless steel hardwares.",
    "image": "https://www.vguard.in/uploads/product/revo-series-sm.jpg",
    "features": [
      "Optimized motor design",
      "Rust preventive SS BODY",
      "Stainless steel hardwares"
    ],
    "specs": {
      "Series": "REVO",
      "Material": "Stainless Steel",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vosk-vosw-dom",
    "name": "VOSK & VOSW / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Pressure-regulating diaphragm for safe pumping with rust-resistant matte stainless steel body.",
    "image": "https://www.vguard.in/uploads/product/vosk_f90_sm.jpg",
    "features": [
      "Pressure-regulating diaphragm",
      "Rust-resistant matte SS body",
      "Noryl impellers"
    ],
    "specs": {
      "Series": "VOSK/VOSW",
      "Material": "Matte SS",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-premium-series-dom",
    "name": "Premium Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Premium quality pump sets with ISI models available, ranging up to 1.5 hp.",
    "image": "https://www.vguard.in/uploads/product/premium-series-sm.jpg",
    "features": [
      "Premium quality pump sets",
      "ISI Models available",
      "Models range up to 1.5 hp"
    ],
    "specs": {
      "Series": "Premium",
      "Power": "Up to 1.5 hp",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-neon-rf130",
    "name": "NEON RF130 / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Reliable domestic pump with aluminium extruded motor body and forged brass impeller for efficient water delivery.",
    "image": "https://www.vguard.in/uploads/product/neon-rf130-pump-bg.jpg",
    "features": [
      "Aluminium extruded motor body",
      "Forged brass impeller",
      "High quality alloy steel motor shaft"
    ],
    "specs": {
      "Series": "NEON",
      "Model": "RF130",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-neon-rh80",
    "name": "NEON RH80 / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Compact and durable domestic pump featuring high-quality alloy steel motor shaft and forged brass impeller.",
    "image": "https://www.vguard.in/uploads/product/neon-rh80-pump-bg.jpg",
    "features": [
      "Aluminium extruded motor body",
      "Forged brass impeller",
      "High quality alloy steel motor shaft"
    ],
    "specs": {
      "Series": "NEON",
      "Model": "RH80",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-nova-series-dom",
    "name": "NOVA Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "Features pressure regulating diaphragm and rust preventive SS body with mat finish for long-lasting performance.",
    "image": "https://www.vguard.in/uploads/product/nova-series-sm.jpg",
    "features": [
      "Pressure regulating diaphragm",
      "Rust preventive SS BODY with mat finish",
      "Engineered plastic Noryl impellers"
    ],
    "specs": {
      "Series": "NOVA",
      "Body": "Stainless Steel",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-neon-revo-series",
    "name": "NEON & REVO Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Economic pumpset series with ISI models available. Revo series offers both normal and low voltage models.",
    "image": "https://www.vguard.in/uploads/product/neon-revo-sm.jpg",
    "features": [
      "Economic pumpset",
      "ISI models available",
      "Normal and Low voltage models in Revo Series"
    ],
    "specs": {
      "Series": "NEON/REVO",
      "Type": "Economic",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-vcsw-series",
    "name": "VCSW Series / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "High performance self-priming pumpset for domestic water supply.",
    "image": "https://www.vguard.in/uploads/product/vcsw_1.jpg",
    "features": [
      "Self-priming",
      "High efficiency",
      "Durable construction"
    ],
    "specs": {
      "Series": "VCSW",
      "Type": "Self Priming",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-neon-series-jet",
    "name": "NEON Series Jet / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Powerful jet pump for domestic applications.",
    "image": "https://www.vguard.in/uploads/product/neon-series-sm.jpg",
    "features": [
      "High pressure",
      "Reliable performance",
      "Robust design"
    ],
    "specs": {
      "Series": "NEON",
      "Type": "Jet",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "vg-neon-100-oil",
    "name": "100mm NEON Series Oil Cooled / DOMESTIC PUMPS",
    "brand": "V-Guard",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Oil cooled 100mm borewell submersible pump for superior motor life.",
    "image": "https://www.vguard.in/uploads/product/4-neon-series2-sm.jpg",
    "features": [
      "Oil cooled motor",
      "SS body",
      "High efficiency"
    ],
    "specs": {
      "Size": "100mm",
      "Cooling": "Oil Cooled",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "zb-alkaline",
    "name": "Hydrolife Health Crafter",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Alkaline Purifiers",
    "description": "RO + ESS + Alkaline Crafter system that produces alkaline and hydrogen-rich water. It uses Minera Logic, patented Alkaline Crafter technology, and HRR water-saving technology for health-focused home use.",
    "image": "/products/water-treatment/hydrolife-health-crafter.webp",
    "features": [
      "RO + ESS + Alkaline Crafter",
      "Alkaline and hydrogen-rich water",
      "Minera Logic TDS-based selection",
      "Patented mineralizer cartridge",
      "HRR water-saving technology",
      "Freestanding direct-dispensing form factor"
    ],
    "specs": {
      "Technology": "RO + ESS (Active Silver) + Alkaline Crafter (patented mineralizer technology)",
      "Output": "Alkaline and hydrogen-rich water",
      "Minera Logic": "Smart device that automatically selects whether to pass water through Alkaline Crafter based on inlet water TDS â€” ensures optimal alkaline and hydrogen levels at all times",
      "Alkaline Crafter": "Patented cartridge â€” enhances alkalizer function by adding optimum minerals, especially for low TDS water",
      "Water Recovery": "HRR Technology â€” 70% water saving compared to conventional RO systems",
      "ESS Technology": "Releases Active Silver ions and Hydroxyl ions â€” completely denaturing paralyzed microbes by disrupting genetic cell walls",
      "Form Factor": "Freestanding â€” can be supported from top or bottom; direct dispensing nozzle on unit",
      "Application": "Home use for health-focused drinking water",
      "Key Benefits": "Antioxidant-rich alkaline water; improves hydration; neutralises free radicals; supports metabolism; India's first alkaline and hydrogen water crafter"
    },
    "inStock": true
  },
  {
    "id": "bw-pool-pump-cx",
    "name": "Bluewave CX Series Pool Circulation Pump",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Pumps & Filtration",
    "description": "High-efficiency pool circulation pump designed for residential and commercial pools. Ensures optimal water flow for crystal-clear pool water with low energy consumption.",
    "image": "https://bluewaveindia.com/wp-content/uploads/2021/11/pump.jpg",
    "features": [
      "Energy-efficient motor",
      "Self-priming design",
      "Corrosion-resistant body",
      "Low noise operation"
    ],
    "specs": {
      "Flow Rate": "Up to 18,000 L/hr",
      "Power": "0.5â€“1.5 HP",
      "Voltage": "230V / 50Hz",
      "Warranty": "12 Months"
    },
    "inStock": true
  },
  {
    "id": "bw-sand-filter-sf",
    "name": "Bluewave SF Series Sand Filter System",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Pumps & Filtration",
    "description": "Top-mount sand filter for effective removal of debris, algae, and fine particles from pool water. Designed for seamless integration with standard pool pumps.",
    "image": "https://bluewaveindia.com/wp-content/uploads/2021/11/sand-fitter.jpg",
    "features": [
      "Multi-port valve (6 positions)",
      "High-grade fibreglass tank",
      "Easy backwash function",
      "Suitable for pools up to 50,000 L"
    ],
    "specs": {
      "Tank Diameter": "400â€“600 mm",
      "Filter Media": "Silica Sand / Glass",
      "Connection": "1.5 inch",
      "Warranty": "18 Months"
    },
    "inStock": true
  },
  {
    "id": "bw-chlorine-tablets",
    "name": "Bluewave Chlorine Tablets (Trichlor 90%)",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Chemicals",
    "description": "Slow-dissolving trichloroisocyanuric acid (TCCA) tablets for continuous pool sanitation. Maintains residual chlorine levels and prevents bacterial growth.",
    "image": "https://5.imimg.com/data5/SELLER/Default/2024/10/459151400/CN/DD/TS/1807731/tcca-90-tablet-500x500.png",
    "features": [
      "90% available chlorine",
      "Slow-dissolving formula",
      "Stabilised against UV degradation",
      "Compatible with floater/skimmer dispensers"
    ],
    "specs": {
      "Active Ingredient": "TCCA 90%",
      "Tablet Size": "200g / 50g",
      "Pack Size": "1 kg / 5 kg",
      "pH": "2.8â€“3.2"
    },
    "inStock": true
  },
  {
    "id": "bw-chlorine-granules",
    "name": "Bluewave Chlorine Granules (Calcium Hypochlorite 70%)",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Chemicals",
    "description": "Fast-dissolving calcium hypochlorite granules for shock treatment and routine chlorination of swimming pools. Rapid sanitisation for high-bather-load pools.",
    "image": "https://5.imimg.com/data5/SELLER/Default/2023/10/355346766/EM/HB/PA/1807731/chlorine-granule-500x500.jpg",
    "features": [
      "70% available chlorine",
      "Fast dissolving",
      "Ideal for shock dosing",
      "Non-stabilised formula"
    ],
    "specs": {
      "Active Ingredient": "Calcium Hypochlorite",
      "Available Chlorine": "70%",
      "Pack Size": "1 kg / 5 kg / 25 kg",
      "Application": "Shock & Routine"
    },
    "inStock": true
  },
  {
    "id": "bw-ph-up",
    "name": "Bluewave pH Up (Sodium Carbonate)",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Chemicals",
    "description": "Granular pH increaser to raise pool water pH to the ideal range of 7.2â€“7.6. Prevents corrosion, eye irritation, and chlorine inefficiency caused by low pH.",
    "image": "https://5.imimg.com/data5/SELLER/Default/2024/10/460800859/KX/ZZ/DI/5789594/ph-plus-chemical-500x500.jpg",
    "features": [
      "Raises pH quickly",
      "Non-hazardous granular form",
      "Compatible with all sanitiser systems",
      "Easy dose calculation"
    ],
    "specs": {
      "Active Ingredient": "Sodium Carbonate",
      "Target pH": "7.2â€“7.6",
      "Pack Size": "1 kg / 5 kg",
      "Dosage": "As per pool volume"
    },
    "inStock": true
  },
  {
    "id": "bw-ph-down",
    "name": "Bluewave pH Down (Sodium Bisulphate)",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Chemicals",
    "description": "Dry acid granules to lower pool water pH to the ideal range. Safer to handle than muriatic acid, with accurate dose control for residential and commercial pools.",
    "image": "https://5.imimg.com/data5/SELLER/Default/2024/11/469320532/UQ/IR/TU/5789594/ph-minus-chemical-500x500.jpg",
    "features": [
      "Lowers pH safely",
      "Dry granular â€” safer than liquid acid",
      "Fast dissolving",
      "Suitable for all pool types"
    ],
    "specs": {
      "Active Ingredient": "Sodium Bisulphate",
      "Target pH": "7.2â€“7.6",
      "Pack Size": "1 kg / 5 kg",
      "Dosage": "As per pool volume"
    },
    "inStock": true
  },
  {
    "id": "bw-algaecide",
    "name": "Bluewave Algaecide (Quat-Free Broad Spectrum)",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Chemicals",
    "description": "Broad-spectrum algaecide for prevention and elimination of green, black, and mustard algae. Non-foaming formula safe for all pool surfaces and equipment.",
    "image": "/products/swimming-pool/bluewave-algaecide.webp",
    "features": [
      "Kills green, black & mustard algae",
      "Non-foaming formula",
      "Compatible with all sanitisers",
      "Weekly maintenance dose"
    ],
    "specs": {
      "Type": "Broad Spectrum",
      "Pack Size": "1 L / 5 L",
      "Dosage": "Weekly maintenance",
      "Compatible": "All pool types"
    },
    "inStock": true
  },
  {
    "id": "bw-clarifier",
    "name": "Bluewave Pool Clarifier & Flocculant",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Chemicals",
    "description": "Dual-action pool clarifier and flocculant that coagulates fine particles and suspended matter for crystal-clear water. Improves filter efficiency and water sparkle.",
    "image": "https://5.imimg.com/data5/SELLER/Default/2022/11/WH/AG/PS/7344707/granular-flocculant-500x500.jpg",
    "features": [
      "Coagulates fine particles",
      "Improves filter efficiency",
      "Fast-acting formula",
      "Suitable for sand & cartridge filters"
    ],
    "specs": {
      "Type": "Clarifier + Flocculant",
      "Pack Size": "500 mL / 1 L",
      "Action": "Fast (4â€“8 hrs)",
      "Dosage": "As per water volume"
    },
    "inStock": true
  },
  {
    "id": "bw-water-test-kit",
    "name": "Bluewave Pool Water Test Kit (5-in-1)",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Accessories",
    "description": "Comprehensive 5-in-1 test kit for monitoring pool water balance. Tests free chlorine, total chlorine, pH, total alkalinity, and cyanuric acid for accurate dosing decisions.",
    "image": "https://bluewaveindia.com/wp-content/uploads/2018/10/test-kit.jpg",
    "features": [
      "Tests 5 key parameters",
      "Colour-coded reagents",
      "100 tests per parameter",
      "Includes easy-read guide"
    ],
    "specs": {
      "Parameters": "Clâ‚‚, pH, TA, CYA",
      "Test Method": "Reagent Drop",
      "Tests per Kit": "100+",
      "Standard": "DPD"
    },
    "inStock": true
  },
  {
    "id": "bw-led-pool-light",
    "name": "Bluewave LED Pool Light (RGB Colour-Changing)",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Accessories",
    "description": "IP68-rated RGB LED underwater pool light for vibrant nighttime illumination. Corrosion-resistant stainless-steel housing, compatible with standard pool niches.",
    "image": "https://5.imimg.com/data5/SELLER/Default/2021/8/WE/LA/BZ/1807731/swimming-pool-led-underwater-light-1000x1000.jpg",
    "features": [
      "IP68 waterproof rating",
      "RGB colour changing",
      "Stainless steel housing",
      "Remote control included"
    ],
    "specs": {
      "Power": "18W / 35W",
      "Voltage": "12V AC/DC",
      "Niche Size": "Standard 4-inch",
      "Warranty": "24 Months"
    },
    "inStock": true
  },
  {
    "id": "bw-solar-cover",
    "name": "Bluewave Solar Blanket / Pool Cover",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Accessories",
    "description": "Bubble-wrap solar blanket that retains pool heat, reduces evaporation by up to 95%, and minimises chemical consumption. Custom-cut to pool shape.",
    "image": "https://5.imimg.com/data5/SELLER/Default/2023/7/326849760/LD/HH/KL/2690456/solar-pool-cover-500x500.jpg",
    "features": [
      "Reduces evaporation by 95%",
      "Retains solar heat",
      "UV stabilised 400-micron bubble film",
      "Custom sizing available"
    ],
    "specs": {
      "Thickness": "400 micron",
      "UV Resistance": "High",
      "Colour": "Blue / Clear",
      "Lifespan": "3â€“5 seasons"
    },
    "inStock": true
  },
  {
    "id": "bw-skimmer-basket",
    "name": "Bluewave Heavy-Duty Skimmer Basket",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Accessories",
    "description": "Replacement skimmer basket in durable ABS plastic for in-ground and above-ground pools. Catches leaves, hair, and large debris before they reach the filter.",
    "image": "https://5.imimg.com/data5/FJ/KZ/DK/SELLER-58286089/pool-basket-skimmer-1000x1000.jpg",
    "features": [
      "Heavy-duty ABS construction",
      "Fine-mesh debris capture",
      "Universal fit for standard skimmers",
      "Easy clip-in installation"
    ],
    "specs": {
      "Material": "ABS Plastic",
      "Compatibility": "Standard skimmer niches",
      "Mesh Size": "Fine",
      "Warranty": "6 Months"
    },
    "inStock": true
  },
  {
    "id": "bw-calcium-hypo",
    "name": "Bluewave Calcium Hypochlorite Granules (65%)",
    "brand": "Bluewave India",
    "category": "Swimming Pool",
    "subCategory": "Pool Chemicals",
    "description": "High-strength calcium hypochlorite granules for super-chlorination (shocking) of pools. Rapidly destroys chloramines, algae, and bacteria for immediate water clarity.",
    "image": "https://5.imimg.com/data5/SELLER/Default/2022/11/JF/IF/MK/7344707/chlorine-shock-500x500.jpg",
    "features": [
      "65% available chlorine",
      "Super-shock treatment",
      "Dissolves rapidly",
      "Raises calcium hardness"
    ],
    "specs": {
      "Active Chlorine": "65%",
      "Form": "Granules",
      "Pack Size": "1 kg / 10 kg / 25 kg",
      "Application": "Shock / Weekly"
    },
    "inStock": true
  },
  {
    "id": "wilo-hmhil504-em-24",
    "name": "Wilo HMHIL504-EM-24",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo HMHIL single pump booster with SS 304 impeller for silent residential and light-commercial water boosting. Designed for bungalow, farmhouse, apartment and hostel pressure applications with hydro-pneumatic tank or electronic control based automatic operation.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcupqjqHWWDpnhDcKam5zyCxGHaxTr26mOvXijhK3zIUugr9-ILtLxDQXm05cSu2JO_DYtS52RLiAZqSGtTBrhfWHUA=w800-h800",
    "features": [
      "Stainless steel impeller",
      "Wetted parts made of stainless steel",
      "Available with hydro-pneumatic tank / electronic control for automatic operation",
      "High-efficiency motor suitable for wide voltage fluctuations",
      "Silent in operation"
    ],
    "specs": {
      "Model": "HMHIL504-EM-24",
      "Power": "1.0 HP",
      "Tank": "24 L",
      "Product Family": "Wilo HMHIL Single Pump Booster",
      "Flow": "Up to 215 LPM",
      "Head": "Up to 67 m",
      "Voltage": "1 Ph ~ 230 V, 50 Hz",
      "Application": "Water boosting in bungalows / farm houses, apartments / hostels",
      "Impeller": "SS 304 stainless steel"
    },
    "inStock": true
  },
  {
    "id": "wilo-hmhil504-em-60",
    "name": "Wilo HMHIL504-EM-60",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo HMHIL single pump booster with SS 304 impeller for silent residential and light-commercial water boosting. Designed for bungalow, farmhouse, apartment and hostel pressure applications with hydro-pneumatic tank or electronic control based automatic operation.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcupqjqHWWDpnhDcKam5zyCxGHaxTr26mOvXijhK3zIUugr9-ILtLxDQXm05cSu2JO_DYtS52RLiAZqSGtTBrhfWHUA=w800-h800",
    "features": [
      "Stainless steel impeller",
      "Wetted parts made of stainless steel",
      "Available with hydro-pneumatic tank / electronic control for automatic operation",
      "High-efficiency motor suitable for wide voltage fluctuations",
      "Silent in operation"
    ],
    "specs": {
      "Model": "HMHIL504-EM-60",
      "Power": "1.0 HP",
      "Tank": "60 L",
      "Product Family": "Wilo HMHIL Single Pump Booster",
      "Flow": "Up to 215 LPM",
      "Head": "Up to 67 m",
      "Voltage": "1 Ph ~ 230 V, 50 Hz",
      "Application": "Water boosting in bungalows / farm houses, apartments / hostels",
      "Impeller": "SS 304 stainless steel"
    },
    "inStock": true
  },
  {
    "id": "wilo-hmhil505-em-24",
    "name": "Wilo HMHIL505-EM-24",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo HMHIL single pump booster with SS 304 impeller for silent residential and light-commercial water boosting. Designed for bungalow, farmhouse, apartment and hostel pressure applications with hydro-pneumatic tank or electronic control based automatic operation.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcupqjqHWWDpnhDcKam5zyCxGHaxTr26mOvXijhK3zIUugr9-ILtLxDQXm05cSu2JO_DYtS52RLiAZqSGtTBrhfWHUA=w800-h800",
    "features": [
      "Stainless steel impeller",
      "Wetted parts made of stainless steel",
      "Available with hydro-pneumatic tank / electronic control for automatic operation",
      "High-efficiency motor suitable for wide voltage fluctuations",
      "Silent in operation"
    ],
    "specs": {
      "Model": "HMHIL505-EM-24",
      "Power": "1.5 HP",
      "Tank": "24 L",
      "Product Family": "Wilo HMHIL Single Pump Booster",
      "Flow": "Up to 215 LPM",
      "Head": "Up to 67 m",
      "Voltage": "1 Ph ~ 230 V, 50 Hz",
      "Application": "Water boosting in bungalows / farm houses, apartments / hostels",
      "Impeller": "SS 304 stainless steel"
    },
    "inStock": true
  },
  {
    "id": "wilo-hmhil505-em-60",
    "name": "Wilo HMHIL505-EM-60",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo HMHIL single pump booster with SS 304 impeller for silent residential and light-commercial water boosting. Designed for bungalow, farmhouse, apartment and hostel pressure applications with hydro-pneumatic tank or electronic control based automatic operation.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcupqjqHWWDpnhDcKam5zyCxGHaxTr26mOvXijhK3zIUugr9-ILtLxDQXm05cSu2JO_DYtS52RLiAZqSGtTBrhfWHUA=w800-h800",
    "features": [
      "Stainless steel impeller",
      "Wetted parts made of stainless steel",
      "Available with hydro-pneumatic tank / electronic control for automatic operation",
      "High-efficiency motor suitable for wide voltage fluctuations",
      "Silent in operation"
    ],
    "specs": {
      "Model": "HMHIL505-EM-60",
      "Power": "1.5 HP",
      "Tank": "60 L",
      "Product Family": "Wilo HMHIL Single Pump Booster",
      "Flow": "Up to 215 LPM",
      "Head": "Up to 67 m",
      "Voltage": "1 Ph ~ 230 V, 50 Hz",
      "Application": "Water boosting in bungalows / farm houses, apartments / hostels",
      "Impeller": "SS 304 stainless steel"
    },
    "inStock": true
  },
  {
    "id": "wilo-hwj-201-em-8",
    "name": "Wilo HWJ-201-EM-8",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo HWJ single pump booster with SS 304 impeller and stainless-steel pump body for compact water transfer and pressure boosting. Suitable for bungalow, farmhouse, apartment and hostel water supply with easy installation and silent operation.",
    "image": "/products/wilo-hwj-models.webp",
    "features": [
      "Stainless steel pump body and impeller",
      "Available with hydro-pneumatic tank / electronic control for automatic operation",
      "High-efficiency motor suitable for wide voltage fluctuations",
      "Anti-rust material",
      "Silent in operation",
      "Easy to carry, install and operate"
    ],
    "specs": {
      "Model": "HWJ-201-EM-8",
      "Power": "0.5 HP",
      "Tank": "8 L",
      "Product Family": "Wilo HWJ Single Pump Booster",
      "Flow": "Up to 78 LPM",
      "Head": "Up to 44 m",
      "Voltage": "1 Ph ~ 220 / 415 V",
      "Application": "Water transfer in bungalows / farm houses and apartments / hostels",
      "Impeller": "SS 304 stainless steel"
    },
    "inStock": true
  },
  {
    "id": "wilo-hwj-203-em-24",
    "name": "Wilo HWJ-203-EM-24",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo HWJ single pump booster with SS 304 impeller and stainless-steel pump body for compact water transfer and pressure boosting. Suitable for bungalow, farmhouse, apartment and hostel water supply with easy installation and silent operation.",
    "image": "/products/wilo-hwj-models.webp",
    "features": [
      "Stainless steel pump body and impeller",
      "Available with hydro-pneumatic tank / electronic control for automatic operation",
      "High-efficiency motor suitable for wide voltage fluctuations",
      "Anti-rust material",
      "Silent in operation",
      "Easy to carry, install and operate"
    ],
    "specs": {
      "Model": "HWJ-203-EM-24",
      "Power": "1.0 HP",
      "Tank": "24 L",
      "Product Family": "Wilo HWJ Single Pump Booster",
      "Flow": "Up to 78 LPM",
      "Head": "Up to 44 m",
      "Voltage": "1 Ph ~ 220 / 415 V",
      "Application": "Water transfer in bungalows / farm houses and apartments / hostels",
      "Impeller": "SS 304 stainless steel"
    },
    "inStock": true
  },
  {
    "id": "wilo-hwj-204-em-24",
    "name": "Wilo HWJ-204-EM-24",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo HWJ single pump booster with SS 304 impeller and stainless-steel pump body for compact water transfer and pressure boosting. Suitable for bungalow, farmhouse, apartment and hostel water supply with easy installation and silent operation.",
    "image": "/products/wilo-hwj-models.webp",
    "features": [
      "Stainless steel pump body and impeller",
      "Available with hydro-pneumatic tank / electronic control for automatic operation",
      "High-efficiency motor suitable for wide voltage fluctuations",
      "Anti-rust material",
      "Silent in operation",
      "Easy to carry, install and operate"
    ],
    "specs": {
      "Model": "HWJ-204-EM-24",
      "Power": "1.5 HP",
      "Tank": "24 L",
      "Product Family": "Wilo HWJ Single Pump Booster",
      "Flow": "Up to 78 LPM",
      "Head": "Up to 44 m",
      "Voltage": "1 Ph ~ 220 / 415 V",
      "Application": "Water transfer in bungalows / farm houses and apartments / hostels",
      "Impeller": "SS 304 stainless steel"
    },
    "inStock": true
  },
  {
    "id": "wilo-mhike-402ma-pbil402ma",
    "name": "Wilo MHiKE-402MA / PBI-L402MA",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo MHiKE / PBI-L home booster system for fixed-pressure water supply and pressure boosting. VFD-based operation helps save energy while protection functions, auto-restart and quiet operation support residential, sprinkler and circulation applications.",
    "image": "/products/wilo-mhike-pbil.jpg",
    "features": [
      "Excellent energy saving with VFD, up to 80% energy saving",
      "Various pump protection functions for dependable operation",
      "Automatic restart after error cause is solved",
      "Handy installation and easy maintenance",
      "Excellent design with low noise and low vibration",
      "Suitable for water supply, pressure boosting, sprinkler, fire extinguisher pump, industrial circulation, boiler and coolant systems"
    ],
    "specs": {
      "Model": "MHiKE-402MA / PBI-L402MA",
      "Power": "1.0 HP",
      "Product Family": "Wilo MHiKE / PBI-L Home Booster System",
      "Energy Saving": "Up to 80% with VFD",
      "Application": "Water supply and pressure boosting; residential areas, motels, holiday houses; sprinkler and fixed-pressure systems; boiler, coolant and industrial circulation systems",
      "Operation": "Automatic restart after fault resolution"
    },
    "inStock": true
  },
  {
    "id": "wilo-mhike-403ma-pbil403ma",
    "name": "Wilo MHiKE-403MA / PBI-L403MA",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo MHiKE / PBI-L home booster system for fixed-pressure water supply and pressure boosting. VFD-based operation helps save energy while protection functions, auto-restart and quiet operation support residential, sprinkler and circulation applications.",
    "image": "/products/wilo-mhike-pbil.jpg",
    "features": [
      "Excellent energy saving with VFD, up to 80% energy saving",
      "Various pump protection functions for dependable operation",
      "Automatic restart after error cause is solved",
      "Handy installation and easy maintenance",
      "Excellent design with low noise and low vibration",
      "Suitable for water supply, pressure boosting, sprinkler, fire extinguisher pump, industrial circulation, boiler and coolant systems"
    ],
    "specs": {
      "Model": "MHiKE-403MA / PBI-L403MA",
      "Power": "1.5 HP",
      "Product Family": "Wilo MHiKE / PBI-L Home Booster System",
      "Energy Saving": "Up to 80% with VFD",
      "Application": "Water supply and pressure boosting; residential areas, motels, holiday houses; sprinkler and fixed-pressure systems; boiler, coolant and industrial circulation systems",
      "Operation": "Automatic restart after fault resolution"
    },
    "inStock": true
  },
  {
    "id": "wilo-mhike-404ma-pbil404ma",
    "name": "Wilo MHiKE-404MA / PBI-L404MA",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo MHiKE / PBI-L home booster system for fixed-pressure water supply and pressure boosting. VFD-based operation helps save energy while protection functions, auto-restart and quiet operation support residential, sprinkler and circulation applications.",
    "image": "/products/wilo-mhike-pbil.jpg",
    "features": [
      "Excellent energy saving with VFD, up to 80% energy saving",
      "Various pump protection functions for dependable operation",
      "Automatic restart after error cause is solved",
      "Handy installation and easy maintenance",
      "Excellent design with low noise and low vibration",
      "Suitable for water supply, pressure boosting, sprinkler, fire extinguisher pump, industrial circulation, boiler and coolant systems"
    ],
    "specs": {
      "Model": "MHiKE-404MA / PBI-L404MA",
      "Power": "2.0 HP",
      "Product Family": "Wilo MHiKE / PBI-L Home Booster System",
      "Energy Saving": "Up to 80% with VFD",
      "Application": "Water supply and pressure boosting; residential areas, motels, holiday houses; sprinkler and fixed-pressure systems; boiler, coolant and industrial circulation systems",
      "Operation": "Automatic restart after fault resolution"
    },
    "inStock": true
  },
  {
    "id": "wilo-mhike-405ma-pbil405ma",
    "name": "Wilo MHiKE-405MA / PBI-L405MA",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo MHiKE / PBI-L home booster system for fixed-pressure water supply and pressure boosting. VFD-based operation helps save energy while protection functions, auto-restart and quiet operation support residential, sprinkler and circulation applications.",
    "image": "/products/wilo-mhike-pbil.jpg",
    "features": [
      "Excellent energy saving with VFD, up to 80% energy saving",
      "Various pump protection functions for dependable operation",
      "Automatic restart after error cause is solved",
      "Handy installation and easy maintenance",
      "Excellent design with low noise and low vibration",
      "Suitable for water supply, pressure boosting, sprinkler, fire extinguisher pump, industrial circulation, boiler and coolant systems"
    ],
    "specs": {
      "Model": "MHiKE-405MA / PBI-L405MA",
      "Power": "2.5 HP",
      "Product Family": "Wilo MHiKE / PBI-L Home Booster System",
      "Energy Saving": "Up to 80% with VFD",
      "Application": "Water supply and pressure boosting; residential areas, motels, holiday houses; sprinkler and fixed-pressure systems; boiler, coolant and industrial circulation systems",
      "Operation": "Automatic restart after fault resolution"
    },
    "inStock": true
  },
  {
    "id": "wilo-himulti5-10hp",
    "name": "Wilo-HiMulti5 1.0 HP",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Pressure Pump",
    "description": "Wilo-HiMulti5 pressure booster for pumping and pressure boosting clean water in residential sectors. It supports pressure boosting from roof tanks, break tanks, ground tanks and other static water supplies, with quiet inverter-based operation and safe protection actions.",
    "image": "/products/wilo-himulti5-pressure-booster.webp",
    "features": [
      "Low-noise operation around 50 dB, lower than normal conversation noise",
      "High efficiency with inverter technology, up to 33% energy savings",
      "Completely new design with easy setup via green button",
      "Engineering plastic water-contact parts with high corrosion resistance",
      "Protection action for safer and economical operation",
      "Suction available up to 8 meters",
      "Suitable for clean water pH 6â€“8 with no foreign matter"
    ],
    "specs": {
      "Model": "HiMulti5",
      "Power": "1.0 HP",
      "Noise Level": "Around 50 dB",
      "Energy Saving": "Up to 33% with inverter technology",
      "Suction": "Up to 8 m",
      "Application": "Clean water pressure boosting from roof tank, break tank, ground tank, shallow well and static water supply",
      "Installation": "Indoor installation",
      "Water Quality": "Clean water, pH 6â€“8, no foreign matter"
    },
    "inStock": true
  },
  {
    "id": "wilo-star-rs25-6",
    "name": "WILO STAR-RS25/6 with RLTC Controller",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "WILO STAR-RS return line circulation pump with RLTC controller for compact circulation and return-line applications. The pump supports simple installation, manual speed selection and reliable electrical connection for circulation systems.",
    "image": "/products/wilo-star-rs-rltc-controller.webp",
    "features": [
      "Suitable for any installation location with horizontal shaft and terminal box in 3-6-9-12 o'clock position",
      "Three preselectable speed stages for load adjustment",
      "Easy and safe installation with practical wrench attachment point on pump body",
      "Simplified electrical installation with terminal box and removable threaded cable gland",
      "Quick connection with spring clips"
    ],
    "specs": {
      "Model": "STAR-RS25/6",
      "Power": "1.5 HP",
      "Product Family": "WILO Return Line Circulation Pump â€“ STAR-RS with RLTC Controller",
      "Application": "Return-line circulation and circulation pump use",
      "Speed Control": "Three preselectable speed stages",
      "Installation": "Horizontal shaft; terminal box selectable at 3-6-9-12 o'clock positions"
    },
    "inStock": true
  },
  {
    "id": "wilo-star-rs25-8",
    "name": "WILO STAR-RS25/8 with RLTC Controller",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "WILO STAR-RS return line circulation pump with RLTC controller for compact circulation and return-line applications. The pump supports simple installation, manual speed selection and reliable electrical connection for circulation systems.",
    "image": "/products/wilo-star-rs-rltc-controller.webp",
    "features": [
      "Suitable for any installation location with horizontal shaft and terminal box in 3-6-9-12 o'clock position",
      "Three preselectable speed stages for load adjustment",
      "Easy and safe installation with practical wrench attachment point on pump body",
      "Simplified electrical installation with terminal box and removable threaded cable gland",
      "Quick connection with spring clips"
    ],
    "specs": {
      "Model": "STAR-RS25/8",
      "Power": "1.5 HP",
      "Product Family": "WILO Return Line Circulation Pump â€“ STAR-RS with RLTC Controller",
      "Application": "Return-line circulation and circulation pump use",
      "Speed Control": "Three preselectable speed stages",
      "Installation": "Horizontal shaft; terminal box selectable at 3-6-9-12 o'clock positions"
    },
    "inStock": true
  },
  {
    "id": "wilo-pb-088",
    "name": "PB-088 Inline Pressure Booster",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "PB inline pressure booster for compact water pressure boosting in pipeline applications. Designed for pressure boosting water transfer from roof tank to tap with quiet operation and simple inline installation.",
    "image": "/products/wilo-pb-inline-pressure-booster.webp",
    "features": [
      "Automatic / manual operation",
      "Easy to carry, install and operate",
      "Motor built with thermal protector for safety",
      "Rust-proof casting by electric coating",
      "Inline installation requires less space",
      "Silent operation"
    ],
    "specs": {
      "Model": "PB-088",
      "Power": "0.13 HP",
      "Product Family": "PB Inline Pressure Booster",
      "Flow": "Up to 65 LPM",
      "Head": "Up to 19 m",
      "Power Range": "Up to 400 W",
      "Phase": "Available in 1 Ph",
      "Application": "Pressure boosting water transfer from roof tank to tap; silent operation"
    },
    "inStock": true
  },
  {
    "id": "wilo-pb-200",
    "name": "PB-200 Inline Pressure Booster",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "PB inline pressure booster for compact water pressure boosting in pipeline applications. Designed for pressure boosting water transfer from roof tank to tap with quiet operation and simple inline installation.",
    "image": "/products/wilo-pb-inline-pressure-booster.webp",
    "features": [
      "Automatic / manual operation",
      "Easy to carry, install and operate",
      "Motor built with thermal protector for safety",
      "Rust-proof casting by electric coating",
      "Inline installation requires less space",
      "Silent operation"
    ],
    "specs": {
      "Model": "PB-200",
      "Power": "0.26 HP",
      "Product Family": "PB Inline Pressure Booster",
      "Flow": "Up to 65 LPM",
      "Head": "Up to 19 m",
      "Power Range": "Up to 400 W",
      "Phase": "Available in 1 Ph",
      "Application": "Pressure boosting water transfer from roof tank to tap; silent operation"
    },
    "inStock": true
  },
  {
    "id": "wilo-pb-400",
    "name": "PB-400 Inline Pressure Booster",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "PB inline pressure booster for compact water pressure boosting in pipeline applications. Designed for pressure boosting water transfer from roof tank to tap with quiet operation and simple inline installation.",
    "image": "/products/wilo-pb-inline-pressure-booster.webp",
    "features": [
      "Automatic / manual operation",
      "Easy to carry, install and operate",
      "Motor built with thermal protector for safety",
      "Rust-proof casting by electric coating",
      "Inline installation requires less space",
      "Silent operation"
    ],
    "specs": {
      "Model": "PB-400",
      "Power": "0.53 HP",
      "Product Family": "PB Inline Pressure Booster",
      "Flow": "Up to 65 LPM",
      "Head": "Up to 19 m",
      "Power Range": "Up to 400 W",
      "Phase": "Available in 1 Ph",
      "Application": "Pressure boosting water transfer from roof tank to tap; silent operation"
    },
    "inStock": true
  },
  {
    "id": "wilo-pw-122",
    "name": "PW-122 Peripheral Inline Booster",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "PW peripheral inline booster for household water pressure boosting at taps and showers. Suitable for domestic water supply, small machine/instrument water transfer, sprinkler systems, gardening and car washing.",
    "image": "/products/wilo-pw-peripheral-inline-booster.webp",
    "features": [
      "Self-priming function",
      "Automatic operation",
      "Thermal protector to avoid motor burn out",
      "Efficient cooling fan for specially designed cooling",
      "Easy to carry, install and operate"
    ],
    "specs": {
      "Model": "PW-122",
      "Power": "0.17 HP",
      "Product Family": "PW Peripheral Inline Booster",
      "Flow": "40 LPM",
      "Head": "45 m",
      "Pipe Size": "25 mm",
      "Application": "Boosting water pressure at taps and showers; household use; water transfer for small machines and instruments; sprinkler systems; gardening and car washing"
    },
    "inStock": true
  },
  {
    "id": "wilo-pw-175",
    "name": "PW-175 Peripheral Inline Booster",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "PW peripheral inline booster for household water pressure boosting at taps and showers. Suitable for domestic water supply, small machine/instrument water transfer, sprinkler systems, gardening and car washing.",
    "image": "/products/wilo-pw-peripheral-inline-booster.webp",
    "features": [
      "Self-priming function",
      "Automatic operation",
      "Thermal protector to avoid motor burn out",
      "Efficient cooling fan for specially designed cooling",
      "Easy to carry, install and operate"
    ],
    "specs": {
      "Model": "PW-175",
      "Power": "0.17 HP",
      "Product Family": "PW Peripheral Inline Booster",
      "Flow": "40 LPM",
      "Head": "45 m",
      "Pipe Size": "25 mm",
      "Application": "Boosting water pressure at taps and showers; household use; water transfer for small machines and instruments; sprinkler systems; gardening and car washing"
    },
    "inStock": true
  },
  {
    "id": "wilo-pw-252",
    "name": "PW-252 Peripheral Inline Booster",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Inline / Circulation Pump",
    "description": "PW peripheral inline booster for household water pressure boosting at taps and showers. Suitable for domestic water supply, small machine/instrument water transfer, sprinkler systems, gardening and car washing.",
    "image": "/products/wilo-pw-peripheral-inline-booster.webp",
    "features": [
      "Self-priming function",
      "Automatic operation",
      "Thermal protector to avoid motor burn out",
      "Efficient cooling fan for specially designed cooling",
      "Easy to carry, install and operate"
    ],
    "specs": {
      "Model": "PW-252",
      "Power": "0.33 HP",
      "Product Family": "PW Peripheral Inline Booster",
      "Flow": "40 LPM",
      "Head": "45 m",
      "Pipe Size": "25 mm",
      "Application": "Boosting water pressure at taps and showers; household use; water transfer for small machines and instruments; sprinkler systems; gardening and car washing"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-5a-1",
    "name": "WPO Raptor 5A/1",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 1-phase water transfer applications. Designed for farm houses, bungalows and apartments with cast iron casing and stainless-steel motor body.",
    "image": "/products/wpo-raptor-1-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 1550 LPM and head up to 48 m",
      "1-phase voltage range from 160 to 240 V",
      "Impeller in Noryl / cast iron",
      "Cast iron casing and stainless-steel motor body",
      "Suitable for water transfer in farm houses, bungalows and apartments"
    ],
    "specs": {
      "Model": "WPO Raptor 5A/1",
      "Power": "0.5 HP",
      "Phase": "1 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 1 Phase",
      "Flow": "Up to 1550 LPM",
      "Head": "Up to 48 m",
      "Power Range": "Up to 3.7 kW (5 HP)",
      "Voltage": "160 to 240 V",
      "Impeller": "Noryl / Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "SS",
      "Application": "Water transfer in farm houses, bungalows and apartments"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-10a-1",
    "name": "WPO Raptor 10A/1",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 1-phase water transfer applications. Designed for farm houses, bungalows and apartments with cast iron casing and stainless-steel motor body.",
    "image": "/products/wpo-raptor-1-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 1550 LPM and head up to 48 m",
      "1-phase voltage range from 160 to 240 V",
      "Impeller in Noryl / cast iron",
      "Cast iron casing and stainless-steel motor body",
      "Suitable for water transfer in farm houses, bungalows and apartments"
    ],
    "specs": {
      "Model": "WPO Raptor 10A/1",
      "Power": "1.0 HP",
      "Phase": "1 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 1 Phase",
      "Flow": "Up to 1550 LPM",
      "Head": "Up to 48 m",
      "Power Range": "Up to 3.7 kW (5 HP)",
      "Voltage": "160 to 240 V",
      "Impeller": "Noryl / Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "SS",
      "Application": "Water transfer in farm houses, bungalows and apartments"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-15c-1",
    "name": "WPO Raptor 15C/1",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 1-phase water transfer applications. Designed for farm houses, bungalows and apartments with cast iron casing and stainless-steel motor body.",
    "image": "/products/wpo-raptor-1-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 1550 LPM and head up to 48 m",
      "1-phase voltage range from 160 to 240 V",
      "Impeller in Noryl / cast iron",
      "Cast iron casing and stainless-steel motor body",
      "Suitable for water transfer in farm houses, bungalows and apartments"
    ],
    "specs": {
      "Model": "WPO Raptor 15C/1",
      "Power": "1.5 HP",
      "Phase": "1 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 1 Phase",
      "Flow": "Up to 1550 LPM",
      "Head": "Up to 48 m",
      "Power Range": "Up to 3.7 kW (5 HP)",
      "Voltage": "160 to 240 V",
      "Impeller": "Noryl / Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "SS",
      "Application": "Water transfer in farm houses, bungalows and apartments"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-20e-1",
    "name": "WPO Raptor 20E/1",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 1-phase water transfer applications. Designed for farm houses, bungalows and apartments with cast iron casing and stainless-steel motor body.",
    "image": "/products/wpo-raptor-1-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 1550 LPM and head up to 48 m",
      "1-phase voltage range from 160 to 240 V",
      "Impeller in Noryl / cast iron",
      "Cast iron casing and stainless-steel motor body",
      "Suitable for water transfer in farm houses, bungalows and apartments"
    ],
    "specs": {
      "Model": "WPO Raptor 20E/1",
      "Power": "2.0 HP",
      "Phase": "1 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 1 Phase",
      "Flow": "Up to 1550 LPM",
      "Head": "Up to 48 m",
      "Power Range": "Up to 3.7 kW (5 HP)",
      "Voltage": "160 to 240 V",
      "Impeller": "Noryl / Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "SS",
      "Application": "Water transfer in farm houses, bungalows and apartments"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-30e-1",
    "name": "WPO Raptor 30E/1",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 1-phase water transfer applications. Designed for farm houses, bungalows and apartments with cast iron casing and stainless-steel motor body.",
    "image": "/products/wpo-raptor-1-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 1550 LPM and head up to 48 m",
      "1-phase voltage range from 160 to 240 V",
      "Impeller in Noryl / cast iron",
      "Cast iron casing and stainless-steel motor body",
      "Suitable for water transfer in farm houses, bungalows and apartments"
    ],
    "specs": {
      "Model": "WPO Raptor 30E/1",
      "Power": "3.0 HP",
      "Phase": "1 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 1 Phase",
      "Flow": "Up to 1550 LPM",
      "Head": "Up to 48 m",
      "Power Range": "Up to 3.7 kW (5 HP)",
      "Voltage": "160 to 240 V",
      "Impeller": "Noryl / Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "SS",
      "Application": "Water transfer in farm houses, bungalows and apartments"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-50e-1",
    "name": "WPO Raptor 50E/1",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 1-phase water transfer applications. Designed for farm houses, bungalows and apartments with cast iron casing and stainless-steel motor body.",
    "image": "/products/wpo-raptor-1-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 1550 LPM and head up to 48 m",
      "1-phase voltage range from 160 to 240 V",
      "Impeller in Noryl / cast iron",
      "Cast iron casing and stainless-steel motor body",
      "Suitable for water transfer in farm houses, bungalows and apartments"
    ],
    "specs": {
      "Model": "WPO Raptor 50E/1",
      "Power": "5.0 HP",
      "Phase": "1 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 1 Phase",
      "Flow": "Up to 1550 LPM",
      "Head": "Up to 48 m",
      "Power Range": "Up to 3.7 kW (5 HP)",
      "Voltage": "160 to 240 V",
      "Impeller": "Noryl / Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "SS",
      "Application": "Water transfer in farm houses, bungalows and apartments"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-15c-3",
    "name": "WPO Raptor 15C/3",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 3-phase high-flow water transfer. Suitable for bungalows, farm houses, apartments and agriculture applications with cast iron construction and CED coating.",
    "image": "/products/wpo-raptor-3-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 3400 LPM and head up to 78 m",
      "3-phase voltage range from 350 to 440 V",
      "Cast iron impeller, casing and motor body",
      "CED coating",
      "Suitable for bungalows, farm houses, apartments and agriculture"
    ],
    "specs": {
      "Model": "WPO Raptor 15C/3",
      "Power": "1.5 HP",
      "Phase": "3 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 3 Phase",
      "Flow": "Up to 3400 LPM",
      "Head": "Up to 78 m",
      "Power Range": "Up to 22 kW (30 HP)",
      "Voltage": "350 to 440 V",
      "Impeller": "Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "Cast Iron",
      "Coating": "CED",
      "Application": "Water transfer in bungalows, farm houses, apartments and agriculture"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-20e-3",
    "name": "WPO Raptor 20E/3",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 3-phase high-flow water transfer. Suitable for bungalows, farm houses, apartments and agriculture applications with cast iron construction and CED coating.",
    "image": "/products/wpo-raptor-3-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 3400 LPM and head up to 78 m",
      "3-phase voltage range from 350 to 440 V",
      "Cast iron impeller, casing and motor body",
      "CED coating",
      "Suitable for bungalows, farm houses, apartments and agriculture"
    ],
    "specs": {
      "Model": "WPO Raptor 20E/3",
      "Power": "2.0 HP",
      "Phase": "3 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 3 Phase",
      "Flow": "Up to 3400 LPM",
      "Head": "Up to 78 m",
      "Power Range": "Up to 22 kW (30 HP)",
      "Voltage": "350 to 440 V",
      "Impeller": "Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "Cast Iron",
      "Coating": "CED",
      "Application": "Water transfer in bungalows, farm houses, apartments and agriculture"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-30e-3",
    "name": "WPO Raptor 30E/3",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 3-phase high-flow water transfer. Suitable for bungalows, farm houses, apartments and agriculture applications with cast iron construction and CED coating.",
    "image": "/products/wpo-raptor-3-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 3400 LPM and head up to 78 m",
      "3-phase voltage range from 350 to 440 V",
      "Cast iron impeller, casing and motor body",
      "CED coating",
      "Suitable for bungalows, farm houses, apartments and agriculture"
    ],
    "specs": {
      "Model": "WPO Raptor 30E/3",
      "Power": "3.0 HP",
      "Phase": "3 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 3 Phase",
      "Flow": "Up to 3400 LPM",
      "Head": "Up to 78 m",
      "Power Range": "Up to 22 kW (30 HP)",
      "Voltage": "350 to 440 V",
      "Impeller": "Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "Cast Iron",
      "Coating": "CED",
      "Application": "Water transfer in bungalows, farm houses, apartments and agriculture"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-50e-3",
    "name": "WPO Raptor 50E/3",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 3-phase high-flow water transfer. Suitable for bungalows, farm houses, apartments and agriculture applications with cast iron construction and CED coating.",
    "image": "/products/wpo-raptor-3-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 3400 LPM and head up to 78 m",
      "3-phase voltage range from 350 to 440 V",
      "Cast iron impeller, casing and motor body",
      "CED coating",
      "Suitable for bungalows, farm houses, apartments and agriculture"
    ],
    "specs": {
      "Model": "WPO Raptor 50E/3",
      "Power": "5.0 HP",
      "Phase": "3 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 3 Phase",
      "Flow": "Up to 3400 LPM",
      "Head": "Up to 78 m",
      "Power Range": "Up to 22 kW (30 HP)",
      "Voltage": "350 to 440 V",
      "Impeller": "Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "Cast Iron",
      "Coating": "CED",
      "Application": "Water transfer in bungalows, farm houses, apartments and agriculture"
    },
    "inStock": true
  },
  {
    "id": "wpo-raptor-75f-3",
    "name": "WPO Raptor 75F/3",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Submersible Pumpset",
    "description": "WPO Raptor horizontal open well submersible pumpset for 3-phase high-flow water transfer. Suitable for bungalows, farm houses, apartments and agriculture applications with cast iron construction and CED coating.",
    "image": "/products/wpo-raptor-3-phase.webp",
    "features": [
      "Horizontal open well submersible design",
      "Flow up to 3400 LPM and head up to 78 m",
      "3-phase voltage range from 350 to 440 V",
      "Cast iron impeller, casing and motor body",
      "CED coating",
      "Suitable for bungalows, farm houses, apartments and agriculture"
    ],
    "specs": {
      "Model": "WPO Raptor 75F/3",
      "Power": "7.5 HP",
      "Phase": "3 Phase",
      "Product Family": "WPO Raptor Horizontal Open Well Submersible Pumpset - 3 Phase",
      "Flow": "Up to 3400 LPM",
      "Head": "Up to 78 m",
      "Power Range": "Up to 22 kW (30 HP)",
      "Voltage": "350 to 440 V",
      "Impeller": "Cast Iron",
      "Casing": "Cast Iron",
      "Motor Body": "Cast Iron",
      "Coating": "CED",
      "Application": "Water transfer in bungalows, farm houses, apartments and agriculture"
    },
    "inStock": true
  },
  {
    "id": "wbw6b-30-06",
    "name": "WBW6B-30/06 Water Filled Borewell Submersible Pumpset",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "WBW 150 mm (6 inch) water-filled borewell submersible pumpset for domestic, community, irrigation and industrial water supply applications. Designed for high head borewell pumping with cast iron casing and stainless-steel impeller construction.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoDlr-LOhyZasO9yOhdQBZF3SquBP4KTEzRYUp6RXiet7v179vBXUvwRHg3bxpBkmnQrR2rUfzqqmWBiVHRCZTTcA=w800-h800",
    "features": [
      "150 mm (6 inch) water-filled borewell submersible pumpset",
      "Flow up to 1250 LPM and head up to 227 m",
      "Power range up to 11.2 kW (15 HP)",
      "Cast iron casing with SS 410 impeller",
      "Suitable for domestic and community water supply",
      "Suitable for high-rise buildings, housing complexes, villas, hotels and fountains",
      "Suitable for farm houses, gardens, nurseries, drip and sprinkler irrigation, washing and industrial applications"
    ],
    "specs": {
      "Model": "WBW6B-30/06",
      "Power": "3.0 HP",
      "Size": "150 mm / 6 inch",
      "Product Family": "WBW 150 mm (6 inch) Water Filled Borewell Submersible Pumpset",
      "Flow": "Up to 1250 LPM",
      "Head": "Up to 227 m",
      "Power Range": "Up to 11.2 kW (15 HP)",
      "Casing": "CI",
      "Impeller": "SS 410",
      "Application": "Domestic and community water supply; high-rise buildings, housing complexes, villas, hotels and fountains; farm houses, gardens and nurseries; drip and sprinkler irrigation; washing, garages, poultry, cattle and stud farms; industrial applications"
    },
    "inStock": true
  },
  {
    "id": "wbw6b-40-10",
    "name": "WBW6B-40/10 Water Filled Borewell Submersible Pumpset",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "WBW 150 mm (6 inch) water-filled borewell submersible pumpset for domestic, community, irrigation and industrial water supply applications. Designed for high head borewell pumping with cast iron casing and stainless-steel impeller construction.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoDlr-LOhyZasO9yOhdQBZF3SquBP4KTEzRYUp6RXiet7v179vBXUvwRHg3bxpBkmnQrR2rUfzqqmWBiVHRCZTTcA=w800-h800",
    "features": [
      "150 mm (6 inch) water-filled borewell submersible pumpset",
      "Flow up to 1250 LPM and head up to 227 m",
      "Power range up to 11.2 kW (15 HP)",
      "Cast iron casing with SS 410 impeller",
      "Suitable for domestic and community water supply",
      "Suitable for high-rise buildings, housing complexes, villas, hotels and fountains",
      "Suitable for farm houses, gardens, nurseries, drip and sprinkler irrigation, washing and industrial applications"
    ],
    "specs": {
      "Model": "WBW6B-40/10",
      "Power": "4.0 HP",
      "Size": "150 mm / 6 inch",
      "Product Family": "WBW 150 mm (6 inch) Water Filled Borewell Submersible Pumpset",
      "Flow": "Up to 1250 LPM",
      "Head": "Up to 227 m",
      "Power Range": "Up to 11.2 kW (15 HP)",
      "Casing": "CI",
      "Impeller": "SS 410",
      "Application": "Domestic and community water supply; high-rise buildings, housing complexes, villas, hotels and fountains; farm houses, gardens and nurseries; drip and sprinkler irrigation; washing, garages, poultry, cattle and stud farms; industrial applications"
    },
    "inStock": true
  },
  {
    "id": "wbw6b-50-12",
    "name": "WBW6B-50/12 Water Filled Borewell Submersible Pumpset",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "WBW 150 mm (6 inch) water-filled borewell submersible pumpset for domestic, community, irrigation and industrial water supply applications. Designed for high head borewell pumping with cast iron casing and stainless-steel impeller construction.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoDlr-LOhyZasO9yOhdQBZF3SquBP4KTEzRYUp6RXiet7v179vBXUvwRHg3bxpBkmnQrR2rUfzqqmWBiVHRCZTTcA=w800-h800",
    "features": [
      "150 mm (6 inch) water-filled borewell submersible pumpset",
      "Flow up to 1250 LPM and head up to 227 m",
      "Power range up to 11.2 kW (15 HP)",
      "Cast iron casing with SS 410 impeller",
      "Suitable for domestic and community water supply",
      "Suitable for high-rise buildings, housing complexes, villas, hotels and fountains",
      "Suitable for farm houses, gardens, nurseries, drip and sprinkler irrigation, washing and industrial applications"
    ],
    "specs": {
      "Model": "WBW6B-50/12",
      "Power": "5.0 HP",
      "Size": "150 mm / 6 inch",
      "Product Family": "WBW 150 mm (6 inch) Water Filled Borewell Submersible Pumpset",
      "Flow": "Up to 1250 LPM",
      "Head": "Up to 227 m",
      "Power Range": "Up to 11.2 kW (15 HP)",
      "Casing": "CI",
      "Impeller": "SS 410",
      "Application": "Domestic and community water supply; high-rise buildings, housing complexes, villas, hotels and fountains; farm houses, gardens and nurseries; drip and sprinkler irrigation; washing, garages, poultry, cattle and stud farms; industrial applications"
    },
    "inStock": true
  },
  {
    "id": "wbw6b-75-16",
    "name": "WBW6B-75/16 Water Filled Borewell Submersible Pumpset",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "WBW 150 mm (6 inch) water-filled borewell submersible pumpset for domestic, community, irrigation and industrial water supply applications. Designed for high head borewell pumping with cast iron casing and stainless-steel impeller construction.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcuoDlr-LOhyZasO9yOhdQBZF3SquBP4KTEzRYUp6RXiet7v179vBXUvwRHg3bxpBkmnQrR2rUfzqqmWBiVHRCZTTcA=w800-h800",
    "features": [
      "150 mm (6 inch) water-filled borewell submersible pumpset",
      "Flow up to 1250 LPM and head up to 227 m",
      "Power range up to 11.2 kW (15 HP)",
      "Cast iron casing with SS 410 impeller",
      "Suitable for domestic and community water supply",
      "Suitable for high-rise buildings, housing complexes, villas, hotels and fountains",
      "Suitable for farm houses, gardens, nurseries, drip and sprinkler irrigation, washing and industrial applications"
    ],
    "specs": {
      "Model": "WBW6B-75/16",
      "Power": "7.5 HP",
      "Size": "150 mm / 6 inch",
      "Product Family": "WBW 150 mm (6 inch) Water Filled Borewell Submersible Pumpset",
      "Flow": "Up to 1250 LPM",
      "Head": "Up to 227 m",
      "Power Range": "Up to 11.2 kW (15 HP)",
      "Casing": "CI",
      "Impeller": "SS 410",
      "Application": "Domestic and community water supply; high-rise buildings, housing complexes, villas, hotels and fountains; farm houses, gardens and nurseries; drip and sprinkler irrigation; washing, garages, poultry, cattle and stud farms; industrial applications"
    },
    "inStock": true
  },
  {
    "id": "wilo-wbw4-control-panel-segment",
    "name": "Control Panel for Borewell Submersible Pumpset (WBW4)",
    "brand": "Wilo",
    "category": "Pumping Segments",
    "subCategory": "Borewell Submersible Pumpset",
    "description": "Control panel for borewell submersible pumpsets with robust construction, digital display and motor protection. Designed for domestic household water supply, high-rise buildings, farms, gardens, nurseries and fountain applications.",
    "image": "https://lh3.googleusercontent.com/glsgmb/AMnFcup62hcQK0IWY4TUphu-whFmCQgiaZMDa3uJqRG1udNBoXXhvizUegA6DbSjLKrkusg_nnu1z7HO3Ls5efdMk2fVoQ=w800-h800",
    "features": [
      "Designed with robust construction",
      "Wall-mounted / floor-mounted powder-coated sheet metal enclosure with earth terminal",
      "Fitted with 4-pole heavy duty contactor for wide voltage operation",
      "Easy to install, operate and maintain",
      "Highly precise digital display unit for full-fledged motor protection",
      "Inbuilt short-circuit protection"
    ],
    "specs": {
      "Model": "WBW4 Control Panel",
      "Power Range": "0.37 kW (0.5 HP) to 2.2 kW (3 HP)",
      "Phase": "1 Ph",
      "Application": "Domestic household water supply; high-rise buildings, housing complexes, villas, farm houses, gardens and nurseries; washing, garages, poultry, cattle and stud farms; fountains",
      "Construction": "Powder-coated sheet metal enclosure",
      "Protection": "Digital motor protection and inbuilt short-circuit protection",
      "Contactor": "4-pole heavy duty contactor"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-3400-1p",
    "name": "SOLRIGO 3400 1P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 3400 single-phase On-Grid inverter converts solar DC to AC with 97% efficiency. Surplus energy can be exported to the grid. Comes with free Wi-Fi dongle, LCD interface, and lightweight compact design.",
    "image": "https://www.vguard.in/uploads/product/solrigo-3400-1p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT: 80â€“500 V DC input range, 97% efficiency",
      "LCD displays daily & total energy saved",
      "Operating temp: â€“25Â°C to 60Â°C",
      "8-year warranty",
      "No storage loss â€” no battery required"
    ],
    "specs": {
      "PV power (max)": "3600 W",
      "Max DC voltage": "500 V",
      "Start voltage": "80 V",
      "MPP range": "80â€“500 V DC",
      "THD": "<3%",
      "Phase": "Single",
      "Efficiency": "97%",
      "DC surge": "TMOV",
      "AC surge": "TMOV",
      "Dimensions": "297Ã—223Ã—117 mm",
      "Weight": "4.8 kg",
      "Warranty": "8 years"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-5000-1p",
    "name": "SOLRIGO 5000 1P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 5000 single-phase On-Grid PV inverter with 6000 W input. Wide MPPT gives an input range of 100â€“550 V DC. Free Wi-Fi dongle, LCD display, advanced safety features, lightweight design.",
    "image": "https://www.vguard.in/uploads/product/solrigo-5000-1p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT: 100â€“550 V DC, 97.4% efficiency",
      "LCD displays energy saved daily & total",
      "Operating temp: â€“25Â°C to 60Â°C",
      "8-year warranty",
      "Lightweight compact design"
    ],
    "specs": {
      "PV power (max)": "6000 W",
      "Max DC voltage": "550 V",
      "Start voltage": "100 V",
      "MPP range": "100â€“550 V DC",
      "THD": "<3%",
      "Phase": "Single",
      "Efficiency": "97.4%",
      "DC surge": "TMOV",
      "AC surge": "TMOV",
      "Dimensions": "395Ã—328Ã—154 mm",
      "Weight": "10 kg",
      "Warranty": "8 years"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-5k-1p",
    "name": "Solrigo 5K 1M 1P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "Solrigo 5KW On-Grid Solar Inverter with 98% conversion efficiency. Wide MPPT extracts up to 30% more power on overcast or late-evening conditions. Fortress-protected with IP65 and multiple safety layers. BIS & IEC certified.",
    "image": "https://www.vguard.in/uploads/product/SOLRIGO-5000.jpg",
    "features": [
      "98% max conversion efficiency",
      "Wide MPPT + low startup voltage â€” optimal energy on cloudy days",
      "10-year product warranty",
      "IP65 rated â€” outdoor installation safe",
      "Surge protection, anti-islanding, residual current detection",
      "Wi-Fi + mobile app + LCD real-time monitoring"
    ],
    "specs": {
      "Efficiency": "98%",
      "IP rating": "IP65",
      "Warranty": "10 years",
      "Monitoring": "Wi-Fi + App + LCD",
      "Protection": "Surge, anti-islanding, RCD",
      "Certifications": "BIS & IEC"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-5000-3p",
    "name": "SOLRIGO 5000 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 5000 three-phase On-Grid PV inverter. Converts solar DC to AC, surplus exported to grid. Wide MPPT, free Wi-Fi dongle, LCD, advanced safety features.",
    "image": "https://www.vguard.in/uploads/product/solrigo-5000-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD energy display",
      "Lightweight compact form",
      "8-year warranty"
    ],
    "specs": {
      "Phase": "Three",
      "Efficiency": "97%+",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-8000-3p",
    "name": "SOLRIGO 8000 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 8000 three-phase On-Grid PV inverter. Solar energy converted from DC to AC with high efficiency. Surplus exported to grid. Wi-Fi monitoring, LCD display, advanced safety.",
    "image": "https://www.vguard.in/uploads/product/solrigo-8000-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD energy display",
      "8-year warranty",
      "No battery storage loss"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-10k-3p",
    "name": "SOLRIGO 10K 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 10K three-phase On-Grid PV inverter. Wide MPPT, Wi-Fi dongle, LCD display. Surplus energy exported to grid. Built for cleaner, greener power generation.",
    "image": "https://www.vguard.in/uploads/product/solrigo-10k-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD energy display",
      "8-year warranty",
      "Lightweight compact form"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-15k-3p",
    "name": "SOLRIGO 15K 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 15K three-phase On-Grid inverter for factories, hospitals and large offices. 98% efficiency, 10-year warranty, IP65 protection, Wi-Fi monitoring.",
    "image": "https://www.vguard.in/uploads/product/solsmart-15kt-3p.jpg",
    "features": [
      "98% max conversion efficiency",
      "Wide MPPT + low startup voltage",
      "10-year product warranty",
      "IP65 outdoor rating",
      "Multi-layer safety protection",
      "Wi-Fi + App + LCD monitoring"
    ],
    "specs": {
      "Efficiency": "98%",
      "IP rating": "IP65",
      "Warranty": "10 years",
      "Phase": "Three"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-20k-3p",
    "name": "SOLRIGO 20K 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 20K three-phase On-Grid inverter for large-scale commercial, industrial, IT and healthcare operations. 98% efficiency, 10-year warranty, IP65 outdoor protection.",
    "image": "https://www.vguard.in/uploads/product/SOLRIGO-20-KW-3P.jpg",
    "features": [
      "98% max conversion efficiency",
      "Wide MPPT + low startup voltage",
      "10-year product warranty",
      "IP65 outdoor rating",
      "Multi-layer safety protection",
      "Wi-Fi + App + LCD monitoring"
    ],
    "specs": {
      "Efficiency": "98%",
      "IP rating": "IP65",
      "Warranty": "10 years",
      "Phase": "Three"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-25k-3p",
    "name": "SOLRIGO 25K 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 25K three-phase On-Grid PV inverter. Wide MPPT, Wi-Fi dongle, LCD. Surplus energy exported to grid. Designed for greener power alternatives.",
    "image": "https://www.vguard.in/uploads/product/solrigo-25k-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD energy display",
      "8-year warranty",
      "Surplus exported to grid"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-35k-3p",
    "name": "SOLRIGO 35K 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 35K three-phase On-Grid PV inverter. Solar energy DC to AC conversion, surplus to grid. Wide MPPT, Wi-Fi dongle, LCD interface.",
    "image": "https://www.vguard.in/uploads/product/solrigo-35k-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD energy display",
      "8-year warranty",
      "No battery storage loss"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-50k-3p",
    "name": "SOLRIGO 50K 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 50K three-phase On-Grid PV inverter. High solar yield via wide MPPT. Free Wi-Fi dongle, LCD display, advanced safety. Surplus exported to grid.",
    "image": "https://www.vguard.in/uploads/product/solrigo-50k-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD energy display",
      "8-year warranty",
      "Surplus exported to grid"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-80k-3p",
    "name": "SOLRIGO 80K 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 80K three-phase On-Grid PV inverter. Solar DC to AC with high efficiency MPPT. Wi-Fi, LCD, advanced safety features, lightweight.",
    "image": "https://www.vguard.in/uploads/product/solrigo-80k-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD energy display",
      "8-year warranty",
      "No battery storage loss"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solrigo-100k-3p",
    "name": "SOLRIGO 100K 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLRIGO 100K three-phase On-Grid PV inverter. Largest SOLRIGO model. Wide MPPT, Wi-Fi dongle, LCD display, advanced safety, surplus exported to grid.",
    "image": "https://www.vguard.in/uploads/product/solrigo-100k-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for real-time monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD energy display",
      "8-year warranty",
      "Cleaner greener power generation"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-3000-gfi",
    "name": "SOLSMART 3000 GFI",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SolSmart 3000 GFI single-phase On-Grid PV inverter. 97.60% efficiency. Free Wi-Fi dongle, LCD display, wide MPPT range. Surplus energy exported to grid.",
    "image": "https://www.vguard.in/uploads/product/solsmart-3000-gfi-bg.jpg",
    "features": [
      "97.60% max efficiency",
      "Free Wi-Fi dongle for monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD display + mobile app",
      "Surplus exported to grid"
    ],
    "specs": {
      "Efficiency": "97.60%",
      "Phase": "Single",
      "Monitoring": "Wi-Fi + App + LCD",
      "Warranty": "8 years"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-5000-gfi",
    "name": "SOLSMART 5000 GFI",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SolSmart 5000 GFI single-phase On-Grid PV inverter. 98.40% efficiency. Free Wi-Fi dongle, LCD, wide MPPT. Designed to be an innovation marvel of the solar industry.",
    "image": "https://www.vguard.in/uploads/product/solsmart-5000-gfi-bg.jpg",
    "features": [
      "98.40% max efficiency",
      "Free Wi-Fi dongle for monitoring",
      "Wide MPPT range, high solar yield",
      "â€“25Â°C to 60Â°C operating range",
      "LCD display + mobile app",
      "Surplus exported to grid"
    ],
    "specs": {
      "Efficiency": "98.40%",
      "Phase": "Single",
      "Monitoring": "Wi-Fi + App + LCD",
      "Warranty": "8 years"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-6kt-3p",
    "name": "SOLSMART 6KT 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLSMART 6KT three-phase On-Grid PV inverter. Wide MPPT, free Wi-Fi dongle, LCD. Surplus exported to grid. For cleaner, greener power generation.",
    "image": "https://www.vguard.in/uploads/product/solsmart-6kt-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for monitoring",
      "Wide MPPT, high energy conservation",
      "â€“25Â°C to 60Â°C operating range",
      "LCD display + mobile app",
      "8-year warranty",
      "Surplus exported to grid"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-8kt-3p",
    "name": "SOLSMART 8KT 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLSMART 8KT three-phase On-Grid PV inverter. Wide MPPT, free Wi-Fi dongle, LCD display. Cleaner alternative to reduce electricity bills.",
    "image": "https://www.vguard.in/uploads/product/solsmart-8kt-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for monitoring",
      "Wide MPPT, high energy conservation",
      "â€“25Â°C to 60Â°C operating range",
      "LCD display + mobile app",
      "8-year warranty",
      "Surplus exported to grid"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-10kt-3p",
    "name": "SOLSMART 10KT 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLSMART 10KT three-phase On-Grid PV inverter. Wide MPPT, Wi-Fi dongle, LCD. For cleaner power to cut electricity bills.",
    "image": "https://www.vguard.in/uploads/product/solsmart-10kt-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for monitoring",
      "Wide MPPT, high energy conservation",
      "â€“25Â°C to 60Â°C operating range",
      "LCD display + mobile app",
      "8-year warranty",
      "Surplus exported to grid"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-15kt-3p",
    "name": "SOLSMART 15KT 3P",
    "brand": "V-Guard",
    "category": "On-Grid PV Inverters",
    "description": "SOLSMART 15KT three-phase On-Grid PV inverter. Cleaner greener alternative. Wide MPPT, free Wi-Fi dongle, LCD display.",
    "image": "https://www.vguard.in/uploads/product/solsmart-15kt-3p.jpg",
    "features": [
      "Free Wi-Fi dongle for monitoring",
      "Wide MPPT, high energy conservation",
      "â€“25Â°C to 60Â°C operating range",
      "LCD display + mobile app",
      "8-year warranty",
      "Surplus exported to grid"
    ],
    "specs": {
      "Phase": "Three",
      "Warranty": "8 years",
      "Monitoring": "Wi-Fi + App + LCD"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-1500-12v",
    "name": "SolSmart 1500 MPPT 12V",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "SolSmart 1500 MPPT 12V Solar Hybrid UPS. MPPT solar charge controller with solar + grid dual charging. Wi-Fi & Bluetooth connectivity, V-Guard Smart App for real-time monitoring and control.",
    "image": "https://www.vguard.in/uploads/product/solsmart-1500-12v.jpg",
    "features": [
      "MPPT high-efficiency solar charge controller",
      "Solar + grid dual charging",
      "Wi-Fi & Bluetooth â€” V-Guard Smart App control",
      "Real-time status & energy generation tracking",
      "Pure sine wave output",
      "Compact home solar backup"
    ],
    "specs": {
      "Voltage": "12V",
      "Output": "Pure Sine Wave",
      "Monitoring": "Wi-Fi + Bluetooth + App"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-1500-24v",
    "name": "SolSmart 1500 MPPT 24V",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "SolSmart 1500 MPPT 24V. MPPT-based high-efficiency solar charge controller ensures optimal energy conversion while supporting grid charging. Wi-Fi & Bluetooth, Smart App monitoring.",
    "image": "https://www.vguard.in/uploads/product/solsmart-1500-24v.jpg",
    "features": [
      "MPPT solar + grid dual charging",
      "Wi-Fi & Bluetooth â€” V-Guard Smart App",
      "Real-time energy generation insights",
      "Uninterrupted power supply",
      "Pure sine wave output",
      "Optimal solar power conversion"
    ],
    "specs": {
      "Voltage": "24V",
      "Output": "Pure Sine Wave",
      "Monitoring": "Wi-Fi + Bluetooth + App"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-2500-24v",
    "name": "SolSmart 2500 MPPT 24V",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "SolSmart 2500 MPPT 24V. Uninterrupted power with maximum solar energy utilization. No complicated controls or maintenance. Wi-Fi & Bluetooth, Smart App.",
    "image": "https://www.vguard.in/uploads/product/solsmart-2500-24v.jpg",
    "features": [
      "MPPT high-efficiency solar charge controller",
      "Solar + grid dual charging",
      "Wi-Fi & Bluetooth â€” V-Guard Smart App",
      "Uninterrupted power supply",
      "Pure sine wave output",
      "Simple monitoring & control"
    ],
    "specs": {
      "Voltage": "24V",
      "Output": "Pure Sine Wave",
      "Monitoring": "Wi-Fi + Bluetooth + App"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-1250-set",
    "name": "SolSmart 1250 / 1450 / 1750 / 8750",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "SolSmart series covering 1250, 1450, 1750 and 8750 VA models. Inbuilt high-efficiency solar charge controller. Appliance mode and inverter-technology appliance support via Smart App.",
    "image": "https://www.vguard.in/uploads/product/solsmart.jpg",
    "features": [
      "Inbuilt high-efficiency solar charge controller",
      "Appliance mode via V-Guard Smart App",
      "Support for inverter-tech appliances (AC/refrigerator)",
      "Multiple model options (1250â€“8750 VA)",
      "Pure sine wave output",
      "Wi-Fi + Bluetooth monitoring"
    ],
    "specs": {
      "Models": "1250 / 1450 / 1750 / 8750 VA",
      "Output": "Pure Sine Wave",
      "Monitoring": "Wi-Fi + Bluetooth + App"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-2750",
    "name": "SolSmart 2750",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "V-Guard SolSmart 2750 Solar Hybrid Inverter. Epitome of innovation and technology. Smart App control, solar savings tracker, app-based appliance mode management.",
    "image": "https://www.vguard.in/uploads/product/solsmart-2750-bg.jpg",
    "features": [
      "Wi-Fi & Bluetooth â€” V-Guard Smart App",
      "Solar savings tracker (today/yesterday/total)",
      "App-based mode & settings control",
      "Pure sine wave output (DSC-based)",
      "Industry-leading first-in-class features",
      "Inbuilt high-efficiency solar charge controller"
    ],
    "specs": {
      "Output": "Pure Sine Wave",
      "Monitoring": "Wi-Fi + Bluetooth + App",
      "Savings display": "Today / Yesterday / Total"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-3750",
    "name": "SolSmart 3750",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "V-Guard SolSmart 3750 Solar Hybrid Inverter. Packed with industry-leading features. Smart App control, real-time monitoring, solar savings display.",
    "image": "https://www.vguard.in/uploads/product/solsmart-3750-bg.jpg",
    "features": [
      "Wi-Fi & Bluetooth â€” V-Guard Smart App",
      "Solar savings tracker (today/yesterday/total)",
      "App-based mode & settings control",
      "Pure sine wave output (DSC-based)",
      "Industry-leading first-in-class features",
      "Inbuilt high-efficiency solar charge controller"
    ],
    "specs": {
      "Output": "Pure Sine Wave",
      "Monitoring": "Wi-Fi + Bluetooth + App"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-4750",
    "name": "SolSmart 4750",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "V-Guard SolSmart 4750 Solar Hybrid Inverter. Innovation and technology epitome. Smart App, savings tracker, appliance mode, pure sine wave.",
    "image": "https://www.vguard.in/uploads/product/solsmart-4750-bg.jpg",
    "features": [
      "Wi-Fi & Bluetooth â€” V-Guard Smart App",
      "Solar savings tracker (today/yesterday/total)",
      "App-based appliance & settings control",
      "Pure sine wave output (DSC-based)",
      "First-in-class industry features",
      "Inbuilt high-efficiency solar charge controller"
    ],
    "specs": {
      "Output": "Pure Sine Wave",
      "Monitoring": "Wi-Fi + Bluetooth + App"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-6750",
    "name": "SolSmart 6750",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "SolSmart 6750 Solar Hybrid UPS. 5600 VA / 4500 W high-capacity output. DSC-based pure sine wave, safe for all sensitive appliances. Smart App with savings tracking.",
    "image": "https://www.vguard.in/uploads/product/solsmart-6750.jpg",
    "features": [
      "5600 VA / 4500 W output capacity",
      "Pure sine wave (DSC-based) â€” safe for sensitive electronics",
      "Wi-Fi & Bluetooth â€” V-Guard Smart App",
      "Solar savings tracker (today/yesterday/total)",
      "Heavy-load capable solar hybrid UPS",
      "Real-time solar consumption analytics"
    ],
    "specs": {
      "Capacity": "5600 VA / 4500 W",
      "Output": "Pure Sine Wave",
      "Monitoring": "Wi-Fi + Bluetooth + App"
    },
    "inStock": true
  },
  {
    "id": "vg-vgs-5500",
    "name": "VGS 5500",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "VGS 5500 high-performance solar hybrid inverter. Strong protection against solar PV reverse voltage. Overcurrent battery protection. Inbuilt fully regulated MPPT controller.",
    "image": "https://www.vguard.in/uploads/product/vgs-5500.jpg",
    "features": [
      "Solar PV reverse voltage protection",
      "Overcurrent battery charging protection",
      "Inbuilt fully regulated MPPT charge controller",
      "High-performance solar hybrid inverter",
      "Reliable uninterrupted power supply",
      "Comprehensive electronics protection"
    ],
    "specs": {
      "Protection": "PV reverse voltage, overcurrent",
      "Controller": "Inbuilt MPPT",
      "Output": "Pure Sine Wave"
    },
    "inStock": true
  },
  {
    "id": "vg-vgs-7500",
    "name": "VGS 7500",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "VGS 7500 powerful and intelligent solar hybrid UPS. Uninterrupted power with maximum protection for valuable electronics. Inbuilt MPPT controller.",
    "image": "https://www.vguard.in/uploads/product/vgs-7500.jpg",
    "features": [
      "Solar PV reverse voltage protection",
      "Overcurrent battery charging protection",
      "Inbuilt fully regulated MPPT charge controller",
      "Powerful intelligent solar hybrid UPS",
      "Uninterrupted power with maximum protection",
      "Heavy-load handling"
    ],
    "specs": {
      "Protection": "PV reverse voltage, overcurrent",
      "Controller": "Inbuilt MPPT",
      "Output": "Pure Sine Wave"
    },
    "inStock": true
  },
  {
    "id": "vg-vgs-10000",
    "name": "VGS 10000",
    "brand": "V-Guard",
    "category": "Solar Off-Grid Inverter",
    "description": "VGS 10000 solar hybrid UPS. Power-packed for heavy loads. Inbuilt fully regulated MPPT, PV reverse voltage protection, overcurrent protection. Never worry about power disruptions again.",
    "image": "https://www.vguard.in/uploads/product/vgs-10000.jpg",
    "features": [
      "Solar PV reverse voltage protection",
      "Overcurrent battery charging protection",
      "Inbuilt fully regulated MPPT charge controller",
      "Power-packed design for heavy loads",
      "Never worry about power disruptions",
      "Maximum electronics protection"
    ],
    "specs": {
      "Protection": "PV reverse voltage, overcurrent",
      "Controller": "Inbuilt MPPT",
      "Output": "Pure Sine Wave"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-110w",
    "name": "110W â€“ 12V (36 Cells)",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "V-Guard 110 W 12V Polycrystalline Solar Panel. Generates energy from sunrise to sunset. AR-coated tempered glass, waterproof and corrosion resistant, salt-mist and sand resistant.",
    "image": "https://www.vguard.in/uploads/product/solat-panel-110.jpg",
    "features": [
      "Polycrystalline cells for residential/commercial/industrial",
      "10-yr product / 25-yr performance warranty",
      "AR-coated tempered low-iron glass",
      "High light absorption in all conditions",
      "Waterproof & corrosion resistant",
      "No degradation in extreme environments"
    ],
    "specs": {
      "Wattage": "110 Wp",
      "Voltage": "12V",
      "Cells": "36",
      "Technology": "Polycrystalline",
      "Product warranty": "10 years",
      "Performance warranty": "25 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-270w",
    "name": "270W â€“ 24V (60 Cells)",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "V-Guard 270W 24V Polycrystalline Solar Panel. Perfect embodiment of bringing home a better tomorrow. Excellent temperature performance, improved low-light energy generation.",
    "image": "https://www.vguard.in/uploads/product/solat-panel-270.jpg",
    "features": [
      "Polycrystalline cells, long-lasting",
      "10-yr product / 25-yr performance warranty",
      "AR-coated tempered low-iron glass",
      "Improved low-light performance",
      "Excellent temperature performance",
      "Waterproof & corrosion resistant"
    ],
    "specs": {
      "Wattage": "270 Wp",
      "Voltage": "24V",
      "Cells": "60",
      "Technology": "Polycrystalline",
      "Product warranty": "10 years",
      "Performance warranty": "25 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-340w",
    "name": "Panel 340 Wp DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 340 Wp DCR Multi-Crystalline solar panel. Never-ending power that slashes electricity bills. AR-coated tempered glass, excellent temperature and low-light performance.",
    "image": "https://www.vguard.in/uploads/product/panel-340.jpg",
    "features": [
      "AR-coated tempered glass",
      "Excellent temperature performance for extreme weather",
      "Improved low-light energy generation",
      "Multi-crystalline cells",
      "Generates power on cloudy days",
      "High energy output per installation"
    ],
    "specs": {
      "Wattage": "340 Wp",
      "Technology": "Multi-Crystalline (Polycrystalline)",
      "Glass": "AR-coated tempered"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-400w",
    "name": "400W â€“ 24V (72 Cells)",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "V-Guard 400W MonoPERC 72-cell solar panel. Harness the best of the sun. Excellent low-light performance, high efficiency in small roof space, PID resistance.",
    "image": "https://www.vguard.in/uploads/product/Monoperc-Solar-Panal-bg.jpg",
    "features": [
      "Excellent low-light performance",
      "High efficiency in small roof space",
      "PID resistance for extreme environments",
      "MonoPERC 72-cell module",
      "High efficiency sunlight-to-electricity conversion",
      "Long-lasting durability"
    ],
    "specs": {
      "Wattage": "400 Wp",
      "Voltage": "24V",
      "Cells": "72",
      "Technology": "MonoPERC",
      "PID": "Resistant"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-50w",
    "name": "Panel 50 Wp 12V MonoPERC",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "V-Guard 50 Wp 12V MonoPERC Solar Panel. Turn even a small rooftop corner into your personal power station. High efficiency, compact size, low-light performance.",
    "image": "https://www.vguard.in/uploads/product/Panel-540-Monoperc-Half-Cut.jpg",
    "features": [
      "MonoPERC â€” higher efficiency per sq ft",
      "Compact, easy installation",
      "Better low-light performance",
      "Works in mornings, evenings, cloudy conditions",
      "Ideal for small rooftop setups",
      "Cost-effective solar starter"
    ],
    "specs": {
      "Wattage": "50 Wp",
      "Voltage": "12V",
      "Technology": "MonoPERC"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-120w",
    "name": "Panel 120 Wp 12V MonoPERC",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "V-Guard 120 Wp 12V MonoPERC Solar Panel. Ideal choice for taking control of electricity bills. High efficiency, compact form, excellent low-light performance.",
    "image": "https://www.vguard.in/uploads/product/Panel-540-Monoperc-Half-Cut.jpg",
    "features": [
      "MonoPERC â€” higher efficiency per sq ft",
      "Compact, easy installation",
      "Better low-light performance",
      "Works in mornings, evenings, cloudy conditions",
      "Control electricity bills",
      "Smart rooftop investment"
    ],
    "specs": {
      "Wattage": "120 Wp",
      "Voltage": "12V",
      "Technology": "MonoPERC"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-200w-12v",
    "name": "Panel 200 Wp 12V MonoPERC",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "V-Guard 200 Wp 12V MonoPERC Solar Panel. Rooftop quietly works 24/7 to slash electricity bills. High efficiency, compact, excellent low-light performance.",
    "image": "https://www.vguard.in/uploads/product/Panel-540-Monoperc-Half-Cut.jpg",
    "features": [
      "MonoPERC â€” higher efficiency per sq ft",
      "Compact, easy installation",
      "Better low-light performance",
      "Rooftop savings round the clock",
      "Lightweight panels",
      "Slash electricity bills significantly"
    ],
    "specs": {
      "Wattage": "200 Wp",
      "Voltage": "12V",
      "Technology": "MonoPERC"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-200w-24v",
    "name": "Panel 200 Wp 24V MonoPERC",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "V-Guard 200 Wp 24V MonoPERC Solar Panel. Imagine seeing electricity bills drop significantly. High efficiency, compact, low-light optimized.",
    "image": "https://www.vguard.in/uploads/product/Panel-540-Monoperc-Half-Cut.jpg",
    "features": [
      "MonoPERC â€” higher efficiency per sq ft",
      "Compact, easy installation",
      "Better low-light performance",
      "Works in mornings, evenings, cloudy conditions",
      "Rooftop power station",
      "Reduces monthly electricity bills"
    ],
    "specs": {
      "Wattage": "200 Wp",
      "Voltage": "24V",
      "Technology": "MonoPERC"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-545-mphc",
    "name": "Panel 545 Wp MonoPERC Half-Cut",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "V-Guard 545 Wp MonoPERC Half-Cut Solar Panel. Unmatched solar efficiency. AR-coated tempered glass, anti-reflective surface, microcrack-free EL-tested quality.",
    "image": "https://www.vguard.in/uploads/product/panel-545.jpg",
    "features": [
      "AR-coated glass + anti-reflective surface â€” max sunlight absorption",
      "Superior low-light performance",
      "100% pre & post EL-tested â€” microcrack-free",
      "High module efficiency",
      "Half-cut cell technology for reduced power loss",
      "Long-lasting reliability"
    ],
    "specs": {
      "Wattage": "545 Wp",
      "Technology": "MonoPERC Half-Cut",
      "Testing": "100% pre & post EL",
      "Glass": "AR-coated tempered"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-550-ax",
    "name": "Panel 550 (AX) MPHC Non-DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 550 (AX) MPHC Non-DCR. Works beautifully even in soft or hazy light. MonoPERC technology, AR coating, 25-year linear power warranty, 10-year product warranty.",
    "image": "https://www.vguard.in/uploads/product/Panel-540-Monoperc-Half-Cut.jpg",
    "features": [
      "MonoPERC higher efficiency per sq ft",
      "AR anti-reflective coating",
      "25-yr linear power output warranty",
      "10-yr product warranty on materials/workmanship",
      "Better performance on hazy/unpredictable days",
      "Half-cut cell design"
    ],
    "specs": {
      "Wattage": "550 Wp",
      "Technology": "MonoPERC Half-Cut (Non-DCR)",
      "Linear warranty": "25 years",
      "Product warranty": "10 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-550-rs",
    "name": "Panel 550 (RS) MPHC Non-DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 550 (RS) MPHC Non-DCR. Top-tier performance with extra-long protection. MonoPERC, AR coating, 30-year linear power warranty, 12-year product warranty.",
    "image": "https://www.vguard.in/uploads/product/Panel-550-Monoperc-Half-Cut.jpg",
    "features": [
      "MonoPERC higher efficiency per sq ft",
      "AR anti-reflective coating",
      "30-yr linear power output warranty",
      "12-yr product warranty",
      "Extra-long protection for top-tier performance",
      "Half-cut cell design"
    ],
    "specs": {
      "Wattage": "550 Wp",
      "Technology": "MonoPERC Half-Cut (Non-DCR)",
      "Linear warranty": "30 years",
      "Product warranty": "12 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-540-ax-bifacial",
    "name": "Panel 540 (AX) Bifacial DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 540 (AX) Bifacial DCR. Generates power from both sides. MonoPERC bifacial technology captures direct sunlight and reflected ground light. 25-yr linear, 10-yr product warranty.",
    "image": "https://www.vguard.in/uploads/product/Panel-540-Monoperc-Half-Cut.jpg",
    "features": [
      "Bifacial â€” power from both front & rear sides",
      "AR coating for maximum absorption",
      "25-yr linear power output warranty",
      "10-yr product warranty",
      "Captures reflected ground light",
      "Simple, reliable high-performance"
    ],
    "specs": {
      "Wattage": "540 Wp",
      "Technology": "MonoPERC Bifacial (DCR)",
      "Linear warranty": "25 years",
      "Product warranty": "10 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-550-ax-bifacial",
    "name": "Panel 550 (AX) Bifacial DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 550 (AX) Bifacial DCR. Saves money, reduces bills, powers home with clean energy. Bifacial MonoPERC generating from both sides, 25-yr linear, 10-yr product warranty.",
    "image": "https://www.vguard.in/uploads/product/Panel-550_-Bi-Facial-Non-DC.jpg",
    "features": [
      "Bifacial â€” power from both front & rear sides",
      "AR coating for maximum absorption",
      "25-yr linear power output warranty",
      "10-yr product warranty",
      "Rooftop that works for you savings",
      "Captures reflected ground light"
    ],
    "specs": {
      "Wattage": "550 Wp",
      "Technology": "MonoPERC Bifacial (DCR)",
      "Linear warranty": "25 years",
      "Product warranty": "10 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-545-rs-bifacial",
    "name": "Panel 545 (RS) Bifacial DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 545 (RS) Bifacial DCR. More power and better long-term value. MonoPERC bifacial, AR coating, 30-yr linear power warranty, 12-yr product warranty.",
    "image": "https://www.vguard.in/uploads/product/Panel-545-Bi-Facial-DCR-GS.jpg",
    "features": [
      "Bifacial â€” power from both front & rear sides",
      "AR coating for maximum absorption",
      "30-yr linear power output warranty",
      "12-yr product warranty",
      "More power + better long-term value",
      "MonoPERC bifacial technology"
    ],
    "specs": {
      "Wattage": "545 Wp",
      "Technology": "MonoPERC Bifacial (DCR)",
      "Linear warranty": "30 years",
      "Product warranty": "12 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-550-1n",
    "name": "Panel 550â€“1N (AX) MPHC Non-DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 550â€“1N (AX) MPHC Non-DCR. Strong performance and smart engineering. TOPCon bifacial, AR coating, 15-year product warranty.",
    "image": "https://www.vguard.in/uploads/product/Panel-540-Monoperc-Half-Cut.jpg",
    "features": [
      "TOPCon bifacial â€” higher efficiency, better heat perf, longer lifespan",
      "AR coating for max solar absorption",
      "15-yr product warranty on materials/workmanship",
      "Strong performance, smart engineering",
      "Long-term reliability",
      "N-type cell technology"
    ],
    "specs": {
      "Wattage": "550 Wp",
      "Technology": "TOPCon N-Type Bifacial (MPHC Non-DCR)",
      "Product warranty": "15 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-580-sw",
    "name": "Panel 580 (SW) TOPCon N-Type GG Non-DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 580 (SW) TOPCon N-Type GG Non-DCR. More power from the same sunlight. TOPCon bifacial, AR coating, 30-yr linear power warranty, 12-yr product warranty.",
    "image": "https://www.vguard.in/uploads/product/Panel-580-N-Type-Topcon-Bi.jpg",
    "features": [
      "TOPCon bifacial â€” higher efficiency & better heat performance",
      "AR coating for max absorption",
      "30-yr linear power output warranty",
      "12-yr product warranty",
      "More power from same sunlight",
      "N-type next-generation cell technology"
    ],
    "specs": {
      "Wattage": "580 Wp",
      "Technology": "TOPCon N-Type Bifacial (GG Non-DCR)",
      "Linear warranty": "30 years",
      "Product warranty": "12 years"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-580-topcon",
    "name": "580 TOPCon",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "580 TOPCon. Best-in-class performance, efficiency and reliability. AR-coated glass, excellent bifacial module efficiency, positive power tolerance, current binning.",
    "image": "https://www.vguard.in/uploads/product/580-topcon.jpg",
    "features": [
      "AR-coated glass for enhanced power output",
      "Excellent module efficiency with bifacial power gain",
      "Positive power tolerance + current binning to prevent mismatch losses",
      "Best-in-class performance & reliability",
      "N-type TOPCon cell technology",
      "Long-term high performance"
    ],
    "specs": {
      "Wattage": "580 Wp",
      "Technology": "TOPCon N-Type Bifacial",
      "Glass": "AR-coated",
      "Power tolerance": "Positive"
    },
    "inStock": true
  },
  {
    "id": "vg-panel-585-rs",
    "name": "Panel 585 (RS) TOPCon N-Type GG Non-DCR",
    "brand": "V-Guard",
    "category": "Solar Panels",
    "description": "Panel 585 (RS) TOPCon N-Type GG Non-DCR. Stronger performance and higher power generation every day. TOPCon bifacial, AR coating, 30-yr linear, 15-yr product warranty.",
    "image": "https://www.vguard.in/uploads/product/Panel-540-Monoperc-Half-Cut.jpg",
    "features": [
      "TOPCon bifacial â€” higher efficiency, heat perf & longer lifespan",
      "AR coating for max solar absorption",
      "30-yr linear power output warranty",
      "12-yr product warranty on Panel 580 / 15-yr on Panel 585",
      "Strongest performance & higher daily power",
      "N-type top-tier cell technology"
    ],
    "specs": {
      "Wattage": "585 Wp",
      "Technology": "TOPCon N-Type Bifacial (GG Non-DCR)",
      "Linear warranty": "30 years",
      "Product warranty": "15 years"
    },
    "inStock": true
  },
  {
    "id": "vg-spst4036",
    "name": "SPST4036",
    "brand": "V-Guard",
    "category": "Solar Battery",
    "description": "V-Guard SPST4036 Solar Battery. High efficiency eco-friendly design. High-purity lead with low self-discharge, long cycle life, fast charge acceptance. Specially designed for solar applications.",
    "image": "https://www.vguard.in/uploads/product/spst4036.jpg",
    "features": [
      "High-purity lead â€” long life, very low self-discharge",
      "Long cycle life: 1200 cycles @ 80% DOD",
      "Nature-friendly design",
      "Tubular positive plates for rugged performance",
      "Better charge acceptance, faster charging",
      "Ideal for deep cyclic & high power shortage areas"
    ],
    "specs": {
      "Voltage": "12V",
      "Cycle life": "1200 @ 80% DOD",
      "Construction": "Tubular positive plates"
    },
    "inStock": true
  },
  {
    "id": "vg-spst7536",
    "name": "SPST7536",
    "brand": "V-Guard",
    "category": "Solar Battery",
    "description": "V-Guard SPST7536 Solar Battery. 12V/75Ah. Specially designed for solar. Nature-friendly, high-purity lead, low self-discharge. Powering a world where power cuts are no longer a concern.",
    "image": "https://www.vguard.in/uploads/product/spst7536.jpg",
    "features": [
      "12V / 75 Ah @ C10 rating",
      "Specially designed for solar applications",
      "Nature-friendly design",
      "Tubular positive plates for long life",
      "High-purity lead â€” low self-discharge",
      "No power cut concerns"
    ],
    "specs": {
      "Voltage": "12V",
      "Capacity": "75 Ah @ C10",
      "Construction": "Tubular positive plates"
    },
    "inStock": true
  },
  {
    "id": "vg-spst10060",
    "name": "SPST10060",
    "brand": "V-Guard",
    "category": "Solar Battery",
    "description": "V-Guard SPST10060 Solar Battery. 12V/100Ah. Perfect fit for V-Guard Solar Power Systems. 90-month warranty (60M free replacement + 30M pro-rata). Consistent uninterrupted power.",
    "image": "https://www.vguard.in/uploads/product/SPST10060.jpg",
    "features": [
      "12V / 100 Ah @ C10 rating",
      "90-month warranty: 60M free replacement + 30M pro-rata",
      "Specially designed for solar applications",
      "Perfect fit for V-Guard Solar Power Systems",
      "Uninterrupted consistent power delivery",
      "High-purity lead, tubular plates"
    ],
    "specs": {
      "Voltage": "12V",
      "Capacity": "100 Ah @ C10",
      "Warranty": "90 months (60M free + 30M pro-rata)",
      "Construction": "Tubular positive plates"
    },
    "inStock": true
  },
  {
    "id": "vg-spst15060",
    "name": "SPST15060",
    "brand": "V-Guard",
    "category": "Solar Battery",
    "description": "V-Guard SPST15060. 12V/150Ah. 72-month warranty. End unexpected blackouts. High-performance solar battery with tubular positive plates, high-purity lead.",
    "image": "https://www.vguard.in/uploads/product/spst15060-bg.jpg",
    "features": [
      "12V / 150 Ah @ C10 rating",
      "72-month warranty: 60M free replacement + 12M pro-rata",
      "Specially designed for solar applications",
      "High-performance for unexpected blackouts",
      "High-purity lead, tubular plates",
      "Designed for deep cyclic applications"
    ],
    "specs": {
      "Voltage": "12V",
      "Capacity": "150 Ah @ C10",
      "Warranty": "72 months (60M free + 12M pro-rata)",
      "Construction": "Tubular positive plates"
    },
    "inStock": true
  },
  {
    "id": "vg-spst20036",
    "name": "SPST20036",
    "brand": "V-Guard",
    "category": "Solar Battery",
    "description": "V-Guard SPST20036 Solar Battery. 12V/200Ah â€” highest capacity in this range. Best for large loads and rugged usage. 60-month warranty, deep cyclic performance.",
    "image": "https://www.vguard.in/uploads/product/spst20036-bg.jpg",
    "features": [
      "12V / 200 Ah @ C10 rating â€” highest in this range",
      "60-month warranty: 36M free replacement + 24M pro-rata",
      "Best choice for larger loads & rugged usage",
      "Deep cyclic application performance",
      "High-purity lead, tubular plates",
      "Low self-discharge rate"
    ],
    "specs": {
      "Voltage": "12V",
      "Capacity": "200 Ah @ C10",
      "Warranty": "60 months (36M free + 24M pro-rata)",
      "Construction": "Tubular positive plates"
    },
    "inStock": true
  },
  {
    "id": "vg-spst20060",
    "name": "SPST20060",
    "brand": "V-Guard",
    "category": "Solar Battery",
    "description": "V-Guard SPST20060 Solar Battery. 12V/200Ah. Say goodbye to power interruptions. 72-month warranty (60M free replacement). Faster charging, tubular plates, high-purity lead.",
    "image": "https://www.vguard.in/uploads/product/spst20060.jpg",
    "features": [
      "12V / 200 Ah @ C10 rating",
      "72-month warranty: 60M free replacement + 12M pro-rata",
      "Specially designed for solar applications",
      "Uninterrupted power supply",
      "High-purity lead, tubular plates",
      "Faster charging due to better charge acceptance"
    ],
    "specs": {
      "Voltage": "12V",
      "Capacity": "200 Ah @ C10",
      "Warranty": "72 months (60M free + 12M pro-rata)",
      "Construction": "Tubular positive plates"
    },
    "inStock": true
  },
  {
    "id": "vg-nextgen-900",
    "name": "Nextgen Pro 900 â€” 750VA 12V (600Wp)",
    "brand": "V-Guard",
    "category": "Solar Off-Grid System with Battery and Panel",
    "description": "Nextgen Pro 900 bundled solar system (inverter + battery + panel). 750 VA, 12V. Up to 600 Wp solar panel. DSC-based trapezoidal wave, multiple battery technology modes.",
    "image": "https://www.vguard.in/uploads/product/nextgen-pro-900-bg.jpg",
    "features": [
      "Inbuilt high-efficiency solar charge controller (600W panel compatible)",
      "DSC-based trapezoidal wave output â€” wide application range",
      "Multiple charging modes: Tubular / Flat / Local Battery",
      "Controlled 220â€“230V output in inverter mode",
      "Power Saver Max / Normal mode selection",
      "Fuzzy logic battery water-topping reminder"
    ],
    "specs": {
      "VA rating": "750 VA",
      "Voltage": "12V",
      "Solar panel": "Up to 600 Wp",
      "Output": "Pseudo Sine Wave (Trapezoidal)",
      "Solar controller": "Inbuilt high-efficiency"
    },
    "inStock": true
  },
  {
    "id": "vg-nextgen-1200",
    "name": "Nextgen Pro 1200 â€” 900VA 12V (600Wp)",
    "brand": "V-Guard",
    "category": "Solar Off-Grid System with Battery and Panel",
    "description": "Nextgen Pro 1200 bundled system. 900 VA, 12V. Up to 600 Wp solar. Power Saver Max / Normal mode, fuzzy logic water-topping reminder, controlled 220â€“230V output.",
    "image": "https://www.vguard.in/uploads/product/nextgen-pro-1200-bg.jpg",
    "features": [
      "Controlled 220â€“230V output in inverter mode",
      "Power Saver Max / Normal mode selection",
      "Fuzzy logic battery water-topping reminder",
      "Inbuilt high-efficiency solar charge controller (600W)",
      "Multiple charging modes for different battery types",
      "Current generation + sustainability focus"
    ],
    "specs": {
      "VA rating": "900 VA",
      "Voltage": "12V",
      "Solar panel": "Up to 600 Wp",
      "Output": "Pseudo Sine Wave"
    },
    "inStock": true
  },
  {
    "id": "vg-nextgen-1400",
    "name": "Nextgen Pro 1400 â€” 1100VA 12V (600Wp)",
    "brand": "V-Guard",
    "category": "Solar Off-Grid System with Battery and Panel",
    "description": "Nextgen Pro 1400 bundled system. 1100 VA, 12V. Simple and smart decision. 600Wp solar panel, DSC trapezoidal wave, multiple battery mode support.",
    "image": "https://www.vguard.in/uploads/product/nextgen-pro-1400-bg.jpg",
    "features": [
      "Inbuilt high-efficiency solar charge controller (600W)",
      "DSC-based trapezoidal wave output",
      "Multiple battery technology modes",
      "Controlled 220â€“230V inverter output",
      "Power Saver Max / Normal mode",
      "Water-topping & panel cleaning reminders"
    ],
    "specs": {
      "VA rating": "1100 VA",
      "Voltage": "12V",
      "Solar panel": "Up to 600 Wp",
      "Output": "Pseudo Sine Wave (Trapezoidal)"
    },
    "inStock": true
  },
  {
    "id": "vg-synergy-1150",
    "name": "Synergy Smart 1150 â€” 950VA 12V (640Wp)",
    "brand": "V-Guard",
    "category": "Solar Off-Grid System with Battery and Panel",
    "description": "Synergy Smart 1150 bundled solar system. Innovation marvel. Interact via mobile phone, Smart App Wi-Fi & Bluetooth, solar savings tracker, Battery Gravity Builder.",
    "image": "https://www.vguard.in/uploads/product/synergy-smart-1150-bg.jpg",
    "features": [
      "Smart App control via Wi-Fi & Bluetooth",
      "Solar savings tracker (today/yesterday/total)",
      "Full solar & UPS settings configurable via app",
      "Battery Gravity Builder boost charge technology",
      "Water-topping & panel cleaning reminders",
      "Intelligent load & temperature-based cooling fan"
    ],
    "specs": {
      "VA rating": "950 VA",
      "Voltage": "12V",
      "Solar panel": "Up to 640 Wp",
      "Output": "Pure Sine Wave"
    },
    "inStock": true
  },
  {
    "id": "vg-synergy-1800",
    "name": "Synergy Smart 1800 â€” 1550VA 24V (1280Wp)",
    "brand": "V-Guard",
    "category": "Solar Off-Grid System with Battery and Panel",
    "description": "Synergy Smart 1800 bundled system. Truly defines smart in every way. Smart App, appliance settings, temperature-based cooling fan, Battery Gravity Builder.",
    "image": "https://www.vguard.in/uploads/product/synergy-smart-1800-bg.jpg",
    "features": [
      "Smart App mode & appliance settings control",
      "Full solar & UPS configuration via app",
      "Intelligent load & temperature-based cooling fan",
      "Battery Gravity Builder boost charge",
      "Water-topping & panel cleaning reminders",
      "Wi-Fi & Bluetooth connectivity"
    ],
    "specs": {
      "VA rating": "1550 VA",
      "Voltage": "24V",
      "Solar panel": "Up to 1280 Wp",
      "Output": "Pure Sine Wave"
    },
    "inStock": true
  },
  {
    "id": "vg-synergy-2750",
    "name": "Synergy Smart 2750 â€” 2200VA 24V (1620Wp)",
    "brand": "V-Guard",
    "category": "Solar Off-Grid System with Battery and Panel",
    "description": "Synergy Smart 2750 bundled system. Epitome of innovation and technology. Smart App, Battery Gravity Builder, temperature-based fan, first-in-class features.",
    "image": "https://www.vguard.in/uploads/product/synergy-smart-2750-bg.jpg",
    "features": [
      "Smart App mode & configuration",
      "Battery Gravity Builder boost charge",
      "Intelligent load-based cooling fan",
      "Water-topping & panel cleaning reminders",
      "Wi-Fi & Bluetooth control",
      "Epitome of innovation for solar UPS"
    ],
    "specs": {
      "VA rating": "2200 VA",
      "Voltage": "24V",
      "Solar panel": "Up to 1620 Wp",
      "Output": "Pure Sine Wave"
    },
    "inStock": true
  },
  {
    "id": "vg-solsmart-3750-bundle",
    "name": "SolSmart 3750 â€” 3200VA 36V (2640Wp)",
    "brand": "V-Guard",
    "category": "Solar Off-Grid System with Battery and Panel",
    "description": "SolSmart 3750 bundled system. Industry standards raised for customer convenience. Smart App, Battery Gravity Builder, load & temperature-based cooling, 2640 Wp solar panel.",
    "image": "https://www.vguard.in/uploads/product/solsmart-3750-sinewave-bg.jpg",
    "features": [
      "Smart App full configuration",
      "Battery Gravity Builder boost charge",
      "Intelligent load & temperature-based cooling fan",
      "Water-topping & panel cleaning reminders",
      "Wi-Fi & Bluetooth control",
      "Designed for highest solar panel ratings"
    ],
    "specs": {
      "VA rating": "3200 VA",
      "Voltage": "36V",
      "Solar panel": "Up to 2640 Wp",
      "Output": "Pure Sine Wave"
    },
    "inStock": true
  },
  {
    "id": "zb-autosoft-2",
    "name": "Autosoft-2",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Softeners",
    "description": "2000 LPH automatic softener for medium-sized households and apartments. Built with Purple Resin ion-exchange technology to reduce hardness, protect appliances, and improve washing results.",
    "features": [
      "2000 LPH flow rate",
      "Purple Resin ion exchange",
      "Fully automatic operation",
      "Programmable valve regeneration",
      "Protects water heaters and washing machines",
      "Reduces soap and detergent consumption"
    ],
    "specs": {
      "Flow Rate": "2000 LPH (2 mÂ³/hour)",
      "Technology": "Ion Exchange with Purple Resin Media",
      "Operation": "Fully automatic",
      "Regeneration": "Automatic, programmable valve",
      "Application": "Medium-sized households and apartments",
      "Key Benefits": "Prevents stains on utensils and appliances; reduces soap/detergent consumption; protects washing machines and water heaters from mineral deposits"
    },
    "image": "/products/water-treatment/autosoft-2.webp",
    "inStock": true
  },
  {
    "id": "zb-autosoft-3",
    "name": "Autosoft-3",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Softeners",
    "description": "3000 LPH fully automatic water softener for larger homes and light commercial applications. It reduces hardness-causing calcium and magnesium while operating with zero manual intervention.",
    "features": [
      "3000 LPH flow rate",
      "Fully automatic self-cleaning operation",
      "Purple Resin media",
      "Consumption or day based regeneration",
      "Suitable for larger homes",
      "Improves bathing comfort and washing results"
    ],
    "specs": {
      "Flow Rate": "3000 LPH (3 mÂ³/hour)",
      "Technology": "Ion Exchange with Purple Resin Media",
      "Operation": "Fully automatic, zero manual intervention",
      "Regeneration": "Automatic, self-cleaning based on water consumption or programmed days",
      "Application": "Larger homes and light commercial use (apartments up to 4â€“6 flats)",
      "Key Benefits": "Removes hardness-causing calcium and magnesium; prevents scale deposition on bathroom fittings; improves bathing comfort and washing results"
    },
    "image": "/products/water-treatment/autosoft-3.webp",
    "inStock": true
  },
  {
    "id": "zb-autosoft-6",
    "name": "Autosoft-6",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Softeners",
    "description": "6000 LPH automatic water softener for apartment buildings, hotels, motels, and small commercial establishments. It delivers continuous soft water supply with self-regulating regeneration.",
    "features": [
      "6000 LPH flow rate",
      "Fully automatic operation",
      "Self-regulating regeneration",
      "Designed for apartments and hotels",
      "Protects plumbing and appliances",
      "Saves soap, detergent, and gas consumption"
    ],
    "specs": {
      "Flow Rate": "6000 LPH (6 mÂ³ in approximately 1.5 hours)",
      "Technology": "Ion Exchange with Purple Resin Media",
      "Operation": "Fully automatic, truly zero manual intervention",
      "Regeneration": "Automatic, self-regulating based on consumption",
      "Application": "Apartment buildings, hotels, motels, small commercial establishments",
      "Key Benefits": "Continuous supply of soft water; extends life of plumbing and high-value appliances; significant savings on soap, detergent, and gas consumption"
    },
    "image": "/products/water-treatment/autosoft-6.webp",
    "inStock": true
  },
  {
    "id": "zb-auto-sand-filter",
    "name": "Auto Sand Filter",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Filters",
    "description": "Fully automatic sand filter for removing turbidity, suspended particles, mud, silt, and sediment from raw water. Suitable as pre-treatment for RO systems, cooling towers, housing societies, hotels, and shopping malls.",
    "features": [
      "3000 LPH flow rate",
      "Sand, Garnet, and Silex media",
      "Automatic programmed backwash",
      "Removes turbidity and suspended solids",
      "RO pre-treatment compatible",
      "3.5 kg/cmÂ² max working pressure"
    ],
    "specs": {
      "Flow Rate": "3000 LPH",
      "Filter Media": "High-grade Sand, Garnet, and Silex",
      "Function": "Removes turbidity, suspended particles, mud, silt, and sediment from raw water",
      "Operation": "Fully automatic with programmed backwash cycle",
      "Max Working Pressure": "3.5 kg/cmÂ²",
      "Application": "Pre-treatment for drinking water in housing societies, hotels, shopping malls; pre-treatment for RO systems and cooling towers"
    },
    "image": "/products/water-treatment/auto-sand-filter.webp",
    "inStock": true
  },
  {
    "id": "zb-auto-carbon-filter",
    "name": "Auto Carbon Filter",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Filters",
    "description": "Automatic activated carbon filtration system that removes chlorine, colour, odour, and dissolved organic impurities. It improves water taste and protects downstream RO membranes from chlorine damage.",
    "features": [
      "Bacteriostatic Activated Carbon media",
      "Removes chlorine, colour, and odour",
      "Fully automatic auto-backwash",
      "Protects RO membranes",
      "Improves taste and odour",
      "Low maintenance operation"
    ],
    "specs": {
      "Filter Media": "Bacteriostatic Activated Carbon (ACF)",
      "Function": "Removes chlorine, colour, odour, and dissolved organic impurities from water",
      "Operation": "Fully automatic with auto-backwash for long service life",
      "Application": "Pre-treatment for RO systems; post-treatment for sand filters; municipal water dechlorination",
      "Key Benefits": "Improves taste and odour of water; protects downstream RO membranes from chlorine damage; low maintenance"
    },
    "image": "/products/water-treatment/auto-carbon-filter.webp",
    "inStock": true
  },
  {
    "id": "zb-auto-iron-remover",
    "name": "Auto Iron Remover",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Filters",
    "description": "Automatic iron and manganese remover for borewell and ground water. It uses catalytic oxidation and filtration with auto-backwash to remove metallic taste, foul odour, and staining problems.",
    "features": [
      "Catalytic oxidation and filtration",
      "Removes iron and manganese",
      "Fully automatic auto-backwash",
      "Suitable for borewell water",
      "Prevents stains on tiles and clothes",
      "Protects appliances and piping"
    ],
    "specs": {
      "Technology": "Catalytic oxidation and filtration",
      "Function": "Removes dissolved and precipitated iron and manganese from borewell and ground water",
      "Operation": "Fully automatic with auto-backwash",
      "Application": "Homes and apartments with borewell water having high iron content",
      "Key Benefits": "Eliminates metallic taste and foul odour; prevents staining of clothes, tiles, and bathroom fittings; protects downstream appliances and piping"
    },
    "image": "/products/water-treatment/auto-iron-remover.webp",
    "inStock": true
  },
  {
    "id": "zb-d-ferrous-iron-remover",
    "name": "D-FERROUS Iron Remover",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Filters",
    "description": "Dedicated household iron remover designed for Indian homes. It handles 2 to 10 PPM iron contamination and helps protect skin, fabrics, cooking water quality, and household fixtures.",
    "features": [
      "30 LPH flow rate",
      "2 to 10 PPM iron removal capacity",
      "250 litres output per recharge",
      "Daily backwash operation",
      "User-friendly backwash valve",
      "Designed for household iron contamination"
    ],
    "specs": {
      "Flow Rate": "30 LPH (10\" DF Kit)",
      "Iron Removal Capacity": "2 to 10 PPM (max)",
      "RO Product Output": "250 liters per recharge",
      "Backwash Frequency": "Daily",
      "Valve Type": "User-friendly backwash valve that regulates all functions",
      "Application": "Exclusively designed for Indian households â€” India's first dedicated household iron remover",
      "Key Benefits": "Effective shield against iron contamination; leaves skin soft and healthy; retains colour and texture of fabric; saves cooking gas; removes foul metallic taste from water"
    },
    "image": "/products/water-treatment/d-ferrous-iron-remover.webp",
    "inStock": true
  },
  {
    "id": "zb-eco-ro-active-silver",
    "name": "Eco RO (High Recovery RO + Active Silver Technology)",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "High Recovery RO purifier with ESS Active Silver Technology for reduced water wastage and continued storage-tank protection against recontamination.",
    "features": [
      "High Recovery RO + ESS",
      "9 litres/hour flow rate",
      "6-litre storage tank",
      "Higher recovery than conventional RO",
      "Active Silver tank protection",
      "Municipal and low-TDS water suitable"
    ],
    "specs": {
      "Purification Technology": "HRR (High Recovery RO) + ESS Active Silver Technology",
      "Purification Flow Rate": "9 litres/hour",
      "Storage Tank": "6 litres",
      "Water Recovery": "Significantly higher than conventional RO â€” minimises water wastage",
      "Inlet Pressure": "0.5â€“2.0 kg/cmÂ²",
      "Mounting": "Wall-mounted",
      "ESS Technology": "Active Silver ions maintain purity in storage tank; prevents recontamination",
      "Indicators": "LED Smart Indicators",
      "Suitable For": "Municipal and low-TDS water supply",
      "Standards": "USEPA and IS 10500 compliant"
    },
    "image": "/products/water-treatment/eco-ro-high-recovery-ro-active-silver-technology.webp",
    "inStock": true
  },
  {
    "id": "zb-kitchenmate-ro-uf",
    "name": "Kitchenmate RO+UF (Under the Sink)",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "Under-the-sink RO + UF purifier with 7 stages, 8-litre pressurized storage, and continuous auto tank fill. Low-pressure UF operation helps reduce membrane fouling and extend service life.",
    "features": [
      "RO + UF purification",
      "7 purification stages",
      "8-litre pressurized storage",
      "Low-pressure UF membrane",
      "Under-sink long-reach faucet",
      "Auto tank fill"
    ],
    "specs": {
      "Purification Technology": "RO + UF (Ultra-Filtration)",
      "Purification Stages": "7 stages",
      "Storage Capacity": "8 litres (pressurized, high dispensing flow rate from faucet)",
      "UF Membrane": "Low-pressure operation â€” minimises membrane fouling and extends service life",
      "Installation": "Under-the-sink with long-reach faucet on counter",
      "Auto Tank Fill": "Yes â€” continuous supply maintained",
      "What it Removes": "Dissolved salts, bacteria, viruses, harmful chemicals, and microbes",
      "Standards": "USEPA and IS 10500 compliant"
    },
    "image": "https://www.zerobonline.com/wp-content/uploads/2022/09/ZeroB-Kitchenmate-ROUF-Under-the-Sink-Purifier_01.png",
    "inStock": true
  },
  {
    "id": "zb-intello-ro-25lph",
    "name": "Intello RO 25LPH + Active Silver Technology",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "RO Purifiers",
    "description": "25 LPH under-the-sink RO + ESS purifier with intelligent digital monitoring, 8-stage purification, 8-litre storage, and MIN-TECH mineral retention for larger families and small offices.",
    "features": [
      "RO + ESS Active Silver purification",
      "25 litres/hour output",
      "8-stage purification",
      "8-litre storage",
      "Digital filter-life monitor",
      "MIN-TECH mineral retention"
    ],
    "specs": {
      "Purification Technology": "RO + ESS (Active Silver Technology)",
      "Purification Stages": "8 stages",
      "Output Flow Rate": "25 litres/hour",
      "Storage Capacity": "8 litres",
      "Digital Monitor": "Intelligent digital display with cartridge life alarm and status indicators â€” alerts when filter replacement is due",
      "Mineral Retention": "MIN-TECH retains essential natural minerals and taste after RO purification",
      "Installation": "Under-the-sink; only faucet visible; saves kitchen space",
      "Auto Tank Fill": "Yes",
      "Suitable For": "Small offices, shops, clinics, and larger families",
      "What it Removes": "TDS, heavy metals, bacteria, viruses, pesticides, and harmful chemicals",
      "Standards": "USEPA and IS 10500 certified; 1-year comprehensive warranty including RO membrane and filters"
    },
    "image": "/products/water-treatment/intello-ro-25lph-active-silver-technology.webp",
    "inStock": true
  },
  {
    "id": "zb-hydrolife-uts",
    "name": "HYDROLIFE UTS",
    "brand": "Zero B",
    "category": "Water Treatment",
    "subCategory": "Alkaline Purifiers",
    "description": "Under-the-sink RO + ESS + Alkaline Crafter system with 8-litre pressurized HN tank and remote touch dispensing faucet. It supports RO and Non-RO modes with TDS-specific operating conditions.",
    "features": [
      "Under-the-sink alkaline RO system",
      "8-litre pressurized HN tank",
      "Remote touch dispensing faucet",
      "RO or Non-RO ESS-only modes",
      "Pro Alkaline Cartridge option",
      "USEPA and IS 10500 compliant"
    ],
    "specs": {
      "Technology": "RO + ESS (Active Silver) + Alkaline Crafter â€” under-the-sink configuration",
      "Storage Capacity": "8 litres (pressurized Hydropneumatic / HN Tank)",
      "Dispensing": "Remote touch dispensing faucet installed on kitchen platform (swinging faucet for user-friendly operation)",
      "Purification Modes": "RO Mode (full RO + ESS purification) or Non-RO Mode (ESS-only â€” requires inlet TDS below 150 ppm; diverter valve included for selection)",
      "Continuous Operation": "Maximum 30 minutes continuous use â€” unit must rest between extended cycles",
      "Pro Alkaline Cartridge": "Installed when target pH cannot be achieved with standard cartridge due to specific water constituents",
      "Installation": "Fully under-the-sink; saves kitchen space; only remote faucet visible on counter",
      "Important Notes": "Warranty on electrolyzer is void if Non-RO mode is used with inlet TDS above 150 ppm; not for commercial use â€” designed for personal/limited home use",
      "Standards": "ESS product water meets USEPA and IS 10500 drinking water standards"
    },
    "image": "/products/water-treatment/hydrolife-uts.webp",
    "inStock": true
  },
  {
    "id": "purepower-3-lite",
    "name": "PuREPower 3.0 Lite",
    "brand": "Pure Energy",
    "category": "Smart Energy Storage",
    "subCategory": "Smart Energy Storage",
    "description": "PuREPower 3.0 Lite seamlessly integrates an inverter, solar power, and intelligent AI. Power your essential home appliances without a hiccup, all in a sleek design that complements your home.",
    "features": [
      "Seamless Backup, Powerful Energy",
      "Elegant Design, Superior User Experience",
      "Solar Ready, Power Up"
    ],
    "specs": {
      "Capacity": "3.0 Lite",
      "Integration": "Inverter + Solar Power + AI"
    },
    "image": "https://www.pureenergy.co.in/assets/purepower/images/purepower-3-lite.png",
    "inStock": true
  },
  {
    "id": "purepower-3",
    "name": "PuREPower 3.0",
    "brand": "Pure Energy",
    "category": "Smart Energy Storage",
    "subCategory": "Smart Energy Storage",
    "description": "PuREPower 3.0 seamlessly integrates an inverter, solar power, and intelligent AI. Power your ACs, geysers, and even ovens without a hiccup, all in a sleek design that complements your home.",
    "features": [
      "Seamless Backup, Powerful Energy",
      "Elegant Design, Superior User Experience",
      "Solar Ready, Power Up"
    ],
    "specs": {
      "Capacity": "3.0",
      "Integration": "Inverter + Solar Power + AI"
    },
    "image": "https://www.pureenergy.co.in/assets/purepower/images/purepower-3.0.png",
    "inStock": true
  },
  {
    "id": "purepower-5",
    "name": "PuREPower 5.0",
    "brand": "Pure Energy",
    "category": "Smart Energy Storage",
    "subCategory": "Smart Energy Storage",
    "description": "PuREPower 5.0 seamlessly integrates an inverter, solar power, and intelligent AI. Power your ACs, geysers, and even ovens without a hiccup, all in a sleek design that complements your home.",
    "features": [
      "Seamless Backup, Powerful Energy",
      "Elegant Design, Superior User Experience",
      "Solar Ready, Power Up"
    ],
    "specs": {
      "Capacity": "5.0",
      "Integration": "Inverter + Solar Power + AI"
    },
    "image": "https://www.pureenergy.co.in/assets/purepower/images/purepower-5.0.png",
    "inStock": true
  },
  {
    "id": "purepower-12",
    "name": "PuREPower 12.0",
    "brand": "Pure Energy",
    "category": "Smart Energy Storage",
    "subCategory": "Smart Energy Storage",
    "description": "PuREPower 12.0 seamlessly integrates an inverter, solar power, and intelligent AI. Power your ACs, geysers, and even ovens without a hiccup, all in a sleek design that complements your home.",
    "features": [
      "Seamless Backup, Powerful Energy",
      "Elegant Design, Superior User Experience",
      "Solar Ready, Power Up"
    ],
    "specs": {
      "Capacity": "12.0",
      "Integration": "Inverter + Solar Power + AI"
    },
    "image": "https://www.pureenergy.co.in/assets/purepower/images/purepower-15.0.png",
    "inStock": true
  },
  {
    "id": "purepower-20",
    "name": "PuREPower 20.0",
    "brand": "Pure Energy",
    "category": "Smart Energy Storage",
    "subCategory": "Smart Energy Storage",
    "description": "PuREPower 20.0 seamlessly integrates an inverter, solar power, and intelligent AI. Power your ACs, geysers, and even ovens without a hiccup, all in a sleek design that complements your home.",
    "features": [
      "Seamless Backup, Powerful Energy",
      "Elegant Design, Superior User Experience",
      "Solar Ready, Power Up"
    ],
    "specs": {
      "Capacity": "20.0",
      "Integration": "Inverter + Solar Power + AI"
    },
    "image": "https://www.pureenergy.co.in/assets/purepower/images/purepower-20.0-2.png",
    "inStock": true
  },
  {
    "id": "purepower-commercial-30",
    "name": "PuREPower Commercial 30.0",
    "brand": "Pure Energy",
    "category": "Smart Energy Storage",
    "subCategory": "Smart Energy Storage",
    "description": "Slash peak load charges, maximize solar efficiency, and forget about maintenance. Store energy smartly, Reduce diesel consumption, use it powerfully, and enjoy a 10-year warranty. It's not just energy storage; it's a strategic advantage for your business",
    "features": [
      "Slash peak load charges",
      "Maximize solar efficiency",
      "Reduce diesel consumption",
      "10-year warranty"
    ],
    "specs": {
      "Capacity": "30.0"
    },
    "image": "https://www.pureenergy.co.in/assets/purepower/images/com-slider-1.png",
    "inStock": true
  },
  {
    "id": "purepower-commercial-60",
    "name": "PuREPower Commercial 60.0",
    "brand": "Pure Energy",
    "category": "Smart Energy Storage",
    "subCategory": "Smart Energy Storage",
    "description": "Slash peak load charges, maximize solar efficiency, and forget about maintenance. Store energy smartly, Reduce diesel consumption, use it powerfully, and enjoy a 10-year warranty. It's not just energy storage; it's a strategic advantage for your business",
    "features": [
      "Slash peak load charges",
      "Maximize solar efficiency",
      "Reduce diesel consumption",
      "10-year warranty"
    ],
    "specs": {
      "Capacity": "60.0"
    },
    "image": "https://www.pureenergy.co.in/assets/purepower/images/com-slider-2.png",
    "inStock": true
  },
  {
    "id": "purepower-commercial-120",
    "name": "PuREPower Commercial 120.0",
    "brand": "Pure Energy",
    "category": "Smart Energy Storage",
    "subCategory": "Smart Energy Storage",
    "description": "Slash peak load charges, maximize solar efficiency, and forget about maintenance. Store energy smartly, Reduce diesel consumption, use it powerfully, and enjoy a 10-year warranty. It's not just energy storage; it's a strategic advantage for your business",
    "features": [
      "Slash peak load charges",
      "Maximize solar efficiency",
      "Reduce diesel consumption",
      "10-year warranty"
    ],
    "specs": {
      "Capacity": "120.0"
    },
    "image": "https://www.pureenergy.co.in/assets/purepower/images/com-slider-3.png",
    "inStock": true
  }
,
  {
    "id": "vguard-prime-1150-mili",
    "name": "V-Guard Prime 1150 MILI Inverter for Home, Office",
    "brand": "V-Guard",
    "category": "Inverter",
    "subCategory": "Inverter",
    "description": "Premium digital sinewave inverter with superior performance. Provides long power backup for homes and offices.",
    "image": "/Inverter/Prime1150MiLi.webp",
    "features": [
      "Digital Sinewave",
      "Quick Charge Technology",
      "Advanced Battery Management"
    ],
    "specs": {
      "Price": "â‚¹ 6,799",
      "Capacity": "1000VA"
    },
    "inStock": true
  },
  {
    "id": "vguard-prime-1150-pure",
    "name": "Prime 1150 Pure Sinewave 1000VA Inverter",
    "brand": "V-Guard",
    "category": "Inverter",
    "subCategory": "Inverter",
    "description": "Pure sinewave inverter delivering clean power suitable for sensitive electronics.",
    "image": "/Inverter/INVFE56MKKQHMJEP_1.webp",
    "features": [
      "Pure Sinewave Output",
      "In-built Battery Gravity Builder",
      "High Load Handling"
    ],
    "specs": {
      "Price": "â‚¹ 6,699",
      "Capacity": "1000VA"
    },
    "inStock": true
  },
  {
    "id": "aviolux-800-square",
    "name": "Aviolux 800 Square Wave 775VA Inverter",
    "brand": "V-Guard",
    "category": "Inverter",
    "subCategory": "Inverter",
    "description": "Economical and reliable square wave inverter designed to handle heavy loads with ease.",
    "image": "/Inverter/INVH63KEMJVN5NE8_1.webp",
    "features": [
      "Square Wave Technology",
      "Overload Protection",
      "Compact Design"
    ],
    "specs": {
      "Price": "â‚¹ 4,729",
      "Capacity": "775VA"
    },
    "inStock": true
  },
  {
    "id": "vguard-prime-750-pure",
    "name": "V-Guard Prime 750 Pure Sinewave Inverter",
    "brand": "V-Guard",
    "category": "Inverter",
    "subCategory": "Inverter",
    "description": "High-efficiency pure sinewave inverter that runs fans silently and protects sensitive gadgets.",
    "image": "/Inverter/New_Project_3.webp",
    "features": [
      "Silent Operation",
      "Selectable Charging",
      "Battery Water Topping Reminder"
    ],
    "specs": {
      "Price": "â‚¹ 4,949",
      "Capacity": "750VA"
    },
    "inStock": true
  },
  {
    "id": "smart-pro-1200",
    "name": "Smart Pro 1200 S Pure Sine Wave 1000VA IoT",
    "brand": "V-Guard",
    "category": "Inverter",
    "subCategory": "Inverter",
    "description": "Smart IoT enabled pure sine wave inverter. Monitor and control your inverter from your smartphone.",
    "image": "/Inverter/INVFE6KNMZSFZYCG_1.webp",
    "features": [
      "IoT Enabled (Wi-Fi)",
      "App Control",
      "Appliance Protection",
      "Turbo Charge"
    ],
    "specs": {
      "Price": "â‚¹ 8,599",
      "Capacity": "1000VA"
    },
    "inStock": true
  },
  {
    "id": "aviolux-1100-square",
    "name": "Aviolux 1100 Square Wave 950VA Inverter",
    "brand": "V-Guard",
    "category": "Inverter",
    "subCategory": "Inverter",
    "description": "Powerful square wave inverter that ensures longer backup and reliable performance during power cuts.",
    "image": "/Inverter/INVH63MTRANFGBYD_1.webp",
    "features": [
      "Rugged Design",
      "Thermal Protection",
      "Extra Backup"
    ],
    "specs": {
      "Price": "â‚¹ 5,349",
      "Capacity": "950VA"
    },
    "inStock": true
  }
];


export type CategoryFaq = {
  question: string;
  answer: string;
};

export type CategorySeoData = {
  label: string;
  title: string;
  description: string;
  keywords: string[];
  intro: string;
  highlights: string[];
  faq?: CategoryFaq[];
};

export const CATEGORY_BY_PATH: Record<string, CategorySeoData> = {
  'water-heating-solutions': {
    label: 'Water Heating Solutions',
    title: 'Water Heating Solutions in Nashik | Heat Pumps, Solar Heaters & Geysers',
    description: 'Avegatasta provides water heating solutions in Nashik including heat pump water heaters, solar water heaters and electric geysers for homes, hotels, hospitals and industries.',
    keywords: [
      'Water heating solutions in Nashik',
      'heat pump water heater in Nashik',
      'solar water heater in Nashik',
      'commercial water heating Nashik',
    ],
    intro: 'Explore water heating solutions in Nashik for residential, commercial and industrial projects, including heat pump water heaters, solar water heaters and electric geysers with installation support.',
    highlights: ['Heat pump and solar water heater guidance', 'Residential, hotel and industrial applications', 'Authorized product supply and installation coordination'],
    faq: [
      {
        question: 'What water heating solutions does Avegatasta offer in Nashik?',
        answer: 'Avegatasta supports heat pump water heaters, solar water heaters and electric geysers for homes, hotels, hospitals and industrial hot water requirements in Nashik.',
      },
      {
        question: 'Do you provide installation support for water heating systems?',
        answer: 'Yes. Avegatasta coordinates installation support for suitable water heating systems after checking site requirements, capacity, usage pattern and plumbing conditions.',
      },
    ],
  },
  'water-heating-solutions/heat-pump-water-heaters': {
    label: 'Heat Pump',
    title: 'Heat Pump Water Heater in Nashik | Domestic & Commercial Heat Pumps',
    description: 'Find a heat pump water heater in Nashik for domestic, commercial and swimming pool applications with Avegatasta product guidance and heat pump installation support.',
    keywords: [
      'Heat pump water heater in Nashik',
      'heat pump installation service Nashik',
      'commercial heat pump Nashik',
      'domestic heat pump Nashik',
    ],
    intro: 'Avegatasta helps you choose a heat pump water heater in Nashik for homes, hotels, hospitals, hostels and commercial hot-water systems, with practical sizing and installation guidance.',
    highlights: ['Domestic and commercial heat pump options', 'Energy-efficient hot water systems', 'Project support for Nashik and nearby areas'],
    faq: [
      {
        question: 'What is a heat pump water heater?',
        answer: 'A heat pump water heater uses ambient air and electricity to heat water efficiently, making it suitable for residential and commercial hot water needs.',
      },
      {
        question: 'Can heat pumps be used for hotels and hospitals?',
        answer: 'Yes. Commercial heat pump systems are commonly used by hotels, hospitals, hostels and large residential projects that need reliable hot water with lower operating cost.',
      },
      {
        question: 'Do you provide heat pump installation in Nashik?',
        answer: 'Avegatasta helps with heat pump product selection and installation coordination in Nashik based on capacity, site layout and hot water usage.',
      },
    ],
  },
  'water-heating-solutions/solar-water-heaters': {
    label: 'Solar Water Heater',
    title: 'Solar Water Heater in Nashik | Avegatasta',
    description: 'Explore solar water heater in Nashik options for homes, apartments, hotels and commercial buildings with genuine products and installation support from Avegatasta.',
    keywords: [
      'Solar water heater in Nashik',
      'solar water heater dealer Nashik',
      'solar hot water system Nashik',
    ],
    intro: 'Browse solar water heater in Nashik options for daily hot-water needs, from homes and apartments to hotels, hospitals and commercial facilities.',
    highlights: ['Solar hot water system selection', 'Residential and commercial use cases', 'Installation and service coordination'],
  },
  'water-heating-solutions/electric-geysers': {
    label: 'Electric Geyser',
    title: 'Electric Geysers in Nashik | Avegatasta',
    description: 'Explore electric geysers and water heaters in Nashik with product guidance and installation support from Avegatasta.',
    keywords: ['electric geyser Nashik', 'water heater Nashik', 'V-Guard geyser Nashik'],
    intro: 'Compare electric geysers and storage water heaters for compact hot-water requirements in Nashik homes, offices and hospitality projects.',
    highlights: ['Compact storage water heaters', 'Product selection support', 'Installation coordination'],
  },
  'pumping-solutions': {
    label: 'Pumping Solutions',
    title: 'Pumping Solutions in Nashik | Wilo Pump Dealer Nashik',
    description: 'Find pumping solutions in Nashik from Avegatasta, including pressure pumps, booster pumps, inline pumps and Wilo pump dealer Nashik support for water supply projects.',
    keywords: [
      'Pumping solutions in Nashik',
      'Wilo pump dealer Nashik',
      'pressure pump Nashik',
      'booster pump Nashik',
    ],
    intro: 'Avegatasta provides pumping solutions in Nashik for stable water pressure, circulation and transfer requirements, with Wilo pump dealer Nashik support for genuine pump selection.',
    highlights: ['Pressure, booster and transfer pump options', 'Wilo pumping solutions for buildings and industry', 'Support for homes, hotels, hospitals and commercial sites'],
    faq: [
      {
        question: 'Which pump is best for building water pressure?',
        answer: 'The right pump depends on building height, number of outlets, tank location and water demand. Pressure pumps and booster systems are commonly used for apartments and commercial buildings.',
      },
      {
        question: 'What is the difference between a pressure pump and a booster pump?',
        answer: 'A pressure pump improves water pressure for smaller systems, while booster pump systems are designed to maintain consistent pressure across larger or multi-storey buildings.',
      },
      {
        question: 'Do you provide pump installation support?',
        answer: 'Yes. Avegatasta can guide pump selection and installation support for homes, buildings, hotels, hospitals and commercial water supply systems in Nashik.',
      },
    ],
  },
  'pumping-solutions/pressure-pumps': {
    label: 'Pressure Pump',
    title: 'Pressure Pump Nashik | Booster & Domestic Pressure Pumps',
    description: 'Choose a pressure pump Nashik solution for homes, buildings and commercial water pressure applications with Avegatasta product guidance and installation support.',
    keywords: [
      'Pressure pump Nashik',
      'booster pump Nashik',
      'domestic pressure pump Nashik',
      'Wilo pressure pump Nashik',
    ],
    intro: 'Find the right pressure pump Nashik setup for improving water pressure in apartments, villas, hotels and commercial buildings.',
    highlights: ['Domestic pressure pump guidance', 'Booster systems for multi-floor buildings', 'Wilo and other trusted brand options'],
  },
  'pumping-solutions/booster-pumps': {
    label: 'Booster Pumps',
    title: 'Booster Pumps in Nashik | Avegatasta',
    description: 'Find booster pump and pressure pump Nashik solutions with genuine brand products, project guidance and installation support.',
    keywords: ['booster pump Nashik', 'pressure pump Nashik', 'water pressure pump Nashik'],
    intro: 'Booster pumps help maintain consistent water pressure for multi-storey buildings, hotels, hospitals and commercial facilities in Nashik.',
    highlights: ['Automatic booster pump systems', 'Stable water pressure planning', 'Installation and service support'],
  },
  'pumping-solutions/inline-pumps': {
    label: 'Inline / Circulation Pump',
    title: 'Inline Pumps in Nashik | Avegatasta',
    description: 'Explore inline and circulation pump solutions in Nashik for residential, commercial and industrial applications.',
    keywords: ['inline pump Nashik', 'circulation pump Nashik', 'Wilo circulation pump Nashik'],
    intro: 'Inline and circulation pumps support efficient movement of water in HVAC, hot-water circulation and commercial utility systems.',
    highlights: ['Hot-water circulation support', 'HVAC and utility pump options', 'Compact pump selection guidance'],
  },
  'pumping-solutions/return-line-pumps': {
    label: 'Inline / Circulation Pump',
    title: 'Return Line Pumps in Nashik | Avegatasta',
    description: 'Find return line and circulation pump solutions in Nashik with professional product guidance and support.',
    keywords: ['return line pump Nashik', 'circulation pump Nashik', 'hot water return pump Nashik'],
    intro: 'Return line pumps help reduce hot-water waiting time in hotels, hospitals, apartments and commercial buildings.',
    highlights: ['Hot-water return line planning', 'Circulation pump selection', 'Commercial and hospitality applications'],
  },
  'pumping-solutions/water-transfer-pumps': {
    label: 'Submersible Pumpset',
    title: 'Water Transfer Pumps in Nashik | Avegatasta',
    description: 'Explore water transfer and submersible pump solutions in Nashik for domestic, commercial and industrial projects.',
    keywords: ['water transfer pump Nashik', 'submersible pump Nashik', 'borewell pump Nashik'],
    intro: 'Water transfer and submersible pumps support tank filling, borewell use, utility transfer and industrial water movement across Nashik projects.',
    highlights: ['Submersible pump options', 'Tank filling and water transfer', 'Domestic and industrial applications'],
  },
  'water-treatment-solutions': {
    label: 'Water Treatment Solutions',
    title: 'Water Treatment Solutions in Nashik | Zero B Water Purifier Dealer',
    description: 'Avegatasta provides water treatment solutions in Nashik including RO purifiers, UV purification, water softeners and Zero B water purifier dealer Nashik support.',
    keywords: [
      'Water treatment solutions in Nashik',
      'Zero B water purifier dealer Nashik',
      'RO water purifier supplier in Nashik',
      'water softener dealer in Nashik',
    ],
    intro: 'Avegatasta delivers water treatment solutions in Nashik for homes, offices, hotels, hospitals and commercial properties, including Zero B water purifier dealer Nashik support.',
    highlights: ['RO, UV, softener and filtration systems', 'Zero B purifier product guidance', 'Solutions for hard water and drinking water quality'],
    faq: [
      {
        question: 'Do I need a water softener or RO purifier?',
        answer: 'A water softener reduces hardness and scaling, while an RO purifier is used for drinking water purification. Many properties need both depending on water quality.',
      },
      {
        question: 'Which water treatment system is suitable for hard water?',
        answer: 'For hard water, a water softener or suitable filtration system is usually recommended after checking hardness, TDS and usage requirements.',
      },
      {
        question: 'Do you provide Zero B water purifiers in Nashik?',
        answer: 'Yes. Avegatasta supports Zero B water purifier selection for residential, office and commercial drinking water needs in Nashik.',
      },
    ],
  },
  'water-treatment-solutions/water-softeners': {
    label: 'Water Softeners',
    title: 'Water Softener Dealer in Nashik | Avegatasta',
    description: 'Avegatasta is a water softener dealer in Nashik for hard water treatment in homes, hotels, hospitals and commercial properties.',
    keywords: [
      'Water softener dealer in Nashik',
      'water softener Nashik',
      'hard water treatment Nashik',
    ],
    intro: 'As a water softener dealer in Nashik, Avegatasta helps reduce scaling and hard-water damage in homes, hotels, hospitals and commercial buildings.',
    highlights: ['Hard-water treatment guidance', 'Domestic and commercial softeners', 'Protection for plumbing and appliances'],
  },
  'water-treatment-solutions/filtration-systems': {
    label: 'Sand Filters',
    title: 'Filtration Systems in Nashik | Avegatasta',
    description: 'Find filtration systems in Nashik including sand filters, carbon filters and water treatment support for residential and commercial projects.',
    keywords: ['filtration system Nashik', 'sand filter Nashik', 'carbon filter Nashik'],
    intro: 'Filtration systems help remove suspended particles, sediment and impurities before water is used or further treated.',
    highlights: ['Sand and carbon filter options', 'Pre-treatment for water systems', 'Residential and commercial applications'],
  },
  'water-treatment-solutions/ro-water-purifiers': {
    label: 'RO Water Purifiers',
    title: 'RO Water Purifier Supplier in Nashik | Zero B Dealer',
    description: 'Avegatasta is an RO water purifier supplier in Nashik and Zero B water purifier dealer Nashik for homes, offices and commercial drinking water needs.',
    keywords: [
      'RO water purifier supplier in Nashik',
      'Zero B water purifier dealer Nashik',
      'RO water purifier Nashik',
      'commercial RO Nashik',
    ],
    intro: 'Avegatasta is an RO water purifier supplier in Nashik for homes, offices and commercial sites, with Zero B water purifier dealer Nashik support.',
    highlights: ['Domestic and commercial RO options', 'Zero B purifier selection', 'Drinking water treatment guidance'],
  },
  'water-treatment-solutions/uv-water-purifiers': {
    label: 'UV Water Purifiers',
    title: 'UV Water Purifiers in Nashik | Avegatasta',
    description: 'Explore UV water purification systems in Nashik with genuine products and installation support.',
    keywords: ['UV water purifier Nashik', 'UV purification Nashik', 'water purifier Nashik'],
    intro: 'UV water purifiers support chemical-free disinfection for homes, offices and commercial drinking-water systems.',
    highlights: ['UV purifier product options', 'Chemical-free disinfection', 'Installation and service support'],
  },
  'swimming-pool-solutions': {
    label: 'Swimming Pool Solutions',
    title: 'Swimming Pool Equipment Supplier in Nashik | Pool Chemicals',
    description: 'Avegatasta is a swimming pool equipment supplier in Nashik for pool equipment, pool chemicals, pool heat pumps and maintenance products.',
    keywords: [
      'Swimming pool equipment supplier in Nashik',
      'swimming pool chemical supplier near me',
      'pool chemicals Nashik',
      'Bluewave India pool equipment Nashik',
    ],
    intro: 'Avegatasta supports swimming pool solutions in Nashik with equipment, chemicals, filtration products and maintenance guidance for residential, commercial and hospitality pools.',
    highlights: ['Pool equipment and accessories', 'Pool chemical supply guidance', 'Bluewave India product support'],
    faq: [
      {
        question: 'Where can I buy swimming pool chemicals in Nashik?',
        answer: 'Avegatasta supplies swimming pool chemicals in Nashik and can guide pool owners on products for regular water maintenance.',
      },
      {
        question: 'Do you provide swimming pool equipment?',
        answer: 'Yes. Avegatasta supports swimming pool equipment, accessories, filtration products and pool maintenance solutions for residential and commercial pools.',
      },
      {
        question: 'Do you supply Bluewave India pool products?',
        answer: 'Avegatasta supports Bluewave India swimming pool products and can help with suitable pool equipment and chemical selection.',
      },
    ],
  },
  'swimming-pool-solutions/pool-chemicals': {
    label: 'Pool Chemical Solutions',
    title: 'Swimming Pool Chemical Supplier Near Me | Pool Chemicals Nashik',
    description: 'Looking for a swimming pool chemical supplier near me? Avegatasta supplies pool chemicals in Nashik with product guidance for clean and balanced pool water.',
    keywords: [
      'Swimming pool chemical supplier near me',
      'pool chemicals Nashik',
      'swimming pool chemicals Nashik',
      'Bluewave pool chemicals Nashik',
    ],
    intro: 'If you are searching for a swimming pool chemical supplier near me in Nashik, Avegatasta can help with pool chemical selection and water maintenance products.',
    highlights: ['Pool chemicals for regular maintenance', 'Guidance for clean and balanced water', 'Residential and commercial pool support'],
    faq: [
      {
        question: 'Where can I find a swimming pool chemical supplier near me in Nashik?',
        answer: 'Avegatasta supplies swimming pool chemicals in Nashik and can guide residential, commercial and hospitality pool owners on suitable maintenance products.',
      },
      {
        question: 'Do you supply swimming pool equipment along with chemicals?',
        answer: 'Yes. Avegatasta supports swimming pool equipment, accessories, filtration products and pool chemicals for Nashik projects.',
      },
    ],
  },
  'swimming-pool-solutions/pool-equipment': {
    label: 'Swimming Pool Equipment',
    title: 'Swimming Pool Equipment Supplier in Nashik | Avegatasta',
    description: 'Avegatasta is a swimming pool equipment supplier in Nashik for residential, commercial and hospitality pool projects.',
    keywords: [
      'Swimming pool equipment supplier in Nashik',
      'pool equipment Nashik',
      'Bluewave India pool equipment Nashik',
    ],
    intro: 'Avegatasta supplies swimming pool equipment in Nashik for residential, commercial and hospitality pools, including product guidance and maintenance support.',
    highlights: ['Pool equipment and accessories', 'Filtration and maintenance products', 'Support for hospitality and residential pools'],
  },
  'swimming-pool-solutions/swimming-pool-heat-pumps': {
    label: 'Swimming Pool Heat Pumps',
    title: 'Swimming Pool Heat Pumps in Nashik | Avegatasta',
    description: 'Explore swimming pool heat pump solutions in Nashik with installation and project support.',
    keywords: ['swimming pool heat pump Nashik', 'pool heating Nashik', 'pool heat pump Nashik'],
    intro: 'Swimming pool heat pumps help maintain comfortable pool temperatures for residential, hospitality and commercial pools.',
    highlights: ['Pool heating product guidance', 'Commercial and residential pool support', 'Installation coordination'],
  },
  'solar-power-systems': {
    label: 'Solar Power Systems',
    title: 'Solar Power Systems in Nashik | Rooftop Solar Nashik',
    description: 'Avegatasta offers solar power systems in Nashik including rooftop solar Nashik solutions, on-grid solar systems, solar panels and solar inverters.',
    keywords: [
      'Solar power systems in Nashik',
      'Rooftop solar Nashik',
      'on-grid solar Nashik',
      'solar panel Nashik',
    ],
    intro: 'Avegatasta provides solar power systems in Nashik for homes, businesses and industries, including rooftop solar Nashik and on-grid solar project guidance.',
    highlights: ['Rooftop solar planning', 'On-grid solar panels and inverters', 'Residential, commercial and industrial use'],
    faq: [
      {
        question: 'What solar power systems does Avegatasta offer in Nashik?',
        answer: 'Avegatasta supports solar power systems including rooftop solar planning, on-grid solar systems, solar panels and solar inverter guidance for Nashik projects.',
      },
      {
        question: 'Can solar systems be used for commercial buildings?',
        answer: 'Yes. Solar power systems can be planned for homes, businesses and industrial buildings based on available roof area, sanctioned load and energy usage.',
      },
    ],
  },
  'solar-power-systems/on-grid-solar-systems': {
    label: 'On-Grid PV Inverters',
    title: 'On-Grid Solar Systems in Nashik | Rooftop Solar Nashik',
    description: 'Explore on-grid solar systems in Nashik for rooftop solar Nashik projects, including solar inverters, panels and project consultation from Avegatasta.',
    keywords: [
      'Rooftop solar Nashik',
      'on-grid solar systems in Nashik',
      'solar power systems in Nashik',
      'solar inverter Nashik',
    ],
    intro: 'On-grid solar systems support rooftop solar Nashik projects for homes, commercial buildings and industrial facilities that want to reduce electricity costs.',
    highlights: ['Grid-connected solar planning', 'Solar inverter and panel selection', 'Residential and commercial rooftop solar support'],
  },
  'solar-power-systems/solar-panels': {
    label: 'Solar Panels',
    title: 'Solar Panels in Nashik | Avegatasta',
    description: 'Explore solar panels in Nashik for homes, businesses and industrial energy projects.',
    keywords: ['solar panels Nashik', 'solar panel supplier Nashik', 'rooftop solar Nashik'],
    intro: 'Solar panels are the foundation of reliable rooftop and commercial solar power systems in Nashik.',
    highlights: ['Solar panel selection', 'Rooftop and commercial projects', 'On-grid solar system support'],
  },
  'solar-power-systems/solar-inverters': {
    label: 'Solar Off-Grid Inverter',
    title: 'Solar Inverters in Nashik | Avegatasta',
    description: 'Explore solar inverter solutions in Nashik for residential, commercial and industrial solar projects.',
    keywords: ['solar inverter Nashik', 'solar power systems in Nashik', 'rooftop solar inverter Nashik'],
    intro: 'Solar inverters convert solar generation into usable power for homes, commercial buildings and industrial energy projects.',
    highlights: ['Solar inverter guidance', 'On-grid and off-grid applications', 'Solar project consultation'],
  },
};

export const CATEGORY_SEO_BY_LABEL = Object.values(CATEGORY_BY_PATH).reduce<Record<string, CategorySeoData>>(
  (acc, item) => {
    if (!acc[item.label]) acc[item.label] = item;
    return acc;
  },
  {},
);

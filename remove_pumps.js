const fs = require('fs');

const content = fs.readFileSync('lib/data.ts', 'utf8');

const toDelete = [
  'VC Series - Normal Voltage/ DOMESTIC PUMPS',
  'SNOW SERIES / DOMESTIC PUMPS',
  'Centrifugal Pumps with Extended Shaft / DOMESTIC PUMPS',
  'BLUE SERIES / DOMESTIC PUMPS',
  'VCN & NEON Series /DOMESTIC PUMPS',
  'Multi Stage VCM Series',
  'Wilo Monoblock pumpset- 1 Phase - WMB / MPMS',
  'Self-priming high suction pumpset - WHS C',
  'Single pump booster (SS impeller) - HMHIL',
  'VC Series - Special & Low Voltages/DOMESTIC PUMPS',
  'VJ Series / JET CENTRIFUGAL PUMPS',
  'SINGLE PHASE MOTORS / ELECTRIC MOTORS',
  'Three Phase Motors (Cooling Tower Applications)',
  'SINGLE PHASE MOTORS (COMMERCIAL) / ELECTRIC MOTORS',
  'Three Phase Motors /ELECTRIC MOTORS',
  'Wilo Monoblock pumpset 3 Phase - MPM',
  'SUPER & WONDER Series',
  'Slow Speed Series / DOMESTIC PUMPS',
  'VB24 Series / DOMESTIC PUMPS',
  'Mono Bloc Compressor Pumps/BOREWELL COMPRESSOR PUMPS'
];

// Instead of parsing, we can split by '  {\n    "id":' and re-assemble.
// Let's find the start of the products array.
const startIdx = content.indexOf('export const products: Product[] = [');
if (startIdx === -1) {
  console.log('Could not find products array');
  process.exit(1);
}

const beforeProducts = content.substring(0, startIdx + 'export const products: Product[] = [\n'.length);
const productsAndAfter = content.substring(startIdx + 'export const products: Product[] = [\n'.length);

// Split by '  {\n    "id":'
const parts = productsAndAfter.split('  {\n    "id":');

let newParts = [parts[0]]; // The part before the first id (should be empty if formatted well)

let deletedCount = 0;

for (let i = 1; i < parts.length; i++) {
  const part = parts[i];
  // extract the name
  const nameMatch = part.match(/"name":\s*"([^"]+)"/);
  let shouldDelete = false;
  
  if (nameMatch) {
    const name = nameMatch[1];
    // Check if name is in toDelete list
    if (toDelete.includes(name) || toDelete.some(td => name.includes(td))) {
      shouldDelete = true;
    }
  }
  
  if (!shouldDelete) {
    newParts.push(part);
  } else {
    deletedCount++;
    console.log('Deleted:', nameMatch ? nameMatch[1] : 'Unknown');
  }
}

// Join the parts back
const newProductsAndAfter = newParts.join('  {\n    "id":');
const finalContent = beforeProducts + newProductsAndAfter;

fs.writeFileSync('lib/data.ts', finalContent);
console.log('Deleted ' + deletedCount + ' products.');


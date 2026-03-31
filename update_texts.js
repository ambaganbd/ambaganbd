const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  { regex: /Afra Tech Point/g, replacement: "Am Bagan BD" },
  { regex: /Premium Tech,(\s*<[^>]+>\s*)Delivered Fast\./g, replacement: "Premium Fruits,$1Delivered Fresh." },
  { regex: /Premium Tech,/g, replacement: "Premium Fruits," },
  { regex: /Delivered Fast\./g, replacement: "Delivered Fresh." },
  { regex: /exclusive tech offers/g, replacement: "exclusive orchard offers" },
  { regex: /military-grade encryption/g, replacement: "industry-standard encryption" },
];

function processDirectory(directory) {
  const files = fs.readdirSync(directory);
  
  for (const file of files) {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let originalContent = content;

      for (const { regex, replacement } of replacements) {
        content = content.replace(regex, replacement);
      }

      if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated text in: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

console.log("Starting text content update...");
processDirectory(srcDir);
console.log("Complete!");

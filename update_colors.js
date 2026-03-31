const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

const replacements = [
  // Primary brand transformations
  { regex: /bg-black/g, replacement: "bg-[#2d5a27]" },
  { regex: /hover:bg-gray-900/g, replacement: "hover:bg-[#1e3d1a]" },
  { regex: /hover:bg-gray-800/g, replacement: "hover:bg-[#1e3d1a]" },
  { regex: /active:bg-gray-900/g, replacement: "active:bg-[#1e3d1a]" },
  { regex: /focus:ring-black/g, replacement: "focus:ring-[#2d5a27]" },
  { regex: /focus:border-black/g, replacement: "focus:border-[#2d5a27]" },
  { regex: /border-black/g, replacement: "border-[#2d5a27]" },
  { regex: /border-t-black/g, replacement: "border-t-[#2d5a27]" },
  
  // Selection and accents
  { regex: /selection:bg-black/g, replacement: "selection:bg-[#2d5a27]" },
  { regex: /bg-indigo-600/g, replacement: "bg-amber-500" },
  { regex: /text-indigo-600/g, replacement: "text-amber-600" },
  { regex: /text-indigo-500/g, replacement: "text-amber-500" },
  { regex: /bg-indigo-50/g, replacement: "bg-amber-50" },
  { regex: /border-indigo-100/g, replacement: "border-amber-100" },
  { regex: /ring-indigo-100/g, replacement: "ring-amber-100" },

  // A couple of exceptions: if 'text-black' is used on backgrounds that are now dark green, it's problematic.
  // But our changes above mainly target backgrounds (bg-black -> bg-green).
  // Elements that were bg-black already had text-white, which is perfect for dark green!
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
        console.log(`Updated: ${fullPath.replace(__dirname, '')}`);
      }
    }
  }
}

console.log("Starting theme color replacement...");
processDirectory(srcDir);
console.log("Complete!");

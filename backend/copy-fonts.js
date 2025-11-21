const fs = require("fs");
const path = require("path");

const srcDir = path.join(__dirname, "src", "fonts");
const distDir = path.join(__dirname, "dist", "fonts");

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.readdirSync(srcDir).forEach((file) => {
  const srcPath = path.join(srcDir, file);
  const distPath = path.join(distDir, file);
  fs.copyFileSync(srcPath, distPath);
  console.log(`Copied: ${file}`);
});

console.log("Fonts copied successfully!");

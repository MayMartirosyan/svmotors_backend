const fs = require("fs");
const path = require("path");

const src = path.join(__dirname, "src/utils/email/fonts");
const dest = path.join(__dirname, "dist/utils/email/fonts");

fs.mkdirSync(dest, { recursive: true });

fs.readdirSync(src).forEach((f) => {
  fs.copyFileSync(path.join(src, f), path.join(dest, f));
  console.log("Copied font:", f);
});

console.log("Fonts copied successfully!");

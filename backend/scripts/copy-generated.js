const fs = require("fs");
const path = require("path");

const source = path.resolve(__dirname, "..", "src", "generated");
const destination = path.resolve(__dirname, "..", "dist", "generated");

fs.rmSync(destination, { recursive: true, force: true });
fs.cpSync(source, destination, { recursive: true });
#!/usr/bin/env node
/**
 * Regenerates sitemap.xml and robots.txt from the inventory in assets/js/data.js.
 * Usage: node scripts/build-seo.js
 */
const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.join(__dirname, "..");
const sandbox = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/config.js"), "utf8"), sandbox);
vm.runInNewContext(fs.readFileSync(path.join(root, "assets/js/data.js"), "utf8"), sandbox);
const { RD_CONFIG: cfg, RD_CARS: cars } = sandbox.window;
const site = cfg.siteUrl.replace(/\/$/, "");
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${site}/`, priority: "1.0", changefreq: "daily" },
  { loc: `${site}/inventory.html`, priority: "0.9", changefreq: "daily" },
  ...cars.map((c) => ({ loc: `${site}/car.html?id=${encodeURIComponent(c.id)}`, priority: "0.8", changefreq: "weekly", image: c.image })),
];
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${urls.map((u) => `  <url>
    <loc>${u.loc.replace(/&/g, "&amp;")}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>${u.image ? `\n    <image:image><image:loc>${u.image.replace(/&/g, "&amp;")}</image:loc></image:image>` : ""}
  </url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), xml);
fs.writeFileSync(path.join(root, "robots.txt"), `User-agent: *\nAllow: /\nDisallow: /backend/\n\nSitemap: ${site}/sitemap.xml\n`);
console.log(`sitemap.xml: ${urls.length} URLs · robots.txt written`);

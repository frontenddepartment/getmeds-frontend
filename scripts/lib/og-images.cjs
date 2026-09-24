// Share-card (og:image) lookup for the build scripts. The mapping itself lives in
// src/lib/og-images.json so src/lib/seo.ts reads the same table at runtime.
const config = require('../../src/lib/og-images.json');

const DOMAIN = 'https://getmeds.ph';
const url = (file) => `${DOMAIN}/assets/${file}`;

const imageByFolder = new Map();
Object.values(config.categories).forEach(({ file, folders }) => {
  folders.forEach((folder) => imageByFolder.set(folder, url(file)));
});

const DEFAULT_OG_IMAGE = url(config.default.file);
const ORDER_OG_IMAGE = url(config.order.file);
const CONDITIONS_OG_IMAGE = url(config.conditions.file);

// A category folder without its own image falls back to the site default, never the logo.
function ogImageForFolder(folder) {
  return imageByFolder.get(String(folder || '').trim()) || DEFAULT_OG_IMAGE;
}

// Width/height let Facebook render the card on the very first share instead of waiting to
// fetch the image; alt is read out by screen readers in the card. Every image is 1200x630.
function ogImageTags(imageUrl, alt = 'Getmeds Philippines') {
  return [
    `<meta property="og:image" content="${imageUrl}">`,
    `<meta property="og:image:width" content="1200">`,
    `<meta property="og:image:height" content="630">`,
    `<meta property="og:image:alt" content="${alt}">`,
  ];
}

module.exports = {
  config,
  DEFAULT_OG_IMAGE,
  ORDER_OG_IMAGE,
  CONDITIONS_OG_IMAGE,
  ogImageForFolder,
  ogImageTags,
};

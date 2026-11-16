// Génère les logos PNG des e-mails (les clients mail n'affichent pas le SVG).
// Usage : node scripts/make-email-assets.js   (nécessite Playwright, hors dépendances du projet)
const fs = require("fs");
const { chromium } = require("playwright");
const src = fs.readFileSync(__dirname + "/../src/lib/logo-paths.ts", "utf8");
const MONO = JSON.parse(src.match(/MONO_PATH = (".*?");/)[1]);
const WORD = JSON.parse(src.match(/WORD_PATH = (".*?");/)[1]);

const svg = (word, disc) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="60 520 1400 470" width="840" height="282">
<defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#fadc2c"/><stop offset="1" stop-color="#e97b02"/></linearGradient></defs>
<circle cx="297" cy="755" r="220" fill="url(#g)"/><circle cx="297" cy="755" r="185" fill="${disc}"/>
<path d="${MONO}" fill="#fff" fill-rule="evenodd"/><path d="${WORD}" fill="${word}" fill-rule="evenodd"/></svg>`;

(async () => {
  const b = await chromium.launch();
  const jobs = [
    ["logo-on-dark.png", svg("#ffffff", "#0d3e66")],   // sur fond bleu nuit (en-tête des e-mails)
    ["logo-on-light.png", svg("#0d3e66", "#0d3e66")],  // sur fond clair
  ];
  for (const [name, content] of jobs) {
    const p = await b.newPage({ viewport: { width: 840, height: 282 }, deviceScaleFactor: 1 });
    await p.setContent(`<body style="margin:0;background:transparent">${content}</body>`);
    await p.screenshot({ path: __dirname + "/../public/email/" + name, omitBackground: true });
  }
  await b.close();
})();

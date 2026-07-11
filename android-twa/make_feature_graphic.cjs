const Jimp = require("jimp");
const path = require("path");

async function main() {
  const W = 1024;
  const H = 500;

  // Unbind brand sage green background
  const bg = new Jimp(W, H, "#5E8567");

  const icon = await Jimp.read(path.join(__dirname, "store_icon.png"));
  const iconSize = 320;
  icon.resize(iconSize, iconSize);

  const iconX = 90;
  const iconY = Math.round((H - iconSize) / 2);
  bg.composite(icon, iconX, iconY);

  const font = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE);
  const textX = iconX + iconSize + 60;
  const textY = Math.round(H / 2) - 40;
  bg.print(font, textX, textY, "Unbind");

  const outPath = path.join(__dirname, "store-assets", "feature_graphic.png");
  await bg.writeAsync(outPath);
  console.log("saved:", outPath);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

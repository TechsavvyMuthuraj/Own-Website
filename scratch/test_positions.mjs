import sharp from "sharp";

const searchSvg = Buffer.from(`
<svg width="700" height="56" viewBox="0 0 700 56" xmlns="http://www.w3.org/2000/svg">
  <rect x="2" y="2" width="696" height="52" rx="26" fill="rgba(0,0,0,0.8)" stroke="rgba(245,158,11,0.6)" stroke-width="2"/>
  <text x="45" y="33" fill="#d4d4d4" font-size="16" font-family="sans-serif">Search software, movies, tools, APKs, templates...</text>
  <rect x="570" y="6" width="120" height="40" rx="20" fill="#f59e0b"/>
  <text x="608" y="31" fill="#000000" font-size="15" font-weight="bold" font-family="sans-serif">Search</text>
</svg>
`);

async function testUserPos() {
  const leftPx = Math.round(1983 * 0.172);
  const topPx = Math.round(793 * 0.895 - 28);
  console.log("leftPx:", leftPx, "topPx:", topPx);
  await sharp("public/images/hero-clean.png")
    .composite([{ input: searchSvg, top: topPx, left: leftPx }])
    .toFile("scratch/test_user_pos.png");
  console.log("Saved scratch/test_user_pos.png");
}

testUserPos();

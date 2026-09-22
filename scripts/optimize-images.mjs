import sharp from "sharp";
import { readdir, stat, rename, unlink } from "fs/promises";
import path from "path";

const dir = path.join(process.cwd(), "public", "uploads");
const files = (await readdir(dir)).filter((f) => /\.(jpe?g|png)$/i.test(f) && f !== "logo.png");

for (const f of files) {
  const p = path.join(dir, f);
  const before = (await stat(p)).size;
  const isHero = f.startsWith("hero-");
  const maxW = isHero ? 1920 : 900;
  const tmp = p + ".tmp";
  await sharp(p)
    .rotate()
    .resize({ width: maxW, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(tmp);
  await unlink(p);
  await rename(tmp, p);
  const after = (await stat(p)).size;
  console.log(`${f}: ${(before/1024|0)}KB -> ${(after/1024|0)}KB`);
}
console.log("done");

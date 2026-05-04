import fs from "fs"
import path from "path"
import sharp from "sharp"

const inputDir = "./public/homefarm-shop/mascot-original"
const outputDir = "./public/homefarm-shop/mascot"

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

if (!fs.existsSync(inputDir)) {
  console.error("Missing input folder:", inputDir)
  console.error("Create it and put original PNG/JPG mascot files there.")
  process.exit(1)
}

const files = fs.readdirSync(inputDir)

async function run() {
  for (const file of files) {
    if (!file.match(/\.(png|jpg|jpeg)$/i)) continue

    const inputPath = path.join(inputDir, file)

    const name = file
      .replace(/\.(png|jpg|jpeg)/i, "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/Đ/g, "D")
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9-]/g, "")
      .toLowerCase()

    const outputPath = path.join(outputDir, `${name}.webp`)

    await sharp(inputPath)
      .resize({ width: 768, height: 768, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 75 })
      .toFile(outputPath)

    console.log("✅", `${name}.webp`)
  }

  console.log("🚀 DONE ALL")
}

run()

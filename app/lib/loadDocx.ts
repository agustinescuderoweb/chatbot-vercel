import mammoth from "mammoth";
import fs from "fs";
import path from "path";

export async function loadDocxText(filename: string) {
  try {
    const filePath = path.join(process.cwd(), "public", filename);
    const fileBuffer = fs.readFileSync(filePath);

    const { value } = await mammoth.extractRawText({ buffer: fileBuffer });
    return value;
  } catch (error) {
    console.error("Error leyendo el .docx:", error);
    return "";
  }
}

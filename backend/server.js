import express from "express";
import multer from "multer";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const upload = multer();
app.use(cors());

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

app.get("/", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

app.post(
  "/compare-ai",
  upload.fields([{ name: "baseline" }, { name: "current" }]),
  async (req, res) => {
    try {
      const baseline = req.files["baseline"][0];
      const current = req.files["current"][0];

      const prompt = `
You are an AI that compares two room images.

Task:
- Identify ALL NEW objects present in the second image but NOT in the first.

Rules:
- List EACH object separately
- Do NOT group items (e.g., do not say "stationery", instead say "pen", "paper")
- Detect even small objects like pen, paper, bottle, box, cloth
- Ignore lighting, shadows, and position changes

Return ONLY JSON:
{
  "new_items": []
}
`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          prompt,
          {
            inlineData: {
              mimeType: baseline.mimetype,
              data: baseline.buffer.toString("base64"),
            },
          },
          {
            inlineData: {
              mimeType: current.mimetype,
              data: current.buffer.toString("base64"),
            },
          },
        ],
      });

      const text = response.text;
      const match = text.match(/\{[\s\S]*\}/);
      const parsed = JSON.parse(match[0]);

      res.json({
        new_items: parsed.new_items || [],
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  },
);

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
});

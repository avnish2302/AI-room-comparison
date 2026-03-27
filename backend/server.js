import express from "express"
import multer from "multer"
import cors from "cors"
import dotenv from "dotenv"
import { GoogleGenAI } from "@google/genai"

dotenv.config()                                           // loads enviromental variables like API_KEY and PORT

const app = express()                                     // creates express server

const upload = multer()                                   // initializes multer (stores files in memory as buffer)

app.use(cors())                                           // enables cross-origin requests (react -> node)

const ai = new GoogleGenAI({apiKey: process.env.API_KEY}) // creates gemini client instance. Uses your API key from .env

app.get("/", (req, res) => {
  res.json({ message: "Backend running" })                // this sends a JSON response to the client, automatically converting a js object or value into a JSON formatted string and setting the appropriate HTTP headers
})

app.post(
  "/compare-ai", upload.fields([{ name: "baseline" }, { name: "current" }]),   // multer middleware. Accepts 2 files
  async (req, res) => {
    try {
      const baseline = req.files["baseline"][0];          // each file contains buffer(binary data) and  mimetype(image type)
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
                `

      const response = await ai.models.generateContent({   // calls gemini model. await -> wait until response comes
        model: "gemini-2.5-flash",                         // fast + cheaper model
        contents: [                                        // input to the AI. Its contains three parts, 1.prompt, 2.first image, 2.second image
          prompt,
          {inlineData: {mimeType: baseline.mimetype, data: baseline.buffer.toString("base64")}},  // converts binary image to base64 string. Why base64? because http -> textbased, images -> binary so we must convert. So convert binary -> base64 string
          {inlineData: {mimeType: current.mimetype, data: current.buffer.toString("base64")}},
        ]
      })

      const text = response.text                          // gemini sometimes returns text not pure JSON even if specified (Return only JSON). eg. Gemini may return, here is the result {"new_items" : ["bottle"]}
      const match = text.match(/\{[\s\S]*\}/)             // extract json using regex. What this regex does : \{ -> match {        [\s\S]* -> match ANYTHING(including newlines)        \} -> match }             eg. input -> Here is the result : {"new_items" : ["pen"]}      output -> {"new_items" : ["pen"]}
      const parsed = JSON.parse(match[0])                 // converts string to js object. eg, '{"mew_items" : ["pen"]}'  ->   {new_items : ["pen"]}

      res.json({
        new_items: parsed.new_items || [],                // sends to frontend. Always returns array. Safe fallback( || [])
      })
    } catch (err) {
      console.error(err)
      res.status(500).json({
        error : "AI request failed. Possible reason: API key expired / quota exceeded"
      })
    }
  },
)

app.listen(process.env.PORT, () => {
  console.log(`Server running on http://localhost:${process.env.PORT}`);
})

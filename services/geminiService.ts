import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const getClient = (): GoogleGenAI => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing. Please check your environment configuration.");
  }
  return new GoogleGenAI({ apiKey });
};

/**
 * Converts a File object to a Base64 string.
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the Data URI prefix (e.g., "data:image/jpeg;base64,") to get raw base64
      const base64Data = result.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = (error) => reject(error);
  });
};

/**
 * Solves a math problem from an image using Gemini 2.5 Flash with reasoning.
 */
export const solveMathProblem = async (
  base64Image: string, 
  mimeType: string
): Promise<string> => {
  const ai = getClient();

  // Using gemini-2.5-flash for a good balance of multimodal capability and speed.
  // We enable thinking to improve math reasoning capabilities.
  const modelName = "gemini-2.5-flash";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Image
            }
          },
          {
            text: `You are an expert mathematics tutor. 
            1. Analyze the image provided to identify the math problem.
            2. Break down the solution into clear, logical steps.
            3. Explain each step as if you are teaching a student.
            4. Provide the final answer clearly at the end.
            
            IMPORTANT FORMATTING RULES:
            - Use Markdown for text formatting.
            - Use LaTeX for ALL mathematical expressions.
            - Enclose inline math in single dollar signs: $x^2$.
            - Enclose block math in double dollar signs: $$ \frac{a}{b} $$.
            - Do not use code blocks for the final solution unless it's code.`
          }
        ]
      },
      config: {
        // Enable thinking for better reasoning on complex math problems
        thinkingConfig: {
            thinkingBudget: 2048 
        },
        temperature: 0.2, // Lower temperature for more deterministic/accurate math
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No solution generated.");
    }
    return text;

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "Failed to solve the math problem.");
  }
};

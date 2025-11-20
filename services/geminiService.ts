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
 * Solves a problem from an image using Gemini 2.5 Flash with reasoning.
 * Supports Math, Science, History, Coding, etc.
 */
export const solveProblem = async (
  base64Image: string, 
  mimeType: string
): Promise<string> => {
  const ai = getClient();

  // Using gemini-2.5-flash for a good balance of multimodal capability and speed.
  // We enable thinking to improve reasoning capabilities across all subjects.
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
            text: `You are an expert academic tutor capable of helping with Math, Physics, Chemistry, Biology, History, Literature, Computer Science, and more.
            
            1. Analyze the image provided to identify the homework question or problem.
            2. Identify the subject matter.
            3. Break down the solution into clear, logical steps appropriate for that subject.
            4. Explain concepts clearly as if teaching a student.
            5. Provide the final answer or conclusion clearly at the end.
            
            IMPORTANT FORMATTING RULES:
            - Use Markdown for text formatting.
            - Use LaTeX for mathematical expressions. Enclose inline math in single dollar signs ($x^2$) and block math in double dollar signs ($$ \frac{a}{b} $$).
            - Use Code Blocks for programming problems.
            - For non-STEM subjects (History, Literature), provide a well-structured essay or explanation.`
          }
        ]
      },
      config: {
        // Enable thinking for better reasoning on complex problems
        thinkingConfig: {
            thinkingBudget: 2048 
        },
        temperature: 0.2, // Lower temperature for more deterministic/accurate answers
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("No solution generated.");
    }
    return text;

  } catch (error: any) {
    console.error("Gemini Service Error:", error);
    throw new Error(error.message || "Failed to solve the problem.");
  }
};

import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { ImageFile } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

function fileToGenerativePart(base64: string, mimeType: string) {
  return {
    inlineData: {
      data: base64,
      mimeType,
    },
  };
}

export const findMatchingFaces = async (
  sourceImage: ImageFile,
  libraryImages: ImageFile[]
): Promise<ImageFile[]> => {
  const model = 'gemini-2.5-flash';
  const sourceImagePart = fileToGenerativePart(sourceImage.base64, sourceImage.file.type);

  const matchChecks = libraryImages.map(async (libraryImage) => {
    try {
      const libraryImagePart = fileToGenerativePart(libraryImage.base64, libraryImage.file.type);
      const prompt = "Does the person in the first image appear in the second image? Answer with only 'yes' or 'no'.";
      
      const response: GenerateContentResponse = await ai.models.generateContent({
          model,
          contents: { parts: [sourceImagePart, libraryImagePart, {text: prompt}] },
      });

      const text = response.text.trim().toLowerCase();
      if (text.includes('yes')) {
        return libraryImage;
      }
      return null;
    } catch (error) {
      console.error("Error processing an image with Gemini:", error);
      // Return null for this image and let others continue
      return null;
    }
  });

  const results = await Promise.all(matchChecks);
  return results.filter((image): image is ImageFile => image !== null);
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { GoogleGenAI, Modality } from "@google/genai";
import { Asset, PlacedLayer } from "../types";

/**
 * Helper to strip the data URL prefix (e.g. "data:image/png;base64,")
 */
const getBase64Data = (dataUrl: string): string => {
  return dataUrl.split(',')[1];
};

/**
 * Generates a product mockup using a pre-composited image as a reference.
 * This ensures exact placement of logos as defined by the user.
 */
export const generateMockup = async (
  compositeImage: string, // Base64 data URL of the canvas composite
  instruction: string,
  aspectRatio: string = "1:1",
  imageSize: string = "1K"
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-image-preview';

    // 1. Prepare the Composite Image
    const parts: any[] = [
      {
        inlineData: {
          mimeType: 'image/png',
          data: getBase64Data(compositeImage),
        },
      },
    ];

    // 2. Construct the Prompt
    // We treat this as an Image-to-Image task: "Make this rough composite look real"
    const finalPrompt = `
    Input: A rough design composite of a product with logos placed on it.
    Task: Transform this composite into a high-quality, photorealistic product mockup.
    
    Instructions:
    - ${instruction || "Apply realistic lighting and materials."}
    - KEEP the logos in the EXACT position, scale, and rotation as shown in the input image. Do not move them.
    - Apply realistic surface interaction: the logos should look like they are printed, embroidered, or embossed on the product material (warping, texture, lighting).
    - Ensure the lighting and shadows are consistent across the product and the logos.
    - Background should be clean or match the context of the product.
    
    Output ONLY the resulting image.
    `;

    parts.push({ text: finalPrompt });

    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: {
        responseModalities: [Modality.IMAGE],
        imageConfig: {
            aspectRatio: aspectRatio,
            imageSize: imageSize
        }
      },
    });

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                 return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
    throw new Error("No image data found in response");

  } catch (error) {
    console.error("Mockup generation failed:", error);
    throw error;
  }
};

/**
 * Generates a new logo or product base from scratch using text.
 */
export const generateAsset = async (
  prompt: string, 
  type: 'logo' | 'product',
  aspectRatio: string = "1:1",
  imageSize: string = "1K"
): Promise<string> => {
   try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-3-pro-image-preview';
    
    const enhancedPrompt = type === 'logo' 
        ? `A high-quality, professional vector-style logo design of a ${prompt}. Isolated on a pure white background. Minimalist and clean, single distinct logo.`
        : `Professional studio product photography of a single ${prompt}. Ghost mannequin style or flat lay. Front view, isolated on neutral background. High resolution, photorealistic. Single object only, no stacks, no duplicates.`;

    const response = await ai.models.generateContent({
        model,
        contents: {
            parts: [{ text: enhancedPrompt }]
        },
        config: {
            responseModalities: [Modality.IMAGE],
            imageConfig: {
              aspectRatio: aspectRatio,
              imageSize: imageSize
            }
        }
    });

    const candidates = response.candidates;
    if (candidates && candidates[0]?.content?.parts) {
        for (const part of candidates[0].content.parts) {
            if (part.inlineData && part.inlineData.data) {
                 return `data:image/png;base64,${part.inlineData.data}`;
            }
        }
    }
     throw new Error("No image generated");

   } catch (error) {
       console.error("Asset generation failed:", error);
       throw error;
   }
}

/**
 * Takes a raw AR composite and makes it photorealistic.
 */
export const generateRealtimeComposite = async (
    compositeImageBase64: string,
    prompt: string = "Make this look like a real photo"
  ): Promise<string> => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const model = 'gemini-3-pro-image-preview';
  
      const parts = [
        {
          inlineData: {
            mimeType: 'image/png',
            data: getBase64Data(compositeImageBase64),
          },
        },
        {
          text: `Input is a rough AR composite. Task: ${prompt}. 
          Render the overlaid object naturally into the scene. 
          Match the lighting, shadows, reflections, and perspective of the background. 
          Keep the background largely as is, but blend the object seamlessly.
          Output ONLY the resulting image.`,
        },
      ];
  
      const response = await ai.models.generateContent({
        model,
        contents: { parts },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });
  
      const candidates = response.candidates;
      if (candidates && candidates[0]?.content?.parts) {
          for (const part of candidates[0].content.parts) {
              if (part.inlineData && part.inlineData.data) {
                   return `data:image/png;base64,${part.inlineData.data}`;
              }
          }
      }
      throw new Error("No image data found in response");
  
    } catch (error) {
      console.error("AR Composite generation failed:", error);
      throw error;
    }
  };

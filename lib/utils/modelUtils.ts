import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { LanguageModelV1 } from "@ai-sdk/provider";
import { GoogleGenerativeAI } from '@google/generative-ai';

// Moved from lib/constants/llmModelPricing.ts
export type ModelPricingInfo = {
  inputCostPer1MTokens: number;
  outputCostPer1MTokens: number;
  contextWindowTokens: number;
};

export const MODEL_PRICING = {
  // OpenAI GPT-4 Models
  'gpt-4': { inputCostPer1MTokens: 30.00, outputCostPer1MTokens: 60.00, contextWindowTokens: 8192 },
  'gpt-4-turbo': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 },
  'gpt-4-turbo-2024-04-09': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 },
  'gpt-4-turbo-preview': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 },
  'gpt-4-0125-preview': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 },
  'gpt-4-1106-preview': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 },
  'gpt-4-0613': { inputCostPer1MTokens: 30.00, outputCostPer1MTokens: 60.00, contextWindowTokens: 8192 },

  // OpenAI GPT-4o Models
  'gpt-4o': { inputCostPer1MTokens: 5.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 128000 },
  'gpt-4o-2024-05-13': { inputCostPer1MTokens: 5.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 128000 },
  'gpt-4o-2024-08-06': { inputCostPer1MTokens: 5.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 128000 },
  'gpt-4o-mini': { inputCostPer1MTokens: 0.15, outputCostPer1MTokens: 0.60, contextWindowTokens: 128000 },
  'gpt-4o-mini-2024-07-18': { inputCostPer1MTokens: 0.15, outputCostPer1MTokens: 0.60, contextWindowTokens: 128000 },

  // OpenAI GPT-3.5 Models
  'gpt-3.5-turbo': { inputCostPer1MTokens: 0.50, outputCostPer1MTokens: 1.50, contextWindowTokens: 16385 },
  'gpt-3.5-turbo-0125': { inputCostPer1MTokens: 0.50, outputCostPer1MTokens: 1.50, contextWindowTokens: 16385 },
  'gpt-3.5-turbo-1106': { inputCostPer1MTokens: 0.50, outputCostPer1MTokens: 1.50, contextWindowTokens: 16385 },

  // Anthropic Claude Models
  'claude-3-5-sonnet-20240620': { inputCostPer1MTokens: 3.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 200000 },
  'claude-3-opus-20240229': { inputCostPer1MTokens: 15.00, outputCostPer1MTokens: 75.00, contextWindowTokens: 200000 },
  'claude-3-sonnet-20240229': { inputCostPer1MTokens: 3.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 200000 },
  'claude-3-haiku-20240307': { inputCostPer1MTokens: 0.25, outputCostPer1MTokens: 1.25, contextWindowTokens: 200000 },

  // Google Gemini Models
  'gemini-1.0-pro': { inputCostPer1MTokens: 2.0, outputCostPer1MTokens: 4.0, contextWindowTokens: 32000 },
  'gemini-1.5-pro-latest': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 },
  'gemini-1.5-pro': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 },
  'gemini-1.5-flash-latest': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 },
  'gemini-1.5-flash': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 },
  'gemini-2.0-flash': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 },
  'gemini-2.0-flash-preview-image-generation': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 262144 },
  'gemini-2.0-flash-lite': { inputCostPer1MTokens: 0.30, outputCostPer1MTokens: 0.90, contextWindowTokens: 1048576 },
  'gemini-2.0-flash-live-001': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 },
  'gemini-2.5-pro': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 },
  'gemini-2.5-pro-preview-05-06': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 },
  'gemini-2.5-flash-preview-05-06': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 },
  'gemini-2.5-pro-exp-03-25': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 }
} as const;

// Redefine ModelName based on the keys of MODEL_PRICING
export type ModelName = keyof typeof MODEL_PRICING;

// Type guard to validate model names, now uses keys from MODEL_PRICING
function isValidModelName(model: string): model is ModelName {
  return (Object.keys(MODEL_PRICING) as ModelName[]).includes(model as ModelName);
}

function getDefaultModelName(): ModelName {
  const envModel = process.env.DEFAULT_AI_MODEL;
  const defaultFallbackModel: ModelName = 'gemini-1.5-flash-latest';
  
  if (!envModel) return defaultFallbackModel;
  
  if (isValidModelName(envModel)) {
    return envModel as ModelName;
  }
  
  console.warn(`Invalid model name in DEFAULT_AI_MODEL: ${envModel}, falling back to ${defaultFallbackModel}`);
  return defaultFallbackModel;
}

export const DEFAULT_MODEL_NAME = getDefaultModelName();

export function getModel(modelName: ModelName = DEFAULT_MODEL_NAME): LanguageModelV1 {
  console.log(`🤖 Using AI model: ${modelName}`);
  
  if (modelName.startsWith("claude")) {
    return anthropic(modelName);
  }
  if (modelName.startsWith("gpt")) {
    return openai(modelName);
  }
  if (modelName.startsWith("gemini")) {
    return google(modelName, {
      topK: 0,
      safetySettings: [
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_NONE",
        },
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_NONE",
        },
      ],
    });
  }
  
  // Fallback for unexpected model names not caught by startsWith, though unlikely with ModelName type
  console.warn(`Model prefix not recognized for: ${modelName}. Attempting default model: ${DEFAULT_MODEL_NAME}`);
  // Re-evaluate default model's provider rather than assuming Anthropic for all fallbacks.
  if (DEFAULT_MODEL_NAME.startsWith("claude")) return anthropic(DEFAULT_MODEL_NAME);
  if (DEFAULT_MODEL_NAME.startsWith("gpt")) return openai(DEFAULT_MODEL_NAME);
  if (DEFAULT_MODEL_NAME.startsWith("gemini")) return google(DEFAULT_MODEL_NAME); 
  
  // Ultimate fallback if DEFAULT_MODEL_NAME is somehow invalid (should not happen)
  return anthropic('claude-3-haiku-20240307'); 
}

export async function logAvailableGoogleModels(): Promise<void> {
  console.log("\nAttempting to list available Google AI Models directly from API...");
  try {
    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set. Cannot list models.");
      return;
    }
    const genAI = new GoogleGenerativeAI(apiKey);
    // const result = await genAI.listModels(); // Old attempt
    // According to documentation and common patterns, listModels might be on a sub-property like .models
    // However, the exact structure can vary. If this also fails, the SDK's specific API for listing needs to be confirmed.
    // For now, let's assume it might be on a `models` property if the direct call failed.
    // The @ai-sdk/google might wrap this differently, or this direct usage of @google/generative-ai isn't how @ai-sdk expects it.

    // The most direct way to list models as per Google's REST API documentation is a GET request.
    // However, since we are trying to use the installed SDK, let's try to find its method.
    // The error was "Property 'listModels' does not exist on type 'GoogleGenerativeAI'"
    // The new `@google/genai` SDK documentation shows `ai.models.generateContent`, suggesting listing might be `ai.models.list()`
    // Let's try to adapt to that structure if such a sub-object exists and has listModels.
    // This is speculative as the exact API of the version of @google/generative-ai used by @ai-sdk/google might differ.

    // Given the previous error, it's likely the `GoogleGenerativeAI` instance itself doesn't have `listModels`.
    // Let's try using the Fetch API directly to the REST endpoint as a more robust fallback for listing.
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to list models via REST API: ${response.status} - ${errorText}`);
      return;
    }
    const data = await response.json();

    console.log("Available Google Models (via REST API call):");
    if (data.models && Array.isArray(data.models)) {
      for (const m of data.models) {
        console.log("--------------------------------------------------");
        console.log(`  Name: ${m.name}`); // e.g., models/gemini-pro
        console.log(`  Display Name: ${m.displayName}`);
        console.log(`  Description: ${(m.description || '').substring(0, 150)}${(m.description || '').length > 150 ? '...' : ''}`);
        console.log(`  Version: ${m.version}`);
        console.log(`  Supported Generation Methods: ${m.supportedGenerationMethods?.join(', ') || 'N/A'}`);
        if (m.inputTokenLimit) console.log(`  Input Token Limit: ${m.inputTokenLimit}`);
        if (m.outputTokenLimit) console.log(`  Output Token Limit: ${m.outputTokenLimit}`);
      }
      console.log("--------------------------------------------------");
      console.log("Note: Not all listed models may be suitable for 'generateContent' with the @ai-sdk. Check 'Supported Generation Methods'.");
    } else {
      console.log("No models array found in REST API response or response format unexpected.", data);
    }

  } catch (err) {
    console.error("Failed to list Google AI Models:", err instanceof Error ? err.message : String(err));
    if (err instanceof Error && err.stack) {
        console.error(err.stack);
    }
  }
}

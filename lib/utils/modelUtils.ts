import { anthropic } from "@ai-sdk/anthropic";
import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { LanguageModelV1 } from "@ai-sdk/provider";

function getDefaultModelName(): ModelName {
  const envModel = process.env.DEFAULT_AI_MODEL;
  if (!envModel) return 'gemini-2.5-flash-preview-05-06';
  
  // Validate that the env value is a valid ModelName
  if (isValidModelName(envModel)) {
    return envModel as ModelName;
  }
  
  console.warn(`Invalid model name in DEFAULT_AI_MODEL: ${envModel}, falling back to gpt-4o-mini`);
  return 'gpt-4o-mini';
}

// Type guard to validate model names
function isValidModelName(model: string): model is ModelName {
  const validModels = [
    'claude-3-5-sonnet-20240620',
    'claude-3-opus-20240229',
    'claude-3-sonnet-20240229',
    'claude-3-haiku-20240307',
    'gpt-4o',
    'gpt-4o-2024-05-13',
    'gpt-4o-2024-08-06',
    'gpt-4o-mini',
    'gpt-4o-mini-2024-07-18',
    'gpt-4-turbo',
    'gpt-4-turbo-2024-04-09',
    'gpt-4-turbo-preview',
    'gpt-4-0125-preview',
    'gpt-4-1106-preview',
    'gpt-4',
    'gpt-4-0613',
    'gpt-3.5-turbo-0125',
    'gpt-3.5-turbo',
    'gpt-3.5-turbo-1106',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
    'gemini-1.0-pro',
    'gemini-2.0-flash',
    'gemini-2.0-flash-preview-image-generation',
    'gemini-2.0-flash-lite',
    'gemini-2.0-flash-live-001',
    'gemini-2.5-pro',
    'gemini-2.5-pro-preview-05-06',
    'gemini-2.5-flash-preview-05-06'
  ] as const;
  
  return validModels.includes(model as ModelName);
}

export const DEFAULT_MODEL_NAME = getDefaultModelName();

export type ModelName = 
    | 'claude-3-5-sonnet-20240620'
    | 'claude-3-opus-20240229'
    | 'claude-3-sonnet-20240229'
    | 'claude-3-haiku-20240307'
    | 'gpt-4o'
    | 'gpt-4o-2024-05-13'
    | 'gpt-4o-2024-08-06'
    | 'gpt-4o-mini'
    | 'gpt-4o-mini-2024-07-18'
    | 'gpt-4-turbo'
    | 'gpt-4-turbo-2024-04-09'
    | 'gpt-4-turbo-preview'
    | 'gpt-4-0125-preview'
    | 'gpt-4-1106-preview'
    | 'gpt-4'
    | 'gpt-4-0613'
    | 'gpt-3.5-turbo-0125'
    | 'gpt-3.5-turbo'
    | 'gpt-3.5-turbo-1106'
    | 'gemini-1.5-flash-latest'
    | 'gemini-1.5-flash'
    | 'gemini-1.5-pro-latest'
    | 'gemini-1.5-pro'
    | 'gemini-1.0-pro'
    | 'gemini-2.0-flash'
    | 'gemini-2.0-flash-preview-image-generation'
    | 'gemini-2.0-flash-lite'
    | 'gemini-2.0-flash-live-001'
    | 'gemini-2.5-pro'
    | 'gemini-2.5-pro-preview-05-06'
    | 'gemini-2.5-flash-preview-05-06';


export function getModel(modelName: ModelName = DEFAULT_MODEL_NAME): LanguageModelV1 {
  console.log(`🤖 Using AI model: ${modelName}`);
  
  if (modelName.includes("claude")) {
    return anthropic(modelName)
  }
  if (modelName.includes("gpt")) {
    return openai(modelName)
  }
  if (modelName.includes("gemini")) {
    return google("models/" + modelName, {
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
    })
  }
  return anthropic(DEFAULT_MODEL_NAME) // Default model
}

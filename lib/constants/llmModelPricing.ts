import { ModelName } from '@/lib/utils/modelUtils';

// Updated type definition
export type ModelPricingInfo = {
  inputCostPer1MTokens: number;
  outputCostPer1MTokens: number;
  contextWindowTokens: number;
};

export const MODEL_PRICING: Record<ModelName, ModelPricingInfo> = {
  // OpenAI GPT-4 Models
  'gpt-4': { inputCostPer1MTokens: 30.00, outputCostPer1MTokens: 60.00, contextWindowTokens: 8192 }, // Older GPT-4, assuming 8k variant pricing
  'gpt-4-turbo': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 },
  'gpt-4-turbo-2024-04-09': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 },
  'gpt-4-turbo-preview': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 }, // Typically alias for a recent turbo
  'gpt-4-0125-preview': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 }, // Specific preview
  'gpt-4-1106-preview': { inputCostPer1MTokens: 10.00, outputCostPer1MTokens: 30.00, contextWindowTokens: 128000 }, // Specific preview
  'gpt-4-0613': { inputCostPer1MTokens: 30.00, outputCostPer1MTokens: 60.00, contextWindowTokens: 8192 }, // Older GPT-4 with function calling

  // OpenAI GPT-4o Models
  'gpt-4o': { inputCostPer1MTokens: 5.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 128000 },
  'gpt-4o-2024-05-13': { inputCostPer1MTokens: 5.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 128000 },
  'gpt-4o-2024-08-06': { inputCostPer1MTokens: 5.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 128000 },
  'gpt-4o-mini': { inputCostPer1MTokens: 0.15, outputCostPer1MTokens: 0.60, contextWindowTokens: 128000 },
  'gpt-4o-mini-2024-07-18': { inputCostPer1MTokens: 0.15, outputCostPer1MTokens: 0.60, contextWindowTokens: 128000 },

  // OpenAI GPT-3.5 Models
  'gpt-3.5-turbo': { inputCostPer1MTokens: 0.50, outputCostPer1MTokens: 1.50, contextWindowTokens: 16385 }, // Usually refers to 16k variant like 0125
  'gpt-3.5-turbo-0125': { inputCostPer1MTokens: 0.50, outputCostPer1MTokens: 1.50, contextWindowTokens: 16385 },
  'gpt-3.5-turbo-1106': { inputCostPer1MTokens: 0.50, outputCostPer1MTokens: 1.50, contextWindowTokens: 16385 }, // Also a 16k variant

  // Anthropic Claude Models
  'claude-3-5-sonnet-20240620': { inputCostPer1MTokens: 3.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 200000 },
  'claude-3-opus-20240229': { inputCostPer1MTokens: 15.00, outputCostPer1MTokens: 75.00, contextWindowTokens: 200000 },
  'claude-3-sonnet-20240229': { inputCostPer1MTokens: 3.00, outputCostPer1MTokens: 15.00, contextWindowTokens: 200000 }, // Original Sonnet
  'claude-3-haiku-20240307': { inputCostPer1MTokens: 0.25, outputCostPer1MTokens: 1.25, contextWindowTokens: 200000 },

  // Google Gemini Models (prices from previous steps, context windows are general estimates)
  'gemini-1.0-pro': { inputCostPer1MTokens: 2.0, outputCostPer1MTokens: 4.0, contextWindowTokens: 32000 },
  'gemini-1.5-pro-latest': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 },
  'gemini-1.5-pro': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 },
  'gemini-1.5-flash-latest': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 },
  'gemini-1.5-flash': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 },
  
  // Newer Gemini Models (from modelUtils, pricing and context are estimates/placeholders if not found)
  'gemini-2.0-flash': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 }, // Placeholder
  'gemini-2.0-flash-preview-image-generation': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 262144 }, // Placeholder, image models might differ
  'gemini-2.0-flash-lite': { inputCostPer1MTokens: 0.30, outputCostPer1MTokens: 0.90, contextWindowTokens: 1048576 }, // Placeholder
  'gemini-2.0-flash-live-001': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 }, // Placeholder
  'gemini-2.5-pro': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 }, // Placeholder based on 1.5 Pro
  'gemini-2.5-pro-preview-05-06': { inputCostPer1MTokens: 3.5, outputCostPer1MTokens: 10.5, contextWindowTokens: 1048576 }, // Placeholder
  'gemini-2.5-flash-preview-05-06': { inputCostPer1MTokens: 0.35, outputCostPer1MTokens: 1.05, contextWindowTokens: 1048576 } // Placeholder
} as const;

// Ensure all model names from ModelName (in modelUtils.ts) are present in MODEL_PRICING
// This is a check to help keep them in sync.
// It's a bit manual but useful during development.
// Consider a more automated test if this becomes unwieldy. 
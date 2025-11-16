import { prisma } from "./prisma";
import { decrypt } from "./encryption";
import OpenAI from "openai";

// Types
export interface AiCallOptions {
  featureCode: string;
  messages?: Array<{ role: string; content: string }>;
  prompt?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  responseFormat?: { type: "json_object" } | { type: "text" };
}

export interface AiCallResult {
  success: boolean;
  content?: string;
  provider?: string;
  keyId?: string;
  error?: string;
}

// Provider implementations
async function callOpenAI(
  apiKey: string,
  options: AiCallOptions
): Promise<{ content: string }> {
  const openai = new OpenAI({ apiKey });
  
  const messages = options.messages || [
    { role: "user", content: options.prompt || "" },
  ];

  const completion = await openai.chat.completions.create({
    model: options.model || "gpt-4o-mini",
    messages: messages as any,
    temperature: options.temperature ?? 0.7,
    max_tokens: options.maxTokens,
    response_format: options.responseFormat as any,
  });

  const content = completion.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from OpenAI");
  }

  return { content };
}

async function callGemini(
  apiKey: string,
  options: AiCallOptions
): Promise<{ content: string }> {
  // Gemini API implementation
  // This is a placeholder - actual implementation would use Google's Gemini SDK
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${options.model || "gemini-1.5-pro"}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: options.prompt || options.messages?.[options.messages.length - 1]?.content || "",
              },
            ],
          },
        ],
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini API error: ${error}`);
  }

  const data = await response.json();
  const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) {
    throw new Error("No response from Gemini");
  }

  return { content };
}

async function callClaude(
  apiKey: string,
  options: AiCallOptions
): Promise<{ content: string }> {
  // Claude API implementation
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: options.model || "claude-3-opus-20240229",
      max_tokens: options.maxTokens || 1024,
      messages: options.messages?.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: m.content,
      })) || [{ role: "user", content: options.prompt || "" }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${error}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text;
  if (!content) {
    throw new Error("No response from Claude");
  }

  return { content };
}

// Provider call map
const providerCallers: Record<
  string,
  (apiKey: string, options: AiCallOptions) => Promise<{ content: string }>
> = {
  OPENAI: callOpenAI,
  GEMINI: callGemini,
  CLAUDE: callClaude,
};

// Key health management
async function markKeyFailure(keyId: string, error: string) {
  await prisma.aiProviderKey.update({
    where: { id: keyId },
    data: {
      status: "failing",
      lastErrorAt: new Date(),
      failureCount: { increment: 1 },
    },
  });
}

async function markKeySuccess(keyId: string) {
  await prisma.aiProviderKey.update({
    where: { id: keyId },
    data: {
      status: "healthy",
      lastUsedAt: new Date(),
      failureCount: 0,
    },
  });
}

// Get healthy keys for a provider, ordered by priority
async function getHealthyKeys(providerId: string) {
  const keys = await prisma.aiProviderKey.findMany({
    where: {
      providerId,
      status: { in: ["healthy", "failing"] }, // Include failing to retry after some time
    },
    orderBy: [
      { priority: "asc" },
      { lastUsedAt: { sort: "asc", nullsFirst: true } },
    ],
  });

  // Filter out keys that have failed recently (within last 5 minutes)
  const now = new Date();
  const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

  return keys.filter((key) => {
    if (key.status === "healthy") return true;
    // Retry failing keys if last error was more than 5 minutes ago
    if (key.status === "failing" && key.lastErrorAt) {
      return new Date(key.lastErrorAt) < fiveMinutesAgo;
    }
    return true;
  });
}

// Main orchestrator function
export async function callAI(options: AiCallOptions): Promise<AiCallResult> {
  try {
    // Get feature config
    const featureConfig = await prisma.aiFeatureConfig.findUnique({
      where: { featureCode: options.featureCode },
      include: {
        primaryProvider: true,
        secondaryProvider: true,
      },
    });

    if (!featureConfig) {
      return {
        success: false,
        error: `Feature config not found for ${options.featureCode}`,
      };
    }

    // Merge feature settings with options
    const settings = (featureConfig.settings as any) || {};
    const finalOptions: AiCallOptions = {
      ...options,
      model: options.model || settings.model,
      temperature: options.temperature ?? settings.temperature ?? 0.7,
      maxTokens: options.maxTokens || settings.maxTokens,
    };

    // Try primary provider first
    if (featureConfig.primaryProvider) {
      const result = await tryProvider(
        featureConfig.primaryProvider.code,
        featureConfig.primaryProvider.id,
        finalOptions
      );
      if (result.success) {
        return result;
      }
    }

    // Fallback to secondary provider
    if (featureConfig.secondaryProvider) {
      const result = await tryProvider(
        featureConfig.secondaryProvider.code,
        featureConfig.secondaryProvider.id,
        finalOptions
      );
      if (result.success) {
        return result;
      }
    }

    return {
      success: false,
      error: "All providers failed",
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Unknown error",
    };
  }
}

async function tryProvider(
  providerCode: string,
  providerId: string,
  options: AiCallOptions
): Promise<AiCallResult> {
  const keys = await getHealthyKeys(providerId);

  if (keys.length === 0) {
    return {
      success: false,
      error: `No healthy keys for provider ${providerCode}`,
    };
  }

  const caller = providerCallers[providerCode];
  if (!caller) {
    return {
      success: false,
      error: `Unknown provider: ${providerCode}`,
    };
  }

  // Try each key in order
  for (const key of keys) {
    try {
      const decryptedKey = decrypt(key.apiKeyEnc);
      const result = await caller(decryptedKey, {
        ...options,
        model: options.model || undefined,
      });

      // Mark key as successful
      await markKeySuccess(key.id);

      return {
        success: true,
        content: result.content,
        provider: providerCode,
        keyId: key.id,
      };
    } catch (error: any) {
      // Mark key as failing
      await markKeyFailure(key.id, error.message);

      // Continue to next key
      continue;
    }
  }

  return {
    success: false,
    error: `All keys failed for provider ${providerCode}`,
  };
}


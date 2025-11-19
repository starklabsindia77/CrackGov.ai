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

/**
 * Call Gemini API with comprehensive failsafe mechanisms
 * Includes retry logic, timeout handling, error recovery, and safety filters
 */
async function callGemini(
  apiKey: string,
  options: AiCallOptions
): Promise<{ content: string }> {
  const maxRetries = 3;
  const baseDelay = 1000; // 1 second
  const timeout = 60000; // 60 seconds timeout
  // Default model: gemini-2.0-flash-lite (can be overridden via options.model or feature settings)
  const model = options.model || "gemini-2.0-flash-lite";
  
  // Build prompt from messages or direct prompt
  const promptText = options.prompt || 
    options.messages?.map(m => `${m.role}: ${m.content}`).join("\n") ||
    options.messages?.[options.messages.length - 1]?.content || 
    "";

  if (!promptText.trim()) {
    throw new Error("Empty prompt provided to Gemini");
  }

  // Safety settings for Gemini
  const safetySettings = [
    {
      category: "HARM_CATEGORY_HARASSMENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_HATE_SPEECH",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    },
    {
      category: "HARM_CATEGORY_DANGEROUS_CONTENT",
      threshold: "BLOCK_MEDIUM_AND_ABOVE"
    }
  ];

  // Generation config
  const generationConfig = {
    temperature: options.temperature ?? 0.7,
    maxOutputTokens: options.maxTokens || 2048,
    topP: 0.95,
    topK: 40,
  };

  let lastError: Error | null = null;

  // Retry loop with exponential backoff
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        
        const response = await fetch(url, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: promptText,
                  },
                ],
              },
            ],
            safetySettings,
            generationConfig,
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        // Handle rate limiting
        if (response.status === 429) {
          const retryAfter = response.headers.get("Retry-After");
          const waitTime = retryAfter 
            ? parseInt(retryAfter) * 1000 
            : baseDelay * Math.pow(2, attempt);
          
          if (attempt < maxRetries - 1) {
            console.warn(`Gemini rate limited. Retrying after ${waitTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            continue;
          }
          throw new Error("Gemini API rate limit exceeded. Please try again later.");
        }

        // Handle quota exceeded
        if (response.status === 403) {
          const errorData = await response.json().catch(() => ({}));
          if (errorData.error?.message?.includes("quota") || 
              errorData.error?.message?.includes("billing")) {
            const error = new Error("Gemini API quota exceeded. Please check your billing.");
            (error as any).statusCode = 403;
            throw error;
          }
        }

        // Handle other errors
        if (!response.ok) {
          let errorMessage = `Gemini API error (${response.status})`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error?.message || 
                          errorData.error?.status || 
                          JSON.stringify(errorData);
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          
          // Create error with status code
          const error = new Error(errorMessage);
          (error as any).statusCode = response.status;
          
          // Don't retry on client errors (4xx) except 429
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            throw error;
          }
          
          // Retry on server errors (5xx)
          if (response.status >= 500) {
            lastError = error;
            if (attempt < maxRetries - 1) {
              const delay = baseDelay * Math.pow(2, attempt);
              console.warn(`Gemini server error. Retrying after ${delay}ms...`);
              await new Promise(resolve => setTimeout(resolve, delay));
              continue;
            }
            throw lastError;
          }
          
          throw error;
        }

        // Parse response
        const data = await response.json();

        // Check for safety blocks
        if (data.candidates?.[0]?.finishReason === "SAFETY") {
          throw new Error("Gemini blocked the response due to safety filters. Please modify your prompt.");
        }

        // Check for other finish reasons
        if (data.candidates?.[0]?.finishReason && 
            data.candidates[0].finishReason !== "STOP") {
          const reason = data.candidates[0].finishReason;
          throw new Error(`Gemini stopped generation: ${reason}`);
        }

        // Extract content
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!content) {
          // Check if there are any candidates at all
          if (!data.candidates || data.candidates.length === 0) {
            throw new Error("No candidates returned from Gemini API");
          }
          
          // Check for blocked content
          if (data.promptFeedback?.blockReason) {
            throw new Error(`Gemini blocked the prompt: ${data.promptFeedback.blockReason}`);
          }
          
          throw new Error("No content in Gemini response");
        }

        // Validate content is not empty
        if (content.trim().length === 0) {
          throw new Error("Empty content returned from Gemini");
        }

        return { content };

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        // Handle timeout
        if (fetchError.name === "AbortError") {
          throw new Error(`Gemini API request timed out after ${timeout}ms`);
        }

        // Handle network errors
        if (fetchError instanceof TypeError && fetchError.message.includes("fetch")) {
          lastError = new Error(`Network error connecting to Gemini API: ${fetchError.message}`);
          if (attempt < maxRetries - 1) {
            const delay = baseDelay * Math.pow(2, attempt);
            console.warn(`Network error. Retrying after ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            continue;
          }
          throw lastError;
        }

        // Re-throw other errors
        throw fetchError;
      }

    } catch (error: any) {
      lastError = error;
      
      // Don't retry on certain errors
      if (error.message?.includes("quota") ||
          error.message?.includes("billing") ||
          error.message?.includes("safety") ||
          error.message?.includes("blocked") ||
          error.message?.includes("client error")) {
        throw error;
      }

      // Last attempt - throw the error
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff before retry
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`Gemini API call failed (attempt ${attempt + 1}/${maxRetries}). Retrying after ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // Should never reach here, but TypeScript needs it
  throw lastError || new Error("Gemini API call failed after all retries");
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

// Key health management with enhanced failsafe mechanisms
const MAX_FAILURES_BEFORE_DISABLE = 5; // Auto-disable after 5 consecutive failures
const FAILURE_COOLDOWN_MINUTES = 5; // Retry failing keys after 5 minutes
const PERMANENT_ERROR_KEYWORDS = [
  "invalid",
  "unauthorized",
  "forbidden",
  "quota exceeded",
  "billing",
  "api key",
  "authentication",
  "permission denied",
];

/**
 * Categorize error to determine if it's permanent (should disable key)
 */
function isPermanentError(error: string, statusCode?: number): boolean {
  const errorLower = error.toLowerCase();
  
  // HTTP status codes that indicate permanent issues
  if (statusCode === 401 || statusCode === 403) {
    return true; // Invalid key or permission denied
  }
  
  // Check for permanent error keywords
  return PERMANENT_ERROR_KEYWORDS.some(keyword => errorLower.includes(keyword));
}

/**
 * Mark API key as failed with enhanced failsafe logic
 */
async function markKeyFailure(keyId: string, error: string, statusCode?: number) {
  const key = await prisma.aiProviderKey.findUnique({
    where: { id: keyId },
  });

  if (!key) return;

  const isPermanent = isPermanentError(error, statusCode);
  const newFailureCount = (key.failureCount || 0) + 1;
  
  // Determine new status
  let newStatus: string;
  if (isPermanent) {
    // Permanent errors (invalid key, quota exceeded) - disable immediately
    newStatus = "disabled";
    console.warn(`🔴 Disabling API key ${keyId} due to permanent error: ${error}`);
  } else if (newFailureCount >= MAX_FAILURES_BEFORE_DISABLE) {
    // Too many consecutive failures - disable key
    newStatus = "disabled";
    console.warn(`🔴 Disabling API key ${keyId} after ${newFailureCount} consecutive failures`);
  } else {
    // Temporary error - mark as failing
    newStatus = "failing";
  }

  await prisma.aiProviderKey.update({
    where: { id: keyId },
    data: {
      status: newStatus,
      lastErrorAt: new Date(),
      failureCount: newFailureCount,
    },
  });
}

/**
 * Mark API key as successful and reset failure count
 */
async function markKeySuccess(keyId: string) {
  const key = await prisma.aiProviderKey.findUnique({
    where: { id: keyId },
  });

  if (!key) return;

  // Only update if key was previously failing or disabled (recovery)
  if (key.status === "failing" || key.status === "disabled") {
    console.log(`✅ Recovered API key ${keyId} - marking as healthy`);
  }

  await prisma.aiProviderKey.update({
    where: { id: keyId },
    data: {
      status: "healthy",
      lastUsedAt: new Date(),
      failureCount: 0,
      lastErrorAt: null, // Clear error timestamp on success
    },
  });
}

/**
 * Get healthy keys for a provider with enhanced failsafe filtering
 * Automatically attempts to recover disabled keys after cooldown period
 */
async function getHealthyKeys(providerId: string) {
  const keys = await prisma.aiProviderKey.findMany({
    where: {
      providerId,
      status: { in: ["healthy", "failing", "disabled"] }, // Include disabled for recovery attempts
    },
    orderBy: [
      { priority: "asc" },
      { lastUsedAt: { sort: "asc", nullsFirst: true } },
    ],
  });

  const now = new Date();
  const cooldownTime = new Date(now.getTime() - FAILURE_COOLDOWN_MINUTES * 60 * 1000);
  const RECOVERY_COOLDOWN_HOURS = 24; // Try to recover disabled keys after 24 hours

  const healthyKeys: typeof keys = [];
  const keysToRecover: typeof keys = [];

  for (const key of keys) {
    // Always include healthy keys
    if (key.status === "healthy") {
      healthyKeys.push(key);
      continue;
    }

    // Retry failing keys if cooldown period has passed
    if (key.status === "failing") {
      if (!key.lastErrorAt || new Date(key.lastErrorAt) < cooldownTime) {
        healthyKeys.push(key);
      }
      continue;
    }

    // Attempt recovery of disabled keys after recovery cooldown
    // Only if failure count is below threshold (might have been disabled due to temporary issues)
    if (key.status === "disabled") {
      if (!key.lastErrorAt) continue; // No error timestamp, keep disabled
      
      const errorAge = now.getTime() - new Date(key.lastErrorAt).getTime();
      const hoursSinceError = errorAge / (1000 * 60 * 60);
      
      // Only attempt recovery if:
      // 1. Enough time has passed (24 hours)
      // 2. Failure count is reasonable (might have been temporary issue)
      if (hoursSinceError >= RECOVERY_COOLDOWN_HOURS && 
          (key.failureCount || 0) < MAX_FAILURES_BEFORE_DISABLE) {
        console.log(`🔄 Attempting recovery of disabled key ${key.id} after ${hoursSinceError.toFixed(1)} hours`);
        keysToRecover.push(key);
      }
    }
  }

  // Update keys to be recovered and add them to healthy keys
  if (keysToRecover.length > 0) {
    await Promise.all(
      keysToRecover.map(key =>
        prisma.aiProviderKey.update({
          where: { id: key.id },
          data: {
            status: "failing", // Move to failing status for recovery attempt
            failureCount: 0,
          },
        })
      )
    );
    // Add recovered keys to healthy keys list
    keysToRecover.forEach(key => {
      healthyKeys.push({ ...key, status: "failing", failureCount: 0 });
    });
  }

  return healthyKeys;
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
        tertiaryProvider: true,
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

    // Fallback to tertiary provider
    if (featureConfig.tertiaryProvider) {
      const result = await tryProvider(
        featureConfig.tertiaryProvider.code,
        featureConfig.tertiaryProvider.id,
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

  // Try each key in order with enhanced error handling
  let lastKeyError: { keyId: string; error: string; statusCode?: number } | null = null;

  for (const key of keys) {
    try {
      // Validate key exists and is not empty
      if (!key.apiKeyEnc || key.apiKeyEnc.trim().length === 0) {
        console.warn(`⚠️  Skipping key ${key.id} - empty API key`);
        await markKeyFailure(key.id, "Empty API key", 401);
        continue;
      }

      const decryptedKey = decrypt(key.apiKeyEnc);
      
      // Basic validation of decrypted key
      if (!decryptedKey || decryptedKey.trim().length === 0) {
        console.warn(`⚠️  Skipping key ${key.id} - invalid decrypted key`);
        await markKeyFailure(key.id, "Invalid decrypted API key", 401);
        continue;
      }

      // Attempt API call
      const result = await caller(decryptedKey, {
        ...options,
        model: options.model || undefined,
      });

      // Mark key as successful (this will recover previously failing/disabled keys)
      await markKeySuccess(key.id);

      return {
        success: true,
        content: result.content,
        provider: providerCode,
        keyId: key.id,
      };
    } catch (error: any) {
      // Extract status code if available (from API response errors)
      let statusCode: number | undefined;
      if (error.statusCode) {
        // Status code attached to error object
        statusCode = error.statusCode;
      } else if (error.response?.status) {
        statusCode = error.response.status;
      } else if (error.status) {
        statusCode = error.status;
      } else if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        statusCode = 401;
      } else if (error.message?.includes("403") || error.message?.includes("Forbidden")) {
        statusCode = 403;
      }

      // Store error for reporting
      lastKeyError = {
        keyId: key.id,
        error: error.message || "Unknown error",
        statusCode,
      };

      // Mark key as failing with enhanced error categorization
      await markKeyFailure(key.id, error.message || "Unknown error", statusCode);

      // Log the failure
      console.warn(`⚠️  API key ${key.id} failed: ${error.message}${statusCode ? ` (HTTP ${statusCode})` : ""}`);

      // Continue to next key
      continue;
    }
  }

  // ============================================
  // FINAL FAILSAFE: Environment Variable Fallback (Gemini only)
  // ============================================
  // If all database-configured keys fail, attempt to use key from .env file
  // This is a last-resort failsafe to ensure service continuity
  // Note: The env key is NOT tracked in the database (no health monitoring)
  if (providerCode === "GEMINI") {
    const envKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GEMINI_API_KEY;
    
    if (envKey && envKey.trim().length > 0) {
      console.warn(`⚠️  All database keys failed for Gemini. Attempting fallback to .env key (GEMINI_API_KEY)...`);
      
      try {
        const result = await caller(envKey.trim(), {
          ...options,
          model: options.model || undefined,
        });

        console.log(`✅ Fallback Gemini key from .env succeeded - service restored`);
        
        return {
          success: true,
          content: result.content,
          provider: providerCode,
          keyId: "env-fallback", // Indicate this is from env, not database
        };
      } catch (error: any) {
        console.error(`❌ Fallback Gemini key from .env also failed: ${error.message}`);
        // Don't throw - continue to return error about all keys failing
      }
    } else {
      console.warn(`⚠️  No GEMINI_API_KEY or GOOGLE_GEMINI_API_KEY found in .env for fallback`);
    }
  }

  // All keys failed - provide detailed error message
  const errorMessage = lastKeyError
    ? `All keys failed for provider ${providerCode}. Last error: ${lastKeyError.error}`
    : `All keys failed for provider ${providerCode}`;

  return {
    success: false,
    error: errorMessage,
  };
}


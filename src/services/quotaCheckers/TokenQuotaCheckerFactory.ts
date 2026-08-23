/**
 * 🏛️ [JKADH PAT-CRE-01] Token Quota Checker Factory & Registry
 * Reference: /docs/16-design-patterns-and-technical-architecture-catalog.md
 */

import { ITokenQuotaChecker } from './types';
import { GoogleGeminiQuotaChecker } from './GoogleGeminiQuotaChecker';
import { OpenAiQuotaChecker } from './OpenAiQuotaChecker';
import { AnthropicQuotaChecker } from './AnthropicQuotaChecker';
import { DeepSeekQuotaChecker } from './DeepSeekQuotaChecker';
import { LocalManusQuotaChecker } from './LocalManusQuotaChecker';

export class TokenQuotaCheckerFactory {
  private static instance: TokenQuotaCheckerFactory;
  private readonly registry: Map<string, ITokenQuotaChecker> = new Map();

  private constructor() {
    // Register Default Strategy Instances (Flyweight / Singleton)
    this.register('GOOGLE', new GoogleGeminiQuotaChecker());
    this.register('OPENAI', new OpenAiQuotaChecker());
    this.register('ANTHROPIC', new AnthropicQuotaChecker());
    this.register('DEEPSEEK', new DeepSeekQuotaChecker());
    this.register('MANUS', new LocalManusQuotaChecker());
  }

  public static getInstance(): TokenQuotaCheckerFactory {
    if (!TokenQuotaCheckerFactory.instance) {
      TokenQuotaCheckerFactory.instance = new TokenQuotaCheckerFactory();
    }
    return TokenQuotaCheckerFactory.instance;
  }

  /**
   * Register or override a strategy for a provider
   */
  public register(providerKey: string, checker: ITokenQuotaChecker): void {
    this.registry.set(providerKey.toUpperCase(), checker);
  }

  /**
   * Resolve strategy by provider name or model ID
   */
  public getChecker(providerOrModelId: string): ITokenQuotaChecker {
    const key = providerOrModelId.toUpperCase();

    if (this.registry.has(key)) {
      return this.registry.get(key)!;
    }

    // Heuristic inference if modelId is passed (e.g. 'claude-3-7-sonnet' -> 'ANTHROPIC')
    if (key.includes('GEMINI') || key.includes('GOOGLE')) {
      return this.registry.get('GOOGLE')!;
    }
    if (key.includes('GPT') || key.includes('O1') || key.includes('OPENAI') || key.includes('CODEX')) {
      return this.registry.get('OPENAI')!;
    }
    if (key.includes('CLAUDE') || key.includes('ANTHROPIC') || key.includes('SONNET') || key.includes('OPUS')) {
      return this.registry.get('ANTHROPIC')!;
    }
    if (key.includes('DEEPSEEK')) {
      return this.registry.get('DEEPSEEK')!;
    }
    if (key.includes('MANUS') || key.includes('LOCAL') || key.includes('OLLAMA')) {
      return this.registry.get('MANUS')!;
    }

    // Fallback default
    return this.registry.get('GOOGLE')!;
  }

  /**
   * List all registered strategies
   */
  public getAllCheckers(): { provider: string; checker: ITokenQuotaChecker }[] {
    return Array.from(this.registry.entries()).map(([provider, checker]) => ({
      provider,
      checker,
    }));
  }
}

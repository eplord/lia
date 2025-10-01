import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

/**
 * AI Provider types
 */
export type AIProvider = 'openai' | 'anthropic' | 'google' | 'ollama';

/**
 * AI Response interface
 */
interface AIResponse {
  tags: string[];
  summary?: string;
  suggestedCollection?: string;
  confidence?: number;
}

/**
 * AI Service - Multi-provider abstraction for AI features
 */
export class AIService {
  private openai?: OpenAI;
  private anthropic?: Anthropic;
  private google?: GoogleGenerativeAI;
  private defaultProvider: AIProvider;

  constructor() {
    this.defaultProvider = (process.env.DEFAULT_AI_PROVIDER as AIProvider) || 'openai';
    this.initializeProviders();
  }

  /**
   * Initialize AI providers based on available API keys
   */
  private initializeProviders() {
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      logger.info('OpenAI provider initialized');
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
      logger.info('Anthropic provider initialized');
    }

    if (process.env.GOOGLE_API_KEY) {
      this.google = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
      logger.info('Google Gemini provider initialized');
    }
  }

  /**
   * Check if AI tagging is enabled and available
   */
  isEnabled(): boolean {
    const enabled = process.env.ENABLE_AI_TAGGING === 'true';
    const hasProvider = this.openai || this.anthropic || this.google;
    return enabled && !!hasProvider;
  }

  /**
   * Generate tags for a bookmark using AI
   */
  async generateTags(
    title: string,
    description: string,
    url: string,
    content?: string,
    provider?: AIProvider
  ): Promise<string[]> {
    if (!this.isEnabled()) {
      logger.warn('AI tagging is disabled or no provider available');
      return [];
    }

    const selectedProvider = provider || this.defaultProvider;
    const maxTags = parseInt(process.env.AI_MAX_TAGS || '5', 10);

    try {
      logger.info(`Generating tags using ${selectedProvider} for: ${title}`);

      switch (selectedProvider) {
        case 'openai':
          return await this.generateTagsOpenAI(title, description, url, content, maxTags);
        case 'anthropic':
          return await this.generateTagsAnthropic(title, description, url, content, maxTags);
        case 'google':
          return await this.generateTagsGoogle(title, description, url, content, maxTags);
        case 'ollama':
          return await this.generateTagsOllama(title, description, url, content, maxTags);
        default:
          throw new Error(`Unknown AI provider: ${selectedProvider}`);
      }
    } catch (error) {
      logger.error('Error generating tags:', error);
      return [];
    }
  }

  /**
   * Generate tags using OpenAI
   */
  private async generateTagsOpenAI(
    title: string,
    description: string,
    url: string,
    content: string | undefined,
    maxTags: number
  ): Promise<string[]> {
    if (!this.openai) {
      throw new Error('OpenAI is not initialized');
    }

    const prompt = this.buildTaggingPrompt(title, description, url, content, maxTags);

    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant that generates relevant, concise tags for bookmarks. Return only a JSON array of tags, nothing else.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 150,
    });

    const response = completion.choices[0].message.content?.trim() || '[]';
    return this.parseTags(response, maxTags);
  }

  /**
   * Generate tags using Anthropic Claude
   */
  private async generateTagsAnthropic(
    title: string,
    description: string,
    url: string,
    content: string | undefined,
    maxTags: number
  ): Promise<string[]> {
    if (!this.anthropic) {
      throw new Error('Anthropic is not initialized');
    }

    const prompt = this.buildTaggingPrompt(title, description, url, content, maxTags);

    const message = await this.anthropic.messages.create({
      model: 'claude-3-haiku-20240307',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `You are a helpful assistant that generates relevant, concise tags for bookmarks. Return only a JSON array of tags, nothing else.\n\n${prompt}`,
        },
      ],
    });

    const response = message.content[0].type === 'text' ? message.content[0].text : '[]';
    return this.parseTags(response, maxTags);
  }

  /**
   * Generate tags using Google Gemini
   */
  private async generateTagsGoogle(
    title: string,
    description: string,
    url: string,
    content: string | undefined,
    maxTags: number
  ): Promise<string[]> {
    if (!this.google) {
      throw new Error('Google Gemini is not initialized');
    }

    const model = this.google.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const prompt = this.buildTaggingPrompt(title, description, url, content, maxTags);

    const result = await model.generateContent(
      `You are a helpful assistant that generates relevant, concise tags for bookmarks. Return only a JSON array of tags, nothing else.\n\n${prompt}`
    );

    const response = result.response.text();
    return this.parseTags(response, maxTags);
  }

  /**
   * Generate tags using local Ollama
   */
  private async generateTagsOllama(
    title: string,
    description: string,
    url: string,
    content: string | undefined,
    maxTags: number
  ): Promise<string[]> {
    if (!process.env.OLLAMA_URL) {
      throw new Error('Ollama URL is not configured');
    }

    const prompt = this.buildTaggingPrompt(title, description, url, content, maxTags);

    const response = await fetch(`${process.env.OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2',
        prompt: `You are a helpful assistant that generates relevant, concise tags for bookmarks. Return only a JSON array of tags, nothing else.\n\n${prompt}`,
        stream: false,
      }),
    });

    const data = await response.json();
    return this.parseTags(data.response, maxTags);
  }

  /**
   * Suggest organization for bookmarks
   */
  async suggestOrganization(
    bookmarks: Array<{ title: string; description?: string; tags: string[] }>,
    provider?: AIProvider
  ): Promise<{
    collections: Array<{ name: string; description: string; bookmarkIndices: number[] }>;
    suggestions: string[];
  }> {
    if (!this.isEnabled()) {
      return { collections: [], suggestions: [] };
    }

    const selectedProvider = provider || this.defaultProvider;

    try {
      logger.info(`Suggesting organization using ${selectedProvider}`);

      const prompt = `Analyze these bookmarks and suggest how to organize them into collections. Return a JSON object with "collections" (array of {name, description, bookmarkIndices}) and "suggestions" (array of organization tips).

Bookmarks:
${bookmarks.map((b, i) => `${i}. ${b.title} - ${b.description || 'No description'} [Tags: ${b.tags.join(', ')}]`).join('\n')}

Return only valid JSON, no other text.`;

      let response: string;

      switch (selectedProvider) {
        case 'openai':
          if (!this.openai) throw new Error('OpenAI not initialized');
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'You are an expert at organizing information. Return only valid JSON.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
          });
          response = completion.choices[0].message.content || '{}';
          break;

        case 'anthropic':
          if (!this.anthropic) throw new Error('Anthropic not initialized');
          const message = await this.anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 1000,
            messages: [{ role: 'user', content: prompt }],
          });
          response = message.content[0].type === 'text' ? message.content[0].text : '{}';
          break;

        case 'google':
          if (!this.google) throw new Error('Google not initialized');
          const model = this.google.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent(prompt);
          response = result.response.text();
          break;

        default:
          throw new Error(`Provider ${selectedProvider} not supported for organization`);
      }

      // Parse response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          collections: parsed.collections || [],
          suggestions: parsed.suggestions || [],
        };
      }

      return { collections: [], suggestions: [] };
    } catch (error) {
      logger.error('Error suggesting organization:', error);
      return { collections: [], suggestions: [] };
    }
  }

  /**
   * Generate summary for a bookmark
   */
  async generateSummary(content: string, provider?: AIProvider): Promise<string> {
    if (!this.isEnabled()) {
      return '';
    }

    const selectedProvider = provider || this.defaultProvider;

    try {
      const prompt = `Summarize this webpage content in 2-3 sentences:\n\n${content.slice(0, 2000)}`;

      switch (selectedProvider) {
        case 'openai':
          if (!this.openai) throw new Error('OpenAI not initialized');
          const completion = await this.openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: 'Summarize content concisely.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 150,
          });
          return completion.choices[0].message.content?.trim() || '';

        case 'anthropic':
          if (!this.anthropic) throw new Error('Anthropic not initialized');
          const message = await this.anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 150,
            messages: [{ role: 'user', content: prompt }],
          });
          return message.content[0].type === 'text' ? message.content[0].text : '';

        case 'google':
          if (!this.google) throw new Error('Google not initialized');
          const model = this.google.getGenerativeModel({ model: 'gemini-1.5-flash' });
          const result = await model.generateContent(prompt);
          return result.response.text();

        default:
          return '';
      }
    } catch (error) {
      logger.error('Error generating summary:', error);
      return '';
    }
  }

  /**
   * Build tagging prompt
   */
  private buildTaggingPrompt(
    title: string,
    description: string,
    url: string,
    content: string | undefined,
    maxTags: number
  ): string {
    let prompt = `Generate ${maxTags} relevant, concise tags for this bookmark:\n\n`;
    prompt += `Title: ${title}\n`;
    prompt += `URL: ${url}\n`;
    if (description) prompt += `Description: ${description}\n`;
    if (content) prompt += `Content preview: ${content.slice(0, 500)}...\n`;
    prompt += `\nReturn only a JSON array of ${maxTags} tag strings, like: ["tag1", "tag2", "tag3"]`;

    return prompt;
  }

  /**
   * Parse tags from AI response
   */
  private parseTags(response: string, maxTags: number): string[] {
    try {
      // Try to extract JSON array from response
      const jsonMatch = response.match(/\[[\s\S]*?\]/);
      if (jsonMatch) {
        const tags = JSON.parse(jsonMatch[0]);
        if (Array.isArray(tags)) {
          return tags
            .map((tag) => String(tag).toLowerCase().trim())
            .filter((tag) => tag.length > 0 && tag.length < 30)
            .slice(0, maxTags);
        }
      }

      // Fallback: extract words
      const words = response.match(/["']([^"']+)["']/g);
      if (words) {
        return words
          .map((w) => w.replace(/["']/g, '').toLowerCase().trim())
          .filter((tag) => tag.length > 0 && tag.length < 30)
          .slice(0, maxTags);
      }

      return [];
    } catch (error) {
      logger.error('Error parsing tags:', error);
      return [];
    }
  }
}

// Export singleton instance
export const aiService = new AIService();

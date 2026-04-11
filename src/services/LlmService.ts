import axios, { AxiosInstance, AxiosError } from 'axios';
import NodeCache from 'node-cache';
import { aiConfig } from '../configs/llmConf.js';
import { HttpException } from '../utils/httpException.js';

export interface ChatRequest {
  message: string;
}

export interface AnalyzeRequest {
  user_id: string;
  sleep_hours: number;
  work_hours: number;
  stress_level: number;
  activity_minutes: number;
}

export default class AIService {
  private client: AxiosInstance;
  private cache: NodeCache;

  constructor() {
    this.client = axios.create({
      baseURL: aiConfig.baseUrl,
      timeout: aiConfig.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Cache with 1 hour TTL
    this.cache = new NodeCache({
      stdTTL: parseInt(process.env.AI_CACHE_TTL || '3600')
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const config = error.config as any;

        if (!config || !config.retry) {
          config.retry = 0;
        }

        if (config.retry >= aiConfig.retries) {
          return Promise.reject(error);
        }

        config.retry += 1;

        // Exponential backoff
        const delay = Math.pow(2, config.retry) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));

        return this.client(config);
      }
    );
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await this.client.post<string>('/chat', { message });
      return response.data;
    } catch (error) {
      this.handleError(error, 'Chat request failed');
      throw error;
    }
  }

  async analyze(data: AnalyzeRequest): Promise<string> {
    try {
      const response = await this.client.post<string>('/analyze', data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Analysis request failed');
      throw error;
    }
  }

  async getHistory(userId: string, days: number = 7): Promise<string> {
    const cacheKey = `history:${userId}:${days}`;
    const cached = this.cache.get<string>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get<string>(`/history/${userId}`, {
        params: { days }
      });

      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get history failed');
      throw error;
    }
  }

  async getPattern(userId: string): Promise<string> {
    const cacheKey = `pattern:${userId}`;
    const cached = this.cache.get<string>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get<string>(`/pattern/${userId}`);
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get pattern failed');
      throw error;
    }
  }

  async getWeeklyInsight(userId: string): Promise<string> {
    const cacheKey = `weekly-insight:${userId}`;
    const cached = this.cache.get<string>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get<string>(`/weekly-insight/${userId}`);
      this.cache.set(cacheKey, response.data);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get weekly insight failed');
      throw error;
    }
  }

  async getBurnoutCheck(userId: string): Promise<string> {
    try {
      const response = await this.client.get<string>(`/burnout-check/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Burnout check failed');
      throw error;
    }
  }

  async getRiskAlert(userId: string): Promise<string> {
    try {
      const response = await this.client.get<string>(`/risk-alert/${userId}`);
      return response.data;
    } catch (error) {
      this.handleError(error, 'Risk alert failed');
      throw error;
    }
  }

  async getRecommendations(userId: string): Promise<string> {
    const cacheKey = `recommendations:${userId}`;
    const cached = this.cache.get<string>(cacheKey);

    if (cached) {
      return cached;
    }

    try {
      const response = await this.client.get<string>(`/recommendations/${userId}`);
      this.cache.set(cacheKey, response.data, 1800); // Cache 30 minutes
      return response.data;
    } catch (error) {
      this.handleError(error, 'Get recommendations failed');
      throw error;
    }
  }

  clearUserCache(userId: string) {
    const keys = this.cache.keys();
    keys.forEach(key => {
      if (key.includes(userId)) {
        this.cache.del(key);
      }
    });
  }

  private handleError(error: any, context: string) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const message = error.response?.data?.detail || error.message || context;

      console.error(`[AI Service Error] ${context}:`, {
        status,
        message,
        url: error.config?.url,
      });

      throw new HttpException(status, `AI Service: ${message}`);
    }

    console.error(`[AI Service Error] ${context}:`, error);
    throw new HttpException(500, `AI Service: ${context}`);
  }
}

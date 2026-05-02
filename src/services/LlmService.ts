import axios, { AxiosInstance, AxiosError } from 'axios';
import NodeCache from 'node-cache';
import { llmConfig } from '../configs/llmConf.js';
import { HttpException } from '../utils/httpException.js';
import { RiskLevel } from '@prisma/client';

export interface ChatRequest {
  message: string;
}

  export interface AnalyzeRequest {
    user_id: string;
    sleep_hours: number;
    mood_score: number;
    stress_level: number;
    activity_minutes: number;
  }

export interface BurnoutCheckResult {
  rawResponse: string;
  burnoutScore: number;
  riskLevel: RiskLevel;
  riskScore: number;
  message: string;
  indicators: string[];
}

interface BurnoutApiResponse {
  user_id: string;
  burnout: {
    level: "LOW" | "MEDIUM" | "HIGH";
    emoji: string;
    score: number;
    message: string;
    indicators: string[];
  };
  risk_score: number;
  ai_response: string;
}

export default class LlmService {
  private client: AxiosInstance;
    private cache: NodeCache;

    constructor() {
      this.client = axios.create({
        baseURL: llmConfig.baseUrl,
        timeout: llmConfig.timeout,
        headers: {
          'Content-Type': 'application/json',
        },
      });

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

          if (config.retry >= llmConfig.retries) {
            return Promise.reject(error);
          }

          config.retry += 1;
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

      async getBurnoutCheck(userId: string): Promise<BurnoutCheckResult> {
        try {
          const response = await this.client.get<BurnoutApiResponse>(`/burnout-check/${userId}`);
          const data = response.data;
  
          // // Parse AI response to extract burnout score and risk level
          // const parsed = this.parseBurnoutResponse(rawResponse);
  
          return {
            rawResponse: data.ai_response,
            burnoutScore: data.burnout.score,
            riskLevel: data.burnout.level,
            riskScore: data.risk_score,
            message: data.burnout.message,
            indicators: data.burnout.indicators,
          };
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
        this.cache.set(cacheKey, response.data, 1800);
        return response.data;
      } catch (error) {
        this.handleError(error, 'Get recommendations failed');
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

    // private parseBurnoutResponse(response: string): {
    //   burnoutScore?: number;
    //   riskLevel?: RiskLevel;
    //   insights?: string;
    // } {

    //   const result: any = {};

    //   // Extract burnout score (look for patterns like "score: 65" or "65/100")
    //   const scoreMatch = response.match(/(?:score|skor|nilai)[\s:]+(\d+)(?:\/100)?/i);
    //   if (scoreMatch) {
    //     result.burnoutScore = parseInt(scoreMatch[1]);
    //   }

    //   const riskMatch = response.match(/(?:risk|risiko|level)[\s:]+(\w+)/i);
    //   if (riskMatch) {
    //     const risk = riskMatch[1].toUpperCase();
    //     if (risk.includes('HIGH') || risk.includes('TINGGI')) {
    //       result.riskLevel = RiskLevel.HIGH;
    //     } else if (risk.includes('MEDIUM') || risk.includes('SEDANG')) {
    //       result.riskLevel = RiskLevel.MEDIUM;
    //     } else if (risk.includes('LOW') || risk.includes('RENDAH')) {
    //       result.riskLevel = RiskLevel.LOW;
    //     }
    //   }

    //   result.insights = response;

    //   return result;
    // }

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
        let message: string;
    
        const data = error.response?.data;
    
        if (typeof data?.detail === "string") {
              message = data.detail;
        
            } else if (Array.isArray(data?.detail)) {
              message = data.detail
                .map((err: any) => {
                  if (typeof err === "string") return err;
                  if (err?.msg) return `${err.loc?.join(".")}: ${err.msg}`;
                  return JSON.stringify(err);
                })
                .join(", ");
        
            } else if (typeof data?.detail === "object") {
              message = JSON.stringify(data.detail);
        
            } else {
              message = error.message || context;
            }

        console.error(`[AI Service Error] ${context}:`, {
          status,
          message,
          raw: data,
          url: error.config?.url,
        });

        throw new HttpException(status, `AI Service: ${message}`);
      }

      console.error(`[AI Service Error] ${context}:`, error);
      throw new HttpException(500, `AI Service: ${context}`);
    }
}

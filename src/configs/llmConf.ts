export const llmConfig = {
  baseUrl: process.env.AI_SERVICE_URL || 'https://faithdev-capstone-ai-service.hf.space',
  timeout: 30000, // 30 seconds
  retries: 3,
};

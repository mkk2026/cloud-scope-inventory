export const validateEnvironment = () => {
  const warnings: string[] = [];
  
  // Check for Gemini API key
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY;
  if (!apiKey) {
    warnings.push('Gemini API key not found. AI Advisor features will be disabled.');
  }
  
  // Check for production environment
  if (import.meta.env.PROD && warnings.length > 0) {
    console.warn('Environment validation warnings:', warnings);
  }
  
  return {
    hasGeminiKey: !!apiKey,
    warnings
  };
};

export const getGeminiApiKey = (): string | null => {
  return import.meta.env.VITE_GEMINI_API_KEY || process.env.API_KEY || null;
};
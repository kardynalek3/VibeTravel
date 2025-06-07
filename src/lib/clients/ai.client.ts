/**
 * AiClient - Klient do komunikacji z API OpenRouter.ai
 * Pozwala na generowanie treści przy użyciu wybranych modeli AI.
 */
export class AiClient {
  private baseUrl = "https://openrouter.ai/api/v1";

  constructor(
    private apiKey: string,
    private defaultModel = "openai/gpt-4"
  ) {}

  /**
   * Generowanie odpowiedzi AI na podstawie promptu
   * @param prompt Tekst promptu do wysłania do API
   * @param options Dodatkowe opcje generowania
   * @returns Odpowiedź z API zawierająca wygenerowaną treść
   */
  async generate(prompt: string, options: GenerateOptions = {}): Promise<AiResponse> {
    const requestOptions = {
      model: options.model || this.defaultModel,
      messages: [
        { role: "system", content: options.systemPrompt || "You are a helpful travel planning assistant." },
        { role: "user", content: prompt },
      ],
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 4000,
      top_p: options.topP || 1,
      stream: false,
    };

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://vibetravels.com",
          "X-Title": "VibeTravels",
        },
        body: JSON.stringify(requestOptions),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`AI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      return {
        content: data.choices[0].message.content,
        model: data.model,
        usage: data.usage,
      };
    } catch (error) {
      // Enhance error with context for better debugging
      if (error instanceof Error) {
        throw new Error(`Failed to generate AI response: ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * Opcje generowania dla API AI
 */
export type GenerateOptions = {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
};

/**
 * Standardowa odpowiedź z API AI
 */
export type AiResponse = {
  content: string;
  model: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

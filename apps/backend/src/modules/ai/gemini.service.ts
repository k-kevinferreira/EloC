import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GeminiProductDescription = {
  name: string;
  shortDescription: string;
  description: string;
  suggestedCategory: string;
  tags: string[];
};

type GeminiGenerateContentResponse = {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
};

const fallbackDescription: GeminiProductDescription = {
  name: 'Produto pendente de revisão',
  shortDescription: 'Produto cadastrado automaticamente e pendente de revisão.',
  description: 'Revise manualmente as informações antes de publicar.',
  suggestedCategory: 'Revisar',
  tags: ['review_required'],
};

const geminiPrompt = `Analise a imagem de uma joia ou semijoia para cadastro em um catálogo digital.

Sua tarefa é observar a imagem e gerar um nome/título comercial e descrições para o produto.

Retorne apenas um JSON válido com os seguintes campos:
{
"name": string,
"shortDescription": string,
"description": string,
"suggestedCategory": string,
"tags": string[]
}

Regras:

* O name deve funcionar como título comercial do produto.
* O nome/título deve ser elegante, curto e adequado para venda em catálogo.
* A shortDescription deve ser breve e adequada para card de produto.
* A description deve ser clara, objetiva e adequada para página de detalhes do produto.
* Descreva apenas características visualmente identificáveis na imagem.
* Pode mencionar cor aparente, formato, estilo, acabamento visual e detalhes decorativos.
* Não informe preço.
* Não informe estoque.
* Não afirme que a peça é ouro, prata, prata 925, aço inoxidável, banhada a ouro ou semijoia se isso não for informado pelo usuário.
* Quando não houver certeza sobre o material, use termos como acabamento dourado, acabamento prateado, tom dourado, tom prateado, peça delicada ou design elegante.
* Não invente marca.
* Não invente garantia.
* Não invente quilates, banho, composição, peso ou medidas.
* Não use markdown.
* Não retorne texto fora do JSON.
* Se a imagem não parecer um produto de joia ou semijoia, retorne:
  {
  "name": "Produto pendente de revisão",
  "shortDescription": "Produto cadastrado automaticamente e pendente de revisão.",
  "description": "A imagem enviada não permitiu identificar com segurança os detalhes do produto. Revise manualmente antes de publicar.",
  "suggestedCategory": "Revisar",
  "tags": ["review_required"]
  }
* Se a imagem estiver desfocada, ambígua ou com baixa qualidade, gere um texto conservador e inclua a tag 'review_required'.`;

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);

  constructor(private readonly configService: ConfigService) {}

  async describeProductImage(
    imageBuffer: Buffer,
    mimeType: string,
  ): Promise<GeminiProductDescription> {
    const apiKey = this.configService.get<string | null>('gemini.apiKey', null);
    const model = this.configService.get<string>('gemini.model', 'gemini-3.5-flash');

    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY is not configured. Using fallback product text.');
      return fallbackDescription;
    }

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
          model,
        )}:generateContent?key=${encodeURIComponent(apiKey)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: geminiPrompt },
                  {
                    inline_data: {
                      mime_type: mimeType,
                      data: imageBuffer.toString('base64'),
                    },
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: 'application/json',
              temperature: 0.3,
            },
          }),
        },
      );

      if (!response.ok) {
        this.logger.error(`Gemini request failed with status ${response.status}.`);
        return fallbackDescription;
      }

      const body = (await response.json()) as GeminiGenerateContentResponse;
      const text = body.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter((part): part is string => Boolean(part))
        .join('\n');

      return this.parseProductDescription(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown Gemini error.';
      this.logger.error(`Gemini request failed. ${message}`);
      return fallbackDescription;
    }
  }

  private parseProductDescription(text: string | undefined) {
    if (!text) {
      return fallbackDescription;
    }

    const jsonText = this.extractJson(text);

    if (!jsonText) {
      return fallbackDescription;
    }

    try {
      const parsed = JSON.parse(jsonText) as Partial<GeminiProductDescription>;

      return {
        name: this.normalizeString(parsed.name, fallbackDescription.name, 160),
        shortDescription: this.normalizeString(
          parsed.shortDescription,
          fallbackDescription.shortDescription,
          500,
        ),
        description: this.normalizeString(
          parsed.description,
          fallbackDescription.description,
          2000,
        ),
        suggestedCategory: this.normalizeString(
          parsed.suggestedCategory,
          fallbackDescription.suggestedCategory,
          120,
        ),
        tags: this.normalizeTags(parsed.tags),
      };
    } catch {
      return fallbackDescription;
    }
  }

  private extractJson(text: string) {
    const trimmedText = text.trim();

    if (trimmedText.startsWith('{') && trimmedText.endsWith('}')) {
      return trimmedText;
    }

    const firstBrace = trimmedText.indexOf('{');
    const lastBrace = trimmedText.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    return trimmedText.slice(firstBrace, lastBrace + 1);
  }

  private normalizeString(value: unknown, fallback: string, maxLength: number) {
    if (typeof value !== 'string') {
      return fallback;
    }

    const normalizedValue = value.trim();

    if (!normalizedValue) {
      return fallback;
    }

    return normalizedValue.slice(0, maxLength);
  }

  private normalizeTags(value: unknown) {
    if (!Array.isArray(value)) {
      return fallbackDescription.tags;
    }

    const tags = value
      .filter((tag): tag is string => typeof tag === 'string')
      .map((tag) =>
        tag
          .trim()
          .toLowerCase()
          .replace(/[^a-z0-9_-]+/g, '_')
          .replace(/^_+|_+$/g, '')
          .slice(0, 40),
      )
      .filter((tag) => tag.length > 0)
      .slice(0, 10);

    return tags.length > 0 ? tags : fallbackDescription.tags;
  }
}

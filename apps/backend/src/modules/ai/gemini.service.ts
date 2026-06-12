import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export type GeminiProductDescription = {
  name: string;
  shortDescription: string;
  description: string;
  suggestedCategory: string;
  suggestedMaterial: 'prata' | 'dourado';
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
  name: 'Produto pendente de revisao',
  shortDescription: 'Produto cadastrado automaticamente e pendente de revisao.',
  description: 'Revise manualmente as informacoes antes de publicar.',
  suggestedCategory: 'Revisar',
  suggestedMaterial: 'prata',
  tags: ['review_required'],
};

const geminiPrompt = `Analise a imagem de uma joia ou semijoia para cadastro em um catalogo digital.

Sua tarefa e observar a imagem e gerar um nome/titulo comercial, descricoes, categoria e material visual para o produto.

Retorne apenas um JSON valido com os seguintes campos:
{
"name": string,
"shortDescription": string,
"description": string,
"suggestedCategory": string,
"suggestedMaterial": "prata" | "dourado",
"tags": string[]
}

Regras:

* O name deve funcionar como titulo comercial do produto.
* O nome/titulo deve ser elegante, curto e adequado para venda em catalogo.
* A shortDescription deve ser breve e adequada para card de produto.
* A description deve ser clara, objetiva e adequada para pagina de detalhes do produto.
* Descreva apenas caracteristicas visualmente identificaveis na imagem.
* Pode mencionar cor aparente, formato, estilo, acabamento visual e detalhes decorativos.
* O suggestedCategory deve sugerir uma categoria de catalogo, como Aneis, Brincos, Colares, Pulseiras, Conjuntos, Tornozeleiras ou Berloques.
* O suggestedMaterial deve representar apenas o tom visual usado no catalogo.
* O suggestedMaterial deve ser exatamente "prata" ou "dourado".
* Use "prata" para peca em tom prateado, cinza claro ou metal visualmente branco.
* Use "dourado" para peca em tom dourado, amarelo metalico ou ouro visual aparente.
* Nao informe preco.
* Nao informe estoque.
* Nao afirme que a peca e ouro, prata, prata 925, aco inoxidavel, banhada a ouro ou semijoia se isso nao for informado pelo usuario.
* O suggestedMaterial nao confirma composicao real da peca.
* Quando nao houver certeza sobre composicao real, use termos como acabamento dourado, acabamento prateado, tom dourado, tom prateado, peca delicada ou design elegante.
* Nao invente marca.
* Nao invente garantia.
* Nao invente quilates, banho, composicao, peso ou medidas.
* Nao use markdown.
* Nao retorne texto fora do JSON.
* Se a imagem nao parecer um produto de joia ou semijoia, retorne:
  {
  "name": "Produto pendente de revisao",
  "shortDescription": "Produto cadastrado automaticamente e pendente de revisao.",
  "description": "A imagem enviada nao permitiu identificar com seguranca os detalhes do produto. Revise manualmente antes de publicar.",
  "suggestedCategory": "Revisar",
  "suggestedMaterial": "prata",
  "tags": ["review_required"]
  }
* Se a imagem estiver desfocada, ambigua ou com baixa qualidade, gere um texto conservador e inclua a tag 'review_required'.`;

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
      const response = await this.requestGeminiContent(apiKey, model, {
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
      });

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

  private async requestGeminiContent(apiKey: string, model: string, body: unknown) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
      model,
    )}:generateContent?key=${encodeURIComponent(apiKey)}`;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      if (![429, 500, 502, 503, 504].includes(response.status) || attempt === 3) {
        return response;
      }

      await this.delay(700 * attempt);
    }

    throw new Error('Gemini request retry loop finished unexpectedly.');
  }

  private delay(milliseconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, milliseconds);
    });
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
        suggestedMaterial: this.normalizeMaterial(parsed.suggestedMaterial),
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

  private normalizeMaterial(value: unknown): GeminiProductDescription['suggestedMaterial'] {
    if (typeof value !== 'string') {
      return fallbackDescription.suggestedMaterial;
    }

    const normalizedValue = value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim();

    if (normalizedValue === 'dourado') {
      return 'dourado';
    }

    return 'prata';
  }
}

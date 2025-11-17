import { NextResponse } from 'next/server';

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

type OpenRouterModel = {
  id: string;
  name?: string;
  description?: string;
  architecture?: { provider?: string } | null;
  context_length?: number | null;
  pricing?: Record<string, unknown> | null;
  top_provider?: string | null;
};

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_APP_NAME ?? 'ELINT-GPT',
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorPayload?.error ?? 'Unable to fetch OpenRouter models.' },
        { status: response.status },
      );
    }

    const data = await response.json();
    const models = Array.isArray(data?.data)
      ? data.data.map((model: OpenRouterModel) => {
          const provider = model?.architecture?.provider;
          return {
            id: String(model?.id ?? ''),
            name: model?.name ?? String(model?.id ?? 'Model'),
            description: model?.description ?? (provider ? `Provided by ${provider}` : 'Available via OpenRouter'),
            context_length: model?.context_length ?? null,
            pricing: model?.pricing ?? null,
            top_provider: model?.top_provider ?? null,
          };
        })
      : [];

    return NextResponse.json({ models });
  } catch (error) {
    console.error('[api/models] Failed to load OpenRouter models', error);
    return NextResponse.json({ error: 'Failed to load OpenRouter models.' }, { status: 500 });
  }
}

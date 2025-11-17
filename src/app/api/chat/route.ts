import { NextResponse } from 'next/server';

type ChatMessagePayload = {
  role: 'user' | 'assistant' | 'system';
  content: string;
};

type ChatRequestBody = {
  modelId?: string;
  messages?: ChatMessagePayload[];
};

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(request: Request) {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'OpenRouter API key is not configured.' }, { status: 500 });
  }

  const body = (await request.json()) as ChatRequestBody;

  if (!body?.modelId?.trim()) {
    return NextResponse.json({ error: 'modelId is required.' }, { status: 400 });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return NextResponse.json({ error: 'messages array is required.' }, { status: 400 });
  }

  try {
    const response = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': process.env.OPENROUTER_SITE_URL ?? 'http://localhost:3000',
        'X-Title': process.env.OPENROUTER_APP_NAME ?? 'ELINT-GPT',
      },
      body: JSON.stringify({
        model: body.modelId,
        messages: body.messages.map((message) => ({
          role: message.role,
          content: message.content,
        })),
      }),
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => ({}));
      return NextResponse.json(
        {
          error: errorPayload?.error ?? 'The OpenRouter API returned an error.',
        },
        { status: response.status },
      );
    }

    const data = await response.json();
    const assistantMessage = data?.choices?.[0]?.message ?? null;

    return NextResponse.json({
      message: assistantMessage,
      usage: data?.usage ?? null,
    });
  } catch (error) {
    console.error('[api/chat] OpenRouter request failed:', error);
    return NextResponse.json({ error: 'Failed to reach OpenRouter.' }, { status: 500 });
  }
}

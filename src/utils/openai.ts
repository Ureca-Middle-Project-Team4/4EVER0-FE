export async function fetchChatResponse(userMessage: string): Promise<string> {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: userMessage }],
    }),
  });

  const data = await res.json();
  return data.choices?.[0]?.message?.content || '(응답 없음)';
}

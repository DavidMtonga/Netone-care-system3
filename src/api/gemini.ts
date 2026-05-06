import api from './axios'

export const askGemini = async (
  msg: string,
  hist: { role: string; text: string }[] = []
): Promise<string> => {
  try {
    const res = await api.post('/ai/chat', { message: msg, history: hist })
    return res.data?.data?.reply ?? 'No response. Please try again.'
  } catch (err: any) {
    const msg = err.response?.data?.message
    if (err.response?.status === 429 || msg?.includes('busy'))
      return 'AI is busy, please try again in a moment.'
    return 'AI temporarily unavailable. Please try again shortly.'
  }
}
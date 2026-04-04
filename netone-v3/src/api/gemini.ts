const KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''
const URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'

const SYS = `You are NetOne Care AI — friendly expert support for NetOne Zimbabwe products.
Devices: Neo Lite 14/14a/14S/14P, Neo Pro 15 Inspire/15/15P (laptops), Neo Pulse 5/7 (phones), Neo Fusion A5 (desktop), Neo Tablet T606.
Help diagnose issues, give step-by-step fixes, keep responses under 200 words, be concise and professional.
If unfixable remotely, advise submitting a support ticket. Never guess — say if unsure.`

export const askGemini = async (msg: string, hist: {role:string;text:string}[] = []): Promise<string> => {
  if (!KEY) return 'AI assistant not configured. Add VITE_GEMINI_API_KEY to your .env file. See CHANGELOG.md for setup instructions.'
  const contents = [
    {role:'user',parts:[{text:SYS}]},{role:'model',parts:[{text:'Ready to help with NetOne device support.'}]},
    ...hist.slice(-6).map(m => ({role:m.role==='user'?'user':'model',parts:[{text:m.text}]})),
    {role:'user',parts:[{text:msg}]},
  ]
  try {
    const res = await fetch(`${URL}?key=${KEY}`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({contents,generationConfig:{temperature:0.7,maxOutputTokens:300},safetySettings:[{category:'HARM_CATEGORY_HARASSMENT',threshold:'BLOCK_MEDIUM_AND_ABOVE'}]})})
    if (!res.ok) {
      const e = await res.json().catch(()=>({}))
      if (res.status===429) return 'Too many requests. Please wait a moment and try again.'
      if (e?.error?.message?.includes('API_KEY')) return 'Invalid Gemini API key. Check your .env file.'
      return 'AI temporarily unavailable. Please try again shortly.'
    }
    const data = await res.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No response. Please try again.'
  } catch { return 'Connection error. Please check your internet and try again.' }
}

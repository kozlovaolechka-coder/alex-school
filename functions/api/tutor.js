const SYSTEM = `Ты Лена, доброжелательный репетитор начальной школы. Ты разговариваешь с ребёнком 3 класса по-русски. Текущий урок: множества и подмножества, все машины A, красные машины Б внутри A. Никогда не сообщай ответ на текущий вопрос сразу, даже если ребёнок просит. Задавай ОДИН короткий наводящий вопрос за раз, помогай рассуждать, мягко реагируй на ошибки. Если ребёнок ответил верно, попроси объяснить почему. Если вопрос не относится к уроку, мягко верни к заданию. Не проси личных данных. Максимум 45 слов в ответе.`;
export async function onRequestPost({request, env}) {
  const origin = new URL(request.url).origin;
  if (request.headers.get("origin") && request.headers.get("origin") !== origin) return new Response("Forbidden",{status:403});
  if (!env.GEMINI_API_KEY) return Response.json({error:"ИИ пока не настроен. Добавьте GEMINI_API_KEY в Cloudflare Pages → Settings → Variables and Secrets."},{status:503});
  let body; try { body = await request.json(); } catch { return Response.json({error:"Некорректный запрос"},{status:400}); }
  const message = typeof body.message === "string" ? body.message.trim().slice(0,700) : "";
  const history = Array.isArray(body.history) ? body.history.slice(-6).filter(x=>x && typeof x.text==="string" && ["user","model"].includes(x.role)).map(x=>({role:x.role,parts:[{text:x.text.slice(0,500)}]})) : [];
  if (!message) return Response.json({error:"Ответ пустой"},{status:400});
  const controller = new AbortController(); const timeout=setTimeout(()=>controller.abort(),12000);
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",{
      method:"POST",signal:controller.signal,
      headers:{"Content-Type":"application/json","x-goog-api-key":env.GEMINI_API_KEY},
      body:JSON.stringify({systemInstruction:{parts:[{text:SYSTEM}]},contents:[...history,{role:"user",parts:[{text:message}]}],generationConfig:{maxOutputTokens:240,temperature:0.55}})
    });
    if (!r.ok) return Response.json({error:"Сервис ИИ временно недоступен. Попробуй ещё раз."},{status:502});
    const data=await r.json();
    const answer=data.candidates?.[0]?.content?.parts?.map(x=>x.text||"").join("").trim();
    if(!answer) return Response.json({error:"Не удалось получить ответ Лены"},{status:502});
    return Response.json({answer:answer.slice(0,1200)},{headers:{"Cache-Control":"no-store"}});
  } catch {return Response.json({error:"Не удалось связаться с ИИ. Попробуй ещё раз."},{status:504});}
  finally {clearTimeout(timeout);}
}

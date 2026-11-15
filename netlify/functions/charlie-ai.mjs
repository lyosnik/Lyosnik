export default async (request) => {
 if(request.method!=="POST") return Response.json({error:"Use POST."},{status:405});
 const key=process.env.OPENAI_API_KEY;
 if(!key) return Response.json({error:"AI is not connected yet. Set OPENAI_API_KEY in Netlify environment variables, then redeploy."},{status:503});
 let body;try{body=await request.json()}catch{return Response.json({error:"Invalid request."},{status:400})}
 const message=typeof body.message==="string"?body.message.trim():"";
 if(!message||message.length>2500)return Response.json({error:"Please send a message of up to 2,500 characters."},{status:400});
 try{
 const result=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":`Bearer ${key}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.CHARLIE_MODEL||"gpt-4.1-mini",instructions:"You are Charlie, a cheerful, concise, practical beagle-themed assistant from Happy Apper. Never claim to have searched, accessed, filed, or retrieved private photos or files. File retrieval is not yet connected.",input:message,max_output_tokens:350})});
 const data=await result.json();
 if(!result.ok)return Response.json({error:"AI provider error: "+(data.error?.message||result.status)},{status:502});
 const reply=(data.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text).join("\\n").trim();
 return Response.json({reply:reply||"I didn't receive a reply. Please try again."},{headers:{"Cache-Control":"no-store"}});
 }catch{return Response.json({error:"Could not reach the AI service. Try again."},{status:502})}
};

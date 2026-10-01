export function environment(name: string): string { return Deno.env.get(name) || ''; }
export function serverKey(): string {
  const keys=JSON.parse(environment('SUPABASE_SECRET_KEYS')||'{}');
  return keys.default || environment('SUPABASE_SECRET_KEY') || environment('SUPABASE_SERVICE_ROLE_KEY');
}
export function origins(): string[] { return environment('ALLOWED_ORIGINS').split(',').map(s=>s.trim()).filter(Boolean); }
export function cors(origin: string): Record<string,string> { return {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Headers':'authorization,apikey,content-type,x-client-info','Access-Control-Allow-Methods':'POST,OPTIONS','Vary':'Origin','Cache-Control':'no-store'}; }
export function json(origin: string,status: number,data: unknown): Response { return Response.json(data,{status,headers:cors(origin)}); }
export async function body(req: Request): Promise<Record<string,unknown>> {
  if(!req.headers.get('content-type')?.includes('application/json'))throw Error('Use a JSON request.');
  if(Number(req.headers.get('content-length')||0)>8192)throw Error('Request too large.');
  const reader=req.body?.getReader();if(!reader)throw Error('Missing request.');let size=0;const chunks:Uint8Array[]=[];
  while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>8192){await reader.cancel();throw Error('Request too large.');}chunks.push(value);}
  const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
  const data=JSON.parse(new TextDecoder().decode(bytes));if(!data||Array.isArray(data)||typeof data!=='object')throw Error('Invalid request.');return data;
}
export async function digest(value: string): Promise<string>{return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(n=>n.toString(16).padStart(2,'0')).join('');}
export function serviceHeaders(key: string): Record<string,string>{return {apikey:key,'Content-Type':'application/json',...(key.startsWith('eyJ')?{Authorization:'Bearer '+key}:{})};}

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(__dirname,'..','public','data-cache');
const load=(name)=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
const main=load('main.json'),backlog=load('backlog.json'),improvements=load('improvements.json');
function assert(ok,msg){if(!ok) throw new Error(msg);}
assert(main.length>1000,'Base principal pequena demais para o demo.');
assert(backlog.length>=15,'Backlog insuficiente.');
assert(improvements.length>=6,'Melhorias insuficientes.');
assert(main.every(r=>r.key&&r.type&&r.created),'Há registros principais sem campos mínimos.');
assert(main.some(r=>r.tmaBroken==='Sim'),'Demo precisa conter ao menos um rompimento de SLA de primeiro atendimento.');
assert(main.some(r=>r.tmrBroken==='Sim'),'Demo precisa conter ao menos um rompimento de SLA de resolução.');
console.log('✓ Demo validado: dados sintéticos, SLAs, backlog e melhorias consistentes.');

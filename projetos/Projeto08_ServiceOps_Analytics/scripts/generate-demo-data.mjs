import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'public', 'data-cache');
fs.mkdirSync(OUT, { recursive: true });

function mulberry32(seed) {
  return function() {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(20260924);
const pick = (arr) => arr[Math.floor(rand() * arr.length)];
const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

const platforms = ['CORE','INTEGRATION','CONTAINERS','API-GW','HML'];
const platformWeights = [0.34,0.27,0.16,0.14,0.09];
const analysts = ['Analista 01','Analista 02','Analista 03','Analista 04','Analista 05','Analista 06','Analista 07','Analista 08'];
const statusesResolved = ['Resolvido','Resolvido','Resolvido','Resolvido','Resolvido','Resolvido','Resolvido','Resolvido','Em Andamento'];
const incidentTemplates = [
  'Aumento de taxa de erro em serviço crítico',
  'Latência acima do limite esperado',
  'Indisponibilidade intermitente detectada pelo monitoramento',
  'Falha de autenticação em integração',
  'Uso de memória acima do baseline',
  'Fila de processamento com crescimento anormal',
  'Timeout em chamada de API',
  'Degradação de desempenho no processamento',
  'Erro de conexão entre componentes',
  'Alerta de disponibilidade em endpoint monitorado'
];
const requestTemplates = [
  'Solicitação de ajuste de acesso operacional',
  'Solicitação de atualização de configuração',
  'Solicitação de evidência técnica',
  'Solicitação de liberação controlada',
  'Solicitação de parametrização de monitoramento'
];
const otherTemplates = [
  ['Mudança','Atualização programada de componente'],
  ['Problema','Análise de causa raiz de recorrência'],
  ['Melhoria','Ajuste de observabilidade e alertas']
];
function weightedPlatform(){
  const x=rand(); let acc=0;
  for(let i=0;i<platforms.length;i++){acc+=platformWeights[i]; if(x<=acc) return platforms[i];}
  return platforms.at(-1);
}
function pad(n){return String(n).padStart(2,'0');}
function isoLocal(d){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;}
function dateAt(start, dayOffset, hour, minute=0){const d=new Date(`${start}T00:00:00`);d.setDate(d.getDate()+dayOffset);d.setHours(hour,minute,0,0);return d;}
function addMinutes(d,m){return new Date(d.getTime()+m*60000);}
function priority(){const x=rand(); return x<0.08?'P1':x<0.28?'P2':x<0.30?'P3':'P4';}
function normalish(center, spread){return center + (rand()+rand()+rand()-1.5)*spread;}
function tmaFor(p){const base={P1:2.5,P2:4,P3:5,P4:5.5}[p];return Math.max(0,normalish(base,5));}
function tmrFor(p){const base={P1:85,P2:65,P3:55,P4:48}[p];return Math.max(0,normalish(base,90));}
function spentFor(p){const base={P1:70,P2:32,P3:22,P4:14}[p];return Math.max(1,normalish(base,28));}
function incidentSummary(platform,p){const prefix=platform==='HML'?'[HML] ':'';return `${prefix}[${platform}] [${p}] ${pick(incidentTemplates)}`;}

const weekStarts=['2026-08-31','2026-09-07','2026-09-14','2026-09-21'];
const weekPlans=[
  {inc:246,req:11,other:5,records:6},
  {inc:302,req:9,other:6,records:7},
  {inc:271,req:12,other:5,records:5},
  {inc:318,req:15,other:8,records:8}
];
let seq=10001;
const main=[];
for(let w=0;w<weekStarts.length;w++){
  const plan=weekPlans[w];
  for(let i=0;i<plan.inc;i++){
    const p=priority();
    const platform=weightedPlatform();
    const day=Math.floor(rand()*7); const hour=Math.floor(rand()*24); const minute=Math.floor(rand()*60);
    const created=dateAt(weekStarts[w],day,hour,minute);
    let tma=tmaFor(p); let tmr=tmrFor(p);
    let tmaBroken='Não',tmrBroken='Não';
    if(rand()<0.012){tma=35+rand()*80;tmaBroken='Sim';}
    if(rand()<0.009){tmr=260+rand()*500;tmrBroken='Sim';}
    const isLatest=w===weekStarts.length-1;
    const open=isLatest && day>=5 && rand()<0.09;
    const status=open?pick(['Em Andamento','Aguardando Solicitante','Aguardando Terceiros']):pick(statusesResolved);
    const resolved=status==='Resolvido'?addMinutes(created,tmr):null;
    const spent=Math.round(spentFor(p)*60/60)*60;
    main.push({
      key:`OPS-${seq++}`,summary:incidentSummary(platform,p),type:'Incidente',created:isoLocal(created),resolved:resolved?isoLocal(resolved):null,
      updated:isoLocal(addMinutes(created,Math.min(tmr,180))),closeCode:status==='Resolvido'?'Concluído':'Sem código',status,reporter:'Monitoramento automático',
      resolution:status==='Resolvido'?'Concluído':null,priority:p,firstResponseDays:tma/1440,resolutionDays:resolved?tmr/1440:null,
      tmaBroken,tmrBroken:resolved?tmrBroken:null,owner:pick(analysts),platform,timeSpentSeconds:spent,correctedDays:spent/86400,
      environment:platform==='HML'?'Homologação':'Produção',currentSituation:null,dueDate:null,platformSource:platform,isHml:platform==='HML'
    });
  }
  for(let i=0;i<plan.req;i++){
    const platform=weightedPlatform(); const p=rand()<0.2?'P2':'P4'; const day=Math.floor(rand()*7);
    const created=dateAt(weekStarts[w],day,8+Math.floor(rand()*10),Math.floor(rand()*60));
    const tma=Math.max(0,normalish(7,8)); const tmr=Math.max(20,normalish(160,120)); const resolved=addMinutes(created,tmr);
    main.push({key:`REQ-${seq++}`,summary:`[${platform}] ${pick(requestTemplates)}`,type:'Requisição',created:isoLocal(created),resolved:isoLocal(resolved),updated:isoLocal(resolved),closeCode:'Concluído',status:'Resolvido',reporter:'Portal de serviços',resolution:'Concluído',priority:p,firstResponseDays:tma/1440,resolutionDays:tmr/1440,tmaBroken:'Não',tmrBroken:'Não',owner:pick(analysts),platform,timeSpentSeconds:(10+Math.floor(rand()*35))*60,correctedDays:null,environment:platform==='HML'?'Homologação':'Produção',currentSituation:null,dueDate:null,platformSource:platform,isHml:platform==='HML'});
  }
  for(let i=0;i<plan.other;i++){
    const [type,title]=pick(otherTemplates);const platform=weightedPlatform();const created=dateAt(weekStarts[w],Math.floor(rand()*7),9+Math.floor(rand()*8),Math.floor(rand()*60));
    main.push({key:`CHG-${seq++}`,summary:`[${platform}] ${title}`,type,created:isoLocal(created),resolved:isoLocal(addMinutes(created,120+rand()*360)),updated:isoLocal(addMinutes(created,60)),closeCode:'Concluído',status:'Resolvido',reporter:'Gestão de mudanças',resolution:'Concluído',priority:'P4',firstResponseDays:null,resolutionDays:null,tmaBroken:null,tmrBroken:null,owner:pick(analysts),platform,timeSpentSeconds:(20+Math.floor(rand()*70))*60,correctedDays:null,environment:platform==='HML'?'Homologação':'Produção',currentSituation:null,dueDate:null,platformSource:platform,isHml:platform==='HML'});
  }
  for(let i=0;i<plan.records;i++){
    const platform=weightedPlatform();const created=dateAt(weekStarts[w],Math.floor(rand()*7),8+Math.floor(rand()*10),0);
    const hours=1.5+rand()*3.5;
    main.push({key:`LOG-${seq++}`,summary:`[${platform}] Registro de atividade operacional`,type:'Registro',created:isoLocal(created),resolved:isoLocal(created),updated:isoLocal(created),closeCode:'Concluído',status:'Concluído',reporter:'Apontamento operacional',resolution:'Concluído',priority:'P4',firstResponseDays:null,resolutionDays:null,tmaBroken:null,tmrBroken:null,owner:pick(analysts),platform,timeSpentSeconds:Math.round(hours*3600),correctedDays:null,environment:platform==='HML'?'Homologação':'Produção',currentSituation:null,dueDate:null,platformSource:platform,isHml:platform==='HML'});
  }
}

const backlogStatuses=['Em Andamento','Aguardando Solicitante','Aguardando Terceiros','Em Investigação'];
const backlog=[];
const asOf=new Date('2026-09-27T12:00:00');
for(let i=0;i<24;i++){
  const age=2+Math.floor(rand()*36); const created=new Date(asOf); created.setDate(created.getDate()-age); created.setHours(7+Math.floor(rand()*10),Math.floor(rand()*60),0,0);
  const platform=weightedPlatform(); const p=priority();
  backlog.push({key:`BKG-${2001+i}`,summary:incidentSummary(platform,p),type:rand()<0.82?'Incidente':'Requisição',created:isoLocal(created),resolved:null,updated:isoLocal(addMinutes(created,120)),closeCode:'Sem código',status:pick(backlogStatuses),reporter:'Monitoramento automático',resolution:null,priority:p,firstResponseDays:(2+rand()*10)/1440,resolutionDays:null,tmaBroken:'Não',tmrBroken:null,owner:pick(analysts),platform,timeSpentSeconds:null,correctedDays:null,environment:platform==='HML'?'Homologação':'Produção',currentSituation:'Acompanhamento em andamento',dueDate:null,platformSource:platform,isHml:platform==='HML'});
}

const improvements=[
  ['IMP-001','Automatizar consolidação semanal de indicadores','Em andamento','Analista 03','2026-07-08','2026-10-15','Implementação do pipeline em andamento'],
  ['IMP-002','Criar monitoramento preventivo de latência','Concluída','Analista 05','2026-07-20','2026-09-18','Entregue e validado em produção'],
  ['IMP-003','Revisar regras de alertas duplicados','Aguardando Terceiros','Analista 02','2026-08-05','2026-10-05','Aguardando validação do fornecedor'],
  ['IMP-004','Padronizar dashboard operacional','Em andamento','Analista 01','2026-08-14','2026-10-20','Refino visual e validação de métricas'],
  ['IMP-005','Reduzir ruído de eventos de baixa prioridade','To do','Analista 07','2026-08-28','2026-11-01','Planejado para próximo ciclo'],
  ['IMP-006','Adicionar histórico de SLA por plataforma','Concluída','Analista 04','2026-09-03','2026-09-19','Entregue'],
  ['IMP-007','Criar drill-down de chamados rompidos','Em andamento','Analista 06','2026-09-11','2026-10-10','Desenvolvimento em andamento'],
  ['IMP-008','Otimizar carregamento de gráficos','Concluída','Analista 08','2026-09-17','2026-09-23','Otimização aplicada']
].map(([key,summary,status,owner,created,dueDate,currentSituation])=>({key,summary,type:'Melhoria',status,owner,created:`${created}T00:00:00`,objective:null,dueDate:`${dueDate}T00:00:00`,currentSituation,source:'Demo sintética'}));

const version={generatedAt:new Date().toISOString(),mode:'demo',synthetic:true,records:{main:main.length,backlog:backlog.length,improvements:improvements.length},note:'Todos os dados deste repositório são fictícios e gerados deterministicamente.'};
fs.writeFileSync(path.join(OUT,'main.json'),JSON.stringify(main));
fs.writeFileSync(path.join(OUT,'backlog.json'),JSON.stringify(backlog));
fs.writeFileSync(path.join(OUT,'improvements.json'),JSON.stringify(improvements));
fs.writeFileSync(path.join(OUT,'version.json'),JSON.stringify(version,null,2));
console.log(`[demo] ${main.length} registros operacionais, ${backlog.length} de backlog e ${improvements.length} melhorias gerados.`);

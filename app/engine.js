(function(root,factory){if(typeof module==='object')module.exports=factory();else root.Rules=factory()})(globalThis,function(){
'use strict';
const attrs=['F','H','R','A','PdF'],effectKeys=[...attrs,'pv','pm','fa','melee','ranged','fd','initiative','dodge','testF','testH','testR','testA','testPdF'];
const scales=['Ningen','Sugoi','Kiodai','Kami'],MAX=Number.MAX_SAFE_INTEGER;
const uid=()=>globalThis.crypto?.randomUUID?.()||Date.now().toString(36)+Math.random().toString(36).slice(2);
const num=(n,d=0)=>Number.isFinite(Number(n))?Number(n):d;
function number(value,label='Valor',min=-MAX,max=MAX,integer=false){const n=Number(value);if(value===''||value==null||!Number.isFinite(n)||Math.abs(n)>MAX||n<min||n>max||(integer&&!Number.isInteger(n)))throw Error(`${label}: informe ${integer?'um inteiro':'um número'} entre ${min.toLocaleString('pt-BR')} e ${max.toLocaleString('pt-BR')}. O valor não foi alterado.`);return n}
const safe=(n)=>number(n,'Resultado do cálculo');
const clamp=(n,a,b)=>Math.min(b,Math.max(a,num(n)));
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const defaultCombat=()=>({opponentScale:'Ningen',opponentH:0,armorMode:'normal',invulnerable:false,scaleTests:false});
function create(name='Novo personagem'){return {id:uid(),name,player:'',campaign:'',concept:'',age:'',appearance:'',story:'',notes:'',portrait:'',scale:'Ningen',budget:10,earnedPoints:0,xp:0,phase:'criacao',ruleMode:'standard',attributeLimit:5,limitDisadvantages:5,attrs:Object.fromEntries(attrs.map(k=>[k,0])),modifiers:Object.fromEntries(effectKeys.map(k=>[k,0])),bonuses:[],combat:defaultCombat(),items:[],inventory:[],cash:0,damageMelee:'Esmagamento',damageRanged:'Energia',currentPV:null,currentPM:null,conditions:[],journal:[],history:[],createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()}}
function scaleFactor(scale){return 10**Math.max(0,scales.indexOf(scale))}
function calculate(c){
 for(const k of ['budget','earnedPoints','xp','cash','limitDisadvantages'])number(c[k],k,0);
 const sources=Object.fromEntries(effectKeys.map(k=>[k,[]]));
 function add(k,label,value){if(!value)return;sources[k].push({label,value:safe(value)})}
 for(const k of effectKeys)add(k,'Ajuste da campanha',num(c.modifiers?.[k]));
 for(const i of c.items)for(const k of effectKeys)add(k,i.name,num(i.effects?.[k])*num(i.quantity,1));
 for(const b of c.bonuses||[])if(b.enabled!==false&&(b.duration!=='rounds'||b.remaining>0))add(b.target,b.name,b.value);
 const effect=k=>safe(sources[k].reduce((s,x)=>safe(s+x.value),0));
 const a=Object.fromEntries(attrs.map(k=>[k,safe(num(c.attrs[k])+effect(k))]));
 const base=attrs.reduce((s,k)=>safe(s+num(c.attrs[k])),0);
 const kits=c.items.filter(i=>i.category==='kit').length,kitCost=safe(kits*(kits-1)/2);
 const itemCost=c.items.filter(i=>i.category!=='kit'&&i.currency!=='PE').reduce((s,i)=>safe(s+num(i.cost)*num(i.quantity,1)),0);
 const spent=safe(base+itemCost+kitCost),available=safe(num(c.budget)+num(c.earnedPoints));
 const disadvantages=c.items.filter(i=>i.category==='desvantagem').reduce((s,i)=>safe(s+Math.abs(Math.min(0,num(i.cost)))*num(i.quantity,1)),0);
 const level=name=>c.items.filter(i=>normalize(i.name)===name).reduce((s,i)=>safe(s+num(i.quantity,1)),0);
 const pvLevels=level('pontos de vida extras'),pmLevels=level('pontos de magia extras');
 const pv=Math.max(1,safe(Math.max(1,safe((Math.max(0,a.R)+pvLevels*2)*5))+effect('pv')));
 const pm=Math.max(1,safe(Math.max(1,safe((Math.max(0,a.R)+pmLevels*2)*5))+effect('pm')));
 const helpless=(c.conditions||[]).some(x=>['Indefeso','Paralisado','Inconsciente'].includes(x));
 const mobility=c.items.some(i=>i.name==='Teleporte')?2:c.items.some(i=>i.name==='Aceleração')?1:0;
 const initiative=safe(a.H+effect('initiative')+mobility),dodge=safe(a.H+effect('dodge')+mobility);
 const armorMode=c.combat?.armorMode||'normal',armor=armorMode==='vulneravel'?0:safe(a.A*(armorMode==='extra'?2:1));
 const fa=safe(a.F+a.H+effect('fa')+effect('melee')),far=safe(a.PdF+a.H+effect('fa')+effect('ranged'));
 const fd=safe(armor+(helpless?0:a.H)+effect('fd'));
 const currentPV=c.currentPV==null?pv:clamp(c.currentPV,0,pv),currentPM=c.currentPM==null?pm:clamp(c.currentPM,0,pm);
 const warnings=[];
 if(spent>available)warnings.push(`Você ultrapassou o orçamento em ${spent-available} ponto(s).`);
 if(c.ruleMode!=='free'&&c.phase==='criacao'){
  if(disadvantages>num(c.limitDisadvantages))warnings.push(`Desvantagens: ${disadvantages} pontos; limite da campanha: ${c.limitDisadvantages}.`);
  if(attrs.some(k=>a[k]>num(c.attributeLimit,5)))warnings.push(`Na criação, o limite sugerido é ${c.attributeLimit??5}. Há característica acima dele; o valor foi preservado.`);
 }
 if(attrs.some(k=>a[k]<0))warnings.push('Há uma característica final negativa. Revise os ajustes.');
 if(c.items.filter(i=>i.category==='unica').length>1)warnings.push('Mais de uma vantagem única: confirme a combinação com o mestre.');
 if(c.items.some(i=>i.name==='Paladino')&&c.items.some(i=>i.name==='Magia Negra'))warnings.push('Paladino não pode adquirir Magia Negra no manual básico.');
 for(const i of c.items){
  if(i.name==='Ataque Especial'&&num(i.choices?.level,1)>1&&c.phase==='criacao'&&c.ruleMode!=='free')warnings.push('Ataque Especial acima do nível I exige evolução no manual básico.');
  for(const [k,v] of Object.entries(i.requirements||{}))if(a[k]<v)warnings.push(`${i.name}: exige ${k}${v}.`);
  for(const name of i.requiredItems||[])if(!c.items.some(x=>normalize(x.name)===normalize(name)))warnings.push(`${i.name}: exige ${name}.`);
  if(i.needsReview&&!i.confirmed)warnings.push(`${i.name}: confirme custo, requisitos e efeitos com a fonte.`);
 }
 const breakdown={};for(const k of attrs)breakdown[k]=[{label:`${k} base`,value:c.attrs[k]},...sources[k]];
 const expand=k=>breakdown[k].map(x=>({...x}));
 breakdown.fa=[...expand('F'),...expand('H'),...sources.fa,...sources.melee];
 breakdown.far=[...expand('PdF'),...expand('H'),...sources.fa,...sources.ranged];
 breakdown.fd=[...expand('A').map(x=>({...x,value:armorMode==='vulneravel'?0:x.value*(armorMode==='extra'?2:1)})),...(helpless?[]:expand('H')),...sources.fd];
 breakdown.initiative=[...expand('H'),...sources.initiative,...(mobility?[{label:'Teleporte / Aceleração (maior bônus)',value:mobility}]:[])];
 breakdown.dodge=[...expand('H'),...sources.dodge,...(mobility?[{label:'Teleporte / Aceleração (maior bônus)',value:mobility}]:[])];
 breakdown.pv=[{label:'Resistência e PV Extras: máximo(1, (R + 2 × níveis) × 5)',value:Math.max(1,(Math.max(0,a.R)+pvLevels*2)*5)},...sources.pv];
 breakdown.pm=[{label:'Resistência e PM Extras: máximo(1, (R + 2 × níveis) × 5)',value:Math.max(1,(Math.max(0,a.R)+pmLevels*2)*5)},...sources.pm];
 return {attrs:a,pv,pm,currentPV,currentPM,nearDeath:a.R>0&&currentPV>0&&currentPV<=Math.min(5,a.R),spent,available,remaining:safe(available-spent),base,itemCost,kitCost,disadvantages,fa,far,fd,initiative,dodge,helpless,armorMode,warnings,breakdown,sources,scaleFactor:scaleFactor(c.scale)};
}
function die(rng=Math.random){return Math.min(6,Math.max(1,Math.floor(rng()*6)+1))}
function scaleTestBonus(c,type){if(!c.combat?.scaleTests)return 0;const diff=scales.indexOf(c.scale)-scales.indexOf(c.combat.opponentScale);if(!diff)return 0;if(type==='F')return diff>0?10**diff:0;if(type==='R')return Math.sign(diff)*10**Math.abs(diff);return 0}
function roll(c,type,modifier=0,rng=Math.random,options={}){
 const s=calculate(c),d=die(rng);if((c.conditions||[]).some(x=>['Paralisado','Inconsciente'].includes(x))&&['melee','ranged','initiative'].includes(type))return {die:0,total:0,blocked:true,label:'Ação impedida pela condição',explanation:'Paralisado ou Inconsciente: remova a condição antes de agir.'};modifier=number(modifier,'Modificador situacional');
 if(attrs.includes(type)||type==='dodge'){
  if(type==='dodge'&&s.helpless)return {die:0,total:0,target:0,success:false,blocked:true,label:'Esquiva: personagem indefeso',explanation:'Alvos indefesos não podem tentar esquiva.'};
  const situational=type==='dodge'?-num(c.combat?.opponentH):s.sources['test'+type].reduce((n,x)=>n+x.value,0)+scaleTestBonus(c,type);
  const target=safe((type==='dodge'?s.dodge:s.attrs[type])+situational+modifier);
  return {die:d,total:d,target,success:d!==6&&d<=target,label:type==='dodge'?'Esquiva':`Teste de ${type}`,explanation:`${type==='dodge'?'H + bônus de esquiva − H do atacante':type+' + bônus de teste + escala'} + modificador ${modifier} = ${target}; dado ${d}. 6 sempre falha.`};
 }
 const key={melee:'fa',ranged:'far',defense:'fd',initiative:'initiative'}[type];
 let base=key?s[key]:0,critical=false,usedDie=d;
 const parts=key?s.breakdown[key].map(x=>({...x})):[];
 if(type==='defense'&&s.helpless)usedDie=0;
 else if(d>=(options.criticalAt||6)&&['melee','ranged','defense'].includes(type)){
  critical=true;const value=type==='melee'?s.attrs.F:type==='ranged'?s.attrs.PdF:s.armorMode==='vulneravel'?0:s.attrs.A;
  const extra=safe(value*(type==='defense'?1:(options.criticalExtra||1)));base=safe(base+extra);parts.push({label:'Parcela adicional do crítico',value:extra});
 }
 parts.push({label:usedDie?'Dado':'Indefeso: sem dado',value:usedDie},{label:'Modificador situacional',value:modifier});
 const total=safe(base+usedDie+modifier);
 return {die:usedDie,total,critical,label:({melee:'Ataque corpo a corpo',ranged:'Ataque à distância',defense:'Defesa',initiative:'Iniciativa',d6:'1d6'})[type]||type,parts,explanation:parts.map(p=>`${p.label} (${p.value})`).join(' + ')+` = ${total}`};
}
function damage(attack,defense,attackerScale='Ningen',targetScale='Ningen',invulnerable=false){
 attack=number(attack,'FA');defense=number(defense,'FD');
 const adjustedAttack=invulnerable?Math.floor(attack/10):attack;
 const raw=Math.max(0,safe(adjustedAttack-defense));const factor=scaleFactor(attackerScale)/scaleFactor(targetScale);
 const value=Math.floor(safe(raw*factor));return {value,raw,factor,adjustedAttack,explanation:`${invulnerable?'Invulnerabilidade: FA ÷ 10, arredondada para baixo = '+adjustedAttack+'. ':''}máximo(0, ${adjustedAttack} − ${defense}) × ${factor} = ${value} PV na escala do alvo (arredondado para baixo).`};
}
function advanceRound(c){const expired=[];for(const b of c.bonuses||[])if(b.enabled&&b.duration==='rounds'){b.remaining=Math.max(0,b.remaining-1);if(b.remaining===0){b.enabled=false;expired.push(b.name)}}return expired}
function endCombat(c){for(const b of c.bonuses||[])if(b.duration==='combat')b.enabled=false}
function skillTest(c,trained,difficulty,rng=Math.random){if(trained&&difficulty==='Fácil')return {automatic:true,success:true};if(!trained&&difficulty==='Difícil')return {impossible:true,success:false};const modifier=difficulty==='Fácil'?-1:difficulty==='Média'?(trained?1:-3):-2;return {...roll(c,'H',modifier,rng),modifier}}
function deathResult(d){return ['Muito fraco: consciente, sem poder agir.','Inconsciente: recupera 1 PV após uma hora ou um teste bem-sucedido de Medicina.','Inconsciente: recupera 1 PV após uma hora ou um teste bem-sucedido de Medicina.','Quase morto: morrerá em 2d turnos. Medicina prolonga a vida por 1d horas; magia pode salvá-lo.','Quase morto: morrerá em 2d turnos. Medicina prolonga a vida por 1d horas; magia pode salvá-lo.','Morto.'][clamp(Math.trunc(d),1,6)-1]}
function validateImport(raw,{preserveIds=false}={}){
 if(!raw||typeof raw!=='object'||![1,2].includes(raw.version)||!Array.isArray(raw.characters)||!raw.characters.length||raw.characters.length>1000)throw Error('Formato não reconhecido ou mais de 1.000 fichas. Importe um arquivo .3det.json do aplicativo.');
 const text=(v,max=100000)=>{const s=String(v??'');if(s.length>max)throw Error('Um campo de texto excede o tamanho permitido. Nenhum dado foi importado.');return s};
 const val=(v,label,min=-MAX,integer=false,d=0)=>v==null?d:number(v,label,min,MAX,integer);
 const list=(v,max,label)=>{if(v==null)return [];if(!Array.isArray(v)||v.length>max)throw Error(`${label}: lista inválida ou acima de ${max} entradas.`);return v};
 const ids=new Set();
 return raw.characters.map(source=>{
  if(!source||!source.attrs||!Array.isArray(source.items))throw Error('Ficha incompleta ou corrompida.');
  const c=create(text(source.name,200));if(preserveIds&&typeof source.id==='string'&&source.id.length<=200&&!ids.has(source.id))c.id=source.id;ids.add(c.id);
  for(const k of ['player','campaign','concept','age','appearance','story','notes','damageMelee','damageRanged'])c[k]=text(source[k]);
  c.scale=scales.includes(source.scale)?source.scale:'Ningen';
  for(const k of ['budget','earnedPoints','xp','limitDisadvantages','cash'])c[k]=val(source[k],k,0);
  c.phase=source.phase==='evolucao'?'evolucao':'criacao';c.ruleMode=source.ruleMode==='free'?'free':'standard';c.attributeLimit=val(source.attributeLimit,'Limite da campanha',0,true,5);
  for(const k of attrs)c.attrs[k]=val(source.attrs[k],k,0,true);
  for(const k of effectKeys)c.modifiers[k]=val(source.modifiers?.[k],`Ajuste ${k}`);
  if(source.portrait){if(!/^data:image\/(png|jpeg|webp);base64,[a-z0-9+/=]+$/i.test(source.portrait)||source.portrait.length>6000000)throw Error('Retrato inválido ou muito grande.');c.portrait=source.portrait}
  for(const k of ['currentPV','currentPM'])c[k]=source[k]==null?null:val(source[k],k,0);
  c.bonuses=list(source.bonuses,2000,'Modificadores').map(b=>{if(!effectKeys.includes(b.target))throw Error('Destino de modificador desconhecido.');return {id:preserveIds&&b.id?text(b.id,200):uid(),name:text(b.name,200),target:b.target,value:val(b.value,'Bônus'),enabled:b.enabled!==false,duration:['permanent','combat','rounds'].includes(b.duration)?b.duration:'permanent',remaining:val(b.remaining,'Rodadas',0,true),notes:text(b.notes)}});
  c.combat={...defaultCombat(),opponentScale:scales.includes(source.combat?.opponentScale)?source.combat.opponentScale:'Ningen',opponentH:val(source.combat?.opponentH,'H do oponente',0,true),armorMode:['normal','extra','vulneravel'].includes(source.combat?.armorMode)?source.combat.armorMode:'normal',invulnerable:!!source.combat?.invulnerable,scaleTests:!!source.combat?.scaleTests};
  c.items=list(source.items,2000,'Opções').map(i=>({id:preserveIds&&i.id?text(i.id,200):uid(),name:text(i.name,200),category:['vantagem','desvantagem','unica','pericia','especializacao','magia','kit','poder','regra','criatura'].includes(i.category)?i.category:'regra',cost:val(i.cost,'Custo'),quantity:val(i.quantity,'Quantidade',1,true,1),currency:i.currency==='PE'?'PE':'pontos',text:text(i.text),notes:text(i.notes),book:text(i.book,200),page:val(i.page,'Página',1,true,1),needsReview:!!i.needsReview,confirmed:!!i.confirmed,effects:Object.fromEntries(effectKeys.map(k=>[k,val(i.effects?.[k],`Efeito ${k}`)])),requirements:Object.fromEntries(attrs.filter(k=>i.requirements?.[k]!=null).map(k=>[k,val(i.requirements[k],`Requisito ${k}`,0,true)])),requiredItems:list(i.requiredItems,50,'Exigências').map(v=>text(v,200)),choices:i.choices&&typeof i.choices==='object'?Object.fromEntries(Object.entries(i.choices).filter(([k,v])=>/^[a-zA-Z0-9_-]+$/.test(k)&&typeof v==='string').map(([k,v])=>[k,text(v,1000)])):{}}));
  c.inventory=list(source.inventory,2000,'Inventário').map(i=>({id:preserveIds&&i.id?text(i.id,200):uid(),name:text(i.name,200),quantity:val(i.quantity,'Quantidade',0,true),weight:val(i.weight,'Peso',0),notes:text(i.notes),equipped:!!i.equipped}));
  c.conditions=list(source.conditions,40,'Condições').map(s=>text(s,100));
  c.journal=list(source.journal,1000,'Diário').map(j=>({date:text(j.date,100),text:text(j.text)}));c.history=list(source.history,100,'Registro').map(j=>({date:text(j.date,100),text:text(j.text)}));
  for(const k of ['createdAt','updatedAt'])if(source[k])c[k]=text(source[k],100);
  calculate(c);return c;
 });
}
function pack(characters){return {format:'Forja 3D&T Alpha',version:2,exportedAt:new Date().toISOString(),characters}}
return {attrs,effectKeys,scales,MAX,uid,num,number,clamp,normalize,create,calculate,die,roll,damage,scaleFactor,advanceRound,endCombat,skillTest,deathResult,validateImport,pack};
});

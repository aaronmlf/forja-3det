"""Rebuild a local catalog and searchable page index from the supplied PDF collection."""
import json,re,pathlib,hashlib,subprocess
from lxml import etree as E
ROOT=pathlib.Path(__file__).resolve().parent.parent
REF=ROOT/'referencias';OUT=ROOT/'app'/'data';OUT.mkdir(parents=True,exist_ok=True)
TITLES={'3d&tManualbasico':'Manual 3D&T Alpha — revisado','3dt-alpha-mega-city':'Mega City','3dt-alpha-manual-do-defensor':'Manual do Defensor','3dt-alpha-manual-do-aventureiro-alpha':'Manual do Aventureiro','3dt-alpha-tormenta-alpha':'Tormenta Alpha','3dt-alpha-brigada-ligeira-estelar':'Brigada Ligeira Estelar','3dt-alpha-manual-dos-monstros':'Manual dos Monstros','3dt-alpha-bestiario-alpha-biblioteca-elfica':'Bestiário Alpha','3det-manual-da-magia':'Manual da Magia','3dt-alpha-manual-das-vantagens-biblioteca-elfica':'Manual das Vantagens — compilação','3dt-alpha-manual-da-magia-biblioteca-elfica':'Manual da Magia — Biblioteca Élfica'}
if not list(REF.glob('*.pdf')):raise SystemExit('Sem PDFs em referencias/: o catálogo existente foi preservado. Consulte FONTES.md e README.md.')
(ROOT/'tmp').mkdir(exist_ok=True)
for source in REF.glob('*.pdf'):
 if not source.with_suffix('.txt').exists():subprocess.run(['pdftotext','-layout',str(source),str(source.with_suffix('.txt'))],check=True)
books=[];entries=[];pages=[]
def clean(s):return re.sub(r'\s+',' ',s).strip()
for p in sorted(REF.glob('*.pdf')):
 bid=p.stem;xp=ROOT/'tmp'/(bid+'.xml')
 if not xp.exists():subprocess.run(['pdftohtml','-xml','-hidden','-i',str(p),str(xp)],stdout=subprocess.DEVNULL,check=True)
 doc=E.parse(str(xp),E.XMLParser(recover=True));fonts={f.get('id'):f.attrib for f in doc.iter('fontspec')}
 txt=p.with_suffix('.txt').read_text(encoding='utf-8');pt=txt.split('\f');pt=pt[:-1] if not pt[-1].strip() else pt
 books.append(dict(id=bid,title=TITLES[bid],file=p.name,pages=len(pt),sha256=hashlib.sha256(p.read_bytes()).hexdigest()))
 for pn,t in enumerate(pt,1):pages.append(dict(book=bid,page=pn,text=t.strip()))
 current=None;last=None
 def flush():
  global current
  if not current:return
  name=clean(' '.join(current.pop('heads')));rawname=name;body=clean(' '.join(current.pop('body')))
  name=re.sub(r'\s*\([^)]*\)\s*$','',name).strip(' •:')
  name=re.sub(r'^LISTA DE MAGIAS\s+','',name)
  if not 2<len(name)<110 or re.match(r'^(Parte |Capítulo |1d|Sumário|Índice)',name):current=None;return
  category='regra';pn=current['page'];combined=rawname+' '+body
  if bid=='3d&tManualbasico':
   if 30<=pn<=41:category='vantagem'
   elif 42<=pn<=47:category='desvantagem'
   elif 49<=pn<=62:category='unica'
   elif 65<=pn<=68:category='pericia'
   elif 82<=pn<=117:category='magia'
  elif 'aventureiro' in bid and pn>=8:category='kit'
  elif 'vantagens' in bid:
   category='vantagem' if 7<=pn<71 else 'desvantagem' if 71<=pn<98 else 'unica' if 105<=pn<157 else 'regra'
  elif 'magia' in bid:category='magia' if re.search(r'Escolas?|Custo:|Alcance:|Duração:|Dura[çc][ãa]o',body[:700]) else 'regra'
  elif 'monstros' in bid or 'bestiario' in bid:category='criatura'
  elif re.search(r'Exigências:',body[:500]):category='kit'
  elif re.search(r'Escola:|Escolas:',body[:500]):category='magia'
  costmatch=re.search(r'\(([^)]*(?:ponto|pt\b|PE)[^)]*)\)',combined[:250],re.I)
  costtext=costmatch.group(1) if costmatch else ''
  nums=[int(n.replace('–','-').replace('−','-')) for n in re.findall(r'[–−-]?\d+',costtext)]
  costs=list(dict.fromkeys(nums));cost=costs[0] if costs else None
  if bid=='3d&tManualbasico' and category=='vantagem' and cost is not None and cost<0:category='desvantagem'
  if category=='desvantagem' and cost is not None:cost=-abs(cost);costs=[-abs(n) for n in costs]
  if category=='pericia':cost=2;costs=[2]
  if category in ['magia','kit']:cost=0;costs=[0]
  if len(body)<25:current=None;return
  current.update(id=hashlib.sha1((bid+str(pn)+name).encode()).hexdigest()[:14],name=name,category=category,text=body,cost=cost,costs=costs,costLabel=costtext,currency='PE' if re.search(r'\bPE\b|Experiência',costtext) else 'pontos',reviewed=bid=='3d&tManualbasico')
  entries.append(current);current=None
 for page in doc.iter('page'):
  pn=int(page.get('number'));last=None
  for t in page.findall('text'):
   s=clean(''.join(t.itertext()));f=fonts.get(t.get('font'),{});size=float(f.get('size',0));family=f.get('family','');top=float(t.get('top',0));left=float(t.get('left',0))
   if not s or re.match(r'^1d\s*\+',s) or top>float(page.get('height'))-28:continue
   head=False
   if bid=='3d&tManualbasico':head=(size==18 or (size==21 and 65<=pn<=68)) and 'Microgramma' in family
   elif 'vantagens' in bid:head=15<=size<=26 and 'Square721' in family and pn>=7
   elif 'bestiario' in bid:head=size==15 and 'Square721' in family and pn>=7
   elif 'monstros' in bid:head=size==27 and 'Passion' in family and pn>=7
   else:head=18<=size<=29 and any(v in family for v in ['Microgramma','Square721','Passion','Copperplate','Benguiat','ArialBlack','Exo-Black']) and pn>=5
   if head:
    continuation=current and last and last['head'] and abs(left-last['left'])<40 and 0<=top-last['top']<40 and pn==current['page']
    if continuation:current['heads'].append(s)
    else:
     flush();current=dict(book=bid,page=pn,heads=[s],body=[])
   elif current:current['body'].append(s)
   last=dict(head=head,top=top,left=left)
 flush()
# Remove duplicate rendering artifacts and section headers misread as selectable options.
seen=set();result=[]
for e in entries:
 key=(e['book'],e['name'],e['page'])
 if key in seen:continue
 seen.add(key)
 if e['book']=='3d&tManualbasico' and e['category'] in ['vantagem','desvantagem','unica'] and e['cost'] is None:e['category']='regra'
 if e['book']=='3d&tManualbasico' and e['category']=='pericia' and e['name'] not in ['Animais','Arte','Ciência','Crime','Esporte','Idiomas','Investigação','Manipulação','Máquinas','Medicina','Sobrevivência']:e['category']='regra'
 result.append(e)
# Explicit complete skill list; their specializations are recorded individually on the sheet.
for name in ['Animais','Arte','Ciência','Crime','Esporte','Idiomas','Investigação','Manipulação','Máquinas','Medicina','Sobrevivência']:
 if not any(e['category']=='pericia' and e['name']==name and e['book']=='3d&tManualbasico' for e in result):
  result.append(dict(id='skill-'+name,name=name,category='pericia',book='3d&tManualbasico',page=65,text='Perícia completa: 2 pontos. Por 1 ponto você adquire até três especializações quaisquer. Consulte a lista de especializações e os testes no capítulo de perícias.',cost=2,costs=[2],currency='pontos',costLabel='2 pontos',reviewed=True))
data=dict(books=books,entries=result,pages=pages)
(OUT/'catalog.json').write_text(json.dumps(data,ensure_ascii=False,separators=(',',':')),encoding='utf-8')
(OUT/'catalog.js').write_text('window.CATALOG='+json.dumps(data,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
from collections import Counter
print(len(books),'livros;',len(pages),'páginas;',len(result),'entradas',Counter(e['category'] for e in result))
print('Básico:',Counter(e['category'] for e in result if e['book']=='3d&tManualbasico'))

import runpy
runpy.run_path(str(ROOT/'scripts/optimize_assets.py'),run_name='__main__')

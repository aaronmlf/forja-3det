"""Import the user's local catalog and PDFs without tracking them in the public repository."""
from pathlib import Path
import argparse,hashlib,json,shutil
ROOT=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser(description='Importa catálogo e PDFs da sua cópia local, sem fichas ou dados pessoais.')
p.add_argument('source',type=Path,help='Pasta resources/app da distribuição extraída, ou app do projeto original.')
a=p.parse_args();source=a.source.expanduser().resolve()
if source==ROOT/'app':raise SystemExit('Use uma cópia externa como origem, para preservar os arquivos de entrada.')
manifest=json.loads((ROOT/'app/data/books.json').read_text(encoding='utf-8'))
file=source/'data/catalog.json'
if not file.is_file():raise SystemExit('Origem sem data/catalog.json. Informe a pasta resources/app da distribuição.')
catalog=json.loads(file.read_text(encoding='utf-8'))
if not all(isinstance(catalog.get(key),list) for key in ('books','entries','pages')):raise SystemExit('Catálogo inválido.')
if catalog['books']!=manifest:raise SystemExit('O catálogo não corresponde às fontes e hashes de FONTES.md.')
valid={b['id']:b for b in manifest}
for entry in catalog['entries']+catalog['pages']:
 if entry.get('book') not in valid or not isinstance(entry.get('page'),int) or not 1<=entry['page']<=valid[entry['book']]['pages']:
  raise SystemExit('Referência de livro ou página inválida no catálogo.')
# Validate every supplied PDF before changing local data.
books=[]
for book in manifest:
 pdf=source/'livros'/book['file']
 if pdf.is_file():
  with pdf.open('rb') as stream:
   if hashlib.file_digest(stream,'sha256').hexdigest()!=book['sha256']:raise SystemExit('SHA-256 do PDF não confere: '+book['file'])
  books.append((pdf,book['file']))
out=ROOT/'app/data';out.mkdir(exist_ok=True)
text=json.dumps(catalog,ensure_ascii=False,separators=(',',':'))
(out/'catalog.json').write_text(text,encoding='utf-8')
(out/'catalog.js').write_text('window.CATALOG='+text+';',encoding='utf-8')
metadata={'books':catalog['books'],'pageCount':len(catalog['pages']),'entryCount':len(catalog['entries']),'entries':[],'pages':[],'localAvailable':True}
(out/'catalog-metadata.js').write_text('window.LOCAL_CATALOG='+json.dumps(metadata,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
if books:
 (ROOT/'app/livros').mkdir(exist_ok=True)
 for pdf,name in books:shutil.copy2(pdf,ROOT/'app/livros'/name)
print(f'Acervo local importado: {metadata["entryCount"]} entradas, {metadata["pageCount"]} páginas, {len(books)} PDFs.')
print('Os arquivos estão ignorados pelo Git. Nenhuma ficha ou perfil foi importado. Reinicie o aplicativo.')

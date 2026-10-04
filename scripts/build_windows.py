"""Create a portable Windows build from source without overwriting existing distributions."""
from pathlib import Path
import argparse,hashlib,json,shutil,tempfile,zipfile
ROOT=Path(__file__).resolve().parent.parent
p=argparse.ArgumentParser(description='Empacota o código e o runtime oficial Electron para Windows x64.')
p.add_argument('--with-books',action='store_true',help='Inclui os 11 PDFs locais, após verificar seus hashes.')
a=p.parse_args()
RUNTIME=ROOT/'tmp/electron-win32-x64.zip'
EXPECTED='97dcb75065444ef031b9b6ea814ccd2109b97934fffb0c503a555d4737ca79cc'
if not RUNTIME.is_file():raise SystemExit('Baixe electron-v43.7.7-win32-x64.zip do release oficial para tmp/electron-win32-x64.zip.')
with RUNTIME.open('rb') as stream:
 if hashlib.file_digest(stream,'sha256').hexdigest()!=EXPECTED:raise SystemExit('SHA-256 do runtime não confere.')
VERSION=json.loads((ROOT/'app/package.json').read_text(encoding='utf-8'))['version']
DIST=ROOT/'dist';DIST.mkdir(exist_ok=True)
NAME='Forja-3DeT-'+VERSION+'-Windows-x64';TARGET=DIST/NAME;ZIP=DIST/(NAME+'.zip')
if TARGET.exists() or ZIP.exists():raise SystemExit('A distribuição já existe. Mova a versão anterior para outra pasta antes de empacotar; dados não serão apagados.')
books=json.loads((ROOT/'app/data/books.json').read_text(encoding='utf-8'))
if a.with_books:
 for b in books:
  file=ROOT/'app/livros'/b['file']
  if not file.is_file():raise SystemExit('PDF local ausente: '+b['file'])
  with file.open('rb') as stream:
   if hashlib.file_digest(stream,'sha256').hexdigest()!=b['sha256']:raise SystemExit('SHA-256 do PDF não confere: '+b['file'])
with tempfile.TemporaryDirectory(prefix='forja-build-',dir=DIST) as temp:
 staged=Path(temp)/NAME;staged.mkdir()
 with zipfile.ZipFile(RUNTIME) as z:z.extractall(staged)
 (staged/'electron.exe').replace(staged/'Forja-3DeT.exe')
 (staged/'resources/default_app.asar').unlink(missing_ok=True)
 shutil.copytree(ROOT/'app',staged/'resources/app',ignore=shutil.ignore_patterns('livros','node_modules','__pycache__','*.log'))
 if a.with_books:
  folder=staged/'resources/app/livros';folder.mkdir()
  for b in books:shutil.copy2(ROOT/'app/livros'/b['file'],folder/b['file'])
 for name in ['LEIA-ME.txt','README.md','FONTES.md','VALIDACAO.md','DIREITOS.md']:shutil.copy2(ROOT/name,staged/name)
 (staged/'dados').mkdir()
 assert not list((staged/'dados').iterdir())
 pending=Path(temp)/(NAME+'.zip')
 with zipfile.ZipFile(pending,'w',zipfile.ZIP_DEFLATED,compresslevel=6) as z:
  for f in sorted(staged.rglob('*')):
   if f.is_file():z.write(f,Path(NAME)/f.relative_to(staged))
 with pending.open('rb') as stream:sha=hashlib.file_digest(stream,'sha256').hexdigest()
 staged.replace(TARGET);pending.replace(ZIP)
(DIST/(ZIP.name+'.sha256')).write_text(sha+'  '+ZIP.name+'\n',encoding='utf-8')
print(f'Pacote: {ZIP}\nTamanho: {ZIP.stat().st_size/1024/1024:.1f} MiB\nSHA-256: {sha}')
if not a.with_books:print('Os PDFs não foram incluídos. Catálogo local só acompanha o pacote se previamente configurado.')

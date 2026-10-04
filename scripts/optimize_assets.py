"""Generate the tiny startup manifest; the full corpus is loaded only by the search worker."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
out=root/'app/data'
c=json.loads((out/'catalog.json').read_text(encoding='utf-8'))
metadata={'books':c['books'],'pageCount':len(c['pages']),'entryCount':len(c['entries']),'entries':[],'pages':[],'localAvailable':True}
(out/'catalog-metadata.js').write_text('window.LOCAL_CATALOG='+json.dumps(metadata,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
print('Dados na abertura:',(out/'catalog-metadata.js').stat().st_size,'bytes; acervo carregado sob demanda no worker.')

# Forja 3D&T Alpha

Criador offline de fichas 3D&T Alpha em português, com interface Electron. Mantém múltiplos personagens, modificadores altos, pontos, PV/PM, combate, inventário, evolução, desfazer/refazer, fichas JSON e exportação PDF. Versão do código: **1.1.0**.

Este repositório público contém o código, testes, documentação e a pequena camada de orientação do básico. **Os PDFs, textos integrais dos livros, fichas pessoais e binários não fazem parte do Git.** A criação de fichas funciona sem importar o acervo; catálogo e biblioteca passam a funcionar depois da configuração local abaixo.

## Executar e testar

Requer Node.js 22.12 ou superior e npm. Em uma pasta gravável:

```bash
npm ci
npm start
```

O motor e o armazenamento usam apenas recursos do Node; os testes não precisam de PDFs nem instalação de dependências:

```bash
npm test
```

A interface também pode ser aberta por `app/index.html` no navegador. Nesse modo o armazenamento fica no navegador e a exportação PDF usa a impressão.

## Configurar o acervo no seu computador

Requer Python 3.11 ou superior. Use a distribuição completa que você já possui, extraída em outra pasta. Aponte para `resources/app` dessa distribuição, ou para `app` do projeto original:

```bash
npm run acervo -- "/caminho/da/distribuicao/resources/app"
```

O comando importa somente o catálogo, seus metadados e os PDFs presentes; nunca importa fichas, perfis ou dados de testes. Valida as fontes do catálogo e o SHA-256 de cada PDF fornecido. Reinicie a aplicação depois de importar. Os arquivos resultantes continuam ignorados pelo Git.

`FONTES.md` e `app/data/books.json` registram os 11 nomes de arquivos, páginas e hashes. Não basta colocar os PDFs para ativar a busca: use a importação acima ou regenere os dados localmente.

Para regenerar a partir dos próprios PDFs, instale Python 3.11+, `lxml` e Poppler (`pdftotext`, `pdftohtml`), coloque cópias dos PDFs em `referencias/`, com os nomes de `FONTES.md`, e execute `npm run catalog`. Os textos e arquivos de extração são criados localmente. O comando preserva o catálogo existente quando não há fontes.

## Empacotar para Windows x64

Requer Python 3.11 ou superior. Baixe `electron-v43.7.7-win32-x64.zip` do [release oficial Electron 43.7.7](https://github.com/electron/electron/releases/tag/v43.7.7) e salve como `tmp/electron-win32-x64.zip`. O empacotador confere o hash oficial e gera o executável portátil, ZIP e SHA-256:

```bash
npm run build:windows
```

Esse comando não inclui os PDFs. Para uma distribuição local completa, configure primeiro o acervo e execute:

```bash
npm run build:windows -- --with-books
```

O empacotador recusa sobrescrever uma distribuição existente, inclusive a pasta `dados`. Mova a versão anterior antes de reconstruir. Não regenere nem publique acervo, fichas ou livros inadvertidamente. Para usar o pacote, extraia todo o ZIP e abra `Forja-3DeT.exe`; o runtime acompanha o programa e não é necessário instalar Node/Python.

## Verificações de interface

Após `npm ci` e a importação do acervo, `npm run test:flows` verifica edição, modificadores altos, catálogo, JSON, PDF, evolução e histórico persistente. `npm run test:smoke` e `npm run test:responsiveness` cobrem abertura e resposta da interface. Antes de importar o acervo, `npm run test:public` verifica que o clone vazio abre e edita fichas sem o catálogo privado. No Linux sem ambiente gráfico, use `xvfb-run -a npm run test:flows`. É possível informar `ELECTRON_PATH` e `PLAYWRIGHT_PATH` para runtimes já instalados. O teste `tests/windows.cjs` usa Wine e uma cópia isolada de um pacote previamente criado.

## Dados e cobertura

No Windows portátil as fichas ficam em `dados/fichas.json`, com uma cópia anterior em `.bak`. Exporte backups pela interface. A atualização para 1.1.0 requer preservar a pasta `dados`; o formato 2 lê fichas anteriores, mas versões 1.0.x não abrem os novos arquivos.

A extração assistida não interpreta automaticamente todas as exceções dos suplementos. Custos variáveis, requisitos narrativos e efeitos situacionais precisam da decisão do mestre. A versão anterior foi validada em Linux/Electron e Windows sob Wine; consulte `VALIDACAO.md` para o registro histórico, limites e medições locais.

## Estrutura

- `app/engine.js`, `advanced.js`, `history.js`: cálculo, regras adicionais e histórico.
- `app/ui.js`, `index.html`, `style.css`: interface e impressão.
- `app/main.cjs`, `preload.cjs`, `store.cjs`: acesso local isolado e gravação com backup.
- `app/data/basic-guide.js`: camada pequena de custos e orientação revisados.
- `app/data/books.json`, `FONTES.md`: identificação e hashes das fontes locais.
- `tests/`: testes de Node e fluxos opcionais com Electron.
- `scripts/`: importação local, regeneração de dados e empacotamento.

O catálogo completo é pesquisado em um worker e só é carregado sob demanda. Não há telemetria ou serviços remotos no aplicativo. O projeto é independente e não inclui concessão de licença aberta: veja `DIREITOS.md`.

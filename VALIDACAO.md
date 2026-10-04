# Validação — Forja 3D&T Alpha

Registro histórico das versões distribuídas com acervo local. O repositório público conserva o código e os testes, sem PDFs ou catálogo integral. Os testes de regras/armazenamento executam sem acervo; os fluxos de biblioteca exigem a configuração local descrita no README. Novos clones podem repetir os testes e produzir seu próprio registro.

Validação inicial: 18/09/2026. Atualização 1.1.0: 25/09/2026.

## Resultado

- 14 testes do motor aprovados: R0, PV/PM, extras, ajustes fixos, custos, desvantagens, bônus raciais, kits, PE, críticos, testes de característica/perícia, tabela de morte, perto da morte, limites de recursos e importação segura.
- Teste dos fluxos completos aprovado: edição, catálogo, inventário, recursos, evolução, conjuração, diário, rolagem, exportação JSON, reimportação, PDF, pesquisa, visualização do livro, janela compacta e reabertura.
- O PDF de teste foi renderizado e suas duas páginas foram inspecionadas visualmente.
- 11 livros, 1.505 páginas e 4.188 entradas indexadas; todos os identificadores são únicos e todas as referências de página existem.
- Runtime Electron Windows x64 conferido com SHA-256 publicado no release oficial.
- Executável identificado como PE32+ x86-64 GUI para Windows.
- Executável Windows inicializado sob Wine em um perfil isolado: interface carregada e ficha salva corretamente na pasta portátil `dados/fichas.json`.
- A distribuição é entregue com a pasta de dados vazia, sem personagens ou perfis dos testes.

## Limites da validação

Não foi usado um computador Windows físico. A execução sob Wine complementa os testes de Electron em Linux; não substitui a homologação em instalações reais de Windows 10/11, diferentes antivírus, impressoras ou políticas de acesso a pastas.

O catálogo foi extraído automaticamente e não houve revisão editorial integral das 1.505 páginas. O texto de alguns PDFs tem problemas de ordem de leitura, hifenização e cabeçalhos. Entradas devem ser conferidas com o original, acessível pela interface. Não se afirma que todas as exceções, condições e regras opcionais dos onze livros sejam automaticamente interpretadas.

## Evidências

- `tests/engine.test.cjs`: casos unitários independentes da interface.
- `tests/flows.cjs`: fluxos do aplicativo e verificação de dados persistidos.
- `tests/windows.cjs`: inicialização da distribuição Windows sob Wine.
- `tmp/qa`: capturas, PDF e arquivos usados na validação; não fazem parte das fichas distribuídas.
- `dist/SHA256SUMS.txt`: hash do ZIP final, para conferir transferências.

## Correção de desempenho — 1.0.1

- Abertura medida em um ensaio local: 1.263 ms antes, 820 ms depois.
- Pesquisa já carregada: cerca de 53 ms antes, 10–14 ms depois.
- Primeira pesquisa após a mudança: cerca de 452 ms para carregar e indexar o acervo, fora da interface. Esse custo é pago uma vez por execução.
- Dados iniciais na interface: 15.491.535 bytes antes, 2.357 bytes depois.
- Motor de regras: 14 testes aprovados. Armazenamento: gravações ordenadas, backup e recuperação aprovados.
- Os fluxos completos de interface foram repetidos com sucesso após a alteração.
- Medições locais de uma execução; não representam garantia para todo hardware. A distribuição atual conserva o formato de fichas da versão 1.0.0.

Teste com CPU limitada a 25% da velocidade: preparação inicial de 508 ms, interface recebendo 32 intervalos de atualização durante a operação; campo de busca e barra lateral preservados; resposta antiga não substituiu a pesquisa mais recente.

O pacote Windows 1.0.1 foi executado sob Wine: abriu, pesquisou o acervo com o worker e salvou a ficha na pasta portátil. O ZIP passou na conferência de integridade e comparação dos arquivos finais.


## Atualização 1.1.0

- 32 testes aprovados: 14 do núcleo anterior, 17 novos de números altos, modificadores, combate, migração e histórico; 1 de gravação ordenada e recuperação.
- Fluxos anteriores e novos aprovados em Electron: edição, catálogo, inventário, sessão, exportação/importação JSON, PDF, pesquisa, livros, tela compacta e persistência.
- Teste de regressão na interface: característica base 1.500, ajuste +20.000, ajuste de defesa -12.000, efeito de item +1.500 e bônus temporário +50.000. Valores mantidos após exportação, importação e reabertura. Entrada fora da faixa segura recusada sem alterar o valor anterior.
- Verificados desfazer/refazer, remoção e recuperação de bônus, expiração por rodada, reabertura com operações para refazer, escolhas de Energia Extra e Sentidos Especiais, custo/PM do Ataque Especial, ativação de Arena sem duplicação, dano entre escalas e remoção de Paralisado por dano.
- Custos de 122 entradas do básico na camada de revisão; 17 resumos revisados. Conferidos bônus de Resistência apenas em testes e correção do bônus de Centauro. A cobertura editorial dos suplementos permanece parcial.
- PDF de teste com valores altos e memória dos cálculos: duas páginas, renderizadas e inspecionadas. Interface de modificadores inspecionada em janela de 960 × 720 sem transbordamento horizontal.
- Medição local: abertura em aproximadamente 1,15 s; primeira pesquisa em 475 ms; buscas seguintes em 12–13 ms. Com CPU limitada a 25%, a indexação levou 526 ms, com 34 ciclos de atualização da interface durante a operação; maior tarefa registrada de 50 ms. Campo/foco e barra lateral preservados; resultado antigo não substituiu a pesquisa recente. Números de um ensaio local, sem garantia universal.
- O histórico guarda diferenças e verifica apenas o campo afetado em edições simples; o catálogo integral permanece fora da interface, no worker de pesquisa.

O formato 2 é necessário para os novos dados. Versões 1.0.x não abrem esse formato. Valores que já tinham sido reduzidos pela aplicação anterior não podem ser recuperados automaticamente sem uma cópia original.

Validação final do pacote 1.1.0: executável Windows executado sob Wine em perfil isolado. Abriu a interface, pesquisou o acervo, salvou +20.000 e +50.000 na pasta portátil, manteve os valores após recarregar e executou desfazer/refazer com o histórico persistido. Não foi usado Windows físico. ZIP aprovado na integridade e na comparação dos 28 arquivos do aplicativo com as fontes finais; não contém fichas de teste.

SHA-256 de `Forja-3DeT-1.1.0-Windows-x64.zip`: `f2c97b3370112a13e8e2129d889d339f4cbd9af268dd89bc853a7edffe8030b8`.


## Preparação do repositório público — 03/10/2026

O repositório usa Electron **43.7.7**, com Node.js 22.12 ou superior no desenvolvimento. A versão foi atualizada antes da publicação a partir do [release oficial](https://github.com/electron/electron/releases/tag/v43.7.7). Os runtimes Windows/Linux foram conferidos contra o [manifesto SHA-256 oficial](https://github.com/electron/electron/releases/download/v43.7.7/SHASUMS256.txt). O empacotador Windows exige o hash `97dcb75065444ef031b9b6ea814ccd2109b97934fffb0c503a555d4737ca79cc`.

- `npm audit` do arquivo de versões final: zero alertas conhecidos na data desta conferência.
- 34 testes de regras, armazenamento, histórico e inicialização dos metadados públicos aprovados, sem depender do acervo.
- Cópia pública sem PDFs nem catálogo integral executada em Electron43.7.7: abertura, edição de ficha e busca vazia com orientação para configurar o acervo, sem exceções da interface.
- Fluxo com o acervo privado local repetido no novo runtime: edição, catálogo, PV/PM, inventário, evolução, magia, diário, dados, JSON, importação, PDF, busca, abertura do livro, janela compacta e persistência aprovados.
- Build Windows com runtime43.7.7 a partir da cópia pública: ZIP de 144,3 MiB íntegro, executável Windows, sem PDFs, corpus integral ou fichas. SHA-256 deste ensaio: `4c9021596ea5c54606bf3a8386bf221c579f6502e0a480cb3d965d14c76a5be0`. O tamanho e o hash mudam em novas reconstruções.

Os registros anteriores descrevem as distribuições originais. Esta atualização do repositório preserva os arquivos originais e seus dados. O novo build Windows foi empacotado e conferido; os fluxos do runtime43.7.7 foram executados em Linux. A execução Windows/Wine registrada nas seções anteriores corresponde à distribuição anterior, e não afirma uma nova homologação em Windows físico.

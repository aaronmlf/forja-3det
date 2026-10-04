"""Explicit review overlay: base-book costs and guided variants, separate from PDF extraction."""
from pathlib import Path
import json
root=Path(__file__).resolve().parent.parent
c=json.loads((root/'app/data/catalog.json').read_text(encoding='utf-8'))
base={e['name']:e for e in c['entries'] if e['book']=='3d&tManualbasico' and e['category'] in ['vantagem','desvantagem','unica','pericia']}
costs={name:{'costReviewed':True,'page':e['page'],'cost':e['cost'],'costs':[e['cost']],'repeatable':'cada' in e['costLabel']} for name,e in base.items()}
for name,values in {'Energia Extra':[1,2],'Imortal':[1,2],'Magia Irresistível':[1,2,3],'Sentidos Especiais':[1,2],'Deficiência Física':[0,-1,-2],'Insano':[0,-1,-2,-3],'Maldição':[-1,-2],'Poder Vergonhoso':[0,-1],'Restrição de Poder':[-1,-2,-3]}.items():costs[name]['costs']=values
# Reviewed descriptions supersede extraction fragments only for the entries below.
summaries={
'Arena':'Você recebe H+2 apenas no terreno ou condição escolhidos. Fora da arena, o bônus não se aplica. Registre a arena e ative o efeito temporário quando for pertinente; não aumente a Habilidade permanentemente.',
'Pontos de Vida Extras':'Cada aquisição custa 1 ponto e aumenta a Resistência efetiva em 2 somente para calcular PV. Não modifica a Resistência nem os PM. O aplicativo calcula esse efeito pela quantidade.',
'Pontos de Magia Extras':'Cada aquisição custa 1 ponto e aumenta a Resistência efetiva em 2 somente para calcular PM. Não modifica a Resistência nem os PV. O aplicativo calcula esse efeito pela quantidade.',
'Energia Extra':'Gaste 2 PM e um turno inteiro para recuperar todos os seus PV. A versão de 1 ponto só funciona Perto da Morte; a de 2 pontos pode ser usada a qualquer momento. Não cura doenças nem venenos.',
'Imortal':'Por 1 ponto, retornar da morte leva até uma aventura seguinte. Por 2 pontos, o retorno ocorre após o combate ou o perigo. Uma aventura em que tenha morrido não concede PE. Confira na fonte as limitações.',
'Magia Irresistível':'O custo de 1, 2 ou 3 pontos impõe, respectivamente, −1, −2 ou −3 ao teste de Resistência da vítima de suas magias. É uma penalidade aplicada ao alvo, não um bônus permanente em sua própria ficha.',
'Sentidos Especiais':'Por 1 ponto, escolha três sentidos; por 2 pontos, receba todos os sete. Infravisão e Radar não substituem Ver o Invisível. Registre explicitamente os sentidos escolhidos.',
'Elementalista':'Escolha água, ar, fogo, terra ou espírito. Magias desse elemento custam metade dos PM, arredondados para cima. Pode ser comprado uma vez para cada elemento; não se aplica à Magia Branca ou Negra.',
'Parceiro':'Exige Aliado. Quando lutam em dupla, podem combinar as características mais altas e certas vantagens; o dano é dividido entre ambos, arredondado para cima. O Aliado também precisa possuir Parceiro. Não some permanentemente as características.',
'Ligação Natural':'Exige Aliado. Permite comunicação e percepção da localização dele e tem consequências compartilhadas de dano. Consulte os detalhes e as escalas na página original.',
'Paladino':'Recebe +1 somente em testes de Resistência e acesso a Cura Mágica e Detectar o Mal pelo custo normal de PM. Segue os códigos dos Heróis e Honestidade sem receber pontos. Não pode adquirir Magia Negra.',
'Aceleração':'Oferece um movimento extra e +1 para certas situações de mobilidade. O capítulo de combate concede +1 em iniciativa e esquiva, sem acumular com Teleporte. O uso em combate custa 1 PM e dura até o fim do combate.',
'Teleporte':'Permite deslocamento instantâneo de até H × 10 metros; destinos fora de vista exigem teste de H. Um deslocamento custa 1 PM. O capítulo de combate concede +2 em iniciativa e esquiva, sem acumular com Aceleração.',
'Código de Honra':'Cada código adotado custa −1 ponto. Escolha e registre os compromissos; infringir os códigos tem consequências previstas na fonte. Não conte códigos já incluídos em outra vantagem.',
'Ataque Especial':'Escolha Força ou Poder de Fogo. A versão básica custa 1 ponto e permite gastar 1 PM para ganhar +2 na característica escolhida, em um único ataque. Modificações podem alterar custo, PM e efeito. Nunca custa menos de 1 ponto ou 1 PM. Bônus do ataque não é permanente.',
'Restrição de Poder':'Escolha a condição que dobra o gasto de PM. Frequência incomum (aproximadamente 25%): −1 ponto; comum (50%): −2; muito comum: −3. O mestre determina quando a restrição está presente.',
'Maldição':'Registre a maldição e sua gravidade: suave (−1) ou grave (−2). Os efeitos concretos devem ser definidos com o mestre; o custo sozinho não descreve as consequências.'}
for name,summary in summaries.items():costs[name].update(summary=summary,guideReviewed=True)
for name in ['Parceiro','Ligação Natural']:costs[name]['requiredItems']=['Aliado']
costs['Paladino']['effects']={'testR':1}
for name,effects in {'Elfo':{'H':1},'Elfo Negro':{'H':1},'Halfling':{'H':1,'PdF':1},'Anfíbio':{'R':1},'Centauro':{'F':1},'Minotauro':{'F':2,'R':1},'Ogre':{'F':3,'R':3},'Troglodita':{'F':1,'A':1},'Anão':{'testR':1},'Goblin':{'testR':1}}.items():costs[name]['effects']=effects
# Structured choices always remain editable by a game master.
def choose(name,key,label,values):costs[name].setdefault('choices',[]).append({'key':key,'label':label,'values':values})
choose('Energia Extra','version','Quando pode usar',['Somente Perto da Morte (1 ponto)','A qualquer momento (2 pontos)'])
choose('Imortal','version','Tempo para retornar',['Aventura seguinte (1 ponto)','Após o perigo (2 pontos)'])
choose('Sentidos Especiais','version','Abrangência',['Três sentidos (1 ponto)','Todos os sentidos (2 pontos)'])
choose('Elementalista','element','Elemento',['Água','Ar','Fogo','Terra','Espírito'])
choose('Ataque Especial','attack','Característica do ataque',['F','PdF'])
for name,label in {'Arena':'Terreno ou condição da arena','Aliado':'Nome e vínculo do aliado','Código de Honra':'Código escolhido e compromissos','Inimigo':'Grupo de inimigos','Familiar':'Animal e poderes compartilhados','Maldição':'Efeito e condição da maldição','Restrição de Poder':'Condição que restringe os poderes','Deficiência Física':'Deficiência e exceções aplicáveis','Insano':'Variante e custo conforme a fonte','Protegido Indefeso':'Pessoa protegida'}.items():choose(name,'detail',label,[])
choose('Sentidos Especiais','senses','Sentidos escolhidos (separados por vírgula)',[])
costs['Ataque Especial']['specialAttack']=True
out=root/'app/data/basic-guide.js';out.write_text('window.BASIC_GUIDE='+json.dumps(costs,ensure_ascii=False,separators=(',',':'))+';',encoding='utf-8')
print(len(costs),'opções do básico com custos conferidos;',len(summaries),'resumos revisados.')

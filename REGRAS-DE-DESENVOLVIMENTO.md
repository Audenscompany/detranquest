# 🛡️ Regras de Desenvolvimento - Alfred OS v9

**Documento Crítico para Evitar Regressão**

---

## ⚠️ LEIA ANTES DE FAZER QUALQUER ALTERAÇÃO

Este documento foi criado após a recuperação de um bug silencioso que quebrou todo o projeto.

**Objetivo:** Garantir que nunca mais isso aconteça.

---

## 🚫 NUNCA FAÇA

| ❌ NÃO FAÇA | 💥 POR QUÊ | ✅ FAÇA ISSO |
|---|---|---|
| Renomear variáveis sem buscar todas as referências | Você esquece de atualizar imports/usos | Buscar com Ctrl+F antes de renomear |
| Refatorar código sem testar a página | Erros silenciosos quebram tudo | Abrir F12 e testar após cada mudança |
| Fazer commit sem testar em produção | Bug vai para produção | Testar em GitHub Pages antes de push |
| Confiar em "acho que deve funcionar" | Você estava errado | Testar SEMPRE |
| Ignorar erros no console | Erros silenciosos são piores | Verificar F12 Console antes de commitar |
| Modificar código que você não entende | Você quebra sem saber por quê | Pedir código review ou estudar primeiro |
| Fazer multiplas mudanças em um commit | Impossível debugar depois | Um commit = uma funcionalidade |

---

## ✅ REGRA DE OURO - CHECKLIST PRÉ-COMMIT

**ANTES de fazer qualquer `git commit`:**

```
□ Abri a página em meu navegador?
  https://audenscompany.github.io/detranquest/alfred.html

□ Abri DevTools (F12)?

□ Fui para Console e verifiquei se tem erros vermelhos?

□ Testei a funcionalidade que modifiquei?

□ Testei todas as funcionalidades existentes?

□ A página funciona como antes?

□ Nenhum erro no console?

□ Se tudo passou → Agora posso fazer commit
  Se algo quebrou → Corrijo e testo novamente
```

**SE VOCÊ NÃO PASSAR NESTE CHECKLIST, NÃO COMMITE!**

---

## 🔍 PROTOCOLO DE MUDANÇA

Sempre que fizer qualquer mudança:

### 1. ANTES de começar
```
a) Crie uma branch: git checkout -b feature/sua-feature
b) Documente o que vai mudar
c) Identifique os arquivos que vão ser modificados
```

### 2. DURANTE o desenvolvimento
```
a) Faça pequenas mudanças (1 mudança por commit)
b) Teste após CADA mudança
c) Use console.log() para debug
d) Verifique F12 Console frequentemente
```

### 3. APÓS terminar
```
a) Teste na página: GitHub Pages
b) Teste no Console: F12
c) Teste todas as funcionalidades
d) Teste casos extremos (API Key inválida, PDF grande, etc)
```

### 4. ANTES de fazer push
```
a) Recarregue a página (F5)
b) Teste novamente (completo)
c) Se passou → push OK
d) Se falhou → corrija e tente novamente
```

---

## 🏗️ ESTRUTURA DO CÓDIGO

### Padrão de Função

```javascript
// ✅ CORRETO
const myFunction = (param1, param2) => {
  // Validar entrada
  if (!param1 || !param2) {
    console.error('❌ Parâmetros inválidos');
    return null;
  }

  try {
    // Fazer algo
    const result = doSomething(param1, param2);
    console.log('✅ Operação bem-sucedida');
    return result;
  } catch (error) {
    console.error('❌ Erro:', error.message);
    return null;
  }
};

// ❌ ERRADO
function myFunction(a, b) {
  var x = a + b;
  return x;
}
```

### Padrão de Async/Await

```javascript
// ✅ CORRETO
const fetchData = async () => {
  try {
    const response = await fetch('...');
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('❌ Erro ao buscar dados:', error);
    return null;
  }
};

// ❌ ERRADO
const fetchData = () => {
  fetch('...').then(r => r.json()).then(d => console.log(d));
};
```

---

## 📝 EXEMPLO DE BOAS PRÁTICAS

### Quando adicionar uma funcionalidade:

```javascript
// 1. Comentar o propósito
// 2. Validar entrada
// 3. Implementar com try-catch
// 4. Logar cada passo
// 5. Retornar resultado ou null

const uploadFile = async (file) => {
  // Validação
  if (!file) {
    console.warn('⚠️ Arquivo não fornecido');
    addMessage('❌ Selecione um arquivo', 'error');
    return null;
  }

  console.log(`📤 Iniciando upload de ${file.name}...`);
  addMessage(`📤 Processando ${file.name}...`, 'system');

  try {
    // Validar tipo
    if (!file.name.endsWith('.pdf')) {
      throw new Error('Apenas PDFs são aceitos');
    }

    // Processar
    const buffer = await file.arrayBuffer();
    const result = await processPDF(buffer);

    console.log(`✅ ${file.name} processado com sucesso`);
    addMessage(`✅ ${file.name} pronto!`, 'system');

    return result;
  } catch (error) {
    console.error(`❌ Erro ao processar ${file.name}:`, error);
    addMessage(`❌ Erro: ${error.message}`, 'error');
    return null;
  }
};
```

---

## 🐛 COMO DEBUGAR

### Passo 1: Abrir Console
```
F12 → Console tab
```

### Passo 2: Procurar por erros
```
❌ Erros aparecem em vermelho
⚠️ Avisos aparecem em amarelo
ℹ️ Informações aparecem em azul
```

### Passo 3: Adicionar logs
```javascript
console.log('ℹ️ Informação:', variavel);
console.warn('⚠️ Aviso:', mensagem);
console.error('❌ Erro:', erro);
```

### Passo 4: Testar no console
```javascript
// Executar diretamente no console
send()  // Simular clique
uploadPDF(file)  // Testar upload
getContext()  // Testar memória
```

---

## 📋 TIPOS DE TESTE

### Teste de Inicialização
```
1. Abra a página
2. Vê "Bem-vindo ao Alfred OS v9"?
3. Bolinha está vermelha?
4. Console está limpo?
```

### Teste de API Key
```
1. Cole API Key inválida (< 20 chars)
2. Bolinha permanece vermelha?
3. Tente enviar
4. Vê erro "API Key inválida"?
```

### Teste de Chat
```
1. Cole API Key válida
2. Bolinha fica verde?
3. Digite "opa"
4. Clique Enviar
5. Vé "⏳ Alfred pensando..."?
6. Vé resposta do Claude?
```

### Teste de PDF
```
1. Cole API Key válida
2. Clique "📄 PDF"
3. Selecione PDF
4. Vé "✅ PDF absorvido"?
5. Pergunte algo sobre o PDF
6. Alfred usa o PDF?
```

### Teste de Memória
```
1. Envie mensagem: "meu nome é Lucas"
2. Envie mensagem: "qual é meu nome?"
3. Alfred lembrou?
4. Recarregue página (F5)
5. Histórico continua?
```

---

## 🚨 ERROS CONHECIDOS E COMO EVITAR

### Erro: "window.pdfjsWorker is undefined"
```
❌ ERRADO: const pdfjsLib = window.pdfjsWorker;
✅ CORRETO: const pdfjsLib = window.pdfjs;

Causa: PDF.js cria window.pdfjs, não pdfjsWorker
```

### Erro: "Cannot read property of undefined"
```
❌ ERRADO: document.getElementById('id').value
✅ CORRETO: 
  const elem = document.getElementById('id');
  if (elem) {
    const value = elem.value;
  }

Causa: Elemento pode não existir
```

### Erro: "Fetch failed"
```
❌ Esqueceu de validar API Key antes
✅ SEMPRE validar antes de fazer fetch

Causa: API Key inválida ou ausente
```

---

## 📊 LISTA DE VERIFICAÇÃO FINAL

Antes de fazer push para main:

### Código
- [ ] Sem erros de sintaxe
- [ ] Sem variáveis indefinidas
- [ ] Sem funções não declaradas
- [ ] Nomes de variáveis claros
- [ ] Documentação (comentários)

### Funcionalidade
- [ ] Testei a nova funcionalidade
- [ ] Não quebrei funcionalidade existente
- [ ] API Key validation funciona
- [ ] Chat funciona
- [ ] PDFs funcionam
- [ ] Memória funciona

### Console (F12)
- [ ] Nenhum erro vermelho
- [ ] Nenhum aviso importante
- [ ] Logs informativos aparecem

### Página
- [ ] Carrega rapidamente
- [ ] Interface responde
- [ ] Botões funcionam
- [ ] Inputs funcionam
- [ ] Sem travamentos

### Performance
- [ ] Sem memory leaks
- [ ] Sem loops infinitos
- [ ] Sem requisições duplicadas
- [ ] Tempo de resposta aceitável

---

## 🎓 REFERÊNCIAS

### Arquivos Importantes
- `alfred.html` - Arquivo principal (não modificar sem cuidado!)
- `RECUPERACAO-E-TESTES.md` - Histórico do bug
- Este arquivo - Regras de desenvolvimento

### Pontos de Atenção
- Linha 223: `const pdfjsLib = window.pdfjs;` (CRÍTICO)
- Funções de upload: Validar PDF.js
- Fetch API: Sempre validar API Key
- LocalStorage: Pode estar cheio

### Ferramentas
- F12 Console: Debug indispensável
- GitHub: Versionamento
- GitHub Pages: Produção

---

## 🏆 QUALIDADE

**Meta:** 0 bugs silenciosos em produção

**Como alcançar:**
1. Testar SEMPRE antes de commitar
2. Abrir F12 SEMPRE antes de push
3. Ler o console SEMPRE depois de mudanças
4. Documentar SEMPRE o que foi feito
5. Revisar SEMPRE o próprio código

**Resultado:** Projeto estável e confiável

---

## 📞 SUPORTE

Se encontrar um bug:

1. Abra F12 Console
2. Reproduza o erro
3. Copie a mensagem de erro
4. Procure a linha de código
5. Adicione logs (`console.log()`)
6. Teste novamente
7. Corrija e valide

Se não conseguir corrigir:

1. Faça um commit com o bug (não push!)
2. Documente exatamente o que está quebrado
3. Descreva os passos para reproduzir
4. Peça ajuda

---

**Lembre-se:** Um desenvolvedor responsável testa SEMPRE antes de commitar.

🦇 **Made with dedication to quality.**

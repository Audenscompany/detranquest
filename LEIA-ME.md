# DETRAN Quest — PWA pronto pra publicar

## O que mudou
O jogo deixou de ser um arquivo único pra virar uma pastinha com 4 itens:

- `index.html` — o jogo (igual a antes, só com a camada de PWA adicionada no fim)
- `manifest.json` — identidade do app (nome, ícone, cor)
- `service-worker.js` — quem cuida do cache e da atualização automática
- `icons/icon-192.png` e `icons/icon-512.png` — ícone do app instalado

**Nada do que já existia mudou de comportamento**: login multiusuário, save por
e-mail, backup automático, migração de save antigo, tela de recuperação — tudo
continua exatamente igual. A única coisa nova é a camada de entrega.

## Como a atualização automática funciona, na prática
1. Você muda o `index.html` (novo conteúdo, correção de bug, etc).
2. Antes de publicar, bump **os dois** números de versão (são números
   idênticos de propósito, pra ficar fácil de lembrar):
   - `GAME_VERSION` dentro de `index.html`
   - `CACHE_VERSION` dentro de `service-worker.js`
3. Publica os arquivos atualizados (manda pro GitHub/Vercel/Netlify).
4. Quem já tinha o jogo aberto ou instalado recebe um aviso *"🔄 Nova versão
   disponível"* com os botões **Atualizar agora** / **Depois** — sem precisar
   baixar nada.
5. Quem abre o link pela primeira vez depois da publicação já recebe a versão
   nova direto, sem aviso nenhum (é assim que normalmente funciona um site).

Se você esquecer de bumpar o `CACHE_VERSION`, o navegador não vai perceber
que existe versão nova — por isso o aviso duplicado nos dois arquivos.

## Opção 1 — GitHub Pages (recomendado, você já usa isso no audenscompany)

```bash
# dentro da pasta detranquest-pwa/
git init
git add .
git commit -m "DETRAN Quest v5.1.0 — PWA"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/detranquest.git
git push -u origin main
```

Depois, no GitHub: **Settings → Pages → Source: branch `main`, pasta `/ (root)` → Save**.

Em alguns minutos o jogo fica em `https://SEU-USUARIO.github.io/detranquest/`.

Pra toda atualização futura, é só repetir `git add . && git commit -m "..." && git push` — o Pages republica sozinho.

**Se você quiser, eu mesmo faço esse `git push` agora** — preciso de um Personal
Access Token seu (GitHub → Settings → Developer settings → Personal access
tokens → Fine-grained, com permissão de `Contents: Read and write` no repo).
Sem o token, os comandos acima são pra você rodar (2 minutos, é basicamente o
que você já fez no projeto da Audens).

## Opção 2 — Netlify (mais simples ainda, sem git nenhum)
Acesse [app.netlify.com/drop](https://app.netlify.com/drop) e arraste a pasta
`detranquest-pwa` inteira. Pronto, link gerado na hora
(`algumacoisa.netlify.app`). Pra atualização automática de verdade (sem
arrastar de novo toda vez), conecte esse mesmo site a um repositório GitHub
depois — aí cada `git push` republica sozinho.

## Opção 3 — Vercel
`vercel.com/new` → importar a pasta ou conectar ao GitHub → deploy. Mesma
lógica: depois de conectado a um repo, cada push publica sozinho.

## Opção 4 — Cloudflare Pages
`pages.cloudflare.com` → "Create a project" → conectar ao GitHub (ou upload
direto da pasta). Mesma lógica de auto-deploy a cada push.

## Importante sobre o que eu consegui testar
Testei toda a lógica de JavaScript (registro do service worker sem quebrar
nada, o aviso de atualização salvando o progresso antes de aplicar, o botão
de instalar, o indicador de offline) num ambiente simulado. O que eu **não**
consigo simular por aqui é o ciclo de vida real de um Service Worker num
navegador de verdade com HTTPS (isso só existe em produção). Depois de
publicar, vale abrir o DevTools → Application → Service Workers uma vez pra
confirmar visualmente que registrou certo — é rápido e só precisa ser feito
uma vez.

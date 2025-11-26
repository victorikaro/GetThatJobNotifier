#  Get That Job!

Bem-vindo ao seu novo assistente de busca de vagas. Este projeto foi criado para automatizar aquela tarefa repetitiva de ficar dando F5 no Workana o dia todo. Ele monitora as vagas para você e te avisa quando algo interessante aparece.

Simples, direto e funcional.

##  Como rodar

Você vai precisar de dois terminais abertos. É só seguir o passo a passo:

### 1. Instale o necessário
Se é a primeira vez por aqui, instale as dependências:
`
npm install
`

### 2. Ligue o motor (Backend)
Em um terminal, inicie o scraper que vai buscar as vagas:
`
node backend-scraper.js
`
_Ele vai rodar na porta 4000._

### 3. Abra a interface (Frontend)
Em **outro** terminal, inicie o servidor da interface visual:
`
node server.js
`
_Acesse em: http://localhost:8080_

---

##  O que ele faz por você?

*   **Monitoramento Real:** Usa um navegador invisível (Puppeteer) para ler o site do Workana de verdade.
*   **Notificações:** Te avisa no navegador assim que uma vaga nova que bate com seus filtros aparece.
*   **Filtros Inteligentes:** Escolha categorias, palavras-chave (ex: "react", "python") e orçamento mínimo.
*   **Visual Moderno:** Uma interface "Glassmorphism" limpa para você deixar aberta na segunda tela sem doer os olhos.

##  Dicas de Uso

*   **Intervalo:** Não coloque um tempo muito curto (menos de 30s) para evitar que o Workana bloqueie seu IP temporariamente.
*   **Notificações:** Lembre-se de permitir as notificações no navegador quando o site pedir.
*   **Keywords:** Use vírgulas para separar (ex: 
ode, backend, api).

##  Tecnologias
*   **Frontend:** HTML5, CSS3, Vanilla JS.
*   **Backend:** Node.js, Express.
*   **Core:** Puppeteer (para o scraping).

---
*Feito por Victor Ikaro.* 

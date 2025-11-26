# 🔍 Workana Job Scraper - REAL SCRAPING

Sistema web scraper para monitorar **vagas REAIS** do Workana em tempo real com notificações no navegador.

## ✨ Funcionalidades

- 🔄 **Scraping REAL** do site Workana usando Puppeteer
- 🔗 **Links diretos** para as vagas reais
- 🔄 **Monitoramento automático** de novas vagas
- 🔔 **Notificações do navegador** para novas vagas
- 🎯 **Filtros personalizáveis**:
  - Por categoria (TI, Design, Marketing, etc.)
  - Por palavras-chave
  - Por orçamento mínimo
- 📊 **Dashboard em tempo real** com estatísticas
- 📝 **Sistema de logs** detalhado
- 💾 **Persistência de configurações** no navegador
- ⚡ **Interface moderna e responsiva**

## 🚀 Como Usar

### 1. Instalação

```powershell
# Navegue até a pasta do projeto
cd e:\PROJETOS\2025.02\workana

# Instale as dependências
npm install
```

### 2. Iniciar os Servidores

**⚠️ IMPORTANTE: Você precisa rodar 2 servidores!**

#### Terminal 1 - Backend Scraper (Porta 4000):
```powershell
node backend-scraper.js
```

#### Terminal 2 - Frontend (Porta 8080):
```powershell
node server.js
```

Os servidores estarão em:
- **Frontend**: http://localhost:8080
- **Backend API**: http://localhost:4000

### 3. Acessar o Sistema

1. Abra seu navegador
2. Acesse: **http://localhost:3000**
3. Clique em **"🔔 Solicitar Permissão de Notificação"** para habilitar notificações
4. Configure os filtros desejados
5. Clique em **"▶️ Iniciar Monitoramento"**

## 📋 Configurações

### Filtros de Categoria

Selecione as categorias que deseja monitorar:
- ✅ TI e Programação
- 🎨 Design e Multimídia
- 📝 Tradução e Conteúdos
- 📱 Marketing e Vendas
- 📁 Suporte Administrativo
- ⚖️ Jurídico
- 💰 Finanças e Administração
- 🏗️ Engenharia e Manufatura

### Filtros de Palavras-chave

Digite palavras-chave separadas por vírgula para refinar a busca:
```
javascript, react, python, node.js
```

### Filtro de Orçamento

Defina o orçamento mínimo (em USD) para as vagas que deseja monitorar.

### Intervalo de Verificação

Configure o intervalo (em segundos) entre cada verificação de novas vagas.
- Mínimo: 10 segundos
- Máximo: 300 segundos (5 minutos)

## ⚠️ Importante - CORS e Scraping Real

**Nota:** A versão atual utiliza dados simulados (mock) para demonstração. Para fazer scraping real do Workana, você precisará:

### Opção 1: Backend Proxy (Recomendado)

Crie um backend Node.js com Express para fazer as requisições:

```javascript
// backend-proxy.js
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

app.get('/api/workana-jobs', async (req, res) => {
    try {
        const response = await axios.get('https://www.workana.com/jobs');
        // Parse HTML com cheerio ou similar
        res.json(jobs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(4000, () => console.log('Proxy rodando na porta 4000'));
```

### Opção 2: Puppeteer/Playwright

Use automação de navegador para scraping mais robusto:

```javascript
const puppeteer = require('puppeteer');

async function scrapeWorkana() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.workana.com/jobs');
    
    const jobs = await page.evaluate(() => {
        // Extrair dados da página
    });
    
    await browser.close();
    return jobs;
}
```

### Opção 3: API Oficial

Verifique se o Workana oferece uma API oficial para integração.

## 🛠️ Estrutura do Projeto

```
workana/
├── index.html      # Interface principal
├── scraper.js      # Lógica do scraper
├── style.css       # Estilos
├── server.js       # Servidor local
└── README.md       # Documentação
```

## 🔧 Tecnologias Utilizadas

- **HTML5** - Estrutura
- **CSS3** - Estilização com gradientes e animações
- **JavaScript (ES6+)** - Lógica e scraping
- **Node.js** - Servidor local
- **Notification API** - Notificações do navegador
- **LocalStorage API** - Persistência de dados

## 📱 Notificações do Navegador

Para receber notificações:

1. Clique no botão "🔔 Solicitar Permissão de Notificação"
2. Permita as notificações quando o navegador solicitar
3. As notificações aparecerão quando novas vagas forem encontradas
4. Clique na notificação para focar na janela do scraper

## 💡 Dicas de Uso

- **Filtros múltiplos**: Combine diferentes filtros para resultados mais precisos
- **Palavras-chave**: Use termos específicos da sua área
- **Intervalo**: Um intervalo menor detecta vagas mais rapidamente, mas consome mais recursos
- **Logs**: Use os logs para debugar e entender o comportamento do sistema
- **Persistência**: Suas configurações são salvas automaticamente no navegador

## 🐛 Solução de Problemas

### Notificações não funcionam
- Verifique se concedeu permissão no navegador
- Verifique se a opção "Habilitar notificações" está marcada
- Teste em modo HTTPS (notificações podem não funcionar em HTTP)

### Sem vagas encontradas
- Verifique se selecionou pelo menos uma categoria
- Ajuste os filtros (palavras-chave ou orçamento podem ser muito restritivos)
- Aguarde o próximo ciclo de verificação

### Servidor não inicia
- Verifique se o Node.js está instalado: `node --version`
- Verifique se a porta 3000 está disponível
- Tente usar outra porta alterando PORT no server.js

## 📄 Licença

Este projeto é apenas para fins educacionais e demonstração. Respeite os termos de uso do Workana ao fazer scraping.

## 🤝 Contribuições

Sugestões e melhorias são bem-vindas!

## 📞 Suporte

Para dúvidas ou problemas, consulte a documentação ou abra uma issue.

---

**Desenvolvido com ❤️ para facilitar a busca de vagas no Workana**

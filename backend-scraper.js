const express = require('express');
const puppeteer = require('puppeteer');
const cors = require('cors');

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

let browser = null;

async function initBrowser() {
    if (!browser) {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
    }
    return browser;
}

const categoryMap = {
    'ti-programacao': 'it-programming',
    'design-multimedia': 'design-multimedia',
    'traducao-conteudos': 'writing-translation',
    'marketing-vendas': 'sales-marketing',
    'suporte-administrativo': 'admin-support',
    'juridico': 'legal',
    'financas-administracao': 'finance-management',
    'engenharia-manufatura': 'engineering-manufacturing'
};

app.get('/api/scrape-jobs', async (req, res) => {
    try {
        const { categories = 'it-programming', countries = 'br' } = req.query;
        
        console.log(`Buscando vagas - Categorias: ${categories}, Países: ${countries}`);
        
        const browser = await initBrowser();
        const page = await browser.newPage();
        
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
        
        const categorySlug = categoryMap[categories.split(',')[0]] || 'it-programming';
        let url = `https://www.workana.com/jobs?language=pt&category=${categorySlug}`;
        
        if (countries && countries.length > 0 && countries !== 'undefined') {
            url += `&country=${countries.toLowerCase()}`;
        }
        
        console.log(`Acessando: ${url}`);
        
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000 
        });
        
        await page.waitForTimeout(2000);
        
        const jobs = await page.evaluate(() => {
            const jobElements = document.querySelectorAll('[class*="project-item"], .project, [data-testid*="project"]');
            const results = [];
            
            jobElements.forEach((element, index) => {
                if (index >= 20) return;
                
                try {
                    const titleEl = element.querySelector('h2, h3, [class*="title"], a[class*="project"]');
                    const title = titleEl ? titleEl.textContent.trim() : null;
                    
                    if (!title) return;
                    
                    const linkEl = element.querySelector('a[href*="/projects/"], a[href*="/jobs/"]');
                    const relativeUrl = linkEl ? linkEl.getAttribute('href') : null;
                    const url = relativeUrl ? `https://www.workana.com${relativeUrl}` : null;
                    
                    const budgetEl = element.querySelector('[class*="budget"], [class*="price"], [class*="amount"]');
                    let budget = 0;
                    if (budgetEl) {
                        const budgetText = budgetEl.textContent.replace(/[^\d]/g, '');
                        budget = parseInt(budgetText) || 0;
                    }
                    
                    const descEl = element.querySelector('p, [class*="description"]');
                    const description = descEl ? descEl.textContent.trim().substring(0, 200) : '';
                    
                    const skillEls = element.querySelectorAll('[class*="skill"], [class*="tag"], .badge');
                    const skills = Array.from(skillEls).map(el => el.textContent.trim()).filter(s => s.length > 0);
                    
                    const countryEl = element.querySelector('[class*="country"], [class*="location"], img[alt*="flag"]');
                    let country = 'Brasil';
                    if (countryEl) {
                        const countryText = countryEl.textContent || countryEl.getAttribute('alt') || '';
                        country = countryText.trim() || 'Brasil';
                    }
                    
                    if (url) {
                        results.push({
                            title,
                            description,
                            budget,
                            url,
                            skills: skills.slice(0, 5),
                            country,
                            timestamp: new Date().toISOString()
                        });
                    }
                } catch (err) {
                    console.error('Erro ao processar elemento:', err);
                }
            });
            
            return results;
        });
        
        await page.close();
        
        console.log(`✅ Encontradas ${jobs.length} vagas`);
        
        res.json({
            success: true,
            count: jobs.length,
            jobs: jobs
        });
        
    } catch (error) {
        console.error('❌ Erro ao fazer scraping:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            jobs: []
        });
    }
});

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Backend scraper rodando!' });
});

// Cleanup ao fechar
process.on('SIGINT', async () => {
    if (browser) {
        await browser.close();
    }
    process.exit();
});

app.listen(PORT, () => {
    console.log('='.repeat(60));
    console.log('🤖 Workana Scraper Backend - Iniciado!');
    console.log('='.repeat(60));
    console.log(`📍 Backend API: http://localhost:${PORT}`);
    console.log(`🔍 Endpoint: http://localhost:${PORT}/api/scrape-jobs`);
    console.log(`⏰ Hora: ${new Date().toLocaleString('pt-BR')}`);
    console.log('='.repeat(60));
    console.log('✅ Pronto para fazer scraping... Pressione Ctrl+C para parar');
    console.log('');
});

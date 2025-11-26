class WorkanaJobScraper {
    constructor() {
        this.jobs = new Map();
        this.isRunning = false;
        this.intervalId = null;
        this.newJobsCount = 0;
        this.config = {
            enableNotifications: true,
            checkInterval: 30,
            maxJobs: 50,
            categories: ['ti-programacao'],
            keywords: [],
            minBudget: 0,
            countries: ['BR']
        };
        
        this.init();
    }

    init() {
        this.loadConfig();
        this.setupEventListeners();
        this.log('Sistema iniciado', 'info');
        this.checkNotificationPermission();
    }

    loadConfig() {
        const saved = localStorage.getItem('workana_scraper_config');
        if (saved) {
            this.config = { ...this.config, ...JSON.parse(saved) };
            this.applyConfigToUI();
        }
    }

    saveConfig() {
        localStorage.setItem('workana_scraper_config', JSON.stringify(this.config));
        this.log('Configurações salvas', 'success');
    }

    applyConfigToUI() {
        document.getElementById('enableNotifications').checked = this.config.enableNotifications;
        document.getElementById('checkInterval').value = this.config.checkInterval;
        document.getElementById('intervalValue').textContent = `${this.config.checkInterval}s`;
        document.getElementById('maxJobs').value = this.config.maxJobs;
        document.getElementById('minBudget').value = this.config.minBudget || '';
        document.getElementById('keywordFilter').value = this.config.keywords.join(', ');
        
        // Set region filter
        const regionSelect = document.getElementById('regionFilter');
        if (regionSelect && this.config.countries && this.config.countries.length > 0) {
            regionSelect.value = this.config.countries[0];
        }
        
        document.querySelectorAll('.category-filter').forEach(cb => {
            cb.checked = this.config.categories.includes(cb.value);
        });
    }

    updateConfigFromUI() {
        this.config.enableNotifications = document.getElementById('enableNotifications').checked;
        this.config.checkInterval = parseInt(document.getElementById('checkInterval').value);
        document.getElementById('intervalValue').textContent = `${this.config.checkInterval}s`;
        
        this.config.maxJobs = parseInt(document.getElementById('maxJobs').value);
        this.config.minBudget = parseFloat(document.getElementById('minBudget').value) || 0;
        
        const keywordsInput = document.getElementById('keywordFilter').value;
        this.config.keywords = keywordsInput
            .split(',')
            .map(k => k.trim().toLowerCase())
            .filter(k => k.length > 0);
        
        this.config.categories = Array.from(document.querySelectorAll('.category-filter:checked'))
            .map(cb => cb.value);
            
        // Update countries from UI
        const regionSelect = document.getElementById('regionFilter');
        if (regionSelect) {
            const selectedRegion = regionSelect.value;
            this.config.countries = selectedRegion ? [selectedRegion] : [];
        }
        
        this.saveConfig();
    }

    setupEventListeners() {
        document.getElementById('startBtn').addEventListener('click', () => this.start());
        document.getElementById('stopBtn').addEventListener('click', () => this.stop());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearLogs());
        document.getElementById('requestPermissionBtn').addEventListener('click', () => this.requestNotificationPermission());
        
        // Range slider update
        document.getElementById('checkInterval').addEventListener('input', (e) => {
            document.getElementById('intervalValue').textContent = `${e.target.value}s`;
        });

        document.querySelectorAll('.category-filter, #keywordFilter, #minBudget, #enableNotifications, #checkInterval, #maxJobs, #regionFilter').forEach(el => {
            el.addEventListener('change', () => this.updateConfigFromUI());
        });
    }

    checkNotificationPermission() {
        if (!('Notification' in window)) {
            this.log('Este navegador não suporta notificações', 'error');
            return false;
        }
        
        if (Notification.permission === 'granted') {
            this.log('Permissão de notificação concedida', 'success');
            return true;
        } else if (Notification.permission === 'denied') {
            this.log('Permissão de notificação negada', 'error');
            return false;
        } else {
            this.log('Permissão de notificação pendente', 'warning');
            return false;
        }
    }

    async requestNotificationPermission() {
        if (!('Notification' in window)) {
            alert('Este navegador não suporta notificações');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                this.log('Permissão de notificação concedida!', 'success');
                this.showNotification('Notificações Ativadas', 'Você receberá alertas de novas vagas do Workana!', 'success');
            } else {
                this.log('Permissão de notificação negada', 'error');
            }
        } catch (error) {
            this.log('Erro ao solicitar permissão: ' + error.message, 'error');
        }
    }

    showNotification(title, message, type = 'info') {
        if (!this.config.enableNotifications) return;
        if (Notification.permission !== 'granted') return;

        const notification = new Notification(title, {
            body: message,
            tag: 'workana-scraper',
            requireInteraction: type === 'success'
        });

        notification.onclick = () => {
            window.focus();
            notification.close();
        };
    }

    async start() {
        if (this.isRunning) return;
        
        this.updateConfigFromUI();
        
        if (this.config.categories.length === 0) {
            alert('Selecione pelo menos uma categoria para monitorar!');
            return;
        }

        this.isRunning = true;
        document.body.classList.add('monitoring');
        this.newJobsCount = 0;
        this.updateUI();
        this.log('Monitoramento iniciado', 'success');
        
        await this.scrapeJobs();
        
        this.intervalId = setInterval(() => {
            this.scrapeJobs();
        }, this.config.checkInterval * 1000);
    }

    stop() {
        if (!this.isRunning) return;
        
        this.isRunning = false;
        document.body.classList.remove('monitoring');
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.updateUI();
        this.log('Monitoramento pausado', 'warning');
    }

    async scrapeJobs() {
        this.log('Verificando novas vagas...', 'info');
        
        try {
            const jobs = await this.fetchWorkanaJobs();
            
            const filteredJobs = this.filterJobs(jobs);
            const newJobs = this.processJobs(filteredJobs);
            
            if (newJobs.length > 0) {
                this.log(`${newJobs.length} nova(s) vaga(s) encontrada(s)!`, 'success');
                this.newJobsCount += newJobs.length;
                
                newJobs.forEach(job => {
                    this.showNotification(
                        'Nova Vaga no Workana!',
                        `${job.title}\n${job.country}\nOrçamento: $${job.budget}\nCategoria: ${job.category}`,
                        'success'
                    );
                });
            } else {
                this.log('Nenhuma vaga nova encontrada', 'info');
            }
            
            this.updateUI();
            
        } catch (error) {
            this.log('Erro ao buscar vagas: ' + error.message, 'error');
        }
    }

    async fetchWorkanaJobs() {
        try {
            const categories = this.config.categories.join(',');
            const countries = this.config.countries.join(',').toLowerCase();
            
            const response = await fetch(`http://localhost:4000/api/scrape-jobs?categories=${categories}&countries=${countries}`);
            
            if (!response.ok) {
                throw new Error('Erro ao buscar vagas do backend');
            }
            
            const data = await response.json();
            
            if (!data.success || !data.jobs) {
                throw new Error('Resposta inválida do backend');
            }
            
            return data.jobs.map(job => {
                const categoryMap = {
                    'it-programming': { id: 'ti-programacao', name: 'TI e Programação' },
                    'design-multimedia': { id: 'design-multimedia', name: 'Design e Multimídia' },
                    'writing-translation': { id: 'traducao-conteudos', name: 'Tradução e Conteúdos' },
                    'sales-marketing': { id: 'marketing-vendas', name: 'Marketing e Vendas' }
                };
                
                const category = categoryMap[this.config.categories[0]] || categoryMap['it-programming'];
                
                const countryMap = {
                    'brasil': { code: 'BR' },
                    'brazil': { code: 'BR' },
                    'argentina': { code: 'AR' },
                    'méxico': { code: 'MX' },
                    'mexico': { code: 'MX' },
                    'colombia': { code: 'CO' },
                    'chile': { code: 'CL' },
                    'españa': { code: 'ES' },
                    'spain': { code: 'ES' },
                    'portugal': { code: 'PT' }
                };
                
                const countryKey = job.country.toLowerCase();
                const countryData = countryMap[countryKey] || { code: 'BR' };
                
                const urlParts = job.url.split('/');
                const jobId = urlParts[urlParts.length - 1] || Math.random().toString(36).substr(2, 9);
                
                return {
                    id: `job_real_${jobId}`,
                    title: job.title,
                    description: job.description,
                    budget: job.budget || 0,
                    category: category.name,
                    categoryId: category.id,
                    country: job.country,
                    countryCode: countryData.code,
                    url: job.url,
                    timestamp: job.timestamp,
                    skills: job.skills || []
                };
            });
            
        } catch (error) {
            this.log(`Erro ao buscar vagas reais: ${error.message}. Usando dados de demonstração.`, 'warning');
            
            const mockJobs = this.generateMockJobs();
            await new Promise(resolve => setTimeout(resolve, 500));
            return mockJobs;
        }
    }

    generateMockJobs() {
        const categories = [
            { id: 'ti-programacao', name: 'TI e Programação' },
            { id: 'design-multimedia', name: 'Design e Multimídia' },
            { id: 'traducao-conteudos', name: 'Tradução e Conteúdos' },
            { id: 'marketing-vendas', name: 'Marketing e Vendas' }
        ];

        const countries = [
            { code: 'BR', name: 'Brasil' },
            { code: 'US', name: 'Estados Unidos' },
            { code: 'AR', name: 'Argentina' },
            { code: 'MX', name: 'México' },
            { code: 'CO', name: 'Colômbia' },
            { code: 'CL', name: 'Chile' },
            { code: 'ES', name: 'Espanha' },
            { code: 'PT', name: 'Portugal' }
        ];

        const titles = [
            'Desenvolvimento de Website em React',
            'Designer Gráfico para Logo',
            'Tradução PT-EN de Conteúdo Técnico',
            'Campanha de Marketing Digital',
            'Desenvolvimento de API REST',
            'Criação de Identidade Visual',
            'Redação de Artigos SEO',
            'Desenvolvimento Mobile Flutter',
            'Edição de Vídeos Promocionais',
            'Consultoria em Python'
        ];

        const numJobs = Math.floor(Math.random() * 5) + 1;
        const jobs = [];

        for (let i = 0; i < numJobs; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const country = countries[Math.floor(Math.random() * countries.length)];
            const jobId = Math.random().toString(36).substr(2, 9);
            
            const categorySlug = category.id;
            const searchUrl = `https://www.workana.com/jobs?category=${categorySlug}&language=pt`;
            
            const job = {
                id: `job_${Date.now()}_${jobId}`,
                title: titles[Math.floor(Math.random() * titles.length)],
                description: 'Descrição detalhada do projeto...',
                budget: Math.floor(Math.random() * 2000) + 100,
                category: category.name,
                categoryId: category.id,
                country: country.name,
                countryCode: country.code,
                url: searchUrl,
                timestamp: new Date().toISOString(),
                skills: ['JavaScript', 'React', 'Node.js', 'CSS'].slice(0, Math.floor(Math.random() * 3) + 1)
            };
            jobs.push(job);
        }

        return jobs;
    }

    filterJobs(jobs) {
        return jobs.filter(job => {
            if (!this.config.categories.includes(job.categoryId)) {
                return false;
            }

            if (this.config.countries.length > 0 && !this.config.countries.includes(job.countryCode)) {
                return false;
            }

            if (job.budget < this.config.minBudget) {
                return false;
            }

            if (this.config.keywords.length > 0) {
                const jobText = (job.title + ' ' + job.description + ' ' + job.skills.join(' ')).toLowerCase();
                const hasKeyword = this.config.keywords.some(keyword => jobText.includes(keyword));
                if (!hasKeyword) {
                    return false;
                }
            }

            return true;
        });
    }

    processJobs(jobs) {
        const newJobs = [];

        jobs.forEach(job => {
            if (!this.jobs.has(job.id)) {
                this.jobs.set(job.id, job);
                newJobs.push(job);
            }
        });

        if (this.jobs.size > this.config.maxJobs) {
            const jobsArray = Array.from(this.jobs.entries());
            const toRemove = jobsArray.slice(0, this.jobs.size - this.config.maxJobs);
            toRemove.forEach(([id]) => this.jobs.delete(id));
        }

        return newJobs;
    }

    updateUI() {
        document.getElementById('startBtn').disabled = this.isRunning;
        document.getElementById('stopBtn').disabled = !this.isRunning;

        document.getElementById('totalJobs').textContent = this.jobs.size;
        document.getElementById('newJobs').textContent = this.newJobsCount;
        document.getElementById('lastCheck').textContent = new Date().toLocaleTimeString('pt-BR');
        
        // Update Status Indicator
        const statusDot = document.getElementById('statusDot');
        const statusText = document.getElementById('statusText');
        const statusContainer = document.querySelector('.status-indicator');
        
        if (statusContainer) {
            if (this.isRunning) {
                statusContainer.classList.add('status-active');
                statusText.textContent = 'Monitorando';
            } else {
                statusContainer.classList.remove('status-active');
                statusText.textContent = 'Pausado';
            }
        }

        // Calculate Average Budget
        let totalBudget = 0;
        let count = 0;
        this.jobs.forEach(job => {
            if (job.budget > 0) {
                totalBudget += job.budget;
                count++;
            }
        });
        const avg = count > 0 ? Math.round(totalBudget / count) : 0;
        const avgEl = document.getElementById('avgBudget');
        if (avgEl) avgEl.textContent = `$${avg}`;

        this.updateJobsList();
    }

    updateJobsList() {
        const jobsList = document.getElementById('jobsList');
        
        if (this.jobs.size === 0) {
            jobsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">📡</div>
                    <p>Nenhuma vaga encontrada ainda.</p>
                </div>`;
            return;
        }

        const jobsArray = Array.from(this.jobs.values()).reverse();
        
        jobsList.innerHTML = jobsArray.map(job => `
            <div class="job-card">
                <div class="job-header">
                    <h3 class="job-title">${this.escapeHtml(job.title)}</h3>
                    <span class="job-budget">$${job.budget}</span>
                </div>
                <div class="job-meta">
                    <span class="job-category">${this.escapeHtml(job.category)}</span>
                    <span class="job-country">${this.escapeHtml(job.country)}</span>
                    <span class="job-time">${this.formatTime(job.timestamp)}</span>
                </div>
                <div class="job-skills">
                    ${job.skills.map(skill => `<span class="skill-tag">${this.escapeHtml(skill)}</span>`).join('')}
                </div>
                <a href="${job.url}" target="_blank" rel="noopener noreferrer" class="job-link">Ver vaga no Workana &rarr;</a>
            </div>
        `).join('');
    }

    log(message, type = 'info') {
        const logsList = document.getElementById('logsList');
        const timestamp = new Date().toLocaleTimeString('pt-BR');
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry log-${type}`;
        
        logEntry.innerHTML = `
            <span class="log-time">[${timestamp}]</span>
            <span class="log-message">${this.escapeHtml(message)}</span>
        `;
        
        logsList.insertBefore(logEntry, logsList.firstChild);
        
        while (logsList.children.length > 100) {
            logsList.removeChild(logsList.lastChild);
        }

        console.log(`[${timestamp}] [${type.toUpperCase()}] ${message}`);
    }

    clearLogs() {
        if (confirm('Limpar todos os logs e vagas?')) {
            document.getElementById('logsList').innerHTML = '';
            this.jobs.clear();
            this.newJobsCount = 0;
            this.updateUI();
            this.log('Logs e vagas limpos', 'info');
        }
    }

    // ==================== UTILIDADES ====================
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    formatTime(timestamp) {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return 'agora mesmo';
        if (diffMins < 60) return `${diffMins}m atrás`;
        
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h atrás`;
        
        return date.toLocaleDateString('pt-BR');
    }
}

// Inicializa o scraper quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.scraper = new WorkanaJobScraper();
});

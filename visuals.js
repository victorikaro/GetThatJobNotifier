document.addEventListener('DOMContentLoaded', () => {
    // Parallax Effect for Background Shapes
    const shapes = document.querySelectorAll('.bg-shape');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX / window.innerWidth;
        const y = e.clientY / window.innerHeight;
        
        shapes.forEach((shape, index) => {
            const speed = (index + 1) * 20;
            const xOffset = (window.innerWidth / 2 - e.clientX) / speed;
            const yOffset = (window.innerHeight / 2 - e.clientY) / speed;
            
            shape.style.transform = `translate(${xOffset}px, ${yOffset}px)`;
        });
    });

    // Ripple Effect on Buttons (Event Delegation)
    document.addEventListener('click', function(e) {
        const target = e.target.closest('.btn, .chip, .job-card');
        if (target) {
            const x = e.clientX - target.getBoundingClientRect().left;
            const y = e.clientY - target.getBoundingClientRect().top;
            
            const ripple = document.createElement('span');
            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;
            ripple.classList.add('ripple');
            
            target.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        }
    });

    // Context-aware Glow Effect for Stat Cards
    const statCards = document.querySelectorAll('.stat-card');
    
    statCards.forEach(card => {
        const iconContainer = card.querySelector('.stat-icon');
        const iconSvg = iconContainer ? iconContainer.querySelector('svg') : null;
        
        if (iconSvg) {
            const glowContainer = document.createElement('div');
            glowContainer.classList.add('stat-card-glow');
            
            const glowIcon = iconSvg.cloneNode(true);
            glowIcon.classList.add('glow-icon');
            
            // Apply specific colors based on parent class
            if (iconContainer.classList.contains('color-1')) glowIcon.style.color = 'var(--accent-1)';
            if (iconContainer.classList.contains('color-2')) glowIcon.style.color = 'var(--accent-2)';
            if (iconContainer.classList.contains('color-3')) glowIcon.style.color = 'var(--accent-3)';
            
            glowContainer.appendChild(glowIcon);
            card.appendChild(glowContainer);
            
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                glowIcon.style.transform = `translate(${x - 30}px, ${y - 30}px) scale(3)`;
            });
        }
    });
});

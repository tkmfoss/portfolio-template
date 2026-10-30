const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = (u) => (/^(https?:\/\/|mailto:)/i.test(u) ? u : '#');

// Initialize spotlight mouse tracker immediately
setupSpotlightTracker();

// Hook up Email Copy button immediately
const copyBtn = $('copy-email-btn');
const toast = $('copy-toast');
if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
        const emailToCopy = 'jobinmjohn4@gmail.com';
        try {
            await navigator.clipboard.writeText(emailToCopy);
            if (toast) {
                toast.classList.add('show');
                setTimeout(() => toast.classList.remove('show'), 2500);
            }
        } catch {
            window.location.href = `mailto:${emailToCopy}`;
        }
    });
}

// Fetch and hydrate from profile.json (if running on a server or GitHub Pages)
fetch('profile.json')
    .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
    })
    .then((p) => {
        if (!p) return;
        
        // Update document title and core headers
        if (p.name) {
            document.title = `${p.name} | Portfolio`;
            if ($('name')) $('name').textContent = p.name;
        }
        if (p.role && $('role')) $('role').textContent = p.role;
        if (p.tagline && $('tagline')) $('tagline').textContent = p.tagline;
        if (p.bio && $('bio')) $('bio').textContent = p.bio;
        if (p.status && $('status-text')) $('status-text').textContent = p.status;

        // Hydrate Stats
        if ($('stats-strip') && Array.isArray(p.stats) && p.stats.length > 0) {
            $('stats-strip').innerHTML = p.stats.map((s) => `
                <div class="stat-item">
                    <span class="stat-value">${esc(s.value)}</span>
                    <span class="stat-label">${esc(s.label)}</span>
                </div>
            `).join('');
        }

        // Hydrate Projects
        if ($('projects') && Array.isArray(p.projects) && p.projects.length > 0) {
            $('projects').innerHTML = p.projects.map((x) => {
                const tags = Array.isArray(x.tech)
                    ? x.tech.map((t) => `<span class="tech-tag">${esc(t)}</span>`).join('')
                    : '';
                const categoryBadge = x.category
                    ? `<span class="project-category">${esc(x.category)}</span>`
                    : '';
                return `
                    <div class="spotlight-card">
                        <div class="card-inner">
                            <div class="project-meta">
                                ${categoryBadge}
                            </div>
                            <h3 class="project-title">${esc(x.title)}</h3>
                            <p class="project-desc">${esc(x.desc)}</p>
                            ${tags ? `<div class="project-tags">${tags}</div>` : ''}
                            <a href="${safe(x.link)}" target="_blank" rel="noopener" class="project-link">
                                <span>Explore Project</span>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                    <line x1="7" y1="17" x2="17" y2="7"></line>
                                    <polyline points="7 7 17 7 17 17"></polyline>
                                </svg>
                            </a>
                        </div>
                    </div>
                `;
            }).join('');
        }

        // Hydrate Categorized Skills
        if ($('skills-container') && p.skillsCategorized && Object.keys(p.skillsCategorized).length > 0) {
            $('skills-container').innerHTML = Object.entries(p.skillsCategorized).map(([category, items]) => `
                <div class="skill-category-card">
                    <div class="skill-cat-title">${esc(category)}</div>
                    <ul class="chips">
                        ${(items || []).map((i) => `<li>${esc(i)}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        }

        // Hydrate Links
        if ($('links') && p.links && Object.keys(p.links).length > 0) {
            const linksEntries = Object.entries(p.links);
            $('links').innerHTML = linksEntries.map(([k, v]) => {
                const label = k.charAt(0).toUpperCase() + k.slice(1);
                return `
                    <a href="${safe(v)}" target="_blank" rel="noopener" class="btn btn-secondary">
                        <span>${esc(label)}</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                            <line x1="7" y1="17" x2="17" y2="7"></line>
                            <polyline points="7 7 17 7 17 17"></polyline>
                        </svg>
                    </a>
                `;
            }).join('');
        }
    })
    .catch((err) => {
        // If opened locally via file://, pre-rendered semantic HTML remains fully visible
        console.log('Static pre-rendered HTML active. Profile hydration skipped (likely local file:// protocol):', err.message);
    });

// Smooth 60fps Spotlight Border Hover Tracker
function setupSpotlightTracker() {
    window.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.spotlight-card');
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const rect = card.getBoundingClientRect();
            if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        }
    }, { passive: true });
}

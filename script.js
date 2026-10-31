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

        // Hydrate Projects (with architecture previews, live indicators, problem/arch highlights, and multi-CTAs)
        if ($('projects') && Array.isArray(p.projects) && p.projects.length > 0) {
            $('projects').innerHTML = p.projects.map((x) => {
                const tags = Array.isArray(x.tech)
                    ? x.tech.map((t) => `<span class="tech-tag">${esc(t)}</span>`).join('')
                    : '';
                const liveDot = x.isLive
                    ? '<span class="tag-live-dot" aria-hidden="true"></span>'
                    : '';
                const categoryBadge = x.category
                    ? `<span class="project-category">${liveDot}<span>${esc(x.category)}</span></span>`
                    : '';
                const tagline = x.tagline
                    ? `<p class="project-tagline">${esc(x.tagline)}</p>`
                    : '';
                
                const highlights = (x.problem || x.architecture) ? `
                    <div class="project-highlight-box">
                        ${x.problem ? `
                            <div class="highlight-item">
                                <span class="highlight-label">Problem</span>
                                <span class="highlight-text">${esc(x.problem)}</span>
                            </div>
                        ` : ''}
                        ${x.architecture ? `
                            <div class="highlight-item">
                                <span class="highlight-label">Architecture</span>
                                <span class="highlight-text">${esc(x.architecture)}</span>
                            </div>
                        ` : ''}
                    </div>
                ` : '';

                const actionLinks = [];
                if (x.liveLink) {
                    actionLinks.push(`
                        <a href="${safe(x.liveLink)}" target="_blank" rel="noopener" class="ghost-btn-link">
                            <span>Live Deployment</span>
                            <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </a>
                    `);
                }
                if (x.link) {
                    actionLinks.push(`
                        <a href="${safe(x.link)}" target="_blank" rel="noopener" class="ghost-btn-link">
                            <span>GitHub Repository</span>
                            <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <line x1="7" y1="17" x2="17" y2="7"></line>
                                <polyline points="7 7 17 7 17 17"></polyline>
                            </svg>
                        </a>
                    `);
                }
                if (x.demoLink) {
                    actionLinks.push(`
                        <a href="${safe(x.demoLink)}" target="_blank" rel="noopener" class="ghost-btn-link">
                            <span>Video Demo</span>
                            <svg class="link-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                                <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                        </a>
                    `);
                }

                return `
                    <div class="spotlight-card">
                        <div class="card-inner">
                            <div class="project-preview">
                                <svg class="preview-graphic-svg" viewBox="0 0 400 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="400" height="130" fill="#0d0e17"/>
                                    <path d="M0 65 Q 100 20, 200 65 T 400 65" stroke="rgba(99,102,241,0.25)" stroke-width="2" fill="none"/>
                                    <circle cx="80" cy="52" r="4" fill="#818cf8"/>
                                    <circle cx="200" cy="65" r="5" fill="#10b981"/>
                                    <circle cx="320" cy="68" r="4" fill="#6366f1"/>
                                    <rect x="270" y="16" width="116" height="22" rx="4" fill="rgba(99,102,241,0.15)" stroke="rgba(99,102,241,0.3)"/>
                                    <text x="328" y="31" fill="#818cf8" font-family="JetBrains Mono" font-size="10" text-anchor="middle">SYSTEM CORE</text>
                                </svg>
                            </div>
                            <div class="project-meta">
                                ${categoryBadge}
                            </div>
                            <h3 class="project-title">${esc(x.title)}</h3>
                            ${tagline}
                            ${highlights}
                            <p class="project-desc">${esc(x.desc)}</p>
                            ${tags ? `<div class="project-tags">${tags}</div>` : ''}
                            <div class="project-links-row">
                                ${actionLinks.join('')}
                            </div>
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

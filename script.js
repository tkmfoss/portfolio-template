const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = (u) => (/^(https?:\/\/|mailto:)/i.test(u) ? u : '#');

fetch('profile.json')
    .then((r) => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
    })
    .then((p) => {
        // Dynamic title & base fields
        document.title = `${p.name} | Portfolio`;
        $('name').textContent = p.name || 'Jobin M John';
        if ($('role')) $('role').textContent = p.role || '';
        $('tagline').textContent = p.tagline || '';
        $('bio').textContent = p.bio || '';

        // Status text
        if (p.status && $('status-text')) {
            $('status-text').textContent = p.status;
        }

        // Stats Strip
        if ($('stats-strip') && Array.isArray(p.stats)) {
            $('stats-strip').innerHTML = p.stats.map((s) => `
                <div class="stat-item">
                    <span class="stat-value">${esc(s.value)}</span>
                    <span class="stat-label">${esc(s.label)}</span>
                </div>
            `).join('');
        }

        // Projects Section (Spotlight Cards)
        if ($('projects')) {
            $('projects').innerHTML = (p.projects || []).map((x) => {
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
                                <span>View Repository</span>
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

        // Categorized Skills
        if ($('skills-container') && p.skillsCategorized) {
            $('skills-container').innerHTML = Object.entries(p.skillsCategorized).map(([category, items]) => `
                <div class="skill-category-card">
                    <div class="skill-cat-title">${esc(category)}</div>
                    <ul class="chips">
                        ${(items || []).map((i) => `<li>${esc(i)}</li>`).join('')}
                    </ul>
                </div>
            `).join('');
        } else if ($('skills')) {
            $('skills').style.display = 'flex';
            $('skills').innerHTML = (p.skills || []).map((s) => `<li>${esc(s)}</li>`).join('');
        }

        // Contact & Social Links
        if ($('links')) {
            const rawEmail = p.email || 'jobinmjbzkj97@gmail.com';
            const linksEntries = Object.entries(p.links || {});
            $('links').innerHTML = linksEntries.map(([k, v]) => `
                <a href="${safe(v)}" target="_blank" rel="noopener" class="btn btn-secondary">
                    <span>${esc(k.charAt(0).toUpperCase() + k.slice(1))}</span>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                        <line x1="7" y1="17" x2="17" y2="7"></line>
                        <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                </a>
            `).join('');

            // Hook up Email Copy button
            const copyBtn = $('copy-email-btn');
            const toast = $('copy-toast');
            if (copyBtn) {
                copyBtn.addEventListener('click', async () => {
                    try {
                        await navigator.clipboard.writeText(rawEmail);
                        if (toast) {
                            toast.classList.add('show');
                            setTimeout(() => toast.classList.remove('show'), 2500);
                        }
                    } catch {
                        window.location.href = `mailto:${rawEmail}`;
                    }
                });
            }
        }

        // Footer
        if ($('footer')) {
            $('footer').innerHTML = `
                <div>&copy; ${new Date().getFullYear()} ${esc(p.name)}. Built for FOSSSoC-S1 Portfolio Week.</div>
                <div style="margin-top: 6px; font-size: 0.75rem; color: var(--subtle);">Deployed statically via GitHub Pages</div>
            `;
        }

        // Initialize Spotlight card mouse tracker
        setupSpotlightTracker();
    })
    .catch((err) => {
        console.error('Error loading profile data:', err);
    });

// Smooth 60fps Spotlight Border Hover Tracker
function setupSpotlightTracker() {
    window.addEventListener('mousemove', (e) => {
        const cards = document.querySelectorAll('.spotlight-card');
        for (let i = 0; i < cards.length; i++) {
            const card = cards[i];
            const rect = card.getBoundingClientRect();
            // Only calculate if visible in viewport
            if (rect.bottom >= 0 && rect.top <= window.innerHeight) {
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            }
        }
    }, { passive: true });
}

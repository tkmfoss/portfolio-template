const $ = (id) => document.getElementById(id);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const safe = (u) => (/^(https?:\/\/|mailto:)/i.test(u) ? u : '#');

// Initialize spotlight & 3D tilt tracking immediately
setupSpotlightTracker();
setupModalController();
setupClickRipple();
setupScrollTransitions();

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

        // Hydrate Projects (with architecture previews, cover screenshots, video overlays, and Dynamic Island expansion)
        if ($('projects') && Array.isArray(p.projects) && p.projects.length > 0) {
            $('projects').innerHTML = p.projects.map((x, idx) => {
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
                    <div class="expand-prompt">
                        <span>Hover to reveal architecture & problem</span>
                        <svg class="expand-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="6 9 12 15 18 9"></polyline></svg>
                    </div>
                    <div class="project-deepdive">
                        <div class="project-deepdive-inner">
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
                        </div>
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

                // Video overlay badge if demo exists
                const videoOverlay = x.demoLink ? `
                    <a href="${safe(x.demoLink)}" target="_blank" rel="noopener" class="preview-video-overlay" title="Watch Video Demo">
                        <span class="preview-play-badge">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                            <span>Watch Video Demo</span>
                        </span>
                    </a>
                ` : (x.link ? `
                    <a href="${safe(x.link)}" target="_blank" rel="noopener" class="preview-video-overlay" title="View Repository">
                        <span class="preview-play-badge">
                            <span>Explore Repository</span>
                        </span>
                    </a>
                ` : '');

                return `
                    <div class="spotlight-card ${idx === 0 ? 'featured-card' : ''}" tabindex="0" role="button" aria-haspopup="dialog" title="Click to view centered case study">
                        <div class="card-inner">
                            <div class="project-preview">
                                ${x.image ? `<img class="preview-img" src="${esc(x.image)}" alt="${esc(x.title)} Cover" loading="lazy" onerror="this.style.display='none'">` : ''}
                                <svg class="preview-graphic-svg" viewBox="0 0 400 130" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <rect width="400" height="130" fill="#0d0e17"/>
                                    <path d="M0 65 Q 100 20, 200 65 T 400 65" stroke="rgba(52,211,153,0.25)" stroke-width="2" fill="none"/>
                                    <circle cx="80" cy="52" r="4" fill="#34d399"/>
                                    <circle cx="200" cy="65" r="5" fill="#10b981"/>
                                    <circle cx="320" cy="68" r="4" fill="#6366f1"/>
                                    <rect x="270" y="16" width="116" height="22" rx="4" fill="rgba(16,185,129,0.15)" stroke="rgba(52,211,153,0.3)"/>
                                    <text x="328" y="31" fill="#34d399" font-family="JetBrains Mono" font-size="10" text-anchor="middle">SYSTEM CORE</text>
                                </svg>
                                ${videoOverlay}
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

            // Re-bind 3D tilt tracking and modal clicks for hydrated cards
            setupSpotlightTracker();
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

            setupSpotlightTracker();
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

// Smooth 60fps 3D Interactive Card Tilt & Dynamic Island Pop-Up Physics across ALL cards
function setupSpotlightTracker() {
    const cards = document.querySelectorAll(
        '.spotlight-card, .about-card, .skill-category-card, .contact-card, .stats-strip'
    );
    
    cards.forEach((card) => {
        if (card.dataset.tiltInitialized) return;
        card.dataset.tiltInitialized = 'true';

        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--mouse-x', `${x}px`);
            card.style.setProperty('--mouse-y', `${y}px`);

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transition = 'transform 0.08s ease-out, box-shadow 0.25s ease';
            card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-6px) scale3d(1.02, 1.02, 1.02)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'transform 0.4s var(--spring-return), box-shadow 0.4s var(--spring-return)';
            card.style.transform = '';
            card.style.setProperty('--mouse-x', '-200px');
            card.style.setProperty('--mouse-y', '-200px');
            setTimeout(() => {
                if (card.style.transition.includes('0.4s')) {
                    card.style.transition = '';
                }
            }, 400);
        });

        // Click on project card pops up modal in the center of the screen
        if (card.classList.contains('spotlight-card')) {
            card.addEventListener('click', (e) => {
                // If user clicked directly on an outbound action link, do not hijack
                if (e.target.closest('a, button')) return;
                openProjectModal(card);
            });
            card.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    if (e.target.closest('a, button')) return;
                    e.preventDefault();
                    openProjectModal(card);
                }
            });
        }
    });
}

// Phosphor Tactile Click Shockwave Physics
function setupClickRipple() {
    window.addEventListener('pointerdown', (e) => {
        // Create phosphor laser ripple at touch / click coordinate
        const ripple = document.createElement('div');
        ripple.className = 'click-ripple';
        ripple.style.left = `${e.clientX}px`;
        ripple.style.top = `${e.clientY}px`;
        document.body.appendChild(ripple);
        setTimeout(() => ripple.remove(), 550);
    });
}

// Centered Case Study Modal Controller
function setupModalController() {
    const modal = $('project-modal');
    const modalCloseBtn = $('modal-close-btn');

    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', closeModal);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

function openProjectModal(card) {
    const modal = $('project-modal');
    const modalBody = $('modal-body');
    if (!modal || !modalBody) return;

    const cardInner = card.querySelector('.card-inner');
    if (!cardInner) return;

    // Clone card inner structure for the centered modal
    const clone = cardInner.cloneNode(true);

    // Expand the deepdive box in the modal unconditionally
    const deepdive = clone.querySelector('.project-deepdive');
    if (deepdive) {
        deepdive.style.gridTemplateRows = '1fr';
        deepdive.style.opacity = '1';
        deepdive.style.marginBottom = '20px';
    }
    const expandPrompt = clone.querySelector('.expand-prompt');
    if (expandPrompt) expandPrompt.style.display = 'none';

    modalBody.innerHTML = '';
    modalBody.appendChild(clone);

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
}

function closeModal() {
    const modal = $('project-modal');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
}

// Full-Page Section Snap & Bidirectional Weighted Push-Up Scroll Transitions
function setupScrollTransitions() {
    document.documentElement.classList.add('js-scroll-transitions');

    const sections = document.querySelectorAll('.scroll-section');
    const dockLinks = document.querySelectorAll('.dock-link');
    const hero = document.getElementById('hero');

    if (!('IntersectionObserver' in window)) {
        sections.forEach((s) => s.classList.add('is-visible'));
        return;
    }

    // Symmetric focal zone so push-up triggers identically when scrolling DOWN and UP
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const rect = entry.boundingClientRect;
            const target = entry.target;
            const targetId = target.id;

            if (entry.isIntersecting) {
                target.classList.add('is-visible');

                if (targetId) {
                    dockLinks.forEach((link) => {
                        const href = link.getAttribute('href');
                        if (href === `#${targetId}` && targetId !== 'hero') {
                            link.classList.add('active');
                        } else {
                            link.classList.remove('active');
                        }
                    });
                }
            } else {
                // Reset when section scrolls out of the active focal region in either direction
                // (Scrolled down past section OR scrolled up above section)
                if (rect.top > window.innerHeight * 0.9 || rect.bottom < window.innerHeight * 0.05) {
                    target.classList.remove('is-visible');
                }
            }
        });
    }, {
        threshold: [0.15, 0.3],
        rootMargin: '-8% 0px -8% 0px'
    });

    sections.forEach((sec) => observer.observe(sec));

    // Ensure hero triggers weighted push-up on load and when scrolled to the very top
    if (hero) {
        hero.classList.add('is-visible');
    }

    window.addEventListener('scroll', () => {
        if (window.scrollY < 60 && hero && !hero.classList.contains('is-visible')) {
            hero.classList.add('is-visible');
            dockLinks.forEach((l) => l.classList.remove('active'));
        }
    }, { passive: true });
}

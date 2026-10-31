
async function loadPortfolio() {
  try {
    const response = await fetch('./profile.json');

    if (!response.ok) {
      throw new Error('Could not load profile.json');
    }

    const profile = await response.json();

    // Hero content
    document.title = `${profile.name} | Portfolio`;

    document.getElementById('name').textContent = profile.name;
    document.getElementById('tagline').textContent = profile.tagline;
    document.getElementById('hero-description').textContent =
      profile.description;

    // About section
    document.getElementById('bio').textContent = profile.bio;

    // Social links
    const linksContainer = document.getElementById('links');
    const contactContainer = document.getElementById('contact-links');

    linksContainer.replaceChildren();
    contactContainer.replaceChildren();

    Object.entries(profile.links || {}).forEach(([platform, url]) => {
      if (!url) return;

      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      const label =
        platform.charAt(0).toUpperCase() + platform.slice(1);

      link.textContent = `${label} ↗`;
      linksContainer.appendChild(link);

      if (platform.toLowerCase() === 'email') {
        link.href = `mailto:${url}`;
        link.target = '_self';
        link.rel = '';
        link.textContent = 'Send me an email ↗';
      } else {
        const contactLink = link.cloneNode(true);
        contactContainer.appendChild(contactLink);
      }
    });

    // Skills
    const skillsContainer = document.getElementById('skills-list');
    skillsContainer.replaceChildren();

    (profile.skills || []).forEach((skill) => {
      const tag = document.createElement('span');
      tag.className = 'skill-tag';
      tag.textContent = skill;
      skillsContainer.appendChild(tag);
    });

    // Projects
    const projectsContainer = document.getElementById('project-grid');
    projectsContainer.replaceChildren();

    (profile.projects || []).forEach((project, index) => {
      const card = document.createElement('article');
      card.className = 'project-card';

      const number = document.createElement('div');
      number.className = 'project-number';
      number.textContent = `PROJECT / ${String(index + 1).padStart(2, '0')}`;

      const title = document.createElement('h3');
      title.textContent = project.name;

      const description = document.createElement('p');
      description.textContent = project.description;

      const technologies = document.createElement('div');
      technologies.className = 'project-tech';

      (project.technologies || []).forEach((technology) => {
        const tag = document.createElement('span');
        tag.textContent = technology;
        technologies.appendChild(tag);
      });

      card.append(number, title, description, technologies);

      if (project.link) {
        const projectLink = document.createElement('a');
        projectLink.className = 'project-link';
        projectLink.href = project.link;
        projectLink.target = '_blank';
        projectLink.rel = 'noopener noreferrer';
        projectLink.textContent = 'View project on GitHub ↗';

        card.appendChild(projectLink);
      }

      projectsContainer.appendChild(card);
    });

    // Footer
    document.getElementById('footer').firstElementChild.textContent =
      `© ${new Date().getFullYear()} ${profile.name}`;
  } catch (error) {
    console.error('Portfolio loading error:', error);

    document.getElementById('hero-description').textContent =
      'Unable to load portfolio information. Please check profile.json.';
  }
}

loadPortfolio();

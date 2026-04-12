export async function initData() {
    try {
        const res = await fetch('/api/content');
        if (!res.ok) throw new Error('Failed to load content');
        const data = await res.json();

        // Site Branding
        const logos = document.querySelectorAll('.logo-text');
        logos.forEach(l => {
            const span = l.querySelector('span');
            l.textContent = data.site.name.split(' ')[0] + ' ';
            l.appendChild(span);
        });

        // Hero
        document.getElementById('dyn-hero-badge').innerText = data.hero.badge;
        document.getElementById('dyn-hero-title').innerHTML = data.hero.title;
        document.getElementById('dyn-hero-desc').innerText = data.hero.description;
        document.getElementById('dyn-hero-cta1').innerText = data.hero.cta_primary;
        document.getElementById('dyn-hero-cta2').innerText = data.hero.cta_secondary;
        document.getElementById('dyn-hero-trust1-n').innerText = data.hero.trust_num_1;
        document.getElementById('dyn-hero-trust1-t').innerText = data.hero.trust_text_1;
        document.getElementById('dyn-hero-trust2-n').innerText = data.hero.trust_num_2;
        document.getElementById('dyn-hero-trust2-t').innerText = data.hero.trust_text_2;
        document.getElementById('dyn-hero-roi').innerText = data.hero.floating_roi;
        document.getElementById('dyn-hero-leads').innerText = data.hero.floating_leads;

        // Stats
        data.statistics.forEach((s, idx) => {
            const i = idx + 1;
            const valEl = document.getElementById(`dyn-stat${i}-val`);
            const sufEl = document.getElementById(`dyn-stat${i}-suf`);
            const labEl = document.getElementById(`dyn-stat${i}-lab`);
            if (valEl) valEl.setAttribute('data-target', s.target);
            if (sufEl) sufEl.innerText = s.suffix;
            if (labEl) labEl.innerText = s.label;
        });

    } catch (err) {
        console.error('Data init failed:', err);
    }
}

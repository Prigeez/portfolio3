const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });
}

document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (!href.startsWith('#')) return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

(function heroRoles() {
    const roleEl = document.getElementById('heroRole');
    const roles = ['Web Developer', 'Designer', 'Creative Thinker', 'Frontend Engineer', 'Problem Solver'];
    let idx = 0;
    roleEl.textContent = roles[0];
    setInterval(() => {
        idx = (idx + 1) % roles.length;
        roleEl.classList.remove('role-fade');
        void roleEl.offsetWidth;
        roleEl.textContent = roles[idx];
        roleEl.classList.add('role-fade');
    }, 2600);
    roleEl.classList.add('role-fade');
})();

const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -100px 0px' };
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.skill-card, .project-card, .testimonial-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

const themeToggle = document.getElementById('themeToggle');
const themeIcon = document.getElementById('themeIcon');
const root = document.documentElement;
const storageKey = 'portfolio-theme';

function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (theme === 'dark') {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
        themeIcon.style.transform = 'rotate(20deg)';
        themeIcon.style.color = 'var(--accent-3)';
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        themeIcon.style.transform = 'rotate(0deg)';
        themeIcon.style.color = 'var(--text)';
    }
}

(function initTheme() {
    const stored = localStorage.getItem(storageKey);
    if (stored === 'dark' || stored === 'light') {
        applyTheme(stored);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        applyTheme('dark');
    } else {
        applyTheme('light');
    }
})();

if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
        const next = current === 'dark' ? 'light' : 'dark';
        applyTheme(next);
        localStorage.setItem(storageKey, next);
    });
}

try {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        const stored = localStorage.getItem(storageKey);
        if (!stored) applyTheme(e.matches ? 'dark' : 'light');
    });
} catch (err) { }

(function typingHeroTitleLoop() {
    const typingEl = document.getElementById('typingText');
    if (!typingEl) return;

    const fullText = 'Welcome To My Portfolio';
    const typingSpeed = 45;
    const deletingSpeed = 30;
    const pauseAfterTyping = 1200;
    const pauseAfterDeleting = 400;
    let isStopped = false;

    const prefersReduced = (() => {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) {
            return false;
        }
    })();

    const sleep = ms => new Promise(res => setTimeout(res, ms));

    if (prefersReduced) {
        typingEl.textContent = fullText;
        typingEl.classList.remove('caret-blink');
        typingEl.setAttribute('aria-label', fullText);
        return;
    }

    typingEl.classList.add('caret-blink');

    async function typeText(text) {
        for (let i = 1; i <= text.length; i++) {
            if (isStopped) return;
            typingEl.textContent = text.slice(0, i);
            await sleep(typingSpeed + Math.round(Math.random() * 30));
        }
    }

    async function deleteText(text) {
        for (let i = text.length; i >= 0; i--) {
            if (isStopped) return;
            typingEl.textContent = text.slice(0, i);
            await sleep(deletingSpeed + Math.round(Math.random() * 20));
        }
    }

    (async function loop() {
        await sleep(250);
        while (!isStopped) {
            await typeText(fullText);
            typingEl.setAttribute('aria-label', fullText);
            await sleep(pauseAfterTyping);
            await deleteText(fullText);
            typingEl.removeAttribute('aria-label');
            await sleep(pauseAfterDeleting);
        }
    })();

    const observer = new MutationObserver(() => {
        if (!document.body.contains(typingEl)) {
            isStopped = true;
            observer.disconnect();
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

    typingEl._typingControl = {
        stop: () => { isStopped = true; typingEl.classList.remove('caret-blink'); },
        start: () => {
            if (!isStopped) return;
            isStopped = false;
            typingEl.classList.add('caret-blink');
            (async function restart() {
                await sleep(50);
                typingEl._typingControl.startPromise = (async () => {
                    await typeText(fullText);
                    await sleep(pauseAfterTyping);
                    await deleteText(fullText);
                })();
            })();
        }
    };
})();

(function emailModalController() {
    const mailtoButtons = document.querySelectorAll('.mailto-btn');
    const backdrop = document.getElementById('emailModalBackdrop');
    const form = document.getElementById('emailComposeForm');
    const nameInput = document.getElementById('composerName');
    const emailInput = document.getElementById('composerEmail');
    const subjectInput = document.getElementById('composerSubject');
    const messageInput = document.getElementById('composerMessage');
    const closeBtn = document.getElementById('closeEmailModal');
    const nameError = document.getElementById('nameError');
    const emailError = document.getElementById('emailError');
    let lastFocused = null;
    let recipient = '';

    function openModal(toEmail, triggerEl) {
        recipient = toEmail || 'your.email@example.com';
        lastFocused = triggerEl || document.activeElement;
        subjectInput.value = 'Project inquiry / Collaboration';
        const storedName = localStorage.getItem('composerName') || '';
        const storedEmail = localStorage.getItem('composerEmail') || '';
        if (storedName) nameInput.value = storedName;
        if (storedEmail) emailInput.value = storedEmail;
        if (!nameInput.value) nameInput.placeholder = 'Prince';
        if (!emailInput.value) emailInput.placeholder = 'you@example.com';
        messageInput.value = messageInput.value || `Hi ${document.querySelector('.about-text h2')?.textContent || 'there'} — I'd love to work with you on...`;

        backdrop.classList.add('show');
        backdrop.setAttribute('aria-hidden', 'false');

        setTimeout(() => {
            nameInput.focus();
        }, 120);
        document.addEventListener('focus', trapFocus, true);
    }

    function closeModal() {
        backdrop.classList.remove('show');
        backdrop.setAttribute('aria-hidden', 'true');
        nameError.hidden = true;
        emailError.hidden = true;
        document.removeEventListener('focus', trapFocus, true);
        if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    }

    function trapFocus(e) {
        if (!backdrop.classList.contains('show')) return;
        if (!backdrop.contains(e.target)) {
            e.stopPropagation();
            nameInput.focus();
        }
    }

    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    mailtoButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const to = (this.dataset && this.dataset.email) ? this.dataset.email.trim() : 'your.email@example.com';
            openModal(to, this);
        });
    });

    closeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        closeModal();
    });

    backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && backdrop.classList.contains('show')) {
            closeModal();
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameVal = nameInput.value.trim();
        const emailVal = emailInput.value.trim();
        const subjectVal = subjectInput.value.trim() || 'Project inquiry from MyPortfolio';
        const messageVal = messageInput.value.trim();

        let valid = true;
        if (!nameVal) {
            nameError.textContent = 'Please enter your name.';
            nameError.hidden = false;
            valid = false;
        } else {
            nameError.hidden = true;
        }

        if (!emailVal || !validateEmail(emailVal)) {
            emailError.textContent = 'Please enter a valid email address.';
            emailError.hidden = false;
            valid = false;
        } else {
            emailError.hidden = true;
        }

        if (!valid) {
            return;
        }

        try {
            localStorage.setItem('composerName', nameVal);
            localStorage.setItem('composerEmail', emailVal);
        } catch (err) { }

        const bodyLines = [
            `Hi ${document.querySelector('.about-text h2')?.textContent || ''},`,
            '',
            messageVal || '',
            '',
            '---',
            `From: ${nameVal}`,
            `Contact: ${emailVal}`,
            `Page: ${location.href}`
        ];

        const mailto = `mailto:${encodeURIComponent(recipient)}?subject=${encodeURIComponent(subjectVal)}&body=${encodeURIComponent(bodyLines.join('\n'))}`;

        try {
            window.location.href = mailto;
        } catch (err) {
            window.open(mailto, '_blank');
        }

        closeModal();
    });
})();

(function profileTilt() {
    const container = document.querySelector('.profile-img');
    const inner = document.getElementById('profileInner');
    const shine = container?.querySelector('.profile-shine');
    if (!container || !inner) return;

    const prefersReduced = (() => {
        try {
            return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch (e) {
            return false;
        }
    })();

    if (prefersReduced) {
      
        return;
    }

    let frame = null;
    const maxRotX = 16; 
    const maxRotY = 22; 
    const maxTranslateZ = 30; 
    function onMove(e) {
        const rect = container.getBoundingClientRect();
        const clientX = e.clientX ?? (e.touches && e.touches[0].clientX);
        const clientY = e.clientY ?? (e.touches && e.touches[0].clientY);
        if (typeof clientX !== 'number' || typeof clientY !== 'number') return;

        const x = clientX - rect.left;
        const y = clientY - rect.top;
        const halfW = rect.width / 2;
        const halfH = rect.height / 2;
        const normX = (x - halfW) / halfW; 
        const normY = (y - halfH) / halfH; 

        const rotY = clamp(normX * maxRotY, -maxRotY, maxRotY);
        const rotX = clamp(-normY * maxRotX, -maxRotX, maxRotX);
        const depth = (1 - Math.max(Math.abs(normX), Math.abs(normY))) * maxTranslateZ;

        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;

       
        if (frame) cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
            inner.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(${depth}px) scale(1.03)`;
            container.classList.add('is-tilting');
            if (shine) {
                
                shine.style.background = `radial-gradient(circle at ${percentX}% ${percentY}%, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.08) 10%, rgba(255,255,255,0.02) 25%, transparent 45%)`;
            }
        });
    }

    function onEnter() {
        
        inner.style.transition = 'transform 220ms cubic-bezier(.2,.9,.2,1), box-shadow 220ms';
        container.addEventListener('mousemove', onMove, { passive: true });
        container.addEventListener('touchmove', onMove, { passive: true });
    }

    function onLeave() {
        if (frame) cancelAnimationFrame(frame);
        
        inner.style.transition = 'transform 450ms cubic-bezier(.2,.9,.2,1), box-shadow 450ms';
        inner.style.transform = '';
        container.classList.remove('is-tilting');
        if (shine) {
            shine.style.background = '';
        }
        container.removeEventListener('mousemove', onMove);
        container.removeEventListener('touchmove', onMove);
    }

    
    function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

    container.addEventListener('mouseenter', onEnter);
    container.addEventListener('mouseleave', onLeave);
    container.addEventListener('touchstart', onEnter, { passive: true });
    container.addEventListener('touchend', onLeave, { passive: true });
})();
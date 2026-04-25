const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Connect Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    // ─── GSAP SETUP ──────────────────────────────────
    gsap.registerPlugin(ScrollTrigger, TextPlugin);

    // ─── CUSTOM CURSOR ───────────────────────────────
    const cursor = document.getElementById('cursor');
    const follower = document.getElementById('cursor-follower');
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      gsap.to(cursor, { x: mouseX - 6, y: mouseY - 6, duration: 0.1 });
    });

    function animateFollower() {
      followerX += (mouseX - followerX - 18) * 0.12;
      followerY += (mouseY - followerY - 18) * 0.12;
      follower.style.transform = `translate(${followerX}px, ${followerY}px)`;
      requestAnimationFrame(animateFollower);
    }
    animateFollower();

    // Cursor hover effect
    document.querySelectorAll('a, button, .skill-card, .project-card').forEach(el => {
      el.addEventListener('mouseenter', () => gsap.to(cursor, { scale: 3, duration: 0.3 }));
      el.addEventListener('mouseleave', () => gsap.to(cursor, { scale: 1, duration: 0.3 }));
    });

    // ─── HERO GRID / FALLING NODES ───────────────────
    const heroGrid = document.getElementById('hero-grid');
    const heroLabels = ['HTML', 'CSS', 'JavaScript', 'Three.js', 'React.js', 'GSAP', 'Lenis'];
    const totalNodes = 26;

    for (let i = 0; i < totalNodes; i++) {
      const cell = document.createElement('div');
      const isText = Math.random() > 0.55;
      cell.className = `hero-grid-cell ${isText ? 'text' : 'box'}`;

      if (isText) {
        cell.textContent = heroLabels[Math.floor(Math.random() * heroLabels.length)];
      }

      const left = Math.random() * 100;
      const duration = 8 + Math.random() * 8;
      const delay = -Math.random() * duration;

      cell.style.left = `${left}%`;
      cell.style.animationDelay = `${delay}s`;
      cell.style.animationDuration = `${duration}s`;
      heroGrid.appendChild(cell);
    }

    // ─── HERO ENTRANCE ───────────────────────────────
    console.log('Script loaded, starting hero animation');
    const heroTL = gsap.timeline({ delay: 0.2 });

    heroTL
      .to('.hero-title .line-inner', {
        y: '0%',
        duration: 1.2,
        stagger: 0.12,
        ease: 'power4.out'
      })
      .to('.hero-label', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.6')
      .to('.hero-desc', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.4')
      .to('.hero-cta', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' }, '-=0.3')
      .to('.hero-scroll-hint', { opacity: 1, duration: 0.8 }, '-=0.2')
      .from('.hero-grid-cell', {
        opacity: 0, stagger: { each: 0.02, from: 'random' }, duration: 0.5
      }, 0.4);

    // ─── HERO CODE TYPING ────────────────────────────
    const codeText = "const developer = {\n  name: 'Ankush Amar',\n  skills: ['React', 'Node.js', 'Three.js'],\n  passion: 'Building Digital Experiences'\n};\n\nconsole.log(developer);";
    const typingCode = document.getElementById('typing-code');
    let i = 0;
    function typeWriter() {
      if (i < codeText.length) {
        typingCode.innerHTML += codeText.charAt(i);
        i++;
        setTimeout(typeWriter, 50);
      }
    }
    gsap.to('.hero-code', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out', delay: 1.5, onComplete: typeWriter });

    // ─── NAV SCROLL ──────────────────────────────────
    ScrollTrigger.create({
      start: '80px top',
      onEnter: () => gsap.to('#navbar', { background: 'rgba(10,10,15,0.95)', duration: 0.4 }),
      onLeaveBack: () => gsap.to('#navbar', { background: 'transparent', duration: 0.4 })
    });

    // ─── REVEAL ON SCROLL ────────────────────────────
    gsap.utils.toArray('.reveal').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
          scrollTrigger: { trigger: el, start: 'top 88%', toggleActions: 'play none none none' }
        }
      );
    });

    // ─── SKILL BARS ──────────────────────────────────
    gsap.utils.toArray('.skill-bar').forEach(bar => {
      gsap.to(bar, {
        scaleX: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: { trigger: bar, start: 'top 90%' }
      });
    });

    // ─── STAT COUNTER ────────────────────────────────
    gsap.utils.toArray('.stat-num').forEach(el => {
      const target = parseInt(el.dataset.target);
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        onEnter: () => {
          gsap.to({ val: 0 }, {
            val: target,
            duration: 2,
            ease: 'power2.out',
            onUpdate: function() { el.textContent = Math.round(this.targets()[0].val); }
          });
        }
      });
    });

    // ─── PROJECT CARD PARALLAX ───────────────────────
    gsap.utils.toArray('.project-card').forEach(card => {
      gsap.to(card, {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: card,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5
        }
      });
    });

    // ─── SECTION TITLE HORIZONTAL SLIDE ─────────────
    gsap.utils.toArray('.section-title').forEach(title => {
      gsap.fromTo(title,
        { x: -60, opacity: 0 },
        {
          x: 0, opacity: 1, duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: title, start: 'top 85%' }
        }
      );
    });

    // ─── AUTH HUB INTERACTIONS ───────────────────────
    const API_BASE = 'http://localhost:3000/api';
    const authState = {
      loggedIn: false,
      token: '',
      user: null,
      github: '—',
      leetcode: '—',
      linkedin: '—',
      score: 0
    };

    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const authWelcome = document.getElementById('user-welcome');
    const statusGithub = document.getElementById('status-github');
    const statusLeetCode = document.getElementById('status-leetcode');
    const statusScore = document.getElementById('status-score');
    const certificateResult = document.getElementById('certificate-result');
    const applyResult = document.getElementById('apply-result');

    async function apiRequest(path, payload = {}, method = 'POST') {
      try {
        const response = await fetch(`${API_BASE}${path}`, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...(authState.token ? { Authorization: `Bearer ${authState.token}` } : {})
          },
          body: method === 'GET' ? null : JSON.stringify(payload)
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || 'API request failed');
        }
        return data;
      } catch (error) {
        return { error: error.message };
      }
    }

    function setActiveForm(targetId) {
      authTabs.forEach(tab => tab.classList.toggle('active', tab.dataset.target === targetId));
      authForms.forEach(form => form.classList.toggle('active', form.id === targetId));
    }

    function updatePlatformSummary() {
      statusGithub.textContent = authState.github || '—';
      statusLeetCode.textContent = authState.leetcode || '—';
      statusScore.textContent = authState.score ? `${authState.score}%` : '—';
    }

    authTabs.forEach(tab => {
      tab.addEventListener('click', () => setActiveForm(tab.dataset.target));
    });

    document.querySelectorAll('.password-toggle').forEach(button => {
      const targetInput = document.getElementById(button.dataset.target);
      button.addEventListener('click', () => {
        const isText = targetInput.type === 'text';
        targetInput.type = isText ? 'password' : 'text';
        button.textContent = isText ? '👁' : '🙈';
        button.setAttribute('aria-label', isText ? 'Show password' : 'Hide password');
      });
    });

    document.getElementById('login-panel').addEventListener('submit', async e => {
      e.preventDefault();
      const user = document.getElementById('login-user').value.trim();
      const pass = document.getElementById('login-pass').value.trim();
      const githubHandle = document.getElementById('login-github').value.trim();
      const leetcodeHandle = document.getElementById('login-leetcode').value.trim();
      const linkedin = document.getElementById('login-linkedin').value.trim();

      if (!user || !pass) {
        certificateResult.textContent = 'Please enter both login and password to continue.';
        return;
      }

      const result = await apiRequest('/login', { user, password: pass, githubHandle, leetcodeHandle, linkedin });
      if (result.error) {
        certificateResult.textContent = result.error;
        return;
      }

      authState.loggedIn = true;
      authState.token = result.token;
      authState.user = result.email;
      authState.github = result.githubHandle || 'not provided';
      authState.leetcode = result.leetcodeHandle || 'not provided';
      authState.linkedin = linkedin || 'not provided';
      authState.score = result.score || 0;
      authWelcome.textContent = `Welcome back, ${result.email}. Your career progress is ready.`;
      updatePlatformSummary();
      certificateResult.textContent = 'Tracking data synced with backend.';
    });

    document.getElementById('signup-panel').addEventListener('submit', async e => {
      e.preventDefault();
      const email = document.getElementById('signup-email').value.trim();
      const pass = document.getElementById('signup-pass').value.trim();
      const linkedin = document.getElementById('signup-linkedin').value.trim();
      const goal = document.getElementById('signup-goal').value.trim();

      if (!email || !pass) {
        certificateResult.textContent = 'Please complete the signup fields to continue.';
        return;
      }

      const result = await apiRequest('/signup', { email, password: pass, linkedin, goal });
      if (result.error) {
        certificateResult.textContent = result.error;
        return;
      }

      authState.loggedIn = true;
      authState.token = result.token;
      authState.user = result.email;
      authState.github = result.githubHandle || 'pending';
      authState.leetcode = result.leetcodeHandle || 'pending';
      authState.linkedin = linkedin || 'pending';
      authState.score = result.score || 0;
      authWelcome.textContent = `Welcome, ${goal || 'future developer'}. Start tracking your progress.`;
      updatePlatformSummary();
      certificateResult.textContent = 'Account created. Add GitHub / LeetCode handles to improve scores.';
    });

    document.getElementById('verify-certificate').addEventListener('click', async () => {
      const text = document.getElementById('certificate-text').value.trim();
      if (!text) {
        certificateResult.textContent = 'Paste a certificate title or issuer to verify it.';
        return;
      }

      if (!authState.loggedIn) {
        certificateResult.textContent = 'Please log in before verifying certificates.';
        return;
      }

      const result = await apiRequest('/verify-certificate', { certificateText: text });
      certificateResult.textContent = result.error ? result.error : result.verdict;
    });

    document.getElementById('run-auto-apply').addEventListener('click', async () => {
      const senior = document.getElementById('auto-apply-senior').checked;
      const fullstack = document.getElementById('auto-apply-fullstack').checked;

      if (!authState.loggedIn) {
        applyResult.textContent = 'Please log in before running the application assistant.';
        return;
      }

      if (!senior && !fullstack) {
        applyResult.textContent = 'Select at least one role to let the AI assistant evaluate your eligibility.';
        return;
      }

      const result = await apiRequest('/auto-apply', { roles: { senior, fullstack } });
      applyResult.textContent = result.error ? result.error : result.result;
    });

    if (typeof ScrollTrigger !== 'undefined' && document.querySelector('#auth-hub')) {
      ScrollTrigger.create({
        trigger: '#auth-hub',
        start: 'top 80%',
        end: 'bottom top',
        scrub: true,
        onUpdate: self => {
          gsap.to('#threejs-showcase', {
            scale: 1 + self.progress * 0.04,
            rotation: self.progress * 3,
            transformOrigin: 'center center',
            ease: 'none'
          });
          gsap.to('.auth-panel', {
            y: -18 * self.progress,
            opacity: 0.92 + self.progress * 0.08,
            ease: 'none'
          });
          gsap.to('.auth-info', {
            y: 18 * self.progress,
            opacity: 0.92 + self.progress * 0.08,
            ease: 'none'
          });
        }
      });
    }

    // Smooth anchor scrolling via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -80, duration: 1.6 });
      });
    });
  
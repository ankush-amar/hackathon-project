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

    // ─── HERO GRID ───────────────────────────────────
    const heroGrid = document.getElementById('hero-grid');
    for (let i = 0; i < 60; i++) {
      const cell = document.createElement('div');
      cell.className = 'hero-grid-cell';
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

    // Smooth anchor scrolling via Lenis
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(a.getAttribute('href'));
        if (target) lenis.scrollTo(target, { offset: -80, duration: 1.6 });
      });
    });
  
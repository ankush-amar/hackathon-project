(function () {
  'use strict';

  // ─── SHARED HELPERS ──────────────────────────────────────────

  /** Create a WebGLRenderer attached to a canvas element */
  function createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    return renderer;
  }

  /** Fit renderer + camera aspect to the canvas wrapper's size */
  function fitToWrapper(renderer, camera, wrapper) {
    const w = wrapper.clientWidth;
    const h = wrapper.clientHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  
  function initHeroScene() {
    const canvas  = document.getElementById('hero-canvas');
    if (!canvas) return;

    const wrapper  = canvas.parentElement;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    const renderer = createRenderer(canvas);

    camera.position.z = 5;
    fitToWrapper(renderer, camera, wrapper);
    window.addEventListener('resize', () => fitToWrapper(renderer, camera, wrapper));

    // ── Particle field ──────────────────────────────────────────
    const PARTICLE_COUNT = 2000;
    const positions      = new Float32Array(PARTICLE_COUNT * 3);
    const driftSpeed     = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      positions[i * 3]     = (Math.random() - 0.5) * 22;   // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 22;   // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;   // z
      driftSpeed[i]         = Math.random() * 0.005 + 0.001;
    }

    const particleGeo = new THREE.BufferGeometry();
    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const particleMat = new THREE.PointsMaterial({
      color:          0xc8ff00,
      size:           0.045,
      transparent:    true,
      opacity:        0.55,
      sizeAttenuation: true,
      blending:       THREE.AdditiveBlending,
      depthWrite:     false,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // ── Outer wireframe icosahedron ─────────────────────────────
    const outerGeo = new THREE.IcosahedronGeometry(2.4, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color:       0xc8ff00,
      wireframe:   true,
      transparent: true,
      opacity:     0.07,
    });
    const outerMesh = new THREE.Mesh(outerGeo, outerMat);
    scene.add(outerMesh);

    // ── Inner wireframe icosahedron ─────────────────────────────
    const innerGeo = new THREE.IcosahedronGeometry(1.5, 1);
    const innerMat = new THREE.MeshBasicMaterial({
      color:       0x7c3aed,
      wireframe:   true,
      transparent: true,
      opacity:     0.09,
    });
    const innerMesh = new THREE.Mesh(innerGeo, innerMat);
    scene.add(innerMesh);

    // ── State ───────────────────────────────────────────────────
    let scrollY  = 0;
    let mouseX   = 0;
    let mouseY   = 0;
    let time     = 0;

    window.addEventListener('scroll', () => { scrollY = window.scrollY; });
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ── Render loop ─────────────────────────────────────────────
    (function tick() {
      requestAnimationFrame(tick);
      time += 0.005;

      // Rotate wireframes
      outerMesh.rotation.x = time * 0.25 + mouseY * 0.12;
      outerMesh.rotation.y = time * 0.40 + mouseX * 0.12;
      innerMesh.rotation.x = -time * 0.18;
      innerMesh.rotation.y = -time * 0.30;

      // Camera parallax
      camera.position.x += (mouseX * 0.4 - camera.position.x) * 0.04;
      camera.position.y += (-mouseY * 0.2 - camera.position.y) * 0.04;

      // Particle drift
      const pos = particleGeo.attributes.position.array;
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        pos[i * 3 + 1] -= driftSpeed[i];
        if (pos[i * 3 + 1] < -11) pos[i * 3 + 1] = 11;
      }
      particleGeo.attributes.position.needsUpdate = true;

      // Fade out on scroll
      canvas.style.opacity = Math.max(0, 1 - scrollY / 500).toFixed(3);

      renderer.render(scene, camera);
    })();
  }

  function initShowcaseScene() {
    const canvas  = document.getElementById('showcase-canvas');
    if (!canvas) return;

    const wrapper  = canvas.parentElement;
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    const renderer = createRenderer(canvas);

    camera.position.z = 4.5;
    fitToWrapper(renderer, camera, wrapper);
    window.addEventListener('resize', () => fitToWrapper(renderer, camera, wrapper));

    // ── Lighting ────────────────────────────────────────────────
    scene.add(new THREE.AmbientLight(0xffffff, 0.25));

    const keyLight  = new THREE.PointLight(0xc8ff00, 3.5, 12);
    keyLight.position.set(3, 3, 3);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x7c3aed, 2.5, 12);
    fillLight.position.set(-3, -2, 2);
    scene.add(fillLight);

    const rimLight  = new THREE.PointLight(0xffffff, 1.0, 8);
    rimLight.position.set(0, -3, -2);
    scene.add(rimLight);

    // ── Shape definitions ────────────────────────────────────────
    //   [label shown in HTML sidebar, geometry constructor]
    const SHAPES = [
      { geo: new THREE.IcosahedronGeometry(1.6, 0)          },  // 0 Icosahedron
      { geo: new THREE.OctahedronGeometry(1.7, 0)           },  // 1 Octahedron
      { geo: new THREE.TorusKnotGeometry(1.0, 0.32, 120, 16) }, // 2 Torus Knot
      { geo: new THREE.TorusGeometry(1.25, 0.48, 28, 120)   },  // 3 Torus
    ];

    // ── Build mesh groups ────────────────────────────────────────
    const groups = SHAPES.map(({ geo }, i) => {
      // Solid dark base
      const solidMesh = new THREE.Mesh(geo,
        new THREE.MeshPhongMaterial({
          color:       0x0d0d1a,
          emissive:    0x0a0a14,
          shininess:   100,
          transparent: true,
          opacity:     0.92,
        })
      );

      // Accent wireframe on top
      const wireMesh = new THREE.Mesh(geo,
        new THREE.MeshBasicMaterial({
          color:       0xc8ff00,
          wireframe:   true,
          transparent: true,
          opacity:     0.45,
        })
      );

      // Secondary purple wireframe (slightly larger)
      const wireGeo2 = geo.clone();
      const wireMesh2 = new THREE.Mesh(wireGeo2,
        new THREE.MeshBasicMaterial({
          color:       0x7c3aed,
          wireframe:   true,
          transparent: true,
          opacity:     0.12,
        })
      );
      wireMesh2.scale.setScalar(1.05);

      const group = new THREE.Group();
      group.add(solidMesh, wireMesh, wireMesh2);
      scene.add(group);

      // Start invisible except shape 0
      group.visible = i === 0;
      group.scale.setScalar(i === 0 ? 1 : 0);

      return { group, solid: solidMesh, wire: wireMesh, wire2: wireMesh2 };
    });

    // ── Stage indicator elements ─────────────────────────────────
    const stageItems = document.querySelectorAll('.stage-item');

    function activateShape(idx, prevIdx) {
      if (idx === prevIdx) return;

      // Hide previous
      if (groups[prevIdx]) groups[prevIdx].group.visible = false;

      // Show & animate new
      const next = groups[idx];
      next.group.visible = true;
      next.group.scale.setScalar(0.2);
      next.group.rotation.set(0, 0, 0);

      if (typeof gsap !== 'undefined') {
        gsap.to(next.group.scale, {
          x: 1, y: 1, z: 1,
          duration: 0.75,
          ease: 'back.out(1.6)',
        });
        // Wireframe flash
        gsap.fromTo(next.wire.material,
          { opacity: 1.0 },
          { opacity: 0.45, duration: 0.6, ease: 'power2.out' }
        );
      } else {
        next.group.scale.setScalar(1);
      }

      // Sync sidebar
      stageItems.forEach((el, i) => el.classList.toggle('active', i === idx));
    }

    // ── GSAP ScrollTrigger (pins the section, drives shape swaps) ─
    let currentIdx = 0;

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
      ScrollTrigger.create({
        trigger:   '#threejs-showcase',
        start:     'top top+=80',
        end:       `+=${window.innerHeight * 4.0}`,  // scroll distance for all 4 shapes
        pin:       true,
        pinSpacing: true,
        scrub:     0.4,
        onUpdate:  (self) => {
          // Map 0→1 progress → shape index 0→3
          const raw = self.progress * SHAPES.length;
          const idx = Math.min(Math.floor(raw), SHAPES.length - 1);

          if (idx !== currentIdx) {
            activateShape(idx, currentIdx);
            currentIdx = idx;
          }

          // Subtle camera sway tied to scroll
          camera.position.x = Math.sin(self.progress * Math.PI * 2) * 0.6;
          camera.position.y = Math.cos(self.progress * Math.PI)     * 0.4;
          camera.lookAt(0, 0, 0);
        },
      });
    }

    // ── Mouse interaction ────────────────────────────────────────
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ── Render loop ──────────────────────────────────────────────
    let time = 0;
    (function tick() {
      requestAnimationFrame(tick);
      time += 0.008;

      const active = groups[currentIdx];
      if (active && active.group.visible) {
        // Smooth mouse tracking on X axis, constant Y rotation
        active.group.rotation.y  += 0.008;
        active.group.rotation.x += (mouseY * 0.35 - active.group.rotation.x) * 0.04;
      }

      // Pulsing lights
      keyLight.intensity  = 3.0 + Math.sin(time * 1.6) * 0.8;
      fillLight.intensity = 2.0 + Math.cos(time * 1.1) * 0.6;

      renderer.render(scene, camera);
    })();
  }

  
  function initOrbsScene() {
    const canvas  = document.getElementById('orbs-canvas');
    if (!canvas) return;

    const wrapper  = canvas.parentElement;
    const section  = document.getElementById('about');
    const scene    = new THREE.Scene();
    const camera   = new THREE.PerspectiveCamera(60, 1, 0.1, 100);
    const renderer = createRenderer(canvas);

    camera.position.z = 5;
    fitToWrapper(renderer, camera, wrapper);
    window.addEventListener('resize', () => fitToWrapper(renderer, camera, wrapper));

    scene.add(new THREE.AmbientLight(0xffffff, 0.4));

    // ── Orb definitions ──────────────────────────────────────────
    const ORB_DEFS = [
      { color: 0xc8ff00, r: 0.55, x: -3.6, y:  1.2, z: -1.8, freq: 0.7,  dir:  1 },
      { color: 0x7c3aed, r: 0.80, x:  3.2, y: -0.4, z: -2.5, freq: 0.5,  dir: -1 },
      { color: 0xc8ff00, r: 0.32, x:  1.1, y:  2.1, z: -1.0, freq: 1.15, dir:  1 },
      { color: 0x7c3aed, r: 0.45, x: -1.6, y: -1.8, z: -0.6, freq: 0.90, dir: -1 },
      { color: 0xffffff, r: 0.22, x:  2.6, y:  1.6, z:  0.2, freq: 1.30, dir:  1 },
    ];

    const orbs = ORB_DEFS.map((d, i) => {
      // Core sphere
      const sphereGeo = new THREE.SphereGeometry(d.r, 28, 28);
      const sphereMat = new THREE.MeshPhongMaterial({
        color:              d.color,
        emissive:           d.color,
        emissiveIntensity:  0.35,
        transparent:        true,
        opacity:            0.18,
        shininess:          60,
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.position.set(d.x, d.y, d.z);

      // Halo ring orbiting the sphere
      const ringGeo = new THREE.TorusGeometry(d.r * 1.55, 0.012, 8, 80);
      const ringMat = new THREE.MeshBasicMaterial({
        color:       d.color,
        transparent: true,
        opacity:     0.18,
        blending:    THREE.AdditiveBlending,
        depthWrite:  false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.random() * Math.PI;
      ring.rotation.z = Math.random() * Math.PI;
      sphere.add(ring);

      // Point light on large orbs for atmosphere
      if (d.r > 0.5) {
        const pl = new THREE.PointLight(d.color, 0.6, 5);
        sphere.add(pl);
      }

      scene.add(sphere);
      return { sphere, ring, mat: sphereMat, ...d, phase: i * 1.3 };
    });

    // ── Scroll state ─────────────────────────────────────────────
    let sectionScroll = 0;
    function updateSectionScroll() {
      if (!section) return;
      sectionScroll = window.scrollY - section.offsetTop;
    }
    window.addEventListener('scroll', updateSectionScroll);

    // ── Render loop ──────────────────────────────────────────────
    let time = 0;
    (function tick() {
      requestAnimationFrame(tick);
      time += 0.006;

      orbs.forEach((orb, i) => {
        // Bobbing
        orb.sphere.position.y = orb.y + Math.sin(time * orb.freq + orb.phase) * 0.32;

        // Scroll parallax (drift horizontally as user scrolls)
        orb.sphere.position.x = orb.x + sectionScroll * 0.0018 * orb.dir;

        // Slow spin
        orb.sphere.rotation.y += 0.004 * orb.freq;
        orb.ring.rotation.z   += 0.003 * orb.freq;
        orb.ring.rotation.x   += 0.002;

        // Breathing opacity
        orb.mat.opacity = 0.14 + Math.abs(Math.sin(time * 0.45 + orb.phase)) * 0.13;
      });

      renderer.render(scene, camera);
    })();
  }

  // ─── BOOT ─────────────────────────────────────────────────────
  // Run after all scripts (GSAP, Three.js, main.js) have loaded
  function boot() {
    initHeroScene();
    initShowcaseScene();
    initOrbsScene();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
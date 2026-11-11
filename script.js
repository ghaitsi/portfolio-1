/* ==========================================================
   LOYD AZZUKA PORTFOLIO — MAIN SCRIPT v4
   Features:
   1. Command Palette (Ctrl+K)
   2. Stats Counter
   3. Theme Toggle (system sync)
   4. Copy Email
   5. Scroll Progress
   + Typing, Skill Tabs, Carousel, Active Nav, Form, dll.
   ========================================================== */

(function () {
  'use strict';

  /* ============ THEME (system sync) ============ */
  const html = document.documentElement;
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  function applyTheme(theme) {
    html.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    if (themeIcon) {
      themeIcon.className = theme === 'dark' ? 'bx bx-moon' : 'bx bx-sun';
    }
  }

  const savedTheme = localStorage.getItem('theme');
  applyTheme(savedTheme || (mediaQuery.matches ? 'dark' : 'light'));

  // Sync dengan OS jika user belum pilih manual
  mediaQuery.addEventListener('change', (e) => {
    if (!localStorage.getItem('theme')) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    });
  }

  /* ============ TYPING EFFECT ============ */
  const typingEl = document.getElementById('typing-text');
  const phrases = ['Frontend Developer', 'UI/UX Enthusiast', 'Web Designer', 'Problem Solver'];
  let phraseIdx = 0, charIdx = 0, isDeleting = false;

  function typeLoop() {
    if (!typingEl) return;
    const current = phrases[phraseIdx];
    const speed = isDeleting ? 50 : 100;

    if (!isDeleting) {
      typingEl.textContent = current.substring(0, charIdx + 1);
      charIdx++;
      if (charIdx === current.length) {
        isDeleting = true;
        setTimeout(typeLoop, 1600);
        return;
      }
    } else {
      typingEl.textContent = current.substring(0, charIdx - 1);
      charIdx--;
      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
      }
    }
    setTimeout(typeLoop, speed);
  }

  if (typingEl) {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTimeout(typeLoop, 500);
    } else {
      typingEl.textContent = phrases[0];
    }
  }

  /* ============ SKILL TABS + GRID ============ */
  const skillTabs = document.querySelectorAll('.skill-tab');
  const skillTiles = document.querySelectorAll('.skill-tile');
  const skillEmpty = document.getElementById('skillEmpty');

  skillTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      skillTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const cat = tab.dataset.category;
      let visible = 0;

      skillTiles.forEach(tile => {
        const match = cat === 'all' || tile.dataset.category === cat;
        tile.classList.toggle('hidden', !match);
        tile.classList.remove('fade-in');
        if (match) {
          visible++;
          // trigger reflow biar animasi re-run
          void tile.offsetWidth;
          tile.classList.add('fade-in');
        }
      });

      if (skillEmpty) skillEmpty.hidden = visible > 0;
    });
  });

  /* ============ STATS COUNTER ============ */
  const heroStats = document.getElementById('heroStats');
  if (heroStats) {
    const statNums = heroStats.querySelectorAll('.stat-number');
    let animated = false;

    const statObs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !animated) {
          animated = true;
          statNums.forEach(num => {
            const target = +num.dataset.target;
            let count = 0;
            const step = Math.max(1, Math.ceil(target / 30));
            const tick = setInterval(() => {
              count += step;
              if (count >= target) {
                count = target;
                clearInterval(tick);
              }
              num.textContent = count;
            }, 40);
          });
          statObs.disconnect();
        }
      });
    }, { threshold: 0.3 });

    statObs.observe(heroStats);
  }

  /* ============ CAROUSEL ============ */
  const track = document.getElementById('carouselTrack');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('carouselDots');

  if (track) {
    const slides = track.querySelectorAll('.project-slide');
    let currentIndex = 0;

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.setAttribute('aria-label', `Slide ${i + 1}`);
      if (i === 0) dot.classList.add('active');
      dot.addEventListener('click', () => goTo(i));
      dotsContainer.appendChild(dot);
    });

    function goTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      dotsContainer.querySelectorAll('button').forEach((d, i) => {
        d.classList.toggle('active', i === currentIndex);
      });
    }

    if (prevBtn) prevBtn.addEventListener('click', () => goTo(currentIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => goTo(currentIndex + 1));

    let autoTimer = setInterval(() => goTo(currentIndex + 1), 6000);
    const carouselEl = track.closest('.carousel');
    if (carouselEl) {
      carouselEl.addEventListener('mouseenter', () => clearInterval(autoTimer));
      carouselEl.addEventListener('mouseleave', () => {
        autoTimer = setInterval(() => goTo(currentIndex + 1), 6000);
      });
    }

    let touchStartX = 0;
    track.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    track.addEventListener('touchend', (e) => {
      const diff = e.changedTouches[0].screenX - touchStartX;
      if (Math.abs(diff) > 50) goTo(currentIndex + (diff < 0 ? 1 : -1));
    }, { passive: true });
  }

  /* ============ ACTIVE NAV HIGHLIGHT ============ */
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  function highlightNav() {
    const scrollY = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === '#' + id);
        });
      }
    });
  }

  window.addEventListener('scroll', highlightNav, { passive: true });
  highlightNav();

  /* ============ MOBILE MENU ============ */
  const menuIcon = document.getElementById('menu-icon');
  const navbar = document.getElementById('navbar');

  if (menuIcon && navbar) {
    menuIcon.addEventListener('click', (e) => {
      e.stopPropagation();
      navbar.classList.toggle('open');
      const icon = menuIcon.querySelector('i');
      icon.className = navbar.classList.contains('open') ? 'bx bx-x' : 'bx bx-menu';
    });

    navbar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navbar.classList.remove('open');
        menuIcon.querySelector('i').className = 'bx bx-menu';
      });
    });
  }

  /* ============ SCROLL TO TOP ============ */
  const scrollBtn = document.getElementById('scrollToTop');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.classList.toggle('show', window.scrollY > 300);
    }, { passive: true });
    scrollBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ============ FEATURE 5: SCROLL PROGRESS ============ */
  const scrollProgress = document.getElementById('scrollProgress');
  if (scrollProgress) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
      scrollProgress.style.width = scrolled + '%';
    }, { passive: true });
  }

  /* ============ NAVBAR SHRINK ============ */
  const header = document.querySelector('.header');
  if (header) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        header.style.paddingTop = '12px';
        header.style.paddingBottom = '12px';
        header.style.boxShadow = '0 4px 20px rgba(0,0,0,.2)';
      } else {
        header.style.paddingTop = '18px';
        header.style.paddingBottom = '18px';
        header.style.boxShadow = 'none';
      }
    }, { passive: true });
  }

  /* ============ SCROLL REVEAL ============ */
  const revealEls = document.querySelectorAll(
    '.home-content, .home-img, .about-grid, .timeline-item, .card, .skill-tile, .contact-form, .project-slide, .skill-tabs'
  );
  revealEls.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = 'opacity .7s ease, transform .7s cubic-bezier(.2,.7,.3,1)';
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'translateY(0)';
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ============ FEATURE 4: COPY EMAIL ============ */
  const copyEmailBtn = document.getElementById('copyEmail');
  const copyToast = document.getElementById('copyToast');
  const copyIcon = document.getElementById('copyIcon');

  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', async () => {
      const email = copyEmailBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
        copyEmailBtn.classList.add('copied');
        if (copyIcon) copyIcon.className = 'bx bx-check';
        if (copyToast) {
          copyToast.classList.add('show');
          setTimeout(() => copyToast.classList.remove('show'), 2000);
        }
        setTimeout(() => {
          copyEmailBtn.classList.remove('copied');
          if (copyIcon) copyIcon.className = 'bx bx-copy';
        }, 2000);
      } catch (err) {
        // Fallback
        const ta = document.createElement('textarea');
        ta.value = email;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        copyEmailBtn.classList.add('copied');
        if (copyToast) {
          copyToast.classList.add('show');
          setTimeout(() => copyToast.classList.remove('show'), 2000);
        }
      }
    });
  }

  /* ============ CONTACT FORM ============ */
  const form = document.getElementById('contactForm');
  const status = document.getElementById('formStatus');

  if (form && status) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const name = (data.get('name') || '').trim();
      const email = (data.get('email') || '').trim();
      const message = (data.get('message') || '').trim();

      if (name.length < 2) {
        status.textContent = '❌ Nama minimal 2 karakter.';
        status.className = 'form-status error';
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        status.textContent = '❌ Format email tidak valid.';
        status.className = 'form-status error';
        return;
      }
      if (message.length < 10) {
        status.textContent = '❌ Pesan minimal 10 karakter.';
        status.className = 'form-status error';
        return;
      }

      const btn = form.querySelector('button[type="submit"]');
      const originalHTML = btn.innerHTML;
      btn.disabled = true;
      btn.innerHTML = 'Mengirim...';
      status.textContent = '';
      status.className = 'form-status';

      try {
        const res = await fetch(form.action, {
          method: 'POST',
          body: data,
          headers: { 'Accept': 'application/json' }
        });
        if (res.ok) {
          status.textContent = '✅ Pesan berhasil terkirim! Terima kasih.';
          status.className = 'form-status success';
          form.reset();
        } else throw new Error('Failed');
      } catch (err) {
        status.textContent = '❌ Gagal mengirim. Coba lagi nanti.';
        status.className = 'form-status error';
      } finally {
        btn.disabled = false;
        btn.innerHTML = originalHTML;
      }
    });
  }

  /* ============ SMOOTH SCROLL ============ */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ============ FEATURE 1: COMMAND PALETTE ============ */
  const cmdOverlay = document.getElementById('cmdOverlay');
  const cmdInput = document.getElementById('cmdInput');
  const cmdList = document.getElementById('cmdList');
  const cmdBtn = document.getElementById('cmdBtn');

  const commands = [
    { label: 'Beranda', icon: 'bx-home', href: '#home' },
    { label: 'Tentang Saya', icon: 'bx-user', href: '#about' },
    { label: 'Pengalaman', icon: 'bx-briefcase', href: '#experience' },
    { label: 'Pendidikan', icon: 'bx-book', href: '#education' },
    { label: 'Skill', icon: 'bx-code-alt', href: '#skills' },
    { label: 'Proyek', icon: 'bx-layer', href: '#projects' },
    { label: 'Kontak', icon: 'bx-envelope', href: '#contact' },
    { label: 'Download CV', icon: 'bx-download', href: 'my CV.pdf', external: true },
    { label: 'GitHub', icon: 'bxl-github', href: 'https://github.com/ghaitsi', external: true },
    { label: 'Instagram', icon: 'bxl-instagram', href: 'https://www.instagram.com/kmafif9/', external: true },
    { label: 'WhatsApp', icon: 'bxl-whatsapp', href: 'https://wa.me/6288289062984', external: true },
    { label: 'Ganti Tema', icon: 'bx-moon', action: () => {
      const current = html.getAttribute('data-theme');
      applyTheme(current === 'dark' ? 'light' : 'dark');
    }},
    { label: 'Kembali ke Atas', icon: 'bx-up-arrow-alt', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }
  ];

  let filtered = [...commands];
  let activeIdx = 0;

  function renderCmds() {
    if (!cmdList) return;
    cmdList.innerHTML = '';
    if (filtered.length === 0) {
      cmdList.innerHTML = '<li class="empty">Tidak ada hasil</li>';
      return;
    }
    filtered.forEach((c, i) => {
      const li = document.createElement('li');
      li.innerHTML = `<i class="bx ${c.icon}"></i> ${c.label}`;
      if (i === activeIdx) li.classList.add('active');
      li.addEventListener('click', () => execCmd(c));
      cmdList.appendChild(li);
    });
  }

  function execCmd(c) {
    closeCmd();
    if (c.action) { c.action(); return; }
    if (c.external) { window.open(c.href, '_blank', 'noopener'); return; }
    const target = document.querySelector(c.href);
    if (target) {
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  }

  function openCmd() {
    if (!cmdOverlay) return;
    cmdOverlay.classList.add('open');
    cmdOverlay.setAttribute('aria-hidden', 'false');
    if (cmdInput) { cmdInput.value = ''; cmdInput.focus(); }
    filtered = [...commands];
    activeIdx = 0;
    renderCmds();
  }

  function closeCmd() {
    if (!cmdOverlay) return;
    cmdOverlay.classList.remove('open');
    cmdOverlay.setAttribute('aria-hidden', 'true');
  }

  if (cmdBtn) cmdBtn.addEventListener('click', openCmd);
  if (cmdOverlay) {
    cmdOverlay.addEventListener('click', (e) => {
      if (e.target === cmdOverlay) closeCmd();
    });
  }

  if (cmdInput) {
    cmdInput.addEventListener('input', () => {
      const q = cmdInput.value.toLowerCase().trim();
      filtered = commands.filter(c => c.label.toLowerCase().includes(q));
      activeIdx = 0;
      renderCmds();
    });

    cmdInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIdx = Math.min(activeIdx + 1, filtered.length - 1);
        renderCmds();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIdx = Math.max(activeIdx - 1, 0);
        renderCmds();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[activeIdx]) execCmd(filtered[activeIdx]);
      } else if (e.key === 'Escape') {
        closeCmd();
      }
    });
  }

  // Global shortcut Ctrl+K / Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (cmdOverlay && cmdOverlay.classList.contains('open')) closeCmd();
      else openCmd();
    }
    if (e.key === 'Escape' && cmdOverlay && cmdOverlay.classList.contains('open')) closeCmd();
  });

})();
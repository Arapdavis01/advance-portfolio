(function() {
    'use strict';

    // ============================================================
    // CUSTOM CURSOR
    // ============================================================
    const cursor = document.getElementById('cursorGlow');
    if (window.matchMedia('(hover: hover)').matches) {
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursor.style.opacity = '0.8'; });
    }

    // ============================================================
    // DARK / LIGHT MODE TOGGLE
    // ============================================================
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.getElementById('themeIcon');

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        if (theme === 'light') {
            themeIcon.className = 'fas fa-sun';
        } else {
            themeIcon.className = 'fas fa-moon';
        }
    }

    // Load saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
        setTheme('light');
    }

    themeToggle.addEventListener('click', () => {
        const current = document.documentElement.getAttribute('data-theme');
        setTheme(current === 'light' ? 'dark' : 'light');
    });

    // ============================================================
    // MOBILE HAMBURGER
    // ============================================================
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('open');
        navLinks.classList.toggle('open');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            navLinks.classList.remove('open');
        });
    });

    // ============================================================
    // SCROLL ANIMATIONS (Intersection Observer)
    // ============================================================
    const fadeEls = document.querySelectorAll('.fade-up');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    fadeEls.forEach(el => observer.observe(el));

    // ============================================================
    // SMOOTH SCROLL FOR NAV
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                const navHeight = document.getElementById('navbar').offsetHeight;
                const top = target.getBoundingClientRect().top + window.pageYOffset - navHeight - 20;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ============================================================
    // STATS COUNTERS (animate on scroll)
    // ============================================================
    const statNumbers = document.querySelectorAll('.stat-number');
    let statsAnimated = false;

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !statsAnimated) {
                statsAnimated = true;
                statNumbers.forEach(el => {
                    const target = parseInt(el.getAttribute('data-count'));
                    let current = 0;
                    const increment = target / 60;
                    const timer = setInterval(() => {
                        current += increment;
                        if (current >= target) {
                            el.textContent = target + (target === 99 ? '%' : '+');
                            clearInterval(timer);
                        } else {
                            el.textContent = Math.floor(current) + (target === 99 ? '%' : '+');
                        }
                    }, 25);
                });
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('stats');
    if (statsSection) statsObserver.observe(statsSection);

    // ============================================================
    // TESTIMONIALS CAROUSEL
    // ============================================================
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    let currentSlide = 0;
    let autoSlideInterval;

    function goToSlide(index) {
        slides.forEach(s => s.classList.remove('active'));
        dots.forEach(d => d.classList.remove('active'));
        slides[index].classList.add('active');
        dots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        const next = (currentSlide + 1) % slides.length;
        goToSlide(next);
    }

    // Start auto-slide
    function startAutoSlide() {
        if (autoSlideInterval) clearInterval(autoSlideInterval);
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    // Dot clicks
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            startAutoSlide(); // reset timer
        });
    });

    // Pause on hover
    const carousel = document.querySelector('.testimonial-carousel');
    carousel.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
    carousel.addEventListener('mouseleave', startAutoSlide);

    startAutoSlide();

    // ============================================================
    // CASE STUDY MODAL
    // ============================================================
    const modal = document.getElementById('modal');
    const modalClose = document.getElementById('modalClose');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalChallenge = document.getElementById('modalChallenge');
    const modalTech = document.getElementById('modalTech');
    const modalResult = document.getElementById('modalResult');
    const modalLink = document.getElementById('modalLink');

    // Fallback image if the project image fails to load
    const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop';

    document.querySelectorAll('.modal-trigger').forEach(button => {
        button.addEventListener('click', function() {
            const card = this.closest('.project-card');
            if (!card) return;

            const title = card.dataset.title || 'Project';
            const image = card.dataset.image || '';
            const link = card.dataset.link || '#';
            const challenge = card.dataset.challenge || 'No challenge description provided.';
            const tech = card.dataset.tech || 'Tech stack not specified.';
            const result = card.dataset.result || 'Result not specified.';

            // Set image with fallback
            modalImage.src = image || FALLBACK_IMAGE;
            modalImage.alt = title;

            // If image fails to load, use fallback
            modalImage.onerror = function() {
                this.src = FALLBACK_IMAGE;
                this.onerror = null; // prevent infinite loop
            };

            modalTitle.textContent = title;
            modalChallenge.textContent = challenge;
            modalTech.textContent = tech;
            modalResult.textContent = result;
            modalLink.href = link;

            modal.classList.add('open');
            document.body.style.overflow = 'hidden';
        });
    });

    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        // Reset image onerror handler when closing
        modalImage.onerror = null;
    }

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') closeModal();
    });

    // ============================================================
    // BACK TO TOP BUTTON
    // ============================================================
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 600) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // ============================================================
    // PARTICLES BACKGROUND (Feature 11)
    // ============================================================
    if (typeof tsParticles !== 'undefined') {
        tsParticles.load('particles-bg', {
            particles: {
                number: { 
                    value: 80, 
                    density: { enable: true, area: 800 } 
                },
                color: { 
                    value: ['#00f0ff', '#7b2ffc'] 
                },
                shape: { 
                    type: 'circle' 
                },
                opacity: {
                    value: 0.3,
                    random: true,
                    anim: { enable: true, speed: 0.5, min: 0.1, sync: false }
                },
                size: {
                    value: { min: 1, max: 3 },
                    random: true
                },
                move: {
                    enable: true,
                    speed: 0.5,
                    direction: 'none',
                    random: true,
                    straight: false,
                    outModes: 'out'
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#00f0ff',
                    opacity: 0.15,
                    width: 1
                }
            },
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onClick: {
                        enable: true,
                        mode: 'push'
                    }
                },
                modes: {
                    grab: {
                        distance: 180,
                        line_linked: { opacity: 0.4 }
                    },
                    push: {
                        quantity: 3
                    }
                }
            },
            background: {
                color: 'transparent'
            }
        });
    }

    // ============================================================
    // CONTACT FORM — EMAILJS (Feature 10)
    // ============================================================
    // ⚠️ IMPORTANT: Replace the placeholders below with your EmailJS credentials
    // 1. Go to https://www.emailjs.com/ and sign up (free)
    // 2. Create a service and a template
    // 3. Replace the values below with your own

    const EMAILJS_PUBLIC_KEY = 'YOUR_PUBLIC_KEY';    // e.g., 'abc123def456'
    const EMAILJS_SERVICE_ID = 'YOUR_SERVICE_ID';   // e.g., 'service_abc123'
    const EMAILJS_TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // e.g., 'template_xyz789'

    const form = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');
    const submitBtn = document.getElementById('formSubmit');

    // Initialize EmailJS when the SDK loads
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            const name = document.getElementById('user_name').value.trim();
            const email = document.getElementById('user_email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !subject || !message) {
                formStatus.className = 'form-status error';
                formStatus.textContent = '⚠️ Please fill in all fields.';
                return;
            }

            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';

            const templateParams = {
                from_name: name,
                from_email: email,
                subject: subject,
                message: message,
                to_email: 'dancun6742@gmail.com'
            };

            if (typeof emailjs !== 'undefined' && EMAILJS_PUBLIC_KEY !== 'YOUR_PUBLIC_KEY') {
                emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
                    .then(function(response) {
                        formStatus.className = 'form-status success';
                        formStatus.textContent = '✅ Message sent successfully! I\'ll get back to you shortly.';
                        form.reset();
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                    })
                    .catch(function(error) {
                        console.error('EmailJS error:', error);
                        formStatus.className = 'form-status error';
                        formStatus.textContent = '❌ Failed to send. Please try again or email me directly at dancun6742@gmail.com';
                        submitBtn.disabled = false;
                        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
                    });
            } else {
                // Fallback if EmailJS not configured or not loaded
                formStatus.className = 'form-status error';
                formStatus.textContent = '❌ Email service is not configured. Please email me directly at dancun6742@gmail.com';
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
            }
        });
    }

    // ============================================================
    // SERVICE WORKER (Feature 20 - Offline Ready)
    // ============================================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('sw.js')
            .then(function(registration) {
                console.log('Service Worker registered successfully.');
            })
            .catch(function(err) {
                console.log('Service Worker registration failed:', err);
            });
    }

})();

/* ========================================
   SAVOIRS DE GRAND-MÈRE - SITE VITRINE
   JavaScript Vanilla - Interactions & Animations
======================================== */

document.addEventListener('DOMContentLoaded', function() {
    
    // ========================================
    // NAVIGATION
    // ========================================
    
    const navbar = document.getElementById('navbar');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Navbar scroll effect
    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }
    
    window.addEventListener('scroll', handleNavbarScroll);
    handleNavbarScroll(); // Initial check
    
    // Mobile menu toggle
    navToggle.addEventListener('click', function() {
        navToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Close mobile menu on link click
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });
    
    // Close mobile menu on outside click
    document.addEventListener('click', function(e) {
        if (navMenu.classList.contains('active') && 
            !navMenu.contains(e.target) && 
            !navToggle.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
    
    // ========================================
    // SMOOTH SCROLL
    // ========================================
    
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // ========================================
    // SCROLL ANIMATIONS
    // ========================================
    
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -100px 0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optionally unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
    
    // ========================================
    // METHODS CAROUSEL
    // ========================================
    
    const methodsCarousel = document.getElementById('methodsCarousel');
    const methodsPrev = document.getElementById('methodsPrev');
    const methodsNext = document.getElementById('methodsNext');
    const methodsDots = document.getElementById('methodsDots');
    
    if (methodsCarousel && methodsPrev && methodsNext) {
        const methodCards = methodsCarousel.querySelectorAll('.method-card');
        const cardWidth = 280 + 24; // card width + gap
        let currentIndex = 0;
        const visibleCards = Math.floor(methodsCarousel.offsetWidth / cardWidth);
        const maxIndex = Math.max(0, methodCards.length - visibleCards);
        
        // Create dots
        function createDots() {
            methodsDots.innerHTML = '';
            const dotsCount = maxIndex + 1;
            
            for (let i = 0; i < dotsCount; i++) {
                const dot = document.createElement('button');
                dot.classList.add('carousel-dot');
                if (i === 0) dot.classList.add('active');
                dot.setAttribute('aria-label', `Aller à la slide ${i + 1}`);
                dot.addEventListener('click', () => goToSlide(i));
                methodsDots.appendChild(dot);
            }
        }
        
        // Update dots
        function updateDots() {
            const dots = methodsDots.querySelectorAll('.carousel-dot');
            dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }
        
        // Go to specific slide
        function goToSlide(index) {
            currentIndex = Math.max(0, Math.min(index, maxIndex));
            methodsCarousel.scrollTo({
                left: currentIndex * cardWidth,
                behavior: 'smooth'
            });
            updateDots();
        }
        
        // Navigation buttons
        methodsPrev.addEventListener('click', () => {
            goToSlide(currentIndex - 1);
        });
        
        methodsNext.addEventListener('click', () => {
            goToSlide(currentIndex + 1);
        });
        
        // Update on scroll
        methodsCarousel.addEventListener('scroll', function() {
            const newIndex = Math.round(this.scrollLeft / cardWidth);
            if (newIndex !== currentIndex) {
                currentIndex = newIndex;
                updateDots();
            }
        });
        
        // Initialize
        createDots();
        
        // Recalculate on resize
        window.addEventListener('resize', function() {
            const newVisibleCards = Math.floor(methodsCarousel.offsetWidth / cardWidth);
            const newMaxIndex = Math.max(0, methodCards.length - newVisibleCards);
            if (newMaxIndex !== maxIndex) {
                createDots();
            }
        });
    }
    
    // ========================================
    // TAGS INTERACTION
    // ========================================
    
    const tags = document.querySelectorAll('.tag');
    
    tags.forEach(tag => {
        tag.addEventListener('click', function() {
            // Toggle active state (visual feedback only)
            this.classList.toggle('active');
            
            // Add subtle animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
    
    // ========================================
    // NEWSLETTER FORM
    // ========================================
    
    const newsletterForm = document.getElementById('newsletterForm');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('.email-input');
            const email = emailInput.value.trim();
            
            if (email && isValidEmail(email)) {
                // Show success feedback
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                
                submitBtn.textContent = 'Merci !';
                submitBtn.style.background = 'var(--color-sage)';
                submitBtn.style.color = 'white';
                submitBtn.disabled = true;
                
                emailInput.value = '';
                emailInput.placeholder = 'Inscription enregistrée';
                
                // Reset after delay
                setTimeout(() => {
                    submitBtn.textContent = originalText;
                    submitBtn.style.background = '';
                    submitBtn.style.color = '';
                    submitBtn.disabled = false;
                    emailInput.placeholder = 'Votre adresse email';
                }, 3000);
            } else {
                // Show error feedback
                emailInput.style.borderColor = '#e74c3c';
                emailInput.focus();
                
                setTimeout(() => {
                    emailInput.style.borderColor = '';
                }, 2000);
            }
        });
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    // ========================================
    // SEARCH BAR ANIMATION
    // ========================================
    
    const searchInput = document.querySelector('.search-input');
    
    if (searchInput) {
        const placeholders = [
            'Rechercher un symptôme...',
            'Mal de gorge...',
            'Tisane pour dormir...',
            'Remède contre la toux...',
            'Infusion digestive...'
        ];
        
        let placeholderIndex = 0;
        
        function cyclePlaceholder() {
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
            searchInput.placeholder = placeholders[placeholderIndex];
        }
        
        setInterval(cyclePlaceholder, 3000);
    }
    
    // ========================================
    // CARD HOVER EFFECTS
    // ========================================
    
    const cards = document.querySelectorAll('.method-card, .remedy-card, .feature-card, .wellness-card, .filter-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transition = 'all 0.3s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transition = 'all 0.3s ease';
        });
    });
    
    // ========================================
    // ONBOARDING MOCKUP INTERACTION
    // ========================================
    
    const onboardingOptions = document.querySelectorAll('.onboarding-option');
    
    onboardingOptions.forEach(option => {
        option.addEventListener('click', function() {
            // Remove selected from all
            onboardingOptions.forEach(opt => opt.classList.remove('selected'));
            // Add selected to clicked
            this.classList.add('selected');
        });
    });
    
    // ========================================
    // PARALLAX EFFECT (subtle)
    // ========================================
    
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual && window.innerWidth > 768) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * 0.3;
            
            if (scrolled < window.innerHeight) {
                heroVisual.style.transform = `translateY(${rate}px)`;
            }
        });
    }
    
    // ========================================
    // ACTIVE NAV LINK ON SCROLL
    // ========================================
    
    const sections = document.querySelectorAll('section[id]');
    
    function highlightNavLink() {
        const scrollPosition = window.scrollY + navbar.offsetHeight + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${sectionId}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }
    
    window.addEventListener('scroll', highlightNavLink);
    
    // ========================================
    // LAZY LOADING IMAGES
    // ========================================
    
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        lazyImages.forEach(img => imageObserver.observe(img));
    } else {
        // Fallback for older browsers
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
        });
    }
    
    // ========================================
    // BUTTON RIPPLE EFFECT
    // ========================================
    
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                background: rgba(255, 255, 255, 0.3);
                border-radius: 50%;
                pointer-events: none;
                width: 100px;
                height: 100px;
                left: ${x - 50}px;
                top: ${y - 50}px;
                transform: scale(0);
                animation: ripple 0.6s ease-out;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
    
    // Add ripple animation to stylesheet
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    // ========================================
    // SCROLL TO TOP (optional - hidden by default)
    // ========================================
    
    // Create scroll to top button
    const scrollTopBtn = document.createElement('button');
    scrollTopBtn.innerHTML = '↑';
    scrollTopBtn.className = 'scroll-top-btn';
    scrollTopBtn.setAttribute('aria-label', 'Retour en haut');
    scrollTopBtn.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: var(--color-bg-card);
        border: 1px solid var(--color-border);
        color: var(--color-text-secondary);
        font-size: 1.25rem;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 999;
    `;
    document.body.appendChild(scrollTopBtn);
    
    scrollTopBtn.addEventListener('click', function() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    scrollTopBtn.addEventListener('mouseenter', function() {
        this.style.background = 'var(--color-sage)';
        this.style.color = 'white';
        this.style.borderColor = 'var(--color-sage)';
    });
    
    scrollTopBtn.addEventListener('mouseleave', function() {
        this.style.background = 'var(--color-bg-card)';
        this.style.color = 'var(--color-text-secondary)';
        this.style.borderColor = 'var(--color-border)';
    });
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            scrollTopBtn.style.opacity = '1';
            scrollTopBtn.style.visibility = 'visible';
        } else {
            scrollTopBtn.style.opacity = '0';
            scrollTopBtn.style.visibility = 'hidden';
        }
    });
    
    // ========================================
    // EFFET TILT 3D SUR LES CARTES
    // ========================================
    
    const tiltCards = document.querySelectorAll('.remedy-card, .feature-card, .method-card, .wellness-card');
    
    tiltCards.forEach(card => {
        card.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;
            
            const rotateX = (y - centerY) / 10;
            const rotateY = (centerX - x) / 10;
            
            this.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            this.style.transition = 'transform 0.1s ease';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            this.style.transition = 'transform 0.5s ease';
        });
    });
    
    // ========================================
    // COMPTEURS ANIMÉS
    // ========================================
    
    function animateCounter(element, target, duration = 2000) {
        let start = 0;
        const increment = target / (duration / 16);
        const suffix = element.dataset.suffix || '';
        
        function updateCounter() {
            start += increment;
            if (start < target) {
                element.textContent = Math.floor(start) + suffix;
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target + suffix;
            }
        }
        updateCounter();
    }
    
    const counters = document.querySelectorAll('[data-counter]');
    const counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.counter);
                animateCounter(entry.target, target);
                counterObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => counterObserver.observe(counter));
    
    // ========================================
    // EFFET DE TEXTE TYPING
    // ========================================
    
    const typingElements = document.querySelectorAll('[data-typing]');
    
    typingElements.forEach(element => {
        const text = element.dataset.typing;
        element.textContent = '';
        let index = 0;
        
        function type() {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                setTimeout(type, 80);
            }
        }
        
        const typingObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                type();
                typingObserver.unobserve(element);
            }
        });
        typingObserver.observe(element);
    });
    
    // ========================================
    // PARTICULES FLOTTANTES (Hero)
    // ========================================
    
    function createFloatingParticles() {
        const hero = document.querySelector('.hero');
        if (!hero) return;
        
        const particlesContainer = document.createElement('div');
        particlesContainer.className = 'floating-particles';
        particlesContainer.style.cssText = `
            position: absolute;
            inset: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 1;
        `;
        hero.appendChild(particlesContainer);
        
        const emojis = ['🌿', '🍃', '🌱', '✨', '🌸', '🍀'];
        
        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('span');
            particle.textContent = emojis[Math.floor(Math.random() * emojis.length)];
            particle.style.cssText = `
                position: absolute;
                font-size: ${Math.random() * 20 + 12}px;
                left: ${Math.random() * 100}%;
                top: ${Math.random() * 100}%;
                opacity: ${Math.random() * 0.4 + 0.1};
                animation: floatParticle ${Math.random() * 10 + 10}s ease-in-out infinite;
                animation-delay: ${Math.random() * 5}s;
            `;
            particlesContainer.appendChild(particle);
        }
    }
    
    createFloatingParticles();
    
    // ========================================
    // CTA PULSANT & ATTENTION GRABBER
    // ========================================
    
    const ctaButtons = document.querySelectorAll('.cta-final-section .btn-primary, .hero-buttons .btn-primary');
    
    ctaButtons.forEach(btn => {
        // Ajouter effet de brillance
        const shine = document.createElement('span');
        shine.className = 'btn-shine';
        shine.style.cssText = `
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
            animation: btnShine 3s infinite;
        `;
        btn.style.position = 'relative';
        btn.style.overflow = 'hidden';
        btn.appendChild(shine);
    });
    
    // ========================================
    // SCROLL PROGRESS BAR
    // ========================================
    
    const progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    progressBar.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        height: 3px;
        background: linear-gradient(90deg, var(--color-sage), var(--color-gold));
        z-index: 10000;
        transition: width 0.1s ease;
        width: 0%;
    `;
    document.body.appendChild(progressBar);
    
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        progressBar.style.width = scrollPercent + '%';
    });
    
    // ========================================
    // EFFET MAGNETIC SUR LES BOUTONS CTA
    // ========================================
    
    const magneticBtns = document.querySelectorAll('.btn-primary');
    
    magneticBtns.forEach(btn => {
        btn.addEventListener('mousemove', function(e) {
            const rect = this.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            
            this.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });
        
        btn.addEventListener('mouseleave', function() {
            this.style.transform = 'translate(0, 0)';
        });
    });
    
    // ========================================
    // REVEAL ANIMATIONS AVANCÉES
    // ========================================
    
    const revealElements = document.querySelectorAll('.section-header, .remedy-card, .feature-card');
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }, index * 100);
            }
        });
    }, { threshold: 0.1 });
    
    revealElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        revealObserver.observe(el);
    });
    
    // ========================================
    // NOTIFICATION TOAST (Téléchargement)
    // ========================================
    
    function showDownloadToast() {
        const toast = document.createElement('div');
        toast.className = 'download-toast';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 24px;">📱</span>
                <div>
                    <strong>Téléchargez l'application</strong>
                    <p style="margin: 0; font-size: 13px; opacity: 0.8;">+500 remèdes naturels à portée de main</p>
                </div>
            </div>
            <button class="toast-close" style="background: none; border: none; color: white; cursor: pointer; font-size: 18px;">×</button>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            right: 30px;
            background: linear-gradient(135deg, var(--color-sage), #5a7a5a);
            color: white;
            padding: 16px 20px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.3);
            z-index: 9999;
            animation: slideInRight 0.5s ease, pulse 2s infinite 1s;
            cursor: pointer;
            max-width: 350px;
        `;
        
        document.body.appendChild(toast);
        
        toast.querySelector('.toast-close').addEventListener('click', (e) => {
            e.stopPropagation();
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        });
        
        toast.addEventListener('click', () => {
            document.querySelector('#cta-final')?.scrollIntoView({ behavior: 'smooth' });
            toast.remove();
        });
        
        // Auto-hide après 10 secondes
        setTimeout(() => {
            if (toast.parentNode) {
                toast.style.animation = 'slideOutRight 0.3s ease forwards';
                setTimeout(() => toast.remove(), 300);
            }
        }, 10000);
    }
    
    // Afficher le toast après 5 secondes de navigation
    setTimeout(showDownloadToast, 5000);
    
    // ========================================
    // MOUSE FOLLOWER (effet moderne)
    // ========================================
    
    if (window.innerWidth > 768) {
        const cursor = document.createElement('div');
        cursor.className = 'custom-cursor';
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            border: 2px solid var(--color-sage);
            border-radius: 50%;
            pointer-events: none;
            z-index: 99999;
            transition: transform 0.15s ease, width 0.2s, height 0.2s;
            transform: translate(-50%, -50%);
        `;
        document.body.appendChild(cursor);
        
        document.addEventListener('mousemove', (e) => {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
        });
        
        // Agrandir sur les éléments cliquables
        const clickables = document.querySelectorAll('a, button, .remedy-card, .feature-card');
        clickables.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursor.style.width = '40px';
                cursor.style.height = '40px';
                cursor.style.borderColor = 'var(--color-gold)';
            });
            el.addEventListener('mouseleave', () => {
                cursor.style.width = '20px';
                cursor.style.height = '20px';
                cursor.style.borderColor = 'var(--color-sage)';
            });
        });
    }
    
    // ========================================
    // ANIMATIONS CSS DYNAMIQUES
    // ========================================
    
    const dynamicStyles = document.createElement('style');
    dynamicStyles.textContent = `
        @keyframes floatParticle {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            25% { transform: translateY(-20px) rotate(5deg); }
            50% { transform: translateY(-10px) rotate(-5deg); }
            75% { transform: translateY(-25px) rotate(3deg); }
        }
        
        @keyframes btnShine {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
        }
        
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        
        @keyframes pulse {
            0%, 100% { box-shadow: 0 10px 40px rgba(0,0,0,0.3); }
            50% { box-shadow: 0 10px 40px rgba(124, 154, 124, 0.5); }
        }
        
        .remedy-card:hover, .feature-card:hover {
            box-shadow: 0 20px 60px rgba(124, 154, 124, 0.2) !important;
        }
        
        .btn-primary:hover {
            box-shadow: 0 10px 30px rgba(124, 154, 124, 0.4);
        }
    `;
    document.head.appendChild(dynamicStyles);
    
    // ========================================
    // CONSOLE WELCOME MESSAGE
    // ========================================
    
    console.log(
        '%c🌿 Savoirs de Grand-Mère',
        'font-size: 24px; font-weight: bold; color: #7c9a7c;'
    );
    console.log(
        '%cRemèdes traditionnels & naturels',
        'font-size: 14px; color: #9bb89b;'
    );
    console.log(
        '%c© 2026 - Tous droits réservés',
        'font-size: 12px; color: #7a8194;'
    );
    
});

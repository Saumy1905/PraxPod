// assets/js/main.js
(function() {
  const root = document.documentElement;
  const body = document.body;
  const THEME_KEY = 'praxpod-theme';
  const toggleBtn = document.getElementById('theme-toggle');
  const menuToggle = document.getElementById('menu-toggle');
  const nav = document.getElementById('site-nav');

  // Update toggle button icon based on current theme
  function updateThemeToggleIcon() {
    if (!toggleBtn) return;
    
    const isDarkTheme = root.classList.contains('dark-theme');
    toggleBtn.innerHTML = isDarkTheme ? 
      '<i class="fas fa-sun"></i>' : 
      '<i class="fas fa-moon"></i>';
    toggleBtn.setAttribute('aria-label', isDarkTheme ? 'Switch to light theme' : 'Switch to dark theme');
  }

  // Set initial icon state
  updateThemeToggleIcon();

  // Toggle theme
  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      // Toggle classes on both root and body elements
      root.classList.toggle('dark-theme');
      body.classList.toggle('dark-theme');
      
      // Store preference
      const isDarkTheme = root.classList.contains('dark-theme');
      localStorage.setItem(THEME_KEY, isDarkTheme ? 'dark' : 'light');
      
      // Update the toggle button icon
      updateThemeToggleIcon();
    });
  }

  // Menu toggle
  if (menuToggle && nav) {
    menuToggle.addEventListener('click', () => {
      nav.classList.toggle('active');
    });
  }

  // ===== ENHANCED CARD INTERACTIONS =====

  // Ripple effect for buttons and cards
  function createRipple(event) {
    const button = event.currentTarget;
    const circle = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const rect = button.getBoundingClientRect();
    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${event.clientX - rect.left - radius}px`;
    circle.style.top = `${event.clientY - rect.top - radius}px`;
    circle.classList.add('ripple');

    const ripple = button.getElementsByClassName('ripple')[0];
    if (ripple) {
      ripple.remove();
    }

    button.appendChild(circle);

    // Remove ripple after animation
    setTimeout(() => {
      circle.remove();
    }, 600);
  }

  // Add ripple effect to buttons and interactive elements
  function initRippleEffects() {
    const rippleElements = document.querySelectorAll('.btn, .btn-view, .btn-primary, .btn-secondary, .btn-action, .filter-btn, .pdf-card, .college-card, .branch-card, .semester-card, .subject-card');
    
    rippleElements.forEach(element => {
      element.addEventListener('click', createRipple);
    });
  }

  // 3D Tilt effect for cards
  function initCardTiltEffects() {
    const cards = document.querySelectorAll('.pdf-card, .college-card, .branch-card, .semester-card, .subject-card');
    
    cards.forEach(card => {
      card.addEventListener('mousemove', handleMouseMove);
      card.addEventListener('mouseleave', handleMouseLeave);
    });
  }

  function handleMouseMove(e) {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  }

  function handleMouseLeave(e) {
    const card = e.currentTarget;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  }

  // Animate cards on scroll
  function initScrollAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger the animation for multiple cards
          setTimeout(() => {
            entry.target.classList.add('animate-in');
            entry.target.classList.add('card-slide-in');
          }, index * 100);
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '50px'
    });

    const animateElements = document.querySelectorAll('.pdf-card, .college-card, .branch-card, .semester-card, .subject-card');
    animateElements.forEach(element => {
      element.classList.add('animate-on-scroll');
      observer.observe(element);
    });
  }

  // Enhanced button hover effects
  function initButtonEffects() {
    const buttons = document.querySelectorAll('.btn-view, .btn-primary, .btn-secondary');
    
    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
      });
    });
  }

  // Performance optimized card animations
  function optimizeAnimations() {
    // Reduce motion for users who prefer it
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const style = document.createElement('style');
      style.textContent = `
        *, *::before, *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
      `;
      document.head.appendChild(style);
      return;
    }

    // Enable hardware acceleration for better performance
    const cards = document.querySelectorAll('.pdf-card, .college-card, .branch-card, .semester-card, .subject-card');
    cards.forEach(card => {
      card.style.willChange = 'transform';
    });
  }

  // Initialize all enhancements
  function initEnhancements() {
    // Wait for DOM to be fully loaded
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initRippleEffects();
        initCardTiltEffects();
        initScrollAnimations();
        initButtonEffects();
        optimizeAnimations();
      });
    } else {
      initRippleEffects();
      initCardTiltEffects();
      initScrollAnimations();
      initButtonEffects();
      optimizeAnimations();
    }
  }

  // Start enhancements
  initEnhancements();

  // Debounced resize handler for performance
  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      // Reinitialize effects on resize if needed
      initCardTiltEffects();
    }, 250);
  });

})();

// Theme Management
class ThemeManager {
  constructor() {
    this.theme = localStorage.getItem("theme") || "light";
    this.themeToggle = document.getElementById("themeToggle");
    this.init();
  }

  init() {
    this.setTheme(this.theme);
    this.themeToggle.addEventListener("click", () => this.toggleTheme());

    // Update icon based on current theme
    this.updateThemeIcon();
  }

  setTheme(theme) {
    this.theme = theme;
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
    this.updateThemeIcon();
  }

  toggleTheme() {
    const newTheme = this.theme === "light" ? "dark" : "light";
    this.setTheme(newTheme);

    // Add a fun animation
    this.themeToggle.style.transform = "rotate(360deg)";
    setTimeout(() => {
      this.themeToggle.style.transform = "";
    }, 300);
  }

  updateThemeIcon() {
    const icon = this.themeToggle.querySelector("i");
    if (this.theme === "dark") {
      icon.className = "fas fa-sun";
    } else {
      icon.className = "fas fa-moon";
    }
  }
}

// Navigation Management
class NavigationManager {
  constructor() {
    this.navbar = document.getElementById("navbar");
    this.navMenu = document.getElementById("navMenu");
    this.hamburger = document.getElementById("hamburger");
    this.navLinks = document.querySelectorAll(".nav-link");
    this.sections = document.querySelectorAll("section[id]");
    this.scrollDots = document.querySelectorAll(".scroll-dot");
    this.isScrolling = false;
    this.scrollTimeout = null;

    this.init();
  }

  init() {
    // Handle scroll effects
    window.addEventListener("scroll", () => this.handleScroll());

    // Handle mobile menu
    this.hamburger.addEventListener("click", () => this.toggleMobileMenu());

    // Handle nav link clicks
    this.navLinks.forEach((link) => {
      link.addEventListener("click", (e) => this.handleNavClick(e));
    });

    // Handle scroll dot clicks
    this.scrollDots.forEach((dot) => {
      dot.addEventListener("click", (e) => this.handleDotClick(e));
    });

    // Close mobile menu when clicking outside
    document.addEventListener("click", (e) => this.handleOutsideClick(e));

    // Handle resize
    window.addEventListener("resize", () => this.handleResize());

    // Add enhanced scroll snapping
    this.setupScrollSnapping();

    // Initial scroll position check
    this.handleScroll();
  }

  handleScroll() {
    const scrollTop = window.pageYOffset;

    // Add scrolled class to navbar
    if (scrollTop > 100) {
      this.navbar.classList.add("scrolled");
    } else {
      this.navbar.classList.remove("scrolled");
    }

    // Update active navigation link
    this.updateActiveNavLink();
  }

  updateActiveNavLink() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;

    this.sections.forEach((section) => {
      const sectionTop = section.offsetTop - 100;
      const sectionBottom = sectionTop + section.offsetHeight;
      const sectionId = section.getAttribute("id");
      const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
      const scrollDot = document.querySelector(
        `.scroll-dot[data-section="${sectionId}"]`
      );

      if (scrollTop >= sectionTop && scrollTop < sectionBottom) {
        // Update nav links
        this.navLinks.forEach((link) => link.classList.remove("active"));
        if (navLink) {
          navLink.classList.add("active");
        }

        // Update scroll dots
        this.scrollDots.forEach((dot) => dot.classList.remove("active"));
        if (scrollDot) {
          scrollDot.classList.add("active");
        }
      }
    });
  }

  toggleMobileMenu() {
    this.hamburger.classList.toggle("active");
    this.navMenu.classList.toggle("active");

    // Prevent body scroll when menu is open
    if (this.navMenu.classList.contains("active")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }

  handleNavClick(e) {
    e.preventDefault();
    const targetId = e.target.getAttribute("href");
    const targetSection = document.querySelector(targetId);

    if (targetSection) {
      const offsetTop = targetSection.offsetTop - 80;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });

      // Close mobile menu if open
      if (this.navMenu.classList.contains("active")) {
        this.toggleMobileMenu();
      }
    }
  }

  handleOutsideClick(e) {
    if (
      !this.navbar.contains(e.target) &&
      this.navMenu.classList.contains("active")
    ) {
      this.toggleMobileMenu();
    }
  }

  handleDotClick(e) {
    const sectionId = e.target.getAttribute("data-section");
    const targetSection = document.getElementById(sectionId);

    if (targetSection) {
      const offsetTop = targetSection.offsetTop;

      window.scrollTo({
        top: offsetTop,
        behavior: "smooth",
      });
    }
  }

  handleResize() {
    // Close mobile menu on desktop resize
    if (window.innerWidth > 768 && this.navMenu.classList.contains("active")) {
      this.toggleMobileMenu();
    }
  }

  setupScrollSnapping() {
    let isScrolling = false;
    let scrollTimer = null;

    // Enhanced scroll snapping with content-aware logic
    window.addEventListener(
      "wheel",
      (e) => {
        // Only apply enhanced snapping on desktop
        if (window.innerWidth <= 768) return;

        const currentScrollTop = window.pageYOffset;
        const windowHeight = window.innerHeight;
        const delta = e.deltaY;
        const scrollDirection = delta > 0 ? "down" : "up";

        // Find current section and its boundaries
        let currentSection = null;
        let currentSectionIndex = 0;

        this.sections.forEach((section, index) => {
          const sectionTop = section.offsetTop;
          const sectionBottom = sectionTop + section.offsetHeight;

          if (
            currentScrollTop >= sectionTop - 100 &&
            currentScrollTop < sectionBottom - 100
          ) {
            currentSection = section;
            currentSectionIndex = index;
          }
        });

        if (!currentSection) return;

        const sectionTop = currentSection.offsetTop;
        const sectionHeight = currentSection.offsetHeight;
        const viewportHeight = window.innerHeight;

        // Calculate section scroll boundaries more intelligently
        const sectionScrollProgress = Math.max(
          0,
          currentScrollTop - sectionTop
        );
        const sectionBottom = sectionTop + sectionHeight;
        const viewportBottom = currentScrollTop + viewportHeight;

        // For sections shorter than viewport, use different logic
        const isShortSection = sectionHeight <= viewportHeight;

        let isAtSectionTop, isAtSectionBottom;

        if (isShortSection) {
          // For short sections, check if we're near the actual section boundaries
          const distanceFromSectionTop = Math.abs(
            currentScrollTop - sectionTop
          );
          const distanceFromSectionBottom = Math.abs(
            viewportBottom - sectionBottom
          );

          isAtSectionTop = distanceFromSectionTop <= 100;
          isAtSectionBottom = distanceFromSectionBottom <= 100;
        } else {
          // For tall sections, use scrollable area logic
          const scrollableHeight = sectionHeight - viewportHeight;
          isAtSectionTop = sectionScrollProgress <= 50;
          isAtSectionBottom = sectionScrollProgress >= scrollableHeight - 50;
        }

        // Only snap if we're at the boundaries of the section
        let shouldSnap = false;
        let targetSection = null;

        if (scrollDirection === "down") {
          // Scrolling down: only snap if we're at the bottom of current section
          if (
            isAtSectionBottom &&
            currentSectionIndex < this.sections.length - 1
          ) {
            shouldSnap = true;
            targetSection = this.sections[currentSectionIndex + 1];
          }
        } else if (scrollDirection === "up") {
          // Scrolling up: only snap if we're at the top of current section
          if (isAtSectionTop && currentSectionIndex > 0) {
            shouldSnap = true;
            targetSection = this.sections[currentSectionIndex - 1];

            // For upward scroll, go to the bottom of the previous section if it's tall
            const prevSectionHeight = targetSection.offsetHeight;
            if (prevSectionHeight > viewportHeight) {
              const targetScrollTop =
                targetSection.offsetTop + prevSectionHeight - viewportHeight;
              e.preventDefault();
              isScrolling = true;

              window.scrollTo({
                top: targetScrollTop,
                behavior: "smooth",
              });

              scrollTimer = setTimeout(() => {
                isScrolling = false;
              }, 1000);
              return;
            }
          }
        }

        // Apply snapping if conditions are met
        if (shouldSnap && targetSection && !isScrolling) {
          e.preventDefault();
          isScrolling = true;

          const targetTop = targetSection.offsetTop;

          window.scrollTo({
            top: targetTop,
            behavior: "smooth",
          });

          // Reset scrolling flag after animation completes
          scrollTimer = setTimeout(() => {
            isScrolling = false;
          }, 1000);
        }
      },
      { passive: false }
    );

    // Handle touch scrolling for mobile
    let touchStartY = 0;
    let touchEndY = 0;

    window.addEventListener(
      "touchstart",
      (e) => {
        touchStartY = e.changedTouches[0].screenY;
      },
      { passive: true }
    );

    window.addEventListener(
      "touchend",
      (e) => {
        touchEndY = e.changedTouches[0].screenY;
        const touchDelta = touchStartY - touchEndY;

        // Only trigger on significant swipes (increased threshold for mobile)
        if (Math.abs(touchDelta) > 100) {
          const currentScrollTop = window.pageYOffset;
          const viewportHeight = window.innerHeight;

          // Find current section
          let currentSection = null;
          let currentSectionIndex = 0;

          this.sections.forEach((section, index) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (
              currentScrollTop >= sectionTop - 100 &&
              currentScrollTop < sectionBottom - 100
            ) {
              currentSection = section;
              currentSectionIndex = index;
            }
          });

          if (!currentSection) return;

          const sectionTop = currentSection.offsetTop;
          const sectionHeight = currentSection.offsetHeight;
          const sectionScrollProgress = Math.max(
            0,
            currentScrollTop - sectionTop
          );
          const sectionBottom = sectionTop + sectionHeight;
          const viewportBottom = currentScrollTop + viewportHeight;

          // For sections shorter than viewport, use different logic
          const isShortSection = sectionHeight <= viewportHeight;

          let isAtSectionTop, isAtSectionBottom;

          if (isShortSection) {
            // For short sections, check if we're near the actual section boundaries
            const distanceFromSectionTop = Math.abs(
              currentScrollTop - sectionTop
            );
            const distanceFromSectionBottom = Math.abs(
              viewportBottom - sectionBottom
            );

            isAtSectionTop = distanceFromSectionTop <= 150;
            isAtSectionBottom = distanceFromSectionBottom <= 150;
          } else {
            // For tall sections, use scrollable area logic
            const scrollableHeight = sectionHeight - viewportHeight;
            isAtSectionTop = sectionScrollProgress <= 100;
            isAtSectionBottom = sectionScrollProgress >= scrollableHeight - 100;
          }

          // Determine target section with boundary checks
          let targetSection;
          if (
            touchDelta > 0 &&
            isAtSectionBottom &&
            currentSectionIndex < this.sections.length - 1
          ) {
            // Swiping up (scrolling down) - only if at bottom of section
            targetSection = this.sections[currentSectionIndex + 1];
          } else if (
            touchDelta < 0 &&
            isAtSectionTop &&
            currentSectionIndex > 0
          ) {
            // Swiping down (scrolling up) - only if at top of section
            targetSection = this.sections[currentSectionIndex - 1];
          }

          if (targetSection) {
            const targetTop = targetSection.offsetTop;

            window.scrollTo({
              top: targetTop,
              behavior: "smooth",
            });
          }
        }
      },
      { passive: true }
    );
  }
}

// Animation Manager
class AnimationManager {
  constructor() {
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.setupLoadingAnimations();
    this.setupParallaxEffects();
    this.setupHoverEffects();
  }

  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("loaded");

          // Add stagger delay for grid items
          if (
            entry.target.classList.contains("skill-card") ||
            entry.target.classList.contains("project-card") ||
            entry.target.classList.contains("stat-card")
          ) {
            const siblings = Array.from(entry.target.parentElement.children);
            const index = siblings.indexOf(entry.target);
            entry.target.style.transitionDelay = `${index * 0.1}s`;
          }
        }
      });
    }, this.observerOptions);

    // Observe all animatable elements
    const animatableElements = document.querySelectorAll(`
            .skill-card, .project-card, .stat-card, .contact-card, .webinar-card,
            .timeline-item, .section-header, .about-text
        `);

    animatableElements.forEach((el) => {
      el.classList.add("loading");
      observer.observe(el);
    });
  }

  setupLoadingAnimations() {
    // Add loading class to elements that should animate in
    const elementsToAnimate = document.querySelectorAll(`
            .hero-content, .profile-card
        `);

    elementsToAnimate.forEach((el) => {
      el.classList.add("loading");
    });

    // Trigger animations after page load
    window.addEventListener("load", () => {
      setTimeout(() => {
        elementsToAnimate.forEach((el) => {
          el.classList.add("loaded");
        });
      }, 300);
    });
  }

  setupParallaxEffects() {
    const heroShapes = document.querySelectorAll(".shape");

    window.addEventListener("scroll", () => {
      const scrollTop = window.pageYOffset;
      const rate = scrollTop * -0.5;

      heroShapes.forEach((shape, index) => {
        const speed = (index + 1) * 0.2;
        shape.style.transform = `translateY(${rate * speed}px) rotate(${
          scrollTop * 0.1
        }deg)`;
      });
    });
  }

  setupHoverEffects() {
    // Add magnetic effect to buttons
    const buttons = document.querySelectorAll(".btn");

    buttons.forEach((button) => {
      button.addEventListener("mouseenter", (e) => {
        e.target.style.transform = "translateY(-2px) scale(1.05)";
      });

      button.addEventListener("mouseleave", (e) => {
        e.target.style.transform = "";
      });
    });

    // Add tilt effect to cards
    const cards = document.querySelectorAll(
      ".skill-card, .project-card, .contact-card"
    );

    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
      });

      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }
}

// Utility Functions
class Utils {
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  static throttle(func, limit) {
    let inThrottle;
    return function () {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  static smoothScrollTo(target, duration = 1000) {
    const targetPosition = target.offsetTop - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    let startTime = null;

    function animation(currentTime) {
      if (startTime === null) startTime = currentTime;
      const timeElapsed = currentTime - startTime;
      const run = Utils.easeInOutQuad(
        timeElapsed,
        startPosition,
        distance,
        duration
      );
      window.scrollTo(0, run);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    }

    function easeInOutQuad(t, b, c, d) {
      t /= d / 2;
      if (t < 1) return (c / 2) * t * t + b;
      t--;
      return (-c / 2) * (t * (t - 2) - 1) + b;
    }

    requestAnimationFrame(animation);
  }
}

// Performance Manager
class PerformanceManager {
  constructor() {
    this.init();
  }

  init() {
    this.optimizeScrollEvents();
    this.lazyLoadImages();
    this.preloadCriticalResources();
  }

  optimizeScrollEvents() {
    // Throttle scroll events for better performance
    const throttledScroll = Utils.throttle(() => {
      // Scroll-dependent animations go here
    }, 16); // ~60fps

    window.addEventListener("scroll", throttledScroll, { passive: true });
  }

  lazyLoadImages() {
    // Lazy load images when they come into view
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute("data-src");
            imageObserver.unobserve(img);
          }
        }
      });
    });

    document.querySelectorAll("img[data-src]").forEach((img) => {
      imageObserver.observe(img);
    });
  }

  preloadCriticalResources() {
    // Preload important assets
    const criticalAssets = [
      // Add any critical images or fonts here
    ];

    criticalAssets.forEach((asset) => {
      const link = document.createElement("link");
      link.rel = "preload";
      link.href = asset.url;
      link.as = asset.type;
      document.head.appendChild(link);
    });
  }
}

// Contact Form Handler (if needed in the future)
class ContactManager {
  constructor() {
    this.init();
  }

  init() {
    // Add contact form functionality here if needed
    this.setupContactLinks();
  }

  setupContactLinks() {
    // Add analytics tracking to contact links
    const contactLinks = document.querySelectorAll(
      'a[href^="mailto:"], a[href^="https://github.com"], a[href^="https://linkedin.com"]'
    );

    contactLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        const linkType = this.getLinkType(link.href);
        console.log(`Contact link clicked: ${linkType}`);

        // Add analytics tracking here if needed
        // gtag('event', 'contact_click', { method: linkType });
      });
    });
  }

  getLinkType(href) {
    if (href.includes("mailto:")) return "email";
    if (href.includes("github.com")) return "github";
    if (href.includes("linkedin.com")) return "linkedin";
    if (href.includes("twitter.com")) return "twitter";
    return "other";
  }
}

// Easter Eggs and Fun Features
class EasterEggs {
  constructor() {
    this.konamiCode = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65]; // Up, Up, Down, Down, Left, Right, Left, Right, B, A
    this.konamiIndex = 0;
    this.init();
  }

  init() {
    this.setupKonamiCode();
    this.setupClickCounters();
    this.setupSecretMessages();
  }

  setupKonamiCode() {
    document.addEventListener("keydown", (e) => {
      if (e.keyCode === this.konamiCode[this.konamiIndex]) {
        this.konamiIndex++;
        if (this.konamiIndex === this.konamiCode.length) {
          this.activateKonamiCode();
          this.konamiIndex = 0;
        }
      } else {
        this.konamiIndex = 0;
      }
    });
  }

  activateKonamiCode() {
    // Fun easter egg when Konami code is entered
    document.body.style.animation = "rainbow 2s infinite";

    // Add rainbow animation
    const style = document.createElement("style");
    style.textContent = `
            @keyframes rainbow {
                0% { filter: hue-rotate(0deg); }
                100% { filter: hue-rotate(360deg); }
            }
        `;
    document.head.appendChild(style);

    // Remove after 5 seconds
    setTimeout(() => {
      document.body.style.animation = "";
      document.head.removeChild(style);
    }, 5000);

    console.log("🎉 Konami Code activated! You found the easter egg!");
  }

  setupClickCounters() {
    let logoClicks = 0;
    const logo = document.querySelector(".nav-logo");

    logo.addEventListener("click", (e) => {
      e.preventDefault();
      logoClicks++;

      if (logoClicks === 10) {
        this.showSecretMessage("🚀 You really like clicking that logo!");
        logoClicks = 0;
      }
    });
  }

  setupSecretMessages() {
    // Console message for developers
    console.log(`
        🚀 Hey there, fellow developer!
        
        Thanks for checking out the console. 
        This portfolio was built with vanilla JavaScript, 
        modern CSS, and lots of coffee ☕
        
        Want to connect? Find me on:
        - GitHub: https://github.com/Shreyas281299
        - LinkedIn: https://linkedin.com/in/shreyas-sharma
        
        Keep coding! 💻
        `);
  }

  showSecretMessage(message) {
    // Create a temporary notification
    const notification = document.createElement("div");
    notification.textContent = message;
    notification.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--primary-color);
            color: white;
            padding: 1rem 2rem;
            border-radius: 0.5rem;
            z-index: 9999;
            font-weight: 600;
            box-shadow: var(--shadow-xl);
            animation: fadeInOut 3s ease-in-out;
        `;

    // Add animation
    const style = document.createElement("style");
    style.textContent = `
            @keyframes fadeInOut {
                0%, 100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
                20%, 80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
            }
        `;
    document.head.appendChild(style);

    document.body.appendChild(notification);

    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 3000);
  }
}

// Initialize everything when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize all managers
  new ThemeManager();
  new NavigationManager();
  new AnimationManager();
  new PerformanceManager();
  new ContactManager();
  new EasterEggs();

  // Add loading complete class to body
  window.addEventListener("load", () => {
    document.body.classList.add("loaded");
  });

  // Handle page visibility changes for performance
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      // Pause animations when tab is not visible
      document.body.style.animationPlayState = "paused";
    } else {
      // Resume animations when tab becomes visible
      document.body.style.animationPlayState = "running";
    }
  });

  // Add smooth scrolling to all anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        Utils.smoothScrollTo(target);
      }
    });
  });

  console.log("🎉 Portfolio loaded successfully!");
});

// Handle errors gracefully
window.addEventListener("error", (e) => {
  console.error("An error occurred:", e.error);
  // You could add error reporting here
});

// Service Worker registration (for future PWA features)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Uncomment when you add a service worker
    // navigator.serviceWorker.register('/sw.js')
    //     .then(registration => console.log('SW registered'))
    //     .catch(registrationError => console.log('SW registration failed'));
  });
}

/**
 * مركز الأمجاد للغات والتدريب
 * Main JavaScript File
 * Version: 2.0.0
 */

'use strict';

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Debounce function - Limits how often a function can execute
 */
function debounce(func, delay) {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func.apply(this, args), delay);
  };
}

/**
 * Throttle function - Ensures function runs at most once in a time period
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Check if element is visible in viewport
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0
  );
}

/**
 * Smooth scroll to element
 */
function smoothScrollTo(element) {
  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Add class to element if not exists
 */
function addClass(element, className) {
  if (element && !element.classList.contains(className)) {
    element.classList.add(className);
  }
}

/**
 * Remove class from element
 */
function removeClass(element, className) {
  if (element && element.classList.contains(className)) {
    element.classList.remove(className);
  }
}

/**
 * Toggle class on element
 */
function toggleClass(element, className) {
  if (element) {
    element.classList.toggle(className);
  }
}

// ============================================
// SCROLL ANIMATIONS
// ============================================

class ScrollAnimator {
  constructor() {
    this.elements = document.querySelectorAll('[data-scroll-animate]');
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateElement(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, this.observerOptions);

      this.elements.forEach((element) => observer.observe(element));
    } else {
      // Fallback for older browsers
      this.elements.forEach((element) => this.animateElement(element));
    }
  }

  animateElement(element) {
    const animation = element.getAttribute('data-scroll-animate');
    addClass(element, `animate-${animation}`);
    addClass(element, 'visible');
  }
}

// ============================================
// COUNTER ANIMATION
// ============================================

class CounterAnimator {
  constructor() {
    this.counters = document.querySelectorAll('[data-counter]');
    this.observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -50px 0px'
    };
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !entry.target.classList.contains('counted')) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, this.observerOptions);

      this.counters.forEach((counter) => observer.observe(counter));
    }
  }

  animateCounter(element) {
    const target = parseInt(element.getAttribute('data-counter'), 10);
    const duration = parseInt(element.getAttribute('data-duration') || '2000', 10);
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        addClass(element, 'counted');
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================

class Modal {
  constructor(modalId) {
    this.modal = document.getElementById(modalId);
    this.closeBtn = this.modal?.querySelector('[data-close-modal]');
    this.overlay = this.modal;
    this.init();
  }

  init() {
    if (!this.modal) return;

    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }

    this.overlay?.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close();
      }
    });

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close();
      }
    });
  }

  open() {
    if (!this.modal) return;
    addClass(this.modal, 'active');
    document.body.style.overflow = 'hidden';
  }

  close() {
    if (!this.modal) return;
    removeClass(this.modal, 'active');
    document.body.style.overflow = '';
  }

  isOpen() {
    return this.modal?.classList.contains('active');
  }

  toggle() {
    this.isOpen() ? this.close() : this.open();
  }
}

// ============================================
// FORM HANDLING
// ============================================

class FormHandler {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    this.fields = this.form?.querySelectorAll('input, textarea, select');
    this.submitBtn = this.form?.querySelector('button[type="submit"]');
    this.init();
  }

  init() {
    if (!this.form) return;

    this.form.addEventListener('submit', (e) => this.handleSubmit(e));

    this.fields?.forEach((field) => {
      field.addEventListener('blur', () => this.validateField(field));
      field.addEventListener('input', () => this.clearError(field));
    });
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.validate()) {
      this.submit();
    }
  }

  validate() {
    let isValid = true;

    this.fields?.forEach((field) => {
      if (!this.validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    const required = field.hasAttribute('required');

    if (required && !value) {
      this.showError(field, 'هذا الحقل مطلوب');
      return false;
    }

    if (type === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        this.showError(field, 'البريد الإلكتروني غير صحيح');
        return false;
      }
    }

    if (type === 'tel' && value) {
      const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;
      if (!phoneRegex.test(value)) {
        this.showError(field, 'رقم الهاتف غير صحيح');
        return false;
      }
    }

    this.clearError(field);
    return true;
  }

  showError(field, message) {
    addClass(field, 'error');
    let errorElement = field.nextElementSibling;

    if (!errorElement?.classList.contains('error-message')) {
      errorElement = document.createElement('span');
      errorElement.className = 'error-message';
      field.parentNode.insertBefore(errorElement, field.nextSibling);
    }

    errorElement.textContent = message;
  }

  clearError(field) {
    removeClass(field, 'error');
    const errorElement = field.nextElementSibling;
    if (errorElement?.classList.contains('error-message')) {
      errorElement.remove();
    }
  }

  submit() {
    if (this.submitBtn) {
      this.submitBtn.disabled = true;
      this.submitBtn.textContent = 'جاري الإرسال...';
    }

    const formData = new FormData(this.form);

    // Send to server or WhatsApp
    setTimeout(() => {
      this.form.reset();
      if (this.submitBtn) {
        this.submitBtn.disabled = false;
        this.submitBtn.textContent = 'إرسال';
      }
      alert('تم إرسال نموذجك بنجاح!');
    }, 1500);
  }
}

// ============================================
// MOBILE MENU
// ============================================

class MobileMenu {
  constructor() {
    this.menuToggle = document.querySelector('[data-menu-toggle]');
    this.navMenu = document.querySelector('[data-nav-menu]');
    this.navLinks = this.navMenu?.querySelectorAll('a');
    this.init();
  }

  init() {
    if (!this.menuToggle || !this.navMenu) return;

    this.menuToggle.addEventListener('click', () => this.toggle());

    this.navLinks?.forEach((link) => {
      link.addEventListener('click', () => this.close());
    });

    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (!this.menuToggle.contains(e.target) && !this.navMenu.contains(e.target)) {
        this.close();
      }
    });
  }

  toggle() {
    toggleClass(this.navMenu, 'active');
    toggleClass(this.menuToggle, 'active');
  }

  open() {
    addClass(this.navMenu, 'active');
    addClass(this.menuToggle, 'active');
  }

  close() {
    removeClass(this.navMenu, 'active');
    removeClass(this.menuToggle, 'active');
  }
}

// ============================================
// BACK TO TOP BUTTON
// ============================================

class BackToTop {
  constructor() {
    this.button = document.querySelector('[data-back-to-top]');
    this.threshold = 300;
    this.init();
  }

  init() {
    if (!this.button) return;

    window.addEventListener('scroll', throttle(() => this.toggleVisibility(), 300));
    this.button.addEventListener('click', () => this.scrollToTop());
  }

  toggleVisibility() {
    if (window.scrollY > this.threshold) {
      addClass(this.button, 'show');
    } else {
      removeClass(this.button, 'show');
    }
  }

  scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize scroll animations
  new ScrollAnimator();

  // Initialize counters
  new CounterAnimator();

  // Initialize mobile menu
  new MobileMenu();

  // Initialize back to top button
  new BackToTop();

  // Initialize modals
  const contactModal = new Modal('contactModal');
  const registrationModal = new Modal('registrationModal');

  // Setup modal triggers
  document.querySelectorAll('[data-open-contact-modal]').forEach((btn) => {
    btn.addEventListener('click', () => contactModal.open());
  });

  document.querySelectorAll('[data-open-registration-modal]').forEach((btn) => {
    btn.addEventListener('click', () => registrationModal.open());
  });

  // Initialize forms
  new FormHandler('form[data-contact-form]');
  new FormHandler('form[data-registration-form]');
});

// ============================================
// LAZY LOADING IMAGES
// ============================================

if ('IntersectionObserver' in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.add('loaded');
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll('img[data-src]').forEach((img) => {
    imageObserver.observe(img);
  });
}

// ============================================
// ANALYTICS & TRACKING
// ============================================

function trackEvent(eventName, eventData = {}) {
  if (window.gtag) {
    gtag('event', eventName, eventData);
  }
  console.log(`Event tracked: ${eventName}`, eventData);
}

// Track link clicks
document.addEventListener('click', (e) => {
  const link = e.target.closest('a[href]');
  if (link && link.hostname !== window.location.hostname) {
    trackEvent('external_link_click', {
      link_url: link.href,
      link_text: link.textContent
    });
  }
});

// ============================================
// EXPORT FUNCTIONS
// ============================================

window.ALC = {
  Modal,
  FormHandler,
  MobileMenu,
  ScrollAnimator,
  CounterAnimator,
  BackToTop,
  debounce,
  throttle,
  isElementInViewport,
  smoothScrollTo,
  trackEvent
};

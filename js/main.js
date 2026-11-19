/**
 * Hope & Vitality - مبادرة نبض الأمل لأطفال الغسيل الكلوي
 * Main JavaScript (JS)
 * Handles all interactivity, state management, modals, and dynamic calculations.
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initDonationWidget();
  initCalculator();
  initStoriesFilter();
  initModals();
  initNewsletter();
  initCounters();
});

/* ==========================================================================
   1. State Management
   ========================================================================== */
const appState = {
  selectedAmount: 250,
  frequency: 'once', // 'once' | 'monthly'
  beneficiary: 'عام - الصندوق المشترك',
  childId: null,
  paymentMethod: 'apple-pay',
  calcAmount: 1000
};

/* ==========================================================================
   2. Navigation & Mobile Drawer
   ========================================================================== */
function initNavigation() {
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const closeMobileMenuBtn = document.getElementById('closeMobileMenuBtn');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');
  const desktopNavLinks = document.querySelectorAll('.nav-link');

  // Toggle mobile drawer
  if (mobileMenuBtn && mobileDrawer) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileDrawer.classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  const closeDrawer = () => {
    if (mobileDrawer) {
      mobileDrawer.classList.remove('open');
      document.body.style.overflow = '';
    }
  };

  if (closeMobileMenuBtn) {
    closeMobileMenuBtn.addEventListener('click', closeDrawer);
  }

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  // Active navigation tracking on scroll
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    let currentSectionId = '';
    const scrollY = window.pageYOffset;

    sections.forEach(section => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
      }
    });

    if (currentSectionId) {
      desktopNavLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSectionId}`) {
          link.classList.add('active');
        }
      });
    }
  });

  // Language switch button
  const langButtons = document.querySelectorAll('.lang-toggle-btn');
  langButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      showToast('الموقع متوفر باللغة العربية حالياً. سيتم إطلاق النسخة الإنجليزية قريباً!', 'warning');
    });
  });
}

/* ==========================================================================
   3. Quick Donation Widget (Hero Section)
   ========================================================================== */
function initDonationWidget() {
  const donationCards = document.querySelectorAll('.donation-card');
  const customAmountInput = document.getElementById('customAmountInput');
  const freqButtons = document.querySelectorAll('.freq-toggle-btn');
  const quickDonateBtn = document.getElementById('heroQuickDonateBtn');

  // Frequency switch (مرة واحدة / كفالة دورية)
  freqButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      freqButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      appState.frequency = btn.dataset.freq;
      
      const freqLabel = appState.frequency === 'monthly' ? 'شهرياً' : 'لمرة واحدة';
      showToast(`تم تعيين نوع التبرع إلى: ${freqLabel}`, 'success');
    });
  });

  // Preset Cards Selection
  donationCards.forEach(card => {
    card.addEventListener('click', () => {
      donationCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      const amount = parseInt(card.dataset.amount, 10);
      appState.selectedAmount = amount;
      if (customAmountInput) {
        customAmountInput.value = '';
      }
    });
  });

  // Custom Amount Input
  if (customAmountInput) {
    customAmountInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (val && val > 0) {
        donationCards.forEach(c => c.classList.remove('active'));
        appState.selectedAmount = val;
      }
    });
  }

  // Quick donate button action
  if (quickDonateBtn) {
    quickDonateBtn.addEventListener('click', () => {
      openDonationModal({
        amount: appState.selectedAmount,
        frequency: appState.frequency,
        beneficiary: 'صندوق الأمل الفوري العام'
      });
    });
  }
}

// Global helper to select donation card from inline html if needed
window.selectDonation = function(amount, element) {
  const cards = document.querySelectorAll('.donation-card');
  cards.forEach(c => c.classList.remove('active'));
  if (element) {
    element.classList.add('active');
  }
  appState.selectedAmount = amount;
  const customInput = document.getElementById('customAmountInput');
  if (customInput) customInput.value = '';
};

/* ==========================================================================
   4. Interactive Donation & Sponsorship Calculator
   ========================================================================== */
function initCalculator() {
  const calcSlider = document.getElementById('calcRangeSlider');
  const calcNumberInput = document.getElementById('calcNumberInput');
  const calcPresetBtns = document.querySelectorAll('.calc-preset-btn');
  const calcDonateBtn = document.getElementById('calcDonateBtn');

  // Update calculator UI results based on value
  const updateCalculatorResults = (value) => {
    const val = Math.max(50, Math.min(10000, value));
    appState.calcAmount = val;

    if (calcSlider) calcSlider.value = val;
    if (calcNumberInput) calcNumberInput.value = val;

    // Formulas:
    // Session = 250 SAR
    // Medical Filters kit = 75 SAR
    // Activity / Joy basket = 50 SAR
    // Full care days = 100 SAR
    const sessions = Math.floor(val / 250);
    const filterKits = Math.floor(val / 75);
    const activityBaskets = Math.floor(val / 50);
    const careDays = Math.floor(val / 100);

    const sessionsEl = document.getElementById('calcResultSessions');
    const filtersEl = document.getElementById('calcResultFilters');
    const basketsEl = document.getElementById('calcResultBaskets');
    const careDaysEl = document.getElementById('calcResultCareDays');
    const summaryTotalEl = document.getElementById('calcSummaryTotal');

    if (sessionsEl) sessionsEl.textContent = sessions.toLocaleString('ar-SA');
    if (filtersEl) filtersEl.textContent = filterKits.toLocaleString('ar-SA');
    if (basketsEl) basketsEl.textContent = activityBaskets.toLocaleString('ar-SA');
    if (careDaysEl) careDaysEl.textContent = careDays.toLocaleString('ar-SA');
    if (summaryTotalEl) summaryTotalEl.textContent = `${val.toLocaleString('ar-SA')} ر.س`;
  };

  if (calcSlider) {
    calcSlider.addEventListener('input', (e) => {
      updateCalculatorResults(parseInt(e.target.value, 10));
    });
  }

  if (calcNumberInput) {
    calcNumberInput.addEventListener('input', (e) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val)) {
        updateCalculatorResults(val);
      }
    });
  }

  calcPresetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const amount = parseInt(btn.dataset.preset, 10);
      updateCalculatorResults(amount);
    });
  });

  if (calcDonateBtn) {
    calcDonateBtn.addEventListener('click', () => {
      openDonationModal({
        amount: appState.calcAmount,
        frequency: 'once',
        beneficiary: `حاسبة الأثر (${appState.calcAmount} ر.س)`
      });
    });
  }

  // Initial trigger
  updateCalculatorResults(1000);
}

/* ==========================================================================
   5. Heroes Stories Filtering & Details
   ========================================================================== */
function initStoriesFilter() {
  const filterBtns = document.querySelectorAll('.story-filter-btn');
  const storyCards = document.querySelectorAll('.hero-story-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.dataset.filter;

      storyCards.forEach(card => {
        const category = card.dataset.category;
        if (filterValue === 'all' || category === filterValue) {
          card.style.display = 'block';
          card.classList.add('animate-fadeIn');
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // Story details buttons
  const storyDetailBtns = document.querySelectorAll('.open-story-modal-btn');
  storyDetailBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.hero-story-item');
      if (card) {
        const name = card.dataset.name;
        const age = card.dataset.age;
        const dream = card.dataset.dream;
        const sessions = card.dataset.sessions;
        const story = card.dataset.story;
        const image = card.querySelector('img') ? card.querySelector('img').src : '';
        const progress = card.dataset.progress || '65';

        openStoryDetailsModal({ name, age, dream, sessions, story, image, progress });
      }
    });
  });
}

/* ==========================================================================
   6. Modals Management (Donation, Story, Contact)
   ========================================================================== */
function initModals() {
  // Close buttons on all modals
  const closeBtns = document.querySelectorAll('.close-modal-trigger');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      closeAllModals();
    });
  });

  // Close modal when clicking backdrop
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeAllModals();
      }
    });
  });

  // ESC key listener to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Open general donation modal from any CTA
  const donateTriggers = document.querySelectorAll('.trigger-donation-modal');
  donateTriggers.forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const amount = trigger.dataset.amount ? parseInt(trigger.dataset.amount, 10) : appState.selectedAmount;
      const beneficiary = trigger.dataset.beneficiary || 'صندوق الأمل المفتوح';
      openDonationModal({ amount, beneficiary });
    });
  });

  // Support & Contact Modal triggers
  const supportTriggers = document.querySelectorAll('.trigger-support-modal');
  const supportModal = document.getElementById('supportModal');
  supportTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (supportModal) {
        supportModal.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  // Support form submission
  const supportForm = document.getElementById('supportContactForm');
  if (supportForm) {
    supportForm.addEventListener('submit', (e) => {
      e.preventDefault();
      closeAllModals();
      showToast('شكراً لتواصلك! تم استلام رسالتك وسيتواصل معك فريق نبض الأمل خلال 24 ساعة.', 'success');
      supportForm.reset();
    });
  }

  // Payment method selection inside donation modal
  const paymentMethods = document.querySelectorAll('.payment-method-card');
  paymentMethods.forEach(card => {
    card.addEventListener('click', () => {
      paymentMethods.forEach(c => c.classList.remove('active', 'border-primary', 'bg-primary-fixed/20'));
      card.classList.add('active', 'border-primary', 'bg-primary-fixed/20');
      appState.paymentMethod = card.dataset.method;
    });
  });

  // Dedication toggle (إهداء التبرع)
  const dedicationCheckbox = document.getElementById('isDedicationCheckbox');
  const dedicationFields = document.getElementById('dedicationFields');
  if (dedicationCheckbox && dedicationFields) {
    dedicationCheckbox.addEventListener('change', (e) => {
      if (e.target.checked) {
        dedicationFields.classList.remove('hidden');
      } else {
        dedicationFields.classList.add('hidden');
      }
    });
  }

  // Donation Form Submission simulation
  const donationForm = document.getElementById('checkoutDonationForm');
  if (donationForm) {
    donationForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleDonationSubmit();
    });
  }
}

function openDonationModal({ amount = 250, frequency = 'once', beneficiary = 'صندوق الأمل المفتوح' } = {}) {
  const modal = document.getElementById('donationCheckoutModal');
  if (!modal) return;

  appState.selectedAmount = amount;
  appState.frequency = frequency;
  appState.beneficiary = beneficiary;

  const modalAmountInput = document.getElementById('modalDonationAmount');
  const modalBeneficiaryEl = document.getElementById('modalBeneficiaryName');
  const modalFrequencyEl = document.getElementById('modalFrequencyLabel');

  if (modalAmountInput) modalAmountInput.value = amount;
  if (modalBeneficiaryEl) modalBeneficiaryEl.textContent = beneficiary;
  if (modalFrequencyEl) modalFrequencyEl.textContent = frequency === 'monthly' ? 'كفالة شهرية دورية' : 'تبرع لمرة واحدة';

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function openStoryDetailsModal(storyData) {
  const modal = document.getElementById('storyDetailsModal');
  if (!modal) return;

  document.getElementById('modalStoryName').textContent = storyData.name;
  document.getElementById('modalStoryAge').textContent = `${storyData.age} سنوات`;
  document.getElementById('modalStoryDream').textContent = storyData.dream;
  document.getElementById('modalStorySessions').textContent = `${storyData.sessions} جلسة مطلوبة`;
  document.getElementById('modalStoryText').textContent = storyData.story;
  
  const imgEl = document.getElementById('modalStoryImage');
  if (imgEl && storyData.image) imgEl.src = storyData.image;

  const progressFill = document.getElementById('modalStoryProgressFill');
  const progressText = document.getElementById('modalStoryProgressText');
  if (progressFill) progressFill.style.width = `${storyData.progress}%`;
  if (progressText) progressText.textContent = `${storyData.progress}% مكتمل`;

  const donateBtn = document.getElementById('modalStoryDonateBtn');
  if (donateBtn) {
    donateBtn.onclick = () => {
      closeAllModals();
      openDonationModal({
        amount: 250,
        beneficiary: `كفالة جلسة للبطل: ${storyData.name}`
      });
    };
  }

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAllModals() {
  const openModals = document.querySelectorAll('.modal-overlay.open');
  openModals.forEach(m => m.classList.remove('open'));
  document.body.style.overflow = '';
}

function handleDonationSubmit() {
  const submitBtn = document.getElementById('submitPaymentBtn');
  const originalText = submitBtn ? submitBtn.innerHTML : '';
  
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `
      <span class="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
      <span>جاري معالجة العملية بأمان...</span>
    `;
  }

  setTimeout(() => {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
    closeAllModals();
    showDonationSuccessModal();
  }, 1200);
}

function showDonationSuccessModal() {
  const receiptModal = document.getElementById('donationReceiptModal');
  if (!receiptModal) {
    showToast(`جزاكم الله خيراً! تم تأكيد تبرعكم بقيمة ${appState.selectedAmount} ر.س بنجاح.`, 'success');
    return;
  }

  const receiptNumber = 'HOPE-' + Math.floor(100000 + Math.random() * 900000);
  const now = new Date();
  const dateStr = now.toLocaleDateString('ar-SA', { year: 'numeric', month: 'long', day: 'numeric' });

  document.getElementById('receiptId').textContent = receiptNumber;
  document.getElementById('receiptDate').textContent = dateStr;
  document.getElementById('receiptAmount').textContent = `${appState.selectedAmount.toLocaleString('ar-SA')} ر.س`;
  document.getElementById('receiptBeneficiary').textContent = appState.beneficiary;

  receiptModal.classList.add('open');
  document.body.style.overflow = 'hidden';

  showToast('تمت معالجة التبرع بنجاح ووصلت مساهمتكم إلى رصيد الجلسات!', 'success');
}

/* ==========================================================================
   7. Newsletter Subscription
   ========================================================================== */
function initNewsletter() {
  const forms = document.querySelectorAll('.newsletter-form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = form.querySelector('input[type="email"]');
      if (input && input.value) {
        showToast(`شكراً لاشتراكك! ستصلك قصص الأبطال على ${input.value}`, 'success');
        input.value = '';
      }
    });
  });
}

/* ==========================================================================
   8. Live Impact Counters Animation
   ========================================================================== */
function initCounters() {
  const counters = document.querySelectorAll('.animated-counter');
  const speed = 200;

  const runCounter = (el) => {
    const target = +el.getAttribute('data-target');
    let count = 0;
    const inc = target / speed;

    const updateCount = () => {
      count += inc;
      if (count < target) {
        el.innerText = Math.ceil(count).toLocaleString('ar-SA');
        requestAnimationFrame(updateCount);
      } else {
        el.innerText = target.toLocaleString('ar-SA');
      }
    };
    updateCount();
  };

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        runCounter(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

/* ==========================================================================
   9. Toast Notifications System
   ========================================================================== */
function showToast(message, type = 'success') {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast-message ${type}`;

  const iconName = type === 'success' ? 'check_circle' : type === 'warning' ? 'info' : 'error';
  const iconColor = type === 'success' ? 'text-primary' : type === 'warning' ? 'text-secondary-container' : 'text-tertiary';

  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor} text-[26px]">${iconName}</span>
    <div class="flex-1 text-sm font-medium leading-relaxed">${message}</div>
    <button class="text-outline hover:text-on-surface transition-colors" type="button" aria-label="إغلاق">
      <span class="material-symbols-outlined text-[18px]">close</span>
    </button>
  `;

  const closeBtn = toast.querySelector('button');
  closeBtn.addEventListener('click', () => {
    removeToast(toast);
  });

  container.appendChild(toast);

  setTimeout(() => {
    removeToast(toast);
  }, 4500);
}

function removeToast(toast) {
  toast.style.animation = 'toastOut 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards';
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
}

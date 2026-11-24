/**
 * Dental Clinic Website - Dr. Hanane Hamlawi (د. حملاوي حنان)
 * Master Client-Side JavaScript
 * Pure Vanilla JS - Fast, Accessible, RTL-Optimized
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. WhatsApp Configuration Constants
  const WA_PHONE = '213669371261';
  const WA_DEFAULT_MSG = 'السلام عليكم دكتورة حملاوي حنان، أود حجز موعد في العيادة، من فضلكم.';

  // 2. Mobile Navigation Drawer Toggle
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const mobileDrawer = document.getElementById('mobileDrawer');
  const drawerBackdrop = document.getElementById('drawerBackdrop');
  const drawerLinks = document.querySelectorAll('.drawer-link');

  function openDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.add('open');
    if (drawerBackdrop) drawerBackdrop.classList.add('open');
    if (mobileNavToggle) {
      mobileNavToggle.classList.add('open');
      mobileNavToggle.setAttribute('aria-expanded', 'true');
    }
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    if (!mobileDrawer) return;
    mobileDrawer.classList.remove('open');
    if (drawerBackdrop) drawerBackdrop.classList.remove('open');
    if (mobileNavToggle) {
      mobileNavToggle.classList.remove('open');
      mobileNavToggle.setAttribute('aria-expanded', 'false');
    }
    document.body.style.overflow = '';
  }

  if (mobileNavToggle) {
    mobileNavToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) closeDrawer();
      else openDrawer();
    });
  }

  if (drawerBackdrop) {
    drawerBackdrop.addEventListener('click', closeDrawer);
  }

  drawerLinks.forEach((link) => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
      closeDrawer();
    }
  });

  // 3. Header Scroll Effect & Back-to-Top Button
  const siteHeader = document.querySelector('.site-header');
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;

    // Header shadow on scroll
    if (siteHeader) {
      if (scrollY > 40) {
        siteHeader.classList.add('scrolled');
      } else {
        siteHeader.classList.remove('scrolled');
      }
    }

    // Back to top button visibility
    if (backToTopBtn) {
      if (scrollY > 350) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 4. Live Clinic Open / Closed Status (Algerian Time UTC+1)
  function updateClinicStatus() {
    const statusContainer = document.getElementById('liveClinicStatus');
    const statusTextEl = document.getElementById('liveStatusText');
    const scheduleRows = document.querySelectorAll('.schedule-row[data-day]');

    // Get current time in Algeria (UTC+1)
    const now = new Date();
    // Use Intl to get day and hour in Africa/Algiers timezone
    const algeriaFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Africa/Algiers',
      weekday: 'numeric', // 1=Sunday, 2=Monday, ... or string
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });

    const parts = algeriaFormatter.formatToParts(now);
    let hour = now.getUTCHours() + 1; // Algeria is UTC+1 with no DST
    if (hour >= 24) hour -= 24;
    const dayOfWeek = now.getDay(); // 0: Sunday, 1: Monday, 2: Tuesday, 3: Wednesday, 4: Thursday, 5: Friday, 6: Saturday

    // Working days: Sunday (0) to Thursday (4) from 09:00 to 16:00
    const isWorkingDay = dayOfWeek >= 0 && dayOfWeek <= 4;
    const isWorkingHours = hour >= 9 && hour < 16;
    const isOpen = isWorkingDay && isWorkingHours;

    // Highlight current day row in schedule table
    scheduleRows.forEach(row => {
      const rowDay = parseInt(row.getAttribute('data-day'), 10);
      if (rowDay === dayOfWeek) {
        row.classList.add('today');
        const firstCell = row.querySelector('td:first-child');
        if (firstCell && !firstCell.querySelector('.today-pill')) {
          const pill = document.createElement('span');
          pill.className = 'today-pill';
          pill.textContent = 'اليوم';
          firstCell.appendChild(pill);
        }
      }
    });

    if (statusContainer && statusTextEl) {
      if (isOpen) {
        statusContainer.className = 'live-status-badge open';
        statusTextEl.textContent = 'العيادة مفتوحة الآن (09:00 ص – 16:00 م) - مرحباً بكم';
      } else {
        statusContainer.className = 'live-status-badge closed';
        if (!isWorkingDay) {
          statusTextEl.textContent = 'العيادة مغلقة اليوم (عطلة نهاية الأسبوع) - نستقبل رسائل الواتساب لحجز المواعيد';
        } else if (hour < 9) {
          statusTextEl.textContent = 'العيادة مغلقة حالياً (تفتح اليوم في تمام 09:00 صباحاً) - يمكنكم إرسال رسالة لحجز موعد';
        } else {
          statusTextEl.textContent = 'العيادة مغلقة حالياً (أوقات العمل 09:00 ص – 16:00 م) - يمكنكم حجز موعدكم عبر واتساب';
        }
      }
    }
  }

  updateClinicStatus();

  // 5. Interactive WhatsApp Booking Form Handler
  const bookingForm = document.getElementById('quickBookingForm');
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const nameInput = document.getElementById('patientName');
      const phoneInput = document.getElementById('patientPhone');
      const serviceInput = document.getElementById('bookingService');
      const dayInput = document.getElementById('preferredDay');
      const notesInput = document.getElementById('patientNotes');

      const name = nameInput ? nameInput.value.trim() : '';
      const phone = phoneInput ? phoneInput.value.trim() : '';
      const service = serviceInput ? serviceInput.value : '';
      const day = dayInput ? dayInput.value : '';
      const notes = notesInput ? notesInput.value.trim() : '';

      if (!name) {
        alert('يرجى إدخال الاسم واللقب.');
        if (nameInput) nameInput.focus();
        return;
      }

      // Build formatted Arabic WhatsApp Message
      let message = `السلام عليكم دكتورة حملاوي حنان، أود حجز موعد في العيادة، من فضلكم:\n`;
      message += `• الاسم: ${name}\n`;
      if (phone) message += `• الهاتف: ${phone}\n`;
      if (service) message += `• الخدمة المطلوبة: ${service}\n`;
      if (day) message += `• اليوم المفضل: ${day}\n`;
      if (notes) message += `• ملاحظات إضافية: ${notes}`;

      const encodedMessage = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WA_PHONE}?text=${encodedMessage}`;

      showToast('جاري فتح محادثة الواتساب مع عيادة الدكتورة حملاوي حنان...');
      setTimeout(() => {
        window.open(whatsappUrl, '_blank');
      }, 400);
    });
  }

  // 6. Service Card Direct WhatsApp Buttons
  const serviceBookingButtons = document.querySelectorAll('.service-btn-book[data-service]');
  serviceBookingButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const serviceName = btn.getAttribute('data-service');
      const message = `السلام عليكم دكتورة حملاوي حنان، أود حجز موعد لخدمة (${serviceName}) في العيادة، من فضلكم.`;
      const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    });
  });

  // 7. FAQ Accordion Handler
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const questionBtn = item.querySelector('.faq-question');
    if (questionBtn) {
      questionBtn.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        // Close other FAQs
        faqItems.forEach(otherItem => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
            const otherBtn = otherItem.querySelector('.faq-question');
            if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
          }
        });
        // Toggle current FAQ
        if (isActive) {
          item.classList.remove('active');
          questionBtn.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('active');
          questionBtn.setAttribute('aria-expanded', 'true');
        }
      });
    }
  });

  // 8. Toast Feedback Utility
  function showToast(message) {
    let toast = document.getElementById('toastNotice');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toastNotice';
      toast.className = 'toast-notice';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
      toast.classList.remove('show');
    }, 3500);
  }
});

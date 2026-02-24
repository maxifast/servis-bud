// === АТГ Сервіс Буд — JavaScript ===

document.addEventListener('DOMContentLoaded', () => {
  // --- Sticky Header ---
  const header = document.getElementById('header');
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }, { passive: true });

  // --- Mobile Menu ---
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', () => {
      const headerInfo = document.querySelector('.header-info');
      if (headerInfo) {
        headerInfo.style.display = headerInfo.style.display === 'flex' ? 'none' : 'flex';
        headerInfo.style.position = 'absolute';
        headerInfo.style.top = 'var(--header-height)';
        headerInfo.style.left = '0';
        headerInfo.style.right = '0';
        headerInfo.style.background = 'rgba(15, 23, 42, 0.98)';
        headerInfo.style.padding = '20px 24px';
        headerInfo.style.flexDirection = 'column';
        headerInfo.style.gap = '16px';
        headerInfo.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
      }
    });
  }

  // --- Manipulator Calculator ---
  const calcWeight = document.getElementById('calcWeight');
  const calcDistance = document.getElementById('calcDistance');
  const calcHours = document.getElementById('calcHours');
  const calcManipResult = document.getElementById('calcManipResult');

  function calculateManipulator() {
    const weight = parseInt(calcWeight.value);
    let ratePerHour = 2500;
    if (weight > 5 && weight <= 10) ratePerHour = 3500;
    if (weight > 10) ratePerHour = 4500;

    const distance = parseInt(calcDistance.value) || 0;
    let hours = parseInt(calcHours.value) || 4;
    if (hours < 4) hours = 4;

    const baseCost = ratePerHour * hours;
    const deliveryCost = distance > 0 ? distance * 25 : 0;
    const total = baseCost + deliveryCost;

    calcManipResult.innerHTML = total.toLocaleString('uk-UA') + ' <small>грн</small>';
  }

  if (calcWeight && calcDistance && calcHours) {
    calcWeight.addEventListener('change', calculateManipulator);
    calcDistance.addEventListener('input', calculateManipulator);
    calcHours.addEventListener('input', calculateManipulator);
    calculateManipulator();
  }

  // --- Bytovka Calculator ---
  const calcType = document.getElementById('calcType');
  const calcCondition = document.getElementById('calcCondition');
  const calcDelivery = document.getElementById('calcDelivery');
  const calcBytResult = document.getElementById('calcBytResult');

  function calculateBytovka() {
    const type = calcType.value;
    const condition = calcCondition.value;
    const delivery = calcDelivery.value;

    let price = 0;
    let suffix = '';

    if (condition === 'rent') {
      price = type === 'metal' ? 4500 : 3000;
      suffix = 'грн/міс';
    } else if (condition === 'new') {
      price = type === 'metal' ? 65000 : 45000;
      suffix = 'грн';
    } else if (condition === 'used') {
      price = type === 'metal' ? 21000 : 15000;
      suffix = 'грн';
    }

    if (delivery === 'yes') {
      price += 800;
    }

    calcBytResult.innerHTML = 'від ' + price.toLocaleString('uk-UA') + ' <small>' + suffix + '</small>';
  }

  if (calcType && calcCondition && calcDelivery) {
    calcType.addEventListener('change', calculateBytovka);
    calcCondition.addEventListener('change', calculateBytovka);
    calcDelivery.addEventListener('change', calculateBytovka);
    calculateBytovka();
  }

  // --- FAQ Accordion ---
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    const answerInner = item.querySelector('.faq-answer-inner');

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(other => {
        other.classList.remove('active');
        other.querySelector('.faq-answer').style.maxHeight = '0';
      });

      // Open clicked if it was closed
      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answerInner.scrollHeight + 20 + 'px';
      }
    });
  });

  // --- Smooth Scroll for anchor links ---
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset - 20;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  // --- Form Submission (Viber redirect) ---
  function handleFormSubmit(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('input[type="text"]');
      const phone = form.querySelector('input[type="tel"]');

      if (name && phone && name.value && phone.value) {
        const message = encodeURIComponent('Заявка з сайту АТГ Сервіс Буд\nІм\'я: ' + name.value + '\nТелефон: ' + phone.value);
        window.open('viber://chat?number=%2B380962873737&text=' + message, '_blank');

        // Show success
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.textContent;
        btn.textContent = '✓ Заявку надіслано!';
        btn.style.background = '#10B981';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          form.reset();
        }, 3000);
      }
    });
  }

  const heroFormSubmit = document.getElementById('heroFormSubmit');
  const footerForm = document.getElementById('footerForm');
  if (heroFormSubmit) handleFormSubmit(heroFormSubmit);
  if (footerForm) handleFormSubmit(footerForm);

  // --- Send Calculator to Viber ---
  document.querySelectorAll('.btn-calc-viber').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const type = btn.getAttribute('data-type');
      let message = '';

      if (type === 'manipulator') {
        const weightSelect = document.getElementById('calcWeight');
        const weightText = weightSelect.options[weightSelect.selectedIndex].text;
        const distance = document.getElementById('calcDistance').value;
        const hours = document.getElementById('calcHours').value;
        const result = document.getElementById('calcManipResult').textContent.trim();

        message = `Заявка з калькулятора (Маніпулятор)\nВага вантажу: ${weightText}\nВідстань від Києва: ${distance} км\nГодин роботи: ${hours}\nОрієнтовна вартість: ${result}`;
      } else if (type === 'bytovka') {
        const typeSelect = document.getElementById('calcType');
        const typeText = typeSelect.options[typeSelect.selectedIndex].text;
        const conditionSelect = document.getElementById('calcCondition');
        const conditionText = conditionSelect.options[conditionSelect.selectedIndex].text;
        const deliverySelect = document.getElementById('calcDelivery');
        const deliveryText = deliverySelect.options[deliverySelect.selectedIndex].text;
        const result = document.getElementById('calcBytResult').textContent.trim();

        message = `Заявка з калькулятора (Побутівка)\nТип побутівки: ${typeText}\nСтан/Тип: ${conditionText}\nДоставка: ${deliveryText}\nВартість: ${result}`;
      }

      if (message) {
        const viberUrl = 'viber://chat?number=%2B380962873737&text=' + encodeURIComponent(message);
        window.open(viberUrl, '_blank');
      }
    });
  });

  // --- Phone Input Mask (simple) ---
  document.querySelectorAll('input[type="tel"]').forEach(input => {
    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+380';
    });
    input.addEventListener('input', () => {
      let val = input.value.replace(/[^\d+]/g, '');
      if (!val.startsWith('+380')) val = '+380' + val.replace(/^\+?3?8?0?/, '');
      if (val.length > 13) val = val.slice(0, 13);
      input.value = val;
    });
  });

  // --- Intersection Observer for animations ---
  const observerOptions = { threshold: 0.1, rootMargin: '0px 0px -50px 0px' };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  document.querySelectorAll('.glass-card, .step-card, .advantage-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
});

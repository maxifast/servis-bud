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
  function calculateManipulator() {
    let calcLocation = document.getElementById('calcLocation');
    const distanceGroup = document.getElementById('distanceGroup');
    const calcDistance = document.getElementById('calcDistance');
    if (!calcLocation && calcDistance && calcDistance.parentElement) {
      // Forcibly inject if missing due to caching
      const formGroup = document.createElement('div');
      formGroup.className = 'form-group';
      formGroup.innerHTML = '<label>Локація</label><select id="calcLocation" class="form-select"><option value="kyiv">Оренда по Києву</option><option value="region">Оренда по Області</option></select>';
      calcDistance.parentElement.parentElement.insertBefore(formGroup, calcDistance.parentElement);
      calcLocation = document.getElementById('calcLocation');
      const distanceLabel = calcDistance.previousElementSibling;
      if (distanceLabel) distanceLabel.innerText = "Відстань, км (Київ - місце завантаження - місце вивантаження- Київ)";
      calcDistance.parentElement.id = 'distanceGroup';
      calcLocation.addEventListener('change', calculateManipulator);
    }

    const calcWeight = document.getElementById('calcWeight');
    const calcHours = document.getElementById('calcHours');
    const calcManipResult = document.getElementById('calcManipResult');
    const weight = parseInt(calcWeight.value);
    let ratePerHour = 1200; // До 4 тонн
    let minOrderKyiv = 4200;

    // Region base prices
    let regionBaseCost = 3600; // 2 години + подача (до 4т)
    let ratePerKm = 60;

    if (weight > 4 && weight <= 10) {
      ratePerHour = 1500;
      minOrderKyiv = 5200;
      regionBaseCost = 4500;
      ratePerKm = 60;
    } else if (weight > 10) {
      ratePerHour = 2000;
      minOrderKyiv = 6400;
      regionBaseCost = 7000;
      ratePerKm = 90;
    }

    const location = calcLocation ? calcLocation.value : 'kyiv';
    const distance = parseInt(calcDistance.value) || 0;
    let hours = parseInt(calcHours.value) || 2; // Мінімально 2 години за замовчуванням у полі
    // Завжди беремо мінімум 2 години для розрахунку "по факту"
    if (hours < 2) hours = 2;

    // Show/hide distance field
    if (distanceGroup) {
      if (location === 'region') {
        distanceGroup.style.display = 'block';
      } else {
        distanceGroup.style.display = 'none';
      }
    }

    let total = 0;

    if (location === 'kyiv') {
      // По Києву
      let calculatedCost = 0;
      if (hours === 2) {
        calculatedCost = minOrderKyiv;
      } else if (hours === 3) {
        calculatedCost = minOrderKyiv + ratePerHour;
      } else {
        // За 4 і більше годин
        calculatedCost = ratePerHour * hours;
        // Перевірка на всяк випадок, щоб не просіло нижче
        calculatedCost = Math.max(calculatedCost, minOrderKyiv + (ratePerHour * 2));
      }
      total = calculatedCost;
    } else {
      // По області
      let calculatedCost = regionBaseCost; // Включає 2 години роботи + подачу

      // Якщо годин більше 2-х, кожна наступна година тарифікується згідно rentPerHour
      if (hours > 2) {
        calculatedCost += (hours - 2) * ratePerHour;
      }

      const deliveryCost = distance * ratePerKm;
      total = calculatedCost + deliveryCost;
    }

    calcManipResult.innerHTML = total.toLocaleString('uk-UA') + ' <small>грн</small>';
  }

  const calcWeightInit = document.getElementById('calcWeight');
  const calcDistanceInit = document.getElementById('calcDistance');
  const calcHoursInit = document.getElementById('calcHours');
  if (calcWeightInit && calcDistanceInit && calcHoursInit) {
    calcWeightInit.addEventListener('change', calculateManipulator);
    calcDistanceInit.addEventListener('input', calculateManipulator);
    calcHoursInit.addEventListener('input', calculateManipulator);
    // Let calculateManipulator inject calcLocation on first run, then listen to it
    calculateManipulator();
  }

  // --- Bytovka Calculator ---
  const calcType = document.getElementById('calcType');
  const calcCondition = document.getElementById('calcCondition');
  const calcDelivery = document.getElementById('calcDelivery');
  const calcBytResult = document.getElementById('calcBytResult');

  const rentOptionsContainer = document.getElementById('rentOptions');
  const saleOptionsContainer = document.getElementById('saleOptions');

  // Rent Checkboxes
  const rentBed = document.getElementById('rentBed');
  const rentSleepKit = document.getElementById('rentSleepKit');
  const rentAc = document.getElementById('rentAc');
  const rentHeater = document.getElementById('rentHeater');

  // Sale Checkboxes
  const saleOptionsBoxes = document.querySelectorAll('.sale-option');

  function calculateBytovka() {
    const type = calcType.value;
    const condition = calcCondition.value;
    const delivery = calcDelivery.value;

    const qtyInput = document.getElementById('calcBytQuantity');
    const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;

    let price = 0;
    let suffix = '';

    // Toggle option visibility
    if (condition === 'rent') {
      if (rentOptionsContainer) rentOptionsContainer.style.display = 'block';
      if (saleOptionsContainer) saleOptionsContainer.style.display = 'none';

      // Rent base is 120 per day -> 3600 for 30 days
      price = 3600;
      suffix = 'грн/30 днів';

      // Rent Extras
      const bedQty = rentBed ? parseInt(rentBed.value) || 0 : 0;
      const sleepKitQty = rentSleepKit ? parseInt(rentSleepKit.value) || 0 : 0;

      if (bedQty > 0) price += bedQty * 200;
      if (sleepKitQty > 0) price += sleepKitQty * 200;

      if (rentAc && rentAc.checked) price += parseInt(rentAc.value); // 90 * 30 = 2700
      if (rentHeater && rentHeater.checked) price += parseInt(rentHeater.value); // 20 * 30 = 600

    } else if (condition === 'new') {
      if (rentOptionsContainer) rentOptionsContainer.style.display = 'none';
      if (saleOptionsContainer) saleOptionsContainer.style.display = 'block';

      // Sale base
      price = type === 'metal' ? 87000 : 75000;
      suffix = 'грн';

      // Sale Extras
      saleOptionsBoxes.forEach(checkbox => {
        if (checkbox.checked) {
          price += parseInt(checkbox.value);
        }
      });
    }

    // Multiple quantity scaling
    price = price * quantity;

    calcBytResult.innerHTML = 'від ' + price.toLocaleString('uk-UA') + ' <small>' + suffix + '</small>';
  }

  if (calcType && calcCondition && calcDelivery) {
    calcType.addEventListener('change', calculateBytovka);
    calcCondition.addEventListener('change', calculateBytovka);
    calcDelivery.addEventListener('change', calculateBytovka);

    const calcBytQuantity = document.getElementById('calcBytQuantity');
    if (calcBytQuantity) calcBytQuantity.addEventListener('input', calculateBytovka);

    // Listeners for inputs/checkboxes
    if (rentBed) rentBed.addEventListener('input', calculateBytovka);
    if (rentSleepKit) rentSleepKit.addEventListener('input', calculateBytovka);
    if (rentAc) rentAc.addEventListener('change', calculateBytovka);
    if (rentHeater) rentHeater.addEventListener('change', calculateBytovka);

    saleOptionsBoxes.forEach(box => {
      box.addEventListener('change', calculateBytovka);
    });

    calculateBytovka();
  }

  // Set initial condition and re-calculate
  if (calcCondition && calcCondition.value === 'new') {
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

  // --- Messenger Modal Logic ---
  let pendingMessengerMessage = '';

  window.closeMessengerModal = function () {
    const modal = document.getElementById('messengerModal');
    if (modal) modal.classList.remove('active');
    pendingMessengerMessage = '';
  };

  function openMessengerModal(text) {
    pendingMessengerMessage = text;
    const modal = document.getElementById('messengerModal');
    if (modal) modal.classList.add('active');
  }

  const closeBtn = document.getElementById('closeMessengerModal');
  if (closeBtn) {
    closeBtn.addEventListener('click', window.closeMessengerModal);
  }

  const messengerModalEl = document.getElementById('messengerModal');
  if (messengerModalEl) {
    messengerModalEl.addEventListener('click', (e) => {
      if (e.target === messengerModalEl) {
        window.closeMessengerModal();
      }
    });
  }

  document.querySelectorAll('.msg-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const messenger = btn.dataset.messenger;
      const text = pendingMessengerMessage;
      if (!text) return;

      let link = '';
      if (messenger === 'viber') {
        link = 'viber://chat?number=380962873737&draft=' + encodeURIComponent(text) + '&text=' + encodeURIComponent(text);
        try {
          const tempInput = document.createElement('textarea');
          tempInput.value = text;
          document.body.appendChild(tempInput);
          tempInput.select();
          document.execCommand('copy');
          document.body.removeChild(tempInput);
        } catch (err) { }
      } else if (messenger === 'telegram') {
        link = 'https://t.me/+380962873737?text=' + encodeURIComponent(text);
      } else if (messenger === 'whatsapp') {
        link = 'https://wa.me/380962873737?text=' + encodeURIComponent(text);
      }

      if (link) {
        window.open(link, '_blank');
      }
      window.closeMessengerModal();
    });
  });

  // --- Form Submission (Messenger redirect) ---
  function handleFormSubmit(form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = form.querySelector('input[type="text"]');
      const phone = form.querySelector('input[type="tel"]');
      const service = form.querySelector('select'); // for hero form

      if (name && phone && name.value && phone.value) {
        let text = `🔥 Нова заявка з сайту АТГ Сервіс Буд\n\n👤 Ім'я: ${name.value}\n📞 Телефон: ${phone.value}`;
        if (service) {
          text += `\n🎯 Цікавить: ${service.options[service.selectedIndex].text}`;
        }

        openMessengerModal(text);

        // Show success
        const btn = form.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.textContent = '✓ Заявку надіслано!';
        btn.style.background = '#10B981';
        btn.style.color = '#fff';
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.style.background = '';
          btn.style.color = '';
          form.reset();
        }, 3000);
      }
    });
  }

  const heroFormSubmit = document.getElementById('heroFormSubmit');
  const footerForm = document.getElementById('footerForm');
  if (heroFormSubmit) handleFormSubmit(heroFormSubmit);
  if (footerForm) handleFormSubmit(footerForm);

  // --- Send Calculator to Messenger ---
  document.querySelectorAll('.btn-calc-messenger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const type = btn.getAttribute('data-type');
      let message = '';

      if (type === 'manipulator') {
        const weightSelect = document.getElementById('calcWeight');
        const weightText = weightSelect.options[weightSelect.selectedIndex].text;
        const locationSelect = document.getElementById('calcLocation');
        const locationText = locationSelect ? locationSelect.options[locationSelect.selectedIndex].text : 'Оренда по Києву';
        const distance = document.getElementById('calcDistance').value;
        const hours = document.getElementById('calcHours').value;
        const result = document.getElementById('calcManipResult').textContent.trim();

        let distanceText = locationSelect.value === 'region' ? `\nВідстань: ${distance} км (в одну сторону)` : '';

        message = `🚚 Заявка з калькулятора (Маніпулятор)\n\nЛокація: ${locationText}\nВага вантажу: ${weightText}${distanceText}\nГодин роботи: ${hours}\nОрієнтовна вартість: ${result}`;
      } else if (type === 'bytovka') {
        const typeSelect = document.getElementById('calcType');
        const typeText = typeSelect.options[typeSelect.selectedIndex].text;
        const conditionSelect = document.getElementById('calcCondition');
        const conditionText = conditionSelect.options[conditionSelect.selectedIndex].text;
        const conditionVal = conditionSelect.value;
        const deliverySelect = document.getElementById('calcDelivery');
        const deliveryText = deliverySelect.options[deliverySelect.selectedIndex].text;
        const result = document.getElementById('calcBytResult').textContent.trim();

        let addonsInfo = '';
        const qtyInput = document.getElementById('calcBytQuantity');
        const quantity = qtyInput ? (parseInt(qtyInput.value) || 1) : 1;
        const qtyText = `\nКількість побутівок: ${quantity} шт`;

        if (conditionVal === 'rent') {
          const activeRent = [];
          const rentBedQty = parseInt(document.getElementById('rentBed').value) || 0;
          const rentSleepQty = parseInt(document.getElementById('rentSleepKit').value) || 0;

          if (rentBedQty > 0) activeRent.push(`Ліжка (${rentBedQty} шт)`);
          if (rentSleepQty > 0) activeRent.push(`Сп. комплект (${rentSleepQty} шт)`);

          if (document.getElementById('rentAc') && document.getElementById('rentAc').checked) activeRent.push('Кондиціонер');
          if (document.getElementById('rentHeater') && document.getElementById('rentHeater').checked) activeRent.push('Конвектор');
          if (activeRent.length) addonsInfo = `\nДопи: ${activeRent.join(', ')}`;
        } else if (conditionVal === 'new') {
          const activeSale = [];
          document.querySelectorAll('.sale-option').forEach(checkbox => {
            if (checkbox.checked) {
              activeSale.push(checkbox.parentElement.textContent.trim());
            }
          });
          if (activeSale.length) addonsInfo = `\nДопи: ${activeSale.join(', ')}`;
        }

        message = `🏠 Заявка з калькулятора (Побутівка)\n\nТип: ${typeText}\nЗамовлення: ${conditionText}${qtyText}${addonsInfo}\nДоставка: ${deliveryText}\nВартість: ${result}`;
      }

      if (message) {
        openMessengerModal(message);
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

  // --- Gallery Tabs ---
  const galleryTabs = document.querySelectorAll('.gallery-tab');
  const galleryContents = document.querySelectorAll('.gallery-tab-content');
  let swipers = {};

  function initSwiper(id) {
    if (swipers[id]) return; // Already initialized

    swipers[id] = new Swiper(`#${id}`, {
      slidesPerView: 1,
      spaceBetween: 16,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
      },
      breakpoints: {
        640: { slidesPerView: 2, spaceBetween: 20 },
        1024: { slidesPerView: 3, spaceBetween: 24 }
      }
    });
  }

  // Init the first active swiper on load
  const activeTabTarget = document.querySelector('.gallery-tab.active')?.dataset.target;
  if (activeTabTarget) {
    initSwiper('swiper-' + activeTabTarget.split('-')[1]);
  }

  galleryTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Remove active class from all tabs and contents
      galleryTabs.forEach(t => t.classList.remove('active'));
      galleryContents.forEach(c => c.classList.remove('active'));

      // Add active class to clicked tab and corresponding content
      tab.classList.add('active');
      const targetId = tab.dataset.target;
      const targetContent = document.getElementById(targetId);

      if (targetContent) {
        targetContent.classList.add('active');
        // Initialize swiper if not yet initialized
        initSwiper('swiper-' + targetId.split('-')[1]);
      }
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

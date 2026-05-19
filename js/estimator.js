'use strict';

const ESTIMATOR_WHATSAPP_NUMBER = '916383881006';

const MENU_PRICING = {
  'Ice Cakes': [
    { name: 'Vanilla Cake', price: 380 },
    { name: 'Strawberry Cake', price: 390 },
    { name: 'Black Forest Cake', price: 430 },
    { name: 'White Forest Cake', price: 430 },
    { name: 'Butterscotch Cake', price: 440 },
    { name: 'Pista Flavour Cake', price: 450 },
    { name: 'Rasamalai Cake', price: 480 },
    { name: 'Chocotruffle Cake', price: 480 }
  ],
  Brownies: [
    { name: 'Classic Brownie', price: 220 },
    { name: 'Milk Chocolate Brownie', price: 235 },
    { name: 'Double Chocolate Brownie', price: 245 },
    { name: 'Triple Chocolate Brownie', price: 255 }
  ],
  'Bento Cakes': [
    { name: 'Vanilla Bento', price: 270 },
    { name: 'White Forest Bento', price: 280 },
    { name: 'Rasamalai Bento', price: 290 },
    { name: 'Butterscotch Bento', price: 290 },
    { name: 'Pista Bento', price: 300 },
    { name: 'Rosemilk Bento', price: 300 },
    { name: 'Chocotruffle Bento', price: 320 }
  ]
};

const SIZE_OPTIONS = {
  'Ice Cakes': [
    { label: '1/2 kg', multiplier: 1 },
    { label: '1 kg', multiplier: 2 },
    { label: '1.5 kg', multiplier: 3 },
    { label: '2 kg', multiplier: 4 }
  ],
  Brownies: [
    { label: '1 piece', multiplier: 1 },
    { label: '4 pieces', multiplier: 4 },
    { label: '6 pieces', multiplier: 6 },
    { label: '12 pieces', multiplier: 12 }
  ],
  'Bento Cakes': [
    { label: '1 mini cake', multiplier: 1 },
    { label: '2 mini cakes', multiplier: 2 },
    { label: '4 mini cakes', multiplier: 4 },
    { label: '6 mini cakes', multiplier: 6 }
  ]
};

document.addEventListener('DOMContentLoaded', () => {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  const categorySelect = document.getElementById('categorySelect');
  const cakeSelect = document.getElementById('cakeSelect');
  const sizeSelect = document.getElementById('sizeSelect');
  const designSelect = document.getElementById('designSelect');
  const deliveryDate = document.getElementById('deliveryDate');
  const totalEl = document.getElementById('estimateTotal');
  const summaryEl = document.getElementById('estimateSummary');
  const breakdownEl = document.getElementById('estimateBreakdown');
  const whatsappEl = document.getElementById('estimateWhatsApp');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    document.body.classList.toggle('nav-open', isOpen);
    if (isOpen) {
      document.documentElement.scrollLeft = 0;
      document.body.scrollLeft = 0;
    }
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      document.body.classList.remove('nav-open');
    });
  });

  const today = new Date();
  today.setDate(today.getDate() + 1);
  deliveryDate.min = today.toISOString().split('T')[0];

  Object.keys(MENU_PRICING).forEach(category => {
    categorySelect.add(new Option(category, category));
  });

  function formatRupee(value) {
    return `₹${Math.round(value).toLocaleString('en-IN')}`;
  }

  function renderCakeOptions() {
    cakeSelect.innerHTML = '';
    MENU_PRICING[categorySelect.value].forEach((item, index) => {
      const option = new Option(`${item.name} - ₹${item.price}`, index);
      cakeSelect.add(option);
    });
  }

  function renderSizeOptions() {
    sizeSelect.innerHTML = '';
    SIZE_OPTIONS[categorySelect.value].forEach((item, index) => {
      const option = new Option(item.label, index);
      sizeSelect.add(option);
    });
  }

  function getAddons() {
    return Array.from(document.querySelectorAll('.estimator-addons input:checked')).map(input => ({
      name: input.dataset.addon,
      price: Number(input.value)
    }));
  }

  function calculate() {
    const category = categorySelect.value;
    const cake = MENU_PRICING[category][Number(cakeSelect.value)];
    const size = SIZE_OPTIONS[category][Number(sizeSelect.value)];
    const designCost = Number(designSelect.value);
    const designText = designSelect.options[designSelect.selectedIndex].text.split(' - ')[0];
    const addons = getAddons();

    const baseTotal = cake.price * size.multiplier;
    const addonsTotal = addons.reduce((sum, addon) => sum + addon.price, 0);
    const total = baseTotal + designCost + addonsTotal;
    const addonText = addons.length ? addons.map(addon => addon.name).join(', ') : 'No add-ons';
    const dateText = deliveryDate.value || 'Not selected';

    totalEl.textContent = formatRupee(total);
    summaryEl.textContent = `${cake.name} (${size.label}) with ${designText.toLowerCase()}.`;
    breakdownEl.innerHTML = `
      <div><span>Menu base</span><strong>${formatRupee(baseTotal)}</strong></div>
      <div><span>Design</span><strong>${formatRupee(designCost)}</strong></div>
      <div><span>Add-ons</span><strong>${formatRupee(addonsTotal)}</strong></div>
      <div><span>Delivery date</span><strong>${dateText}</strong></div>
    `;

    const message = `Hi Turtle Bakes, I used the custom cake estimator.\n\nCake: ${cake.name}\nCategory: ${category}\nSize/Quantity: ${size.label}\nDesign: ${designText}\nAdd-ons: ${addonText}\nDelivery Date: ${dateText}\nEstimated Starting Price: ${formatRupee(total)}\n\nPlease confirm the final price for my custom design.`;
    whatsappEl.href = `https://wa.me/${ESTIMATOR_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }

  categorySelect.addEventListener('change', () => {
    renderCakeOptions();
    renderSizeOptions();
    calculate();
  });

  [cakeSelect, sizeSelect, designSelect, deliveryDate].forEach(input => {
    input.addEventListener('input', calculate);
    input.addEventListener('change', calculate);
  });

  document.querySelectorAll('.estimator-addons input').forEach(input => {
    input.addEventListener('change', calculate);
  });

  renderCakeOptions();
  renderSizeOptions();
  calculate();
});

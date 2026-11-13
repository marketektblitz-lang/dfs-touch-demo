(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');
  var nav = document.getElementById('primary-nav');
  var desktop = window.matchMedia('(min-width: 960px)');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    var label = toggle.querySelector('.menu-toggle-label');
    if (label) label.textContent = open ? 'Close' : 'Menu';
  }
  toggle.addEventListener('click', function () {
    setMenu(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', function (e) {
    if (e.target.closest('a')) setMenu(false);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      toggle.focus();
    }
  });
  document.addEventListener('click', function (e) {
    if (toggle.getAttribute('aria-expanded') === 'true' && !header.contains(e.target)) setMenu(false);
  });
  (desktop.addEventListener ? desktop.addEventListener.bind(desktop, 'change') : desktop.addListener.bind(desktop))(function () {
    if (desktop.matches) setMenu(false);
  });

  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var year = document.getElementById('year');
  if (year) year.textContent = String(new Date().getFullYear());

  // Quote form
  var form = document.getElementById('quote-form');
  var success = document.getElementById('form-success');
  var status = document.getElementById('form-status');
  var resetBtn = document.getElementById('form-reset');
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var phoneRe = /^[0-9+().\-\s]{7,}$/;

  var rules = {
    firstName: function (v) { return v ? '' : 'Please enter your first name.'; },
    lastName: function (v) { return v ? '' : 'Please enter your last name.'; },
    email: function (v) {
      if (!v) return 'Please enter your email address.';
      return emailRe.test(v) ? '' : 'Please enter a valid email address, like name@company.com.';
    },
    phone: function (v) {
      if (!v) return '';
      return phoneRe.test(v) && v.replace(/\D/g, '').length >= 7 ? '' : 'Please enter a valid phone number, or leave it blank.';
    },
    message: function (v) {
      if (!v) return 'Please tell us a little about your project.';
      return v.length >= 10 ? '' : 'Please add a few more details (at least 10 characters).';
    }
  };

  function validateField(name) {
    var input = form.elements[name];
    var msg = rules[name](input.value.trim());
    var err = document.getElementById(input.getAttribute('aria-describedby'));
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if (err) err.textContent = msg;
    return !msg;
  }

  Object.keys(rules).forEach(function (name) {
    var input = form.elements[name];
    input.addEventListener('blur', function () { if (input.value.trim() || input.getAttribute('aria-invalid') === 'true') validateField(name); });
    input.addEventListener('input', function () { if (input.getAttribute('aria-invalid') === 'true') validateField(name); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    status.textContent = '';
    var firstInvalid = null;
    Object.keys(rules).forEach(function (name) {
      if (!validateField(name) && !firstInvalid) firstInvalid = form.elements[name];
    });
    if (firstInvalid) {
      status.textContent = 'Please check the highlighted fields.';
      firstInvalid.focus();
      return;
    }
    // Demo build: nothing is sent anywhere. Entries are kept in this browser's localStorage.
    var entry = { receivedAt: new Date().toISOString() };
    ['firstName', 'lastName', 'email', 'phone', 'service', 'message'].forEach(function (k) {
      entry[k] = form.elements[k].value.trim();
    });
    var btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Sending…';
    new Promise(function (resolve) {
      if (form.elements.website.value) return resolve(); // honeypot: silently ignore bots
      try {
        var key = 'dfsTouchDemoQuotes';
        var list = JSON.parse(localStorage.getItem(key) || '[]');
        list.push(entry);
        localStorage.setItem(key, JSON.stringify(list));
      } catch (err) { /* storage unavailable (private mode): still confirm */ }
      resolve();
    }).then(function () {
      form.reset();
      form.hidden = true;
      success.hidden = false;
      var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      document.getElementById('quote').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
      success.focus({ preventScroll: true });
    }).catch(function () {
      status.textContent = 'Sorry, your request could not be sent. Please try again, or call (650) 892 2258.';
    }).then(function () {
      btn.disabled = false;
      btn.textContent = 'Send request';
    });
  });

  resetBtn.addEventListener('click', function () {
    success.hidden = true;
    form.hidden = false;
    Object.keys(rules).forEach(function (name) {
      form.elements[name].removeAttribute('aria-invalid');
      var err = document.getElementById(form.elements[name].getAttribute('aria-describedby'));
      if (err) err.textContent = '';
    });
    form.elements.firstName.focus();
  });
})();

(() => {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".primary-nav");

  document.querySelectorAll("[data-year]").forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 10);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Brand / home links: sticky header made #top on <header> a no-op.
     Scroll to document top reliably and keep the URL clean. */
  document.querySelectorAll('a.brand[href="#top"]').forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
      if (window.history.replaceState) {
        window.history.replaceState(null, "", window.location.pathname + window.location.search);
      }
    });
  });

  const setMenu = (open) => {
    if (!toggle || !nav) return;
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    document.body.style.overflow = open ? "hidden" : "";
  };

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      setMenu(toggle.getAttribute("aria-expanded") !== "true");
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setMenu(false));
    });

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenu(false);
    });
  }

  const motionOk = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(
    ".hero-copy, .section-heading, .about-intro, .about-body, .metrics, .service-list li, .capability, .why-shell > *, .logo-grid, .case, .quote, .contact-shell"
  );

  targets.forEach((el) => el.classList.add("reveal"));

  if (!motionOk || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -4% 0px" }
    );

    targets.forEach((el) => observer.observe(el));
  }

  /* Testimonials: Read more / Read less without leaving the page */
  const syncQuoteToggles = () => {
    document.querySelectorAll(".quote").forEach((quote) => {
      const text = quote.querySelector(".quote-text");
      const toggle = quote.querySelector(".quote-toggle");
      if (!text || !toggle) return;

      const wasExpanded = quote.classList.contains("is-expanded");
      quote.classList.remove("is-expanded");
      const needsToggle = text.scrollHeight > text.clientHeight + 2;
      if (wasExpanded) quote.classList.add("is-expanded");

      toggle.hidden = !needsToggle;
      if (!needsToggle) {
        quote.classList.remove("is-expanded");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Read more";
      }
    });
  };

  document.querySelectorAll(".quote-toggle").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const quote = toggle.closest(".quote");
      if (!quote) return;
      const expanded = quote.classList.toggle("is-expanded");
      toggle.setAttribute("aria-expanded", String(expanded));
      toggle.textContent = expanded ? "Read less" : "Read more";
    });
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(syncQuoteToggles);
  } else {
    window.addEventListener("load", syncQuoteToggles);
  }
  syncQuoteToggles();
  window.addEventListener("resize", syncQuoteToggles);

  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const statusEl = contactForm.querySelector(".form-status");
    const defaultLabel = submitButton ? submitButton.textContent : "Send";

    const setStatus = (message, type) => {
      if (!statusEl) return;
      statusEl.hidden = !message;
      statusEl.classList.remove("is-success", "is-error");
      if (type) statusEl.classList.add(type);

      if (type === "is-error") {
        statusEl.innerHTML =
          'Something went wrong. Please try again or connect with me on <a href="https://www.linkedin.com/in/rashmi-daga/" target="_blank" rel="noopener noreferrer">LinkedIn</a>.';
      } else {
        statusEl.textContent = message;
      }
    };

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!submitButton) return;

      setStatus("", null);
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";

      try {
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" },
        });

        const result = await response.json().catch(() => ({}));

        if (!response.ok || result.success === false) {
          throw new Error(result.message || "Submission failed");
        }

        contactForm.reset();
        setStatus(
          "Thank you for reaching out. I’ll get back to you within 1–2 business days.",
          "is-success"
        );
      } catch (error) {
        setStatus(
          "Something went wrong. Please try again or connect with me on LinkedIn.",
          "is-error"
        );
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = defaultLabel;
      }
    });
  }
})();

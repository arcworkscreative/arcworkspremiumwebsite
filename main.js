document.addEventListener("DOMContentLoaded", () => {
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxpnV-A5WKbVTNKhMBtT5p64qunGomOXWzT6obUfvSIRrcfKYDidhLXFQgq4y1ntm_p/exec";

  // 0. Smart fallback resolver for images
  function resolveSmartImages() {
    const imgs = document.querySelectorAll("img[data-candidates]");
    imgs.forEach((img) => {
      const list = (img.getAttribute("data-candidates") || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!list.length) return;

      let idx = 0;
      const tryNext = () => {
        idx += 1;
        if (idx < list.length) {
          img.src = list[idx];
        } else {
          img.removeEventListener("error", tryNext);
        }
      };

      img.addEventListener("error", tryNext);
      img.src = list[0];
    });
  }
  resolveSmartImages();

  // 1. Floating Golden Sparkles Background
  const sparkleContainer = document.getElementById("sparkle-container");
  if (sparkleContainer) {
    const sparkleCount = window.innerWidth < 600 ? 18 : 32;
    for (let i = 0; i < sparkleCount; i++) {
      const dot = document.createElement("span");
      dot.className = "sparkle";
      const size = (Math.random() * 4 + 2).toFixed(1);
      dot.style.width = `${size}px`;
      dot.style.height = `${size}px`;
      dot.style.left = `${(Math.random() * 100).toFixed(2)}%`;
      dot.style.top = `${(Math.random() * 100).toFixed(2)}%`;
      dot.style.setProperty("--dur", `${(Math.random() * 4 + 3).toFixed(1)}s`);
      dot.style.setProperty("--delay", `${(Math.random() * 4).toFixed(1)}s`);
      dot.style.setProperty("--max-op", `${(Math.random() * 0.55 + 0.35).toFixed(2)}`);
      sparkleContainer.appendChild(dot);
    }
  }

  // 2. Envelope Open + Auto Background Audio
  const gate = document.getElementById("envelope-gate");
  const openBtn = document.getElementById("open-invitation-btn");
  const audioBar = document.getElementById("audio-bar");
  const audio = document.getElementById("bg-audio");
  const musicBtn = document.getElementById("music-toggle-btn");
  const musicStatus = document.getElementById("music-status-text");

  let userPausedMusic = false;

  const startMusic = () => {
    if (!audio || userPausedMusic) return;
    audio.play().then(() => {
      if (musicStatus) musicStatus.textContent = "Pause Music";
    }).catch(() => {
      if (musicStatus) musicStatus.textContent = "Play Music";
    });
  };

  if (openBtn && gate) {
    openBtn.addEventListener("click", () => {
      gate.classList.add("is-open");
      document.body.classList.remove("locked");
      if (audioBar) audioBar.classList.remove("hidden");
      userPausedMusic = false;
      startMusic();
    });
  }

  const unlockOnce = () => {
    if (gate && audio && !gate.classList.contains("is-open") && audio.paused && !userPausedMusic) {
      startMusic();
    }
  };
  document.addEventListener("pointerdown", unlockOnce, { once: true });

  if (musicBtn && audio) {
    musicBtn.addEventListener("click", () => {
      if (audio.paused) {
        userPausedMusic = false;
        audio.play().then(() => {
          if (musicStatus) musicStatus.textContent = "Pause Music";
        }).catch(() => {
          if (musicStatus) musicStatus.textContent = "No Audio File";
        });
      } else {
        userPausedMusic = true;
        audio.pause();
        if (musicStatus) musicStatus.textContent = "Play Music";
      }
    });
  }

  // 3. Helper for Slideshows
  function createSlideshow({
    containerId,
    dotsId,
    prevId,
    nextId,
    counterId,
    intervalMs = 3500,
    autoStart = true,
  }) {
    const container = document.getElementById(containerId);
    if (!container) return { start: () => {} };

    const slides = Array.from(container.querySelectorAll(".slide"));
    const dotsEl = dotsId ? document.getElementById(dotsId) : null;
    const prevBtn = prevId ? document.getElementById(prevId) : null;
    const nextBtn = nextId ? document.getElementById(nextId) : null;
    const counterEl = counterId ? document.getElementById(counterId) : null;

    let current = 0;
    let timer = null;
    let isRunning = false;

    const dots = slides.map((_, idx) => {
      if (!dotsEl) return null;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "slide-dot" + (idx === 0 ? " active" : "");
      btn.setAttribute("aria-label", `Go to slide ${idx + 1}`);
      btn.addEventListener("click", () => {
        goTo(idx);
        restart();
      });
      dotsEl.appendChild(btn);
      return btn;
    });

    function goTo(index) {
      if (!slides.length) return;
      current = (index + slides.length) % slides.length;
      slides.forEach((slide, i) => slide.classList.toggle("active", i === current));
      dots.forEach((dot, i) => dot && dot.classList.toggle("active", i === current));
      if (counterEl) {
        counterEl.textContent = `${current + 1} / ${slides.length}`;
      }
    }

    function next() {
      goTo(current + 1);
    }

    function prev() {
      goTo(current - 1);
    }

    function start() {
      if (isRunning || slides.length <= 1) return;
      isRunning = true;
      timer = setInterval(next, intervalMs);
    }

    function restart() {
      clearInterval(timer);
      if (isRunning) {
        timer = setInterval(next, intervalMs);
      }
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        prev();
        restart();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        next();
        restart();
      });
    }

    goTo(0);
    if (autoStart) start();

    return { start };
  }

  // Debutante Slideshow (Photo 1.jpg to Photo 7.jpg)
  createSlideshow({
    containerId: "debut-slideshow",
    dotsId: "debut-dots",
    prevId: "debut-prev",
    nextId: "debut-next",
    counterId: "debut-counter",
    intervalMs: 3500,
    autoStart: true,
  });

  // Venue Slideshow (Venue 1.png to Venue 3.png) - starts automatically when in Venue section
  const venueSlideshow = createSlideshow({
    containerId: "venue-slideshow",
    dotsId: "venue-dots",
    intervalMs: 3200,
    autoStart: false,
  });

  const venueSection = document.getElementById("venue");
  if (venueSection) {
    const venueObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            venueSlideshow.start();
            venueObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.25 }
    );
    venueObserver.observe(venueSection);
  }

  // 4. Countdown to November 29, 2026 at 3:30 PM
  const eventDate = new Date("2026-11-29T15:30:00+08:00").getTime();
  const daysEl = document.getElementById("cd-days");
  const hoursEl = document.getElementById("cd-hours");
  const minsEl = document.getElementById("cd-minutes");
  const secsEl = document.getElementById("cd-seconds");

  function updateCountdown() {
    if (!daysEl) return;
    const now = Date.now();
    const diff = Math.max(0, eventDate - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    daysEl.textContent = String(days).padStart(2, "0");
    if (hoursEl) hoursEl.textContent = String(hours).padStart(2, "0");
    if (minsEl) minsEl.textContent = String(minutes).padStart(2, "0");
    if (secsEl) secsEl.textContent = String(seconds).padStart(2, "0");
  }

  updateCountdown();
  setInterval(updateCountdown, 1000);

  // 5. Alternating Scroll Reveal
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  // 6. Dynamic RSVP Form (Kids toggle, + Add Another Kid, Google Sheets + Gmail)
  const form = document.getElementById("rsvp-form");
  const statusEl = document.getElementById("rsvp-status");
  const submitBtn = document.getElementById("rsvp-submit-btn");
  const kidsSection = document.getElementById("kids-section");
  const companionSection = document.getElementById("companion-section");
  const kidsInputsList = document.getElementById("kids-inputs-list");
  const addKidBtn = document.getElementById("add-kid-btn");
  const attendanceRadios = document.querySelectorAll('input[name="attendance"]');

  function updateRsvpFieldsVisibility() {
    const selected = document.querySelector('input[name="attendance"]:checked');
    const val = selected ? selected.value : "";

    if (!kidsSection || !companionSection || !kidsInputsList) return;

    if (val === "Yes, I will attend with my kid/s.") {
      kidsSection.classList.remove("hidden");
      companionSection.classList.remove("hidden");
      const firstKid = kidsInputsList.querySelector("input");
      if (firstKid) firstKid.required = true;
    } else if (val === "Declines with regret.") {
      kidsSection.classList.add("hidden");
      companionSection.classList.add("hidden");
      kidsInputsList.querySelectorAll("input").forEach((inp) => (inp.required = false));
    } else {
      kidsSection.classList.add("hidden");
      companionSection.classList.remove("hidden");
      kidsInputsList.querySelectorAll("input").forEach((inp) => (inp.required = false));
    }
  }

  attendanceRadios.forEach((radio) => {
    radio.addEventListener("change", updateRsvpFieldsVisibility);
  });

  function refreshKidPlaceholders() {
    if (!kidsInputsList) return;
    const rows = kidsInputsList.querySelectorAll(".kid-row");
    rows.forEach((row, index) => {
      const input = row.querySelector("input");
      if (input) input.placeholder = `Kid ${index + 1} Full Name`;
    });
  }

  if (addKidBtn && kidsInputsList) {
    addKidBtn.addEventListener("click", () => {
      const count = kidsInputsList.querySelectorAll(".kid-row").length + 1;
      const row = document.createElement("div");
      row.className = "kid-row";

      const input = document.createElement("input");
      input.type = "text";
      input.name = "kidName[]";
      input.placeholder = `Kid ${count} Full Name`;
      input.required = true;

      const removeBtn = document.createElement("button");
      removeBtn.type = "button";
      removeBtn.className = "remove-kid-btn";
      removeBtn.setAttribute("aria-label", "Remove kid");
      removeBtn.textContent = "×";
      removeBtn.addEventListener("click", () => {
        row.remove();
        refreshKidPlaceholders();
      });

      row.appendChild(input);
      row.appendChild(removeBtn);
      kidsInputsList.appendChild(row);
      input.focus();
    });
  }

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const fullNameInput = document.getElementById("fullName");
      const companionInput = document.getElementById("companionName");
      const fullName = fullNameInput ? fullNameInput.value.trim() : "";
      const selectedRadio = document.querySelector('input[name="attendance"]:checked');
      const attendance = selectedRadio ? selectedRadio.value : "";
      const companionName =
        attendance === "Declines with regret." || !companionInput
          ? ""
          : companionInput.value.trim();

      const kids =
        attendance === "Yes, I will attend with my kid/s." && kidsInputsList
          ? Array.from(kidsInputsList.querySelectorAll("input"))
              .map((inp) => inp.value.trim())
              .filter(Boolean)
          : [];

      const payload = {
        fullName,
        attendance,
        companionName,
        kids,
      };

      if (submitBtn) submitBtn.disabled = true;
      if (statusEl) statusEl.textContent = "Confirming and sending your RSVP...";

      try {
        await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          mode: "no-cors",
          body: JSON.stringify(payload),
        });

        if (statusEl) statusEl.textContent = "Thank you! Your RSVP has been confirmed and sent.";
        form.reset();
        if (kidsInputsList) {
          kidsInputsList.innerHTML = `
            <div class="kid-row">
              <input type="text" name="kidName[]" placeholder="Kid 1 Full Name" />
            </div>
          `;
        }
        updateRsvpFieldsVisibility();
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = "Unable to send RSVP right now. Please check your internet connection and try again.";
        }
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }
});
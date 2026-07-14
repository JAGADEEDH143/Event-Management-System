/* ==========================================================================
   Eventide — Multi-step Booking Form
   Handles step navigation, per-step validation, review summary, submit.
   ========================================================================== */
(function () {
  "use strict";

  const form = document.getElementById("bookingForm");
  if (!form) return;

  const steps = Array.from(form.querySelectorAll(".form-step"));
  const indicators = Array.from(document.querySelectorAll(".steps .step"));
  let current = 0;

  // Prefill date from calendar selection (query param or localStorage)
  const dateInput = document.getElementById("eventDate");
  const params = new URLSearchParams(location.search);
  const preset = params.get("date") || (function () { try { return localStorage.getItem("eventide:date"); } catch (e) { return null; } })();
  if (preset && dateInput) dateInput.value = preset;

  function showStep(index) {
    steps.forEach((s, i) => (s.hidden = i !== index));
    indicators.forEach((ind, i) => {
      ind.classList.toggle("is-active", i === index);
      ind.classList.toggle("is-done", i < index);
    });
    current = index;
    window.scrollTo({ top: form.getBoundingClientRect().top + window.scrollY - 140, behavior: "smooth" });
  }

  function validateStep(index) {
    const fields = steps[index].querySelectorAll("input[required], select[required]");
    let ok = true;
    fields.forEach((f) => {
      const msg = f.parentElement.querySelector("small");
      let error = "";
      if (!f.value.trim()) error = "This field is required.";
      else if (f.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(f.value)) error = "Enter a valid email.";
      else if (f.id === "guests" && (+f.value < 1)) error = "Must be at least 1 guest.";
      if (msg) msg.textContent = error;
      if (error) ok = false;
    });
    return ok;
  }

  function fillReview() {
    const val = (id) => document.getElementById(id).value || "—";
    document.getElementById("rType").textContent = val("eventType");
    document.getElementById("rDate").textContent = val("eventDate");
    document.getElementById("rGuests").textContent = val("guests");
    document.getElementById("rName").textContent = val("fname");
    document.getElementById("rEmail").textContent = val("email");
    document.getElementById("rBudget").textContent = val("budget");
  }

  form.querySelectorAll("[data-next]").forEach((btn) =>
    btn.addEventListener("click", () => {
      if (!validateStep(current)) return;
      const next = current + 1;
      if (next === steps.length - 1) fillReview();
      showStep(next);
    })
  );
  form.querySelectorAll("[data-prev]").forEach((btn) =>
    btn.addEventListener("click", () => showStep(current - 1))
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(current)) return;
    document.getElementById("bookingSuccess").classList.add("show");
    form.querySelector('button[type="submit"]').disabled = true;
    try { localStorage.removeItem("eventide:date"); } catch (err) {}
  });

  showStep(0);
})();

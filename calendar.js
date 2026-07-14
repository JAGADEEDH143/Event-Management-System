/* ==========================================================================
   Eventide — Availability Calendar
   Deterministic pseudo-availability so the same date always shows the
   same status. Past dates are disabled. Selecting stores the date and
   links through to the booking page.
   ========================================================================== */
(function () {
  "use strict";

  const grid = document.getElementById("calGrid");
  const title = document.getElementById("calTitle");
  const selectionEl = document.getElementById("calSelection");
  const prevBtn = document.getElementById("prevMonth");
  const nextBtn = document.getElementById("nextMonth");
  if (!grid) return;

  const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let view = new Date(today.getFullYear(), today.getMonth(), 1);
  let selectedKey = null;

  // Deterministic status from a date: available / limited / booked
  function statusFor(date) {
    const seed = date.getFullYear() * 372 + (date.getMonth() + 1) * 31 + date.getDate();
    const r = (seed * 9301 + 49297) % 233280 / 233280; // pseudo-random 0..1
    if (r < 0.18) return "booked";
    if (r < 0.4) return "limited";
    return "available";
  }

  function keyOf(d) {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function render() {
    grid.innerHTML = "";
    title.textContent = `${MONTHS[view.getMonth()]} ${view.getFullYear()}`;

    const firstDay = new Date(view.getFullYear(), view.getMonth(), 1).getDay();
    const daysInMonth = new Date(view.getFullYear(), view.getMonth() + 1, 0).getDate();

    // Disable prev nav for months fully in the past
    const isCurrentMonth = view.getFullYear() === today.getFullYear() && view.getMonth() === today.getMonth();
    prevBtn.disabled = isCurrentMonth;
    prevBtn.style.opacity = isCurrentMonth ? "0.4" : "1";

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement("div");
      empty.className = "day day--empty";
      grid.appendChild(empty);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(view.getFullYear(), view.getMonth(), d);
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "day";
      cell.textContent = d;

      const isPast = date < today;
      const isToday = date.getTime() === today.getTime();
      if (isToday) cell.classList.add("day--today");

      if (isPast) {
        cell.classList.add("day--booked");
        cell.disabled = true;
        cell.setAttribute("aria-label", `${keyOf(date)} unavailable (past)`);
      } else {
        const status = statusFor(date);
        if (status === "booked") {
          cell.classList.add("day--booked");
          cell.disabled = true;
          cell.setAttribute("aria-label", `${keyOf(date)} fully booked`);
        } else {
          cell.classList.add(status === "available" ? "day--available" : "day--limited");
          cell.setAttribute("aria-label", `${keyOf(date)} ${status}`);
          if (keyOf(date) === selectedKey) cell.classList.add("day--selected");
          cell.addEventListener("click", () => select(date, status));
        }
      }
      grid.appendChild(cell);
    }
  }

  function select(date, status) {
    selectedKey = keyOf(date);
    render();
    const pretty = date.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    const label = status === "limited" ? " (limited availability)" : "";
    selectionEl.innerHTML = `Selected: <strong>${pretty}</strong>${label} &nbsp; <a class="btn btn--primary" style="margin-left:8px;padding:9px 20px" href="booking.html?date=${selectedKey}">Continue to Booking</a>`;
    try { localStorage.setItem("eventide:date", selectedKey); } catch (e) {}
  }

  prevBtn.addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
    render();
  });
  nextBtn.addEventListener("click", () => {
    view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
    render();
  });

  render();
})();

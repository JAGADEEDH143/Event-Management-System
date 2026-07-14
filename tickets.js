/* ==========================================================================
   Eventide — Ticket selection & order summary
   ========================================================================== */
(function () {
  "use strict";

  const cards = Array.from(document.querySelectorAll(".ticket-card"));
  if (!cards.length) return;

  const summaryLines = document.getElementById("summaryLines");
  const feeEl = document.getElementById("fee");
  const totalEl = document.getElementById("total");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const successEl = document.getElementById("ticketSuccess");
  const FEE_RATE = 0.08;
  const MAX = 10;

  const money = (n) => "$" + n.toFixed(2);

  function update() {
    let subtotal = 0;
    const selected = [];

    cards.forEach((card) => {
      const qty = parseInt(card.querySelector("[data-qty]").textContent, 10);
      const price = parseFloat(card.dataset.price);
      const tier = card.dataset.tier;
      if (qty > 0) {
        subtotal += qty * price;
        selected.push({ tier, qty, price });
      }
    });

    if (selected.length === 0) {
      summaryLines.innerHTML = '<p style="color:var(--muted)">No tickets selected yet.</p>';
      feeEl.textContent = money(0);
      totalEl.textContent = money(0);
      checkoutBtn.disabled = true;
      return;
    }

    summaryLines.innerHTML = selected
      .map((s) => `<div class="line"><span>${s.tier} × ${s.qty}</span><span>${money(s.qty * s.price)}</span></div>`)
      .join("");
    const fee = subtotal * FEE_RATE;
    feeEl.textContent = money(fee);
    totalEl.textContent = money(subtotal + fee);
    checkoutBtn.disabled = false;
  }

  cards.forEach((card) => {
    const out = card.querySelector("[data-qty]");
    const dec = card.querySelector("[data-dec]");
    const inc = card.querySelector("[data-inc]");

    const setQty = (v) => {
      const val = Math.max(0, Math.min(MAX, v));
      out.textContent = val;
      dec.disabled = val === 0;
      inc.disabled = val === MAX;
      update();
    };

    dec.addEventListener("click", () => setQty(parseInt(out.textContent, 10) - 1));
    inc.addEventListener("click", () => setQty(parseInt(out.textContent, 10) + 1));
    setQty(0);
  });

  checkoutBtn.addEventListener("click", () => {
    successEl.classList.add("show");
    checkoutBtn.disabled = true;
    checkoutBtn.textContent = "Order Complete";
  });

  update();
})();

console.log("eBay Scraper content script loaded");

/* ================= CONFIG ================= */
const SHEET_API_URL =
  "https://script.google.com/macros/s/AKfycbzzywVf9a3Zi52vvyGMmcrzX3Xz5n_37PgQWjqK2A0MB_NulnSk9Js-g2Tnv_R4T0zL/exec";

/* ================= BUTTON REF ================= */
let scrapeBtnRef = null;

/* ================= BUTTON ================= */
function injectScrapeButton() {
  if (document.getElementById("ebay-scrape-btn")) return;

  const btn = document.createElement("button");
  btn.id = "ebay-scrape-btn";
  btn.innerText = "Scrape & Save";
  scrapeBtnRef = btn;

  Object.assign(btn.style, {
    position: "fixed",
    top: "90px",
    right: "20px",
    zIndex: "2147483647",
    padding: "12px 18px",
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    fontSize: "14px",
    cursor: "pointer",
    boxShadow: "0 6px 20px rgba(0,0,0,0.35)"
  });

  btn.onclick = scrapeAndSave;
  document.body.appendChild(btn);
}

/* ================= SCRAPER ================= */
async function scrapeAndSave() {

  /* ---------- BUTTON: SCRAPING STATE ---------- */
  scrapeBtnRef.innerText = "Scraping...";
  scrapeBtnRef.disabled = true;
  scrapeBtnRef.style.background = "#6b7280"; // gray
  scrapeBtnRef.style.cursor = "not-allowed";

  const results = [];

  document.querySelectorAll(".su-card-container__content").forEach(card => {
    try {
      const linkEl = card.querySelector("a.s-card__link");
      if (!linkEl || !linkEl.href) return;

      const linkMatch = linkEl.href.match(
        /https:\/\/www\.ebay\.com\/itm\/\d+/
      );
      if (!linkMatch) return;

      const link = linkMatch[0];
      const itemIdMatch = link.match(/\/itm\/(\d+)/);
      if (!itemIdMatch) return;

      const itemId = itemIdMatch[1];

      const titleEl = card.querySelector(
        ".s-card__title .su-styled-text.primary.default"
      );
      if (!titleEl) return;

      const priceEl = card.querySelector(
        ".su-card-container__attributes__primary .s-card__price"
      );
      const price = priceEl ? priceEl.innerText.trim() : "";

      const secondary = card.querySelector(
        ".su-card-container__attributes__secondary"
      );
      if (!secondary) return;

      const positiveSpan = [...secondary.querySelectorAll(
        ".su-styled-text.primary.large"
      )].find(el => el.innerText.includes("positive"));

      if (!positiveSpan) return;

      const match = positiveSpan.innerText.match(/(\d+(\.\d+)?)%/);
      if (!match) return;

      const sellerPositive = parseFloat(match[1]);
      if (sellerPositive <= 95) return;

      results.push({
        itemId,
        title: titleEl.innerText.trim(),
        link,
        price,
        sellerPositive
      });
    } catch {}
  });

  if (!results.length) {
    scrapeBtnRef.innerText = "No Data";
    scrapeBtnRef.style.background = "#dc2626"; // red

    setTimeout(resetButton, 2500);
    return;
  }

  /* ================= SAVE TO SHEETS ================= */
  chrome.runtime.sendMessage(
    {
      type: "SAVE_TO_SHEETS",
      url: SHEET_API_URL,
      data: results
    },
    response => {
      if (response?.ok) {
        scrapeBtnRef.innerText = "Saved ✓";
        scrapeBtnRef.style.background = "#16a34a"; // green
      } else {
        scrapeBtnRef.innerText = "Error";
        scrapeBtnRef.style.background = "#dc2626"; // red
      }

      setTimeout(resetButton, 3000);
    }
  );
}

/* ================= RESET BUTTON ================= */
function resetButton() {
  scrapeBtnRef.innerText = "Scrape & Save";
  scrapeBtnRef.style.background = "#2563eb";
  scrapeBtnRef.disabled = false;
  scrapeBtnRef.style.cursor = "pointer";
}

/* ================= INIT ================= */
injectScrapeButton();

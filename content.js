console.log("eBay Scraper content script loaded");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action !== "SCRAPE") return;

  const results = [];

  document.querySelectorAll(".su-card-container__content").forEach(card => {
    try {
      /* ---------- LINK ---------- */
      const linkEl = card.querySelector("a.s-card__link");
      if (!linkEl || !linkEl.href) return;

      // Extract clean canonical link
      const cleanLinkMatch = linkEl.href.match(
        /https:\/\/www\.ebay\.com\/itm\/\d+/
      );
      if (!cleanLinkMatch) return;

      const cleanLink = cleanLinkMatch[0];

      /* ---------- ITEM ID (FOR DEDUPE) ---------- */
      const itemIdMatch = cleanLink.match(/\/itm\/(\d+)/);
      if (!itemIdMatch) return;

      const itemId = itemIdMatch[1];

      /* ---------- TITLE ---------- */
      const titleEl = card.querySelector(
        ".s-card__title .su-styled-text.primary.default"
      );
      if (!titleEl) return;

      /* ---------- PRICE ---------- */
      const priceEl = card.querySelector(
        ".su-card-container__attributes__primary .s-card__price"
      );
      const price = priceEl ? priceEl.innerText.trim() : "";

      /* ---------- SELLER POSITIVE % ---------- */
      const secondaryAttr = card.querySelector(
        ".su-card-container__attributes__secondary"
      );
      if (!secondaryAttr) return;

      const positiveSpan = Array.from(
        secondaryAttr.querySelectorAll(".su-styled-text.primary.large")
      ).find(el => el.innerText.includes("positive"));

      if (!positiveSpan) return;

      const match = positiveSpan.innerText.match(/(\d+(\.\d+)?)%/);
      if (!match) return;

      const sellerPositive = parseFloat(match[1]);

      /* ---------- FILTER (ONLY > 95%) ---------- */
      if (sellerPositive <= 95) return;

      /* ---------- PUSH RESULT ---------- */
      results.push({
        itemId,                    // 👈 REQUIRED FOR DEDUPE
        title: titleEl.innerText.trim(),
        link: cleanLink,
        price,
        sellerPositive
      });

    } catch (err) {
      // silently skip broken cards
    }
  });

  console.log("Scraped results:", results);
  sendResponse(results);
  return true; // required for async response
});

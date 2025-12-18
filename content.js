chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "SCRAPE") return;

  const results = [];

  document.querySelectorAll(".su-card-container__content").forEach(card => {
    try {
      const linkEl = card.querySelector("a.s-card__link");
      const link = linkEl?.href;
      if (!link) return;

      const titleEl = card.querySelector(".s-card__title");
      const title = titleEl ? titleEl.innerText.trim() : null;
      if (!title) return;

      const priceEl = card.querySelector(".s-card__price");
      const price = priceEl ? priceEl.innerText.trim() : "";

      // MATCH ITEM ID
      const itemIdMatch = link.match(/\/itm\/(\d+)/);
      const itemId = itemIdMatch ? itemIdMatch[1] : "";
      if (!itemId) return;

      // GET SECONDARY BLOCK (same as your original)
      const secondary = card.querySelector(".su-card-container__attributes__secondary");
      if (!secondary) return;

      // ROBUST SELLER POSITIVE EXTRACTION
      let sellerPositive = null;
      secondary.querySelectorAll("*").forEach(el => {
        const txt = el.innerText?.trim();
        if (txt && txt.match(/\d+(\.\d+)?%/)) {
          const match = txt.match(/(\d+(\.\d+)?)/);
          if (match) sellerPositive = parseFloat(match[1]);
        }
      });

      if (!sellerPositive) return;           // skip if not found
      if (sellerPositive < 95) return;       // seller threshold

      results.push({
        itemId,
        title,
        link,
        price,
        sellerPositive
      });
    } catch (err) {
      console.warn("Error parsing card:", err);
    }
  });

  sendResponse(results);
});

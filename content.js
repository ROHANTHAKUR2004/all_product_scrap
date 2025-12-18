chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action !== "SCRAPE") return;

  const results = [];

  document.querySelectorAll(".su-card-container__content").forEach(card => {
    try {
      const linkEl = card.querySelector("a.s-card__link");
      const link = linkEl?.href;

      const title = card.querySelector(".s-card__title")?.innerText;
      const price = card.querySelector(".s-card__price")?.innerText;

      const sellerEl = card.querySelector(".su-styled-text.primary.large");
      const sellerPositive = sellerEl ? parseFloat(sellerEl.innerText) : null;

      const itemIdMatch = link?.match(/\/itm\/(\d+)/);
      const itemId = itemIdMatch ? itemIdMatch[1] : "";

      if (!link || !title || sellerPositive < 95) return;

      results.push({
        itemId,
        title,
        link,
        price,
        sellerPositive
      });
    } catch {}
  });

  sendResponse(results);
});

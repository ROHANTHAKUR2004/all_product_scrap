const resultsDiv = document.getElementById("results");
const scrapeBtn = document.getElementById("scrapeBtn");

// 🔴 PUT YOUR APPS SCRIPT URL HERE
const SHEET_API_URL = "https://script.google.com/macros/s/AKfycbzzywVf9a3Zi52vvyGMmcrzX3Xz5n_37PgQWjqK2A0MB_NulnSk9Js-g2Tnv_R4T0zL/exec";

scrapeBtn.addEventListener("click", async () => {
  resultsDiv.innerHTML = "Scraping...";

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.tabs.sendMessage(tab.id, { action: "SCRAPE" }, async (data) => {
    if (!data || !data.length) {
      resultsDiv.innerHTML = "No data found";
      return;
    }

    // Show results in popup
    resultsDiv.innerHTML = "";
    data.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";

      div.innerHTML = `
        <div><b>${item.title}</b></div>
        <div style="font-size:11px">${item.link}</div>
        <div style="color:green">Price: ${item.price}</div>
        <div>Seller Positive: ${item.sellerPositive}%</div>
        <hr/>
      `;

      resultsDiv.appendChild(div);
    });

    // 🔥 SEND TO GOOGLE SHEETS
    try {
      const res = await fetch(SHEET_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (res.ok) {
        console.log("Saved to Google Sheets");
      } else {
        console.error("Failed to save");
      }
    } catch (err) {
      console.error("Error sending to Sheets:", err);
    }
  });
});

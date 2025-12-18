const API_URL = "https://script.google.com/macros/s/AKfycbyXTilGNh3NZn2low2EN8MVreARnPJu_ralUCr7yHVQiQbrqytxPypvTDlKuIyb7KWnPg/exec";

// HOTKEY HANDLER
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== "scrape_shortcut") return;

  console.log("Hotkey pressed → SCRAPE trigger.");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  chrome.tabs.sendMessage(tab.id, { action: "SCRAPE" }, async (data) => {
    if (!data || !data.length) {
      console.log("No data scraped.");
      return;
    }

    console.log("Scrape data returned:", data);

    // Load user
    chrome.storage.local.get("user", async (stored) => {
      const user = stored.user;
      if (!user) {
        console.log("No user found.");
        return;
      }

      // Add user info into each scraped item
      const payload = data.map(item => ({
        userId: user.userId,
        ...item
      }));

      // Send to Google sheet
      try {
        await fetch(API_URL, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        console.log("Saved to sheet.");
      } catch (err) {
        console.error("Sheet saving failed:", err);
      }
    });
  });
});

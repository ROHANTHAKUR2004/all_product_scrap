chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type !== "SAVE_TO_SHEETS") return;

  fetch(message.url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(message.data)
  })
    .then(res => res.text())
    .then(text => {
      sendResponse({ ok: true, response: text });
    })
    .catch(err => {
      sendResponse({ ok: false, error: err.toString() });
    });

  return true; // IMPORTANT
});

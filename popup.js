const API_URL = "https://script.google.com/macros/s/AKfycbyXTilGNh3NZn2low2EN8MVreARnPJu_ralUCr7yHVQiQbrqytxPypvTDlKuIyb7KWnPg/exec";

const loginSection = document.getElementById("loginSection");
const scrapeSection = document.getElementById("scrapeSection");
const loginBtn = document.getElementById("loginBtn");
const scrapeBtn = document.getElementById("scrapeBtn");
const resultsDiv = document.getElementById("results");

function checkAuth() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (user) {
    loginSection.style.display = "none";
    scrapeSection.style.display = "block";
  } else {
    loginSection.style.display = "block";
    scrapeSection.style.display = "none";
  }
}

checkAuth();

// LOGIN
loginBtn.addEventListener("click", async () => {
  const name = document.getElementById("nameInput").value;
  const email = document.getElementById("emailInput").value;

  if (!name || !email) {
    alert("Enter name & email");
    return;
  }

  const userId = crypto.randomUUID();
  const userData = { userId, name, email };

  localStorage.setItem("user", JSON.stringify(userData));

  await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(userData)
  });

  checkAuth();
});

// SCRAPE
scrapeBtn.addEventListener("click", async () => {
  resultsDiv.innerHTML = "Scraping...";

  const user = JSON.parse(localStorage.getItem("user"));

  const [tab] = await chrome.tabs.query({
    active: true,
    currentWindow: true
  });

  chrome.tabs.sendMessage(tab.id, { action: "SCRAPE" }, async (data) => {
    if (!data?.length) {
      resultsDiv.innerHTML = "No items found";
      return;
    }

    const payload = data.map(item => ({
      userId: user.userId,
      ...item
    }));

    resultsDiv.innerHTML = "";
    payload.forEach(item => {
      const div = document.createElement("div");
      div.className = "item";
      div.innerHTML = `${item.title}<br>${item.price}<br>${item.sellerPositive}%`;
      resultsDiv.appendChild(div);
    });

    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  });
});

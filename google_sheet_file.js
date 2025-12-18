function doPost(e) {
  const payload = JSON.parse(e.postData.contents);

  // USER
  if (payload.name && payload.email) {
    return saveUser(payload);
  }

  // PRODUCTS
  return saveProducts(payload);
}

function saveUser(user) {
  const userSheet = SpreadsheetApp
    .openById("1eh8RINcZKUvbn0mOxqGngRvK4lhir3rTRwNULTNM8W0")
    .getSheetByName("Users");

  userSheet.appendRow([
    user.userId,
    user.name,
    user.email,
    new Date()
  ]);

  return ContentService.createTextOutput("User Saved");
}

function saveProducts(products) {
  const productSheet = SpreadsheetApp
    .openById("1vIxO8-z9l0wJ0t-vyPCTGLedImPFxR6akEYO1lGGVNY")
    .getSheetByName("Products");

  const lastRow = productSheet.getLastRow();
  const existing = {};

  if (lastRow > 1) {
    const ids = productSheet.getRange(2, 2, lastRow - 1, 1).getValues();
    ids.forEach(row => {
      const id = row[0] ? row[0].toString().trim() : null;
      if (id) existing[id] = true;
    });
  }

  products.forEach(p => {
    const idStr = p.itemId.toString().trim();
    if (!existing[idStr]) {
      productSheet.appendRow([
        p.userId,
        idStr,
        p.title,
        p.price,
        p.sellerPositive,
        p.link,
        new Date()
      ]);
      existing[idStr] = true; // update cache
    }
  });

  return ContentService.createTextOutput("Products Saved without duplicates");
}


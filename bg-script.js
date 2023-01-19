browser.runtime.onInstalled.addListener(() => {
  console.log("Extension was installed!");

  browser.storage.local.get("installed").then((installed) => {
    console.log(installed);
    if (isEmpty(installed)) {
      console.log("LocalStorage is empty!");

      browser.storage.local.set({
        installed: true,
      });

      browser.storage.local.set({
        balance: JSON.stringify(1),
      });
    }
  });
});

// This event is run in the top level scope of the event page, and will persist, allowing
// it to restart the event page if necessary.
browser.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (!isTabFinishedLoading(changeInfo, tab)) {
    return;
  }

  if (!isValidTab(tab)) {
    return;
  }

  // don't count automatic refreshes
  if (sessionStorage.getItem(tabId + tab.url) != null) {
    return;
  }
  sessionStorage.setItem(tabId + tab.url, "true");

  console.log("change info:");
  console.log(changeInfo);

  // update the visit count for this tab
  cleanUrl = cleanURL(tab.url);
  updateCount(cleanUrl);
  updateBaseCount(cleanUrl);
  updateBalance();
});

function updateBalance() {
  browser.storage.local.get("balance").then((currentBalance) => {
    currentBalanceInt = JSON.parse(currentBalance.balance);
    currentBalanceInt += 1;
    browser.storage.local.set({
      balance: JSON.stringify(currentBalanceInt),
    });
    console.log("Current balance: " + currentBalanceInt);
  });
}

function updateBaseCount(url) {
  let key = getBaseURL(url);
  browser.storage.local.get(key).then(
    (website) => {
      if (isEmpty(website)) {
        console.log("Current count: 1");
        browser.storage.local.set({
          [key]: { count: 1, isBase: true },
        });
      } else {
        console.log(website);
        browser.storage.local.set({
          [key]: { count: website[key].count + 1, isBase: true },
        });
        console.log("Current count: " + website[key].count);
      }
    },
    (error) => {
      console.error(error);
    }
  );

  // update recent website list
  let recent = "recent";
  browser.storage.local.get(recent).then(
    (websiteList) => {
      if (isEmpty(websiteList)) {
        websiteList = [];
        websiteList.push(key);
        browser.storage.local.set({
          [recent]: { websiteList },
        });
      } else {
        websiteList = websiteList.recent.websiteList;
        websiteList.push(key);
        if (websiteList.length > 5) {
          websiteList.shift(); // removes the first element in the array
        }
        browser.storage.local.set({
          [recent]: { websiteList },
        });
      }
    },
    (error) => {
      console.error(error);
    }
  );
}

function updateCount(url) {
  let key = url;
  browser.storage.local.get(key).then(
    (website) => {
      if (isEmpty(website)) {
        console.log("Current count: 1");
        browser.storage.local.set({
          [key]: { count: 1, isBase: false },
        });
      } else {
        console.log(website);
        browser.storage.local.set({
          [key]: { count: website[key].count + 1, isBase: false },
        });
        console.log("Current count: " + website[key].count);
      }
    },
    (error) => {
      console.error(error);
    }
  );
}

function isValidTab(tab) {
  let pathArray = tab.url.split("/");
  let protocol = pathArray[0];

  return protocol == "http:" || protocol == "https:";
}

function cleanURL(url) {
  let path = url.split("#");
  return path[0];
}

function getBaseURL(url) {
  let pathArray = url.split("/");
  let protocol = pathArray[0];
  let host = pathArray[2];
  let base = protocol + "//" + host;

  return base;
}

function getBaseURL(url) {
  let pathArray = url.split("/");
  let protocol = pathArray[0];
  let host = pathArray[2];
  let base = protocol + "//" + host;
  return base;
}

function isTabFinishedLoading(changeInfo, tab) {
  return (
    changeInfo.status == "complete" &&
    tab.status == "complete" &&
    tab.url != undefined
  );
}

function isEmpty(object) {
  return (
    object &&
    Object.keys(object).length === 0 &&
    Object.getPrototypeOf(object) === Object.prototype
  );
}

document.addEventListener("DOMContentLoaded", (e) => {
  browser.storage.local.get("balance").then((currentBalance) => {
    balance = JSON.parse(currentBalance.balance);
    const header = document.querySelector("#balance-header");

    header.innerHTML = `You've nibbled on ${balance} website`;
    if (balance > 1) {
      header.innerHTML += "s";
    }
    header.innerHTML += " this month!   🎉";
  });

  const recentTable = document.querySelector("#recent-table");
  recentTable.innerHTML = ""; // clear the current list

  const nibbleTable = document.querySelector("#top-table");
  nibbleTable.innerHTML = ""; // clear the current list

  var updateRecentList = function (website) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    const a = document.createElement("a");
    const websiteTxt = document.createTextNode(website);
    a.appendChild(websiteTxt);
    a.href = "https://" + website;
    a.target = "_blank";
    td.appendChild(a);
    tr.appendChild(td);
    recentTable.appendChild(tr);
  };

  var updateNibbleList = function (website, count) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const a = document.createElement("a");
    const websiteTxt = document.createTextNode(website);
    const countTxt = document.createTextNode(count);
    a.appendChild(websiteTxt);
    a.href = "https://" + website;
    a.target = "_blank";
    td1.appendChild(a);
    tr.appendChild(td1);
    td2.appendChild(countTxt);
    tr.appendChild(td2);
    nibbleTable.appendChild(tr);
  };

  let recent = "recent";
  browser.storage.local.get(recent).then((websiteList) => {
    let list = websiteList.recent.websiteList;
    list.reverse();
    list.forEach((website, index) => {
      updateRecentList(getWebsiteName(website));
    });
  });

  browser.storage.local.get().then((websites) => {
    const keys = Object.keys(websites);
    let sorted = [];

    keys.forEach((key, index) => {
      if (websites[key].isBase) {
        // console.log(`pushed ${key} and ${websites[key].count}`);
        sorted.push([getWebsiteName(key), websites[key].count]);
      }
    });

    sorted.sort(function (a, b) {
      return a[1] - b[1];
    });

    sorted.reverse();
    if (sorted.length > 20) {
      sorted.length = 20; // cap at 20
    }

    for (i = 0; i < sorted.length; i++) {
      updateNibbleList(sorted[i][0], sorted[i][1]);
    }
  });
});

function getWebsiteName(url) {
  let pathArray = url.split("/");
  let host = pathArray[2];
  return host;
}

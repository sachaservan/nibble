document.addEventListener("DOMContentLoaded", (e) => {
  browser.storage.local.get("balance").then((currentBalance) => {
    balance = JSON.parse(currentBalance.balance);
    console.log(`Balance ${balance}`);
    const header = document.querySelector("#balance-header");
    header.innerHTML = `Balance: ${balance} nybls`;
  });

  const table = document.querySelector("#top-table");
  table.innerHTML = ""; // clear the current list

  var updateList = function (website, count) {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    const td2 = document.createElement("td");
    const websiteTxt = document.createTextNode(website);
    const countTxt = document.createTextNode(count);
    td1.appendChild(websiteTxt);
    tr.appendChild(td1);
    td2.appendChild(countTxt);
    tr.appendChild(td2);
    table.appendChild(tr);
  };

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
      updateList(sorted[i][0], sorted[i][1]);
    }
  });
});

function getWebsiteName(url) {
  let pathArray = url.split("/");
  let host = pathArray[2];
  return host;
}

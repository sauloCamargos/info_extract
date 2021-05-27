// // Initialize button with user's preferred color
// let typeStorageSelected = document.querySelector("input[type='radio'][name='storage']:checked");

let storageSelected = document.querySelector("#localStorageInput").checked = true;
let copyData = document.getElementById("copyData");
let pasteData = document.getElementById("pastData");
let listItens = document.getElementById("listItens");
let clipboardPreview = document.querySelector(".clipboard-preview");
let storageData;


// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  
  
  if (
    area === 'local' &&
    changes.storage_data &&
    changes.storage_data.newValue
  ) {
    handleStorageData()
  }
  if (
    area === 'local' &&
    changes.handle_list &&
    changes.handle_list.newValue
  ) {
    changeType()
  }
  if (
    area === 'local' &&
    changes.storage_copy &&
    changes.storage_copy.newValue
  ) {
    clearSelectedItens()
  }
});

let handleList = (newValue) => {
  storageData = JSON.parse(newValue);
  let itens = Object.keys(storageData);
  listItens.innerHTML = '';
  itens.forEach((item, index) => {
    listItens.innerHTML += `<li><input id='key_storage_value_item_${index}' class='key_storage_value' type='checkbox' value='${item}']><label for="key_storage_value_item_${index}">${item}</label></li>`;
  });
}

let handleStorageData = () => {
  chrome.storage.local.get('storage_data', ({ storage_data }) => {
    storageData = JSON.parse(storage_data);
    let itens = Object.keys(storageData);
    listItens.innerHTML = '';
    itens.forEach((item, index) => {
      listItens.innerHTML += `<li><input id='key_storage_value_item_${index}' class='key_storage_value' type='checkbox' value='${item}']><label for="key_storage_value_item_${index}">${item}</label></li>`;
    });
  })
}

let getTypeStorageSelected = () => {
  return document.querySelector("input[type='radio'][name='storage']:checked").value;
}

let changeType = () => {
  let storage_selected = getTypeStorageSelected()
  chrome.storage.local.set({ storage_selected });
  getStorageList()
}

let getCurrentTab = async () => {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

copyData.addEventListener('click', () => {
  let keysElements = document.querySelectorAll('.key_storage_value');
  let dataStorageCopy = {};
  let key;
  keysElements.forEach(element => {
    if (element.checked) {
      key = element.value;
      dataStorageCopy[key] = storageData[key];
    }
  });
  chrome.storage.local.set({ "storage_copy": dataStorageCopy });
  setTimeout(() => {
    handleClipboardPreview();
  }, 1000);
});

let clearSelectedItens = () => {
  let keysElements = document.querySelectorAll('.key_storage_value');
  keysElements.forEach(element => {
    element.checked = false
  });
}


document.querySelectorAll("input[type='radio'][name='storage']").forEach((input) => {
  input.addEventListener('change', changeType);
});

let handleClipboardPreview = async () => {
  chrome.storage.local.get('storage_copy', ({ storage_copy }) => {
    clipboardPreview.textContent = JSON.stringify(storage_copy, undefined, 2);
  });
}



let getStorageList = async () => {
  let currentTab = await getCurrentTab()
  await chrome.scripting.executeScript({
    target: { tabId: currentTab.id },
    function: async () => {
      await chrome.storage.local.get('storage_selected', ({ storage_selected }) => {
        if (storage_selected == 'local') {
          chrome.storage.local.set({ storage_data: JSON.stringify(localStorage) });
        }
        if (storage_selected == 'session') {
          chrome.storage.local.set({ storage_data: JSON.stringify(sessionStorage) });
        }
      });
    },
  });
}

pasteData.addEventListener('click', async () => {
  let currentTab = await getCurrentTab()
  await chrome.scripting.executeScript({
    target: { tabId: currentTab.id },
    function: async () => {
      await chrome.storage.local.get(['storage_copy', 'storage_selected'], ({ storage_copy, storage_selected }) => {
        if (!storage_copy) return;
        for (const key in storage_copy) {
          if (Object.hasOwnProperty.call(storage_copy, key)) {
            if (storage_selected == 'local') {
              localStorage.setItem(key, storage_copy[key]);
            }
            if (storage_selected == 'session') {
              sessionStorage.setItem(key, storage_copy[key]);
            }
          }
        }
        let random = (new Date).getTime();
        chrome.storage.local.set({ handle_list: random });

      });
    },
  });
});

handleClipboardPreview();
changeType();
handleStorageData();

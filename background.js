// Where we will expose all the data we retrieve from storage.sync.
const storageCache = {};
// Asynchronously retrieve data from storage.sync, then cache it.
const initStorageCache = getAllStorageSyncData().then(items => {
  // Copy the data retrieved from storage into storageCache.
  Object.assign(storageCache, items);
});

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await initStorageCache;
    console.log(storageCache)
  } catch (e) {
    // Handle error that occurred during storage initialization.
  }
  // Normal action handler logic.
});

// Reads all data out of storage.sync and exposes it via a promise.
//
// Note: Once the Storage API gains promise support, this function
// can be greatly simplified.
function getAllStorageSyncData() {
  // Immediately return a promise and start asynchronous work
  return new Promise((resolve, reject) => {
    // Asynchronously fetch all data from storage.sync.
    chrome.storage.sync.get(null, (items) => {
      // Pass any observed errors down the promise chain.
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      // Pass the data retrieved from storage down the promise chain.
      resolve(items);
    });
  });
}

let storageCopy;
// Watch for changes to the user's options & apply them
chrome.storage.onChanged.addListener((changes, area) => {
  console.log(changes)
  console.log(area)
  if (
    area === 'local' &&
    changes.storage_selected &&
    changes.storage_selected.newValue
  ) {

  }
  if (
    area === 'local' &&
    changes.storage_copy &&
    changes.storage_copy.newValue
  ) {
    storageCopy = changes.storage_copy.newValue
  }
});


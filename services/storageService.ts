
const DB_NAME = 'OkinawaTripDB';
const DB_VERSION = 1;
const STORE_NAME = 'appData';

export const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onerror = (event) => {
      reject((event.target as IDBOpenDBRequest).error);
    };
  });
};

export const saveData = async (key: string, data: any): Promise<void> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(data, key);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`Failed to save ${key} to IndexedDB`, err);
    // Fallback to localStorage if IndexedDB fails for some reason
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.error("LocalStorage fallback also failed", e);
    }
  }
};

export const loadData = async (key: string): Promise<any> => {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);

      request.onsuccess = () => {
          if (request.result !== undefined) {
              resolve(request.result);
          } else {
              // Fallback to localStorage for migration or if not in IDB
              const localData = localStorage.getItem(key);
              if (localData) {
                  try {
                      resolve(JSON.parse(localData));
                  } catch (e) {
                      resolve(null);
                  }
              } else {
                  resolve(null);
              }
          }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (err) {
    console.error(`Failed to load ${key} from IndexedDB`, err);
    const localData = localStorage.getItem(key);
    if (localData) {
        try {
            return JSON.parse(localData);
        } catch (e) {
            return null;
        }
    }
    return null;
  }
};

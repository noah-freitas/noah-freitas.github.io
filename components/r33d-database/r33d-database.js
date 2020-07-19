import R33dElement from '../r33d-element/r33d-element.js';

const openDb      = Symbol('openDb'),
      runUpgrades = Symbol('runUpgrades');

const dbUpgrades = [
    e => {
        let db = e.target.result;

        let bookStore = db.createObjectStore('books', { keyPath : 'id', autoIncrement : true });
        bookStore.createIndex('authorId', 'authorId', { unique : false });
        bookStore.createIndex('completedDate', 'completedDate', { unique : false });
        bookStore.createIndex('isbn', 'isbn', { unique : true });
        bookStore.createIndex('name', 'name', { unique : true });
        bookStore.createIndex('pageCount', 'pageCount', { unique : false });
        bookStore.createIndex('publisherId', 'publisherId', { unique : false });
        bookStore.createIndex('publishedYear', 'publishedYear', { unique : false });
        bookStore.createIndex('subjects', 'subjects', { multiEntry : true, unique : false });
        bookStore.createIndex('wordsPerPage', 'wordsPerPage', { unique : false });

        let authorStore = db.createObjectStore('authors', { keyPath : 'id', autoIncrement : true });
        authorStore.createIndex('name', 'name', { unique : true });

        let publisherStore = db.createObjectStore('publishers', { keyPath : 'id', autoIncrement : true });
        publisherStore.createIndex('name', 'name', { unique : true });

        let readingStore = db.createObjectStore('readings', { keyPath : 'id', autoIncrement : true });
        readingStore.createIndex('bookId', 'bookId', { unique : false });
        readingStore.createIndex('scheduledDate', 'scheduledDate', { unique : true });
        readingStore.createIndex('completedDate', 'completedDate', { unique : false });
        readingStore.createIndex('completedDate,scheduledDate', ['completedDate', 'scheduledDate'], { unique : false });
        readingStore.createIndex('startPage', 'startPage', { unique : false });
        readingStore.createIndex('endPage', 'endPage', { unique : false });
        readingStore.createIndex('totalPages', 'totalPages', { unique : false });

        let skimmingsStore = db.createObjectStore('skimmings', { keyPath : 'id', autoIncrement : true });
        skimmingsStore.createIndex('completedDate', 'completedDate', { unique : true });
        skimmingsStore.createIndex('startBookId', 'startBookId', { unique : false });
        skimmingsStore.createIndex('startPage', 'startPage', { unique : false });
        skimmingsStore.createIndex('endBookId', 'endBookId', { unique : false });
        skimmingsStore.createIndex('endPage', 'endPage', { unique : false });

        console.info('Installed version 1 of the database.');
    }
];

class R33dDatabaseElement extends R33dElement {
    // add :: String, Object -> Promise<undefined, Error>
    async add(storeName, obj) {
        return await this.fromObjectStore(storeName, store => store.add(obj), {
            successFn       : _ => undefined,
            transactionMode : 'readwrite'
        });
    }

    // count :: String, Number -> Promise<Number, Error>
    async count(storeName, key) {
        return await this.fromObjectStore(storeName, store => store.count(key));
    }

    // delete :: String, Number -> Promise<undefined, Error>
    async delete(storeName, key) {
        return await this.fromObjectStore(storeName, store => store.delete(key), {
            successFn       : _ => undefined,
            transactionMode : 'readwrite'
        });
    }

    // fromIndex :: String, String, String || IDBKeyRange -> Promise<[a], Error>
    async fromIndex(storeName, indexName, key) {
        return await this.fromObjectStore(storeName, store => store.index(indexName).getAll(key));
    }

    // openIndexCursor :: String, String, Object, String -> Promise<IDBCursor, Error>
    async * openIndexCursor(storeName, indexName, query, direction = 'next') {
        const db    = await this.db;
        const index = db.transaction(storeName, 'readonly').objectStore(storeName).index(indexName);
        const req   = index.openCursor(query, direction);

        let reqPromiseResolver, reqPromiseRejector;

        req.onsuccess = e => {
            if (reqPromiseResolver) reqPromiseResolver(e.target.result);
        };
        req.onerror = e => {
            if (reqPromiseRejector) reqPromiseRejector(e.target.error);
        };

        let cursor = await waitForNextCursor();

        while (cursor) {
            yield cursor.value;
            cursor.continue();
            cursor = await waitForNextCursor();
        }

        return;

        function waitForNextCursor() {
            return new Promise((res, rej) => {
                reqPromiseResolver = res;
                reqPromiseRejector = rej;
            });
        }
    }

    // get :: String, Number | [Number] -> Promise<Object, Error>
    async get(storeName, key) {
        if (Array.isArray(key)) return await Promise.all(key.map(k => this.get(storeName, k)));

        return await this.fromObjectStore(storeName, store => store.get(key));
    }

    // getAll :: String -> Promise<[Object], Error>
    async getAll(storeName) {
        return await this.fromObjectStore(storeName, store => store.getAll());
    }

    // put :: String, Object -> Promise<undefined, Error>
    async put(storeName, obj) {
        return await this.fromObjectStore(storeName, store => store.put(obj), {
            successFn       : _ => undefined,
            transactionMode : 'readwrite'
        });
    }

    // upsert :: String, String, Object -> Promise<undefined, Error>
    async upsert(store, key, obj) {
        let existing = await this.get(store, key);
        return existing ? await this.put(store, obj) : this.add(store, obj);
    }

    // name :: String
    get name() {
        return 'r33d';
    }

    // db :: Promise<IDBDatabase, Error>
    get db() {
        return this[openDb]().then(e => e.target.result, e => Promise.reject(e.target.errorCode));
    }

    async fromObjectStore(storeName, storeFn, opts = {}) {
        let db    = await this.db;
        let store = db.transaction(storeName, opts.transactionMode || undefined).objectStore(storeName);
        let req   = storeFn(store);

        return new Promise((res, rej) => {
            let successFn = opts.successFn || (e => e.target.result);

            req.addEventListener('success', e => res(successFn(e)));
            req.addEventListener('error', e => rej(e.target.errorCode));
            req.addEventListener('abort', e => rej(e.target.errorCode));
        });
    }

    // openDb :: String? -> Promise<Event, Event>
    [openDb](dbName = this.name) {
        return new Promise((res, rej) => {
            let req = window.indexedDB.open(dbName, 1);
            req.addEventListener('error', rej);
            req.addEventListener('success', res);
            req.addEventListener('upgradeneeded', this[runUpgrades].bind(this));
        });
    }

    // runUpgrades :: IDBVersionChangeEvent -> undefined
    [runUpgrades](e) {
        dbUpgrades.slice((e.oldVersion || 0) - e.newVersion).forEach(fn => fn(e));
    }
}

customElements.define('r33d-database', R33dDatabaseElement);

export default R33dDatabaseElement;

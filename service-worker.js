const cacheName = '0.0.78',
      showLog   = false;

const assetUrls = [
    '/components/r33d-bookshelf/r33d-bookshelf.html',
    '/components/r33d-bookshelf/r33d-bookshelf.js',
    '/components/r33d-bookshelf-book/r33d-bookshelf-book.html',
    '/components/r33d-bookshelf-book/r33d-bookshelf-book.js',
    '/components/r33d-daily-status/r33d-daily-status.html',
    '/components/r33d-daily-status/r33d-daily-status.js',
    '/components/r33d-database/r33d-database.js',
    '/components/r33d-element/r33d-element.js',
    '/components/r33d-object-editor/r33d-object-editor.html',
    '/components/r33d-object-editor/r33d-object-editor.js',
    '/components/r33d-object-editor-column/r33d-object-editor-column.html',
    '/components/r33d-object-editor-column/r33d-object-editor-column.js',
    '/components/r33d-object-importer/r33d-object-importer.html',
    '/components/r33d-object-importer/r33d-object-importer.js',
    '/components/r33d-object-importer-column/r33d-object-importer-column.html',
    '/components/r33d-object-importer-column/r33d-object-importer-column.js',
    '/components/r33d-object-list/r33d-object-list.html',
    '/components/r33d-object-list/r33d-object-list.js',
    '/components/r33d-object-list-column/r33d-object-list-column.html',
    '/components/r33d-object-list-column/r33d-object-list-column.js',
    '/components/r33d-page/r33d-page.html',
    '/components/r33d-page/r33d-page.js',
    '/components/r33d-service-worker/r33d-service-worker.js',
    '/components/r33d-today/r33d-today.html',
    '/components/r33d-today/r33d-today.js',
    '/components/r33d-ui-element/r33d-ui-element.js',
    '/lib/date.js',
    '/pages/add-author.html',
    '/pages/add-book.html',
    '/pages/add-publisher.html',
    '/pages/add-reading.html',
    '/pages/add-skimming.html',
    '/pages/author.html',
    '/pages/authors.html',
    '/pages/book.html',
    '/pages/books.html',
    '/pages/bookshelf.html',
    '/pages/import-authors.html',
    '/pages/import-books.html',
    '/pages/import-publishers.html',
    '/pages/import-readings.html',
    '/pages/import-skimmings.html',
    '/pages/publisher.html',
    '/pages/publishers.html',
    '/pages/reading.html',
    '/pages/readings.html',
    '/pages/skimming.html',
    '/pages/skimmings.html',
    '/styles/main.css',
    '/index.html',
    '/manifest.json',

];

self.addEventListener('install'  , installHandler);
self.addEventListener('activate' , activateHandler);
self.addEventListener('fetch'    , fetchHandler);

// installHandler :: ExtendableEvent -> undefined
function installHandler(e) {
    log('install: ', e);

    e.waitUntil(caches.open(cacheName)
                      .then(cache => Promise.all(assetUrls.map(url => cache.add(url)))));
}

// activateHandler :: ExtendableEvent -> undefined
function activateHandler(e) {
    log('activate: ', e);

    e.waitUntil(caches.keys()
                      .then(cacheList => Promise.all(cacheList.filter(c => c !== cacheName)
                                                              .map(c => caches.delete(c)))));
}

// fetchHandler :: FetchEvent -> undefined
function fetchHandler(e) {
    log('fetch: ', e);

    e.respondWith((e =>
        caches.open(cacheName)
            .then(cache => cache.match(e.request))
            .then(response => {
                log(`${e.request.method} ${e.request.url} served from ${response ? 'cache' : 'network'}`);
                return response;
            })
            .then(response => response || fetch(e.request)))(e));
}

// log :: ...String -> undefined
function log(...msg) {
    if (showLog) console.log.apply(console, msg);
}

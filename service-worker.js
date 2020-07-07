const cacheName = '0.0.39',
      showLog   = false;

const assetUrls = [
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
    '/styles/main.css',
    '/add-author.html',
    '/add-book.html',
    '/add-publisher.html',
    '/add-reading.html',
    '/add-skimming.html',
    '/author.html',
    '/authors.html',
    '/book.html',
    '/books.html',
    '/import-authors.html',
    '/import-books.html',
    '/import-publishers.html',
    '/import-readings.html',
    '/import-skimmings.html',
    '/index.html',
    '/manifest.json',
    '/publisher.html',
    '/publishers.html',
    '/reading.html',
    '/readings.html',
    '/skimming.html',
    '/skimmings.html',
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

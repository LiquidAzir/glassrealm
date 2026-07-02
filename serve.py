"""Tiny static file server for GlassRealm dev.

Plain `python -m http.server` sends no Cache-Control, so browsers heuristically
cache ES modules and can serve stale code after edits. This sends no-store on
everything so every reload fetches fresh source.
"""
import http.server
import sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 5191


class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

    def send_header(self, key, value):
        # drop Last-Modified so the browser never gets a 304 / serves stale modules
        if key.lower() == 'last-modified':
            return
        super().send_header(key, value)


Handler.extensions_map['.webmanifest'] = 'application/manifest+json'
Handler.extensions_map['.js'] = 'text/javascript'

http.server.ThreadingHTTPServer.allow_reuse_address = True
# The browser opens a burst of ~30 parallel connections for the ES-module graph on
# load. The default listen backlog (request_queue_size=5) overflows under that burst,
# so the OS intermittently REFUSES a connection — and if the refused one is a module
# everything imports (e.g. shaders.js), the whole game hangs on the boot screen.
# A generous backlog makes the initial module fetch reliable.
http.server.ThreadingHTTPServer.request_queue_size = 128
with http.server.ThreadingHTTPServer(('', PORT), Handler) as httpd:
    print(f'GlassRealm dev server on http://localhost:{PORT} (no-store, threaded)')
    httpd.serve_forever()

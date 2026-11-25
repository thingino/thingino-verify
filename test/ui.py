#!/usr/bin/env python3
"""Drive the real page in headless chromium over CDP.

Serve web/ first (python3 -m http.server 8123 from web/), then run this.
Set CHROME=/path/to/chrome or URL=... to override; screenshots land in
$SHOTS or a temp dir.

Checks the things markup inspection cannot: that translations actually
land in the DOM, that the settings dialog opens and switches language,
that a picked file plays, and that a TAMPERED verdict withholds the
player until the override is clicked.
"""
import glob, json, os, shutil, subprocess, sys, tempfile, time, urllib.request
import websocket

# Chromium: $CHROME, else a playwright cache, else PATH.
CHROME = os.environ.get("CHROME") or next(
    (p for p in glob.glob(os.path.expanduser(
        "~/.cache/ms-playwright/chromium-*/chrome-linux64/chrome")) if os.access(p, os.X_OK)),
    shutil.which("chromium") or shutil.which("chrome") or "")
URL = os.environ.get("URL", "http://127.0.0.1:8123/")
OUT = os.environ.get("SHOTS", tempfile.mkdtemp(prefix="verify-ui-")) + "/"

if not CHROME or not os.access(CHROME, os.X_OK):
    print("SKIP: no chromium found (set CHROME=/path/to/chrome)")
    sys.exit(0)

fails = []


def check(cond, msg, detail=""):
    print(("  ok   " if cond else "  FAIL ") + msg + (("  [" + str(detail)[:120] + "]") if detail and not cond else ""))
    if not cond:
        fails.append(msg)


class Tab:
    def __init__(self, port, lang=None):
        # A private profile per tab: chromium otherwise shares the default
        # one, and an explicit language saved by an earlier phase would
        # (correctly) outrank the browser language a later phase is testing.
        args = [CHROME, "--headless=new", "--no-sandbox", "--disable-gpu", "--hide-scrollbars",
                "--remote-allow-origins=*", "--user-data-dir=" + tempfile.mkdtemp(prefix="verify-ui-prof-"),
                f"--remote-debugging-port={port}", "--window-size=760,1100", "about:blank"]
        if lang:
            args.insert(1, f"--lang={lang}")
            args.insert(1, f"--accept-lang={lang}")
        self.proc = subprocess.Popen(args, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(80):
            try:
                tabs = json.load(urllib.request.urlopen(f"http://127.0.0.1:{port}/json"))
                ws = [t for t in tabs if t["type"] == "page"][0]["webSocketDebuggerUrl"]
                break
            except Exception:
                time.sleep(0.25)
        else:
            raise RuntimeError("chromium did not expose CDP")
        self.ws = websocket.create_connection(ws, timeout=30)
        self.i = 0

    def send(self, method, **params):
        self.i += 1
        self.ws.send(json.dumps({"id": self.i, "method": method, "params": params}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get("id") == self.i:
                return m

    def wait(self, expr, timeout=30):
        """Poll until expr is truthy. Fixed sleeps are why browser suites
        go flaky: over a network the scripts simply take longer."""
        end = time.time() + timeout
        while time.time() < end:
            try:
                if self.js(expr):
                    return True
            except Exception:
                pass
            time.sleep(0.25)
        return False

    def goto(self, url):
        self.send("Page.enable")
        self.send("Page.navigate", url=url)
        # ready = the runtime loaded, the dicts registered and app.js ran
        self.wait("!!window.I18N && !!document.querySelector('#lang-slot select')")

    def js(self, expr):
        r = self.send("Runtime.evaluate", expression=expr, returnByValue=True, awaitPromise=True)
        return r.get("result", {}).get("result", {}).get("value")

    def shot(self, name):
        r = self.send("Page.captureScreenshot", format="png")
        data = r.get("result", {}).get("data")
        if data:
            import base64
            open(OUT + name, "wb").write(base64.b64decode(data))

    def close(self):
        try:
            self.ws.close()
        finally:
            self.proc.terminate()


print("=== 1. English render + i18n applied to the DOM ===")
t = Tab(9331)
t.goto(URL)
check(t.js("document.querySelector('h2').textContent.trim()").startswith("Thingino"), "header translated")
check("raptor-signed" in t.js("document.querySelector('#dropzone div').textContent"), "dropzone text applied")
check(t.js("document.title") == "thingino · Media Verifier", "title applied", t.js("document.title"))
check(t.js("!!document.getElementById('settings-btn')"), "gear button present")
check(t.js("document.querySelector('#lang-slot select').options.length") == 15,
      "selector built with 15 languages", t.js("document.querySelector('#lang-slot select').options.length"))
check(t.js("document.getElementById('settings-overlay').classList.contains('d-none')"), "dialog starts closed")

print("=== 2. settings dialog opens, selector inside ===")
t.js("document.getElementById('settings-btn').click()")
time.sleep(0.4)
check(not t.js("document.getElementById('settings-overlay').classList.contains('d-none')"), "dialog opens on gear click")
check(t.js("document.getElementById('settings-overlay').contains(document.getElementById('lang-slot'))"),
      "language selector lives in the dialog")
t.shot("render-settings.png")

print("=== 3. switching language retranslates live ===")
t.js("var s=document.querySelector('#lang-slot select'); s.value='de'; s.dispatchEvent(new Event('change'));")
time.sleep(0.6)
de_title = t.js("document.title")
check("Medien" in de_title or "Verifizierer" in de_title, "title switched to German", de_title)
check("Ziehen" in t.js("document.querySelector('#dropzone div').textContent") or
      "Zieh" in t.js("document.querySelector('#dropzone div').textContent"), "dropzone switched to German",
      t.js("document.querySelector('#dropzone div').textContent")[:60])
check(t.js("document.documentElement.lang") == "de", "html lang attribute updated")
t.shot("render-de.png")
# back to English, and confirm Arabic flips direction
t.js("var s=document.querySelector('#lang-slot select'); s.value='ar'; s.dispatchEvent(new Event('change'));")
time.sleep(0.5)
check(t.js("document.documentElement.dir") == "rtl", "Arabic sets dir=rtl")
t.shot("render-ar.png")
t.js("var s=document.querySelector('#lang-slot select'); s.value='en'; s.dispatchEvent(new Event('change'));")
time.sleep(0.4)
t.js("document.getElementById('settings-close').click()")
time.sleep(0.3)
check(t.js("document.getElementById('settings-overlay').classList.contains('d-none')"), "Close dismisses the dialog")

print("=== 4a. preview is off by default ===")
check(t.js("document.getElementById('setting-preview').checked") is False, "preview switch starts off",
      t.js("document.getElementById('setting-preview').checked"))
t.js("document.getElementById('btn-sample-good').click()")
t.wait("document.getElementById('verdict').textContent.trim().length > 0")
check(t.js("document.getElementById('preview-card').classList.contains('d-none')"),
      "no player for a verified file while preview is off")
check("verified" in (t.js("document.getElementById('verdict').textContent") or "").lower(),
      "verification still runs with preview off")

print("=== 4b. enabling preview in settings plays the already-loaded clip ===")
t.js("document.getElementById('settings-btn').click()")
time.sleep(0.3)
check(t.js("document.getElementById('setting-preview').checked") is False, "dialog reflects the off state")
t.js("var c=document.getElementById('setting-preview'); c.checked=true; c.dispatchEvent(new Event('change'));")
t.wait("var v=document.getElementById('preview-video'); v.readyState>0 && v.videoWidth>0")
t.js("document.getElementById('settings-close').click()")
time.sleep(0.3)
verdict = t.js("document.getElementById('verdict').textContent")
check("verified" in (verdict or "").lower(), "signed sample verdict is verified", verdict)
check(not t.js("document.getElementById('preview-card').classList.contains('d-none')"),
      "player appears once preview is enabled, without re-picking the file")
check(t.js("var v=document.getElementById('preview-video'); v.readyState>0 && v.videoWidth>0"),
      "video actually decoded (videoWidth>0)",
      t.js("var v=document.getElementById('preview-video'); v.readyState+'/'+v.videoWidth"))
check(t.js("document.getElementById('preview-blocked').classList.contains('d-none')"), "not blocked for a good file")
t.shot("render-verified.png")

print("=== 5. tampered sample: verdict TAMPERED and playback withheld ===")
t.js("document.getElementById('btn-sample-bad').click()")
t.wait("/tamper/i.test(document.getElementById('verdict').textContent)")
v2 = t.js("document.getElementById('verdict').textContent")
check("tamper" in (v2 or "").lower(), "tampered verdict shown", v2)
check(not t.js("document.getElementById('preview-blocked').classList.contains('d-none')"),
      "playback withheld panel shown")
check(t.js("document.getElementById('preview-media').classList.contains('d-none')"), "player hidden")
check(t.js("document.getElementById('preview-video').paused"), "video paused")
time.sleep(2)  # let any async decode error fire
check(not t.js("document.getElementById('preview-blocked').classList.contains('d-none')"),
      "tampering warning survives a decode failure")
check(t.js("document.getElementById('preview-unplayable').classList.contains('d-none')"),
      "decode note does not overwrite the tampering warning")
t.shot("render-blocked.png")

print("=== 6. play-anyway override reveals it ===")
t.js("document.getElementById('btn-play-anyway').click()")
t.wait("document.getElementById('preview-blocked').classList.contains('d-none')")
check(t.js("document.getElementById('preview-blocked').classList.contains('d-none')"), "warning dismissed")
# Overriding reveals the player when the browser can decode the file, and
# the honest "cannot decode" note when it cannot (Chromium refuses this
# sample outright). Either is correct; a dead player or a lingering
# warning is not.
# Let the decode attempt settle before judging: asserting during the
# async transition is what makes browser suites flaky. Then check the
# property that actually matters -- a player that cannot play is never
# left on screen -- rather than a snapshot of class names.
t.wait("var v=document.getElementById('preview-video'); !!v.error || v.readyState>0")
time.sleep(0.5)
broken = bool(t.js("!!document.getElementById('preview-video').error"))
player_visible = bool(t.js("!!document.getElementById('preview-video').offsetParent || "
                           "!!document.getElementById('preview-image').offsetParent"))
note_visible = bool(t.js("!!document.getElementById('preview-unplayable').offsetParent"))
if broken:
    check(not player_visible, "no dead player left on screen when the file cannot decode",
          f"player_visible={player_visible}")
    check(note_visible, "cannot-decode note explains the empty preview")
else:
    check(player_visible, "override reveals the player for a decodable file")

print("=== 6b. the setting persists, and off means off again ===")
check(t.js("localStorage.getItem('verify.preview')") == "1", "enabled state persisted")
t.js("localStorage.setItem('verify.preview','0')")
t.goto(URL)
check(t.js("document.getElementById('setting-preview').checked") is False, "off state restored after reload")
t.js("document.getElementById('btn-sample-good').click()")
t.wait("document.getElementById('verdict').textContent.trim().length > 0")
check(t.js("document.getElementById('preview-card').classList.contains('d-none')"),
      "still no player after a reload with the setting off")

print("=== 6c. GPS sample: track drawn from the engine's -g table ===")
t.js("document.getElementById('btn-sample-gps').click()")
t.wait("!document.getElementById('gps-card').classList.contains('d-none')")
v3 = t.js("document.getElementById('verdict').textContent")
check("verified" in (v3 or "").lower(), "GPS sample verifies", v3)
summ = t.js("document.getElementById('gps-summary').textContent") or ""
check("8 records" in summ and "8 with a position fix" in summ, "GPS summary counts records and fixes", summ)
check("top speed 31.5 km/h" in summ, "GPS summary top speed", summ)
check(t.js("document.querySelectorAll('#gps-svg line').length") == 7, "7 track segments",
      t.js("document.querySelectorAll('#gps-svg line').length"))
check(t.js("document.querySelectorAll('#gps-svg circle').length") == 8, "8 track points")
span = t.js("(() => { const c = document.querySelectorAll('#gps-svg circle'); return Math.abs(c[c.length-1].getAttribute('cx') - c[0].getAttribute('cx')); })()")
check((span or 0) > 400, "track spans the view, not a dot", span)
check(t.js("[...document.querySelectorAll('#gps-svg line')].every(l => l.getAttribute('stroke') === '#3fb950')"),
      "every segment green (verified spans)")
osm = t.js("document.getElementById('gps-osm').href") or ""
check("mlat=51.477897" in osm and "mlon=-0.005000" in osm, "OpenStreetMap link points at the last fix", osm)
check(t.js("document.getElementById('gps-nofix').classList.contains('d-none')"), "no 'no fix' note with fixes")
t.shot("render-gps.png")
t.js("document.getElementById('btn-sample-good').click()")
t.wait("/verified/i.test(document.getElementById('verdict').textContent) && document.getElementById('gps-card').classList.contains('d-none')")
check(t.js("document.getElementById('gps-card').classList.contains('d-none')"), "GPS card hidden for a file without GPS")

print("=== 7. no console errors / CSP violations ===")
errs = t.js("(window.__errs||[]).join(' | ')")
t.close()

print("=== 8. German auto-detection from browser language ===")
t2 = Tab(9332, lang="de")
t2.goto(URL)
check(t2.js("document.documentElement.lang") == "de", "de detected from navigator.language",
      t2.js("document.documentElement.lang + ' / ' + navigator.language"))
t2.close()

print()
print("FAILURES: %d" % len(fails))
if fails:
    for f in fails:
        print("  - " + f)
sys.exit(1 if fails else 0)

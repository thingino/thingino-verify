#!/bin/bash
# Dictionary integrity: a missing key silently falls back to English and
# a typo'd one renders as the raw key, so both are checked here rather
# than found in the deployed page.
#
#   - every dict parses and declares the language its filename claims
#   - every dict carries exactly the English key set (no missing, no extra)
#   - substitutions and markup survive translation ({name}, <strong>, <code>)
#   - every key the page and app reference exists in the dictionary
set -e
cd "$(dirname "$0")/../web"

EN=i18n-vfy-en.js
[ -f "$EN" ] || { echo "no $EN"; exit 1; }

keys() { grep -oE '^  [a-zA-Z_0-9]+:' "$1" | tr -d ' :' | sort; }
fail=0

for f in i18n-vfy-*.js; do
	lang=${f#i18n-vfy-}
	lang=${lang%.js}

	if ! node --check "$f" 2>/dev/null; then
		echo "FAIL $f: syntax error"
		fail=1
		continue
	fi
	grep -q "I18N.add(\"$lang\"" "$f" || {
		echo "FAIL $f: does not declare I18N.add(\"$lang\", ...)"
		fail=1
	}

	d=$(diff <(keys "$EN") <(keys "$f") || true)
	if [ -n "$d" ]; then
		echo "FAIL $f: key set differs from $EN"
		echo "$d" | sed 's/^/      /'
		fail=1
		continue
	fi

	# Things translators drop: the interpolation slot, inline markup, and
	# the product name in the footer link.
	grep -q '{name}' "$f" || { echo "FAIL $f: v_verifying lost the {name} slot"; fail=1; }
	grep -q '<strong>' "$f" || { echo "FAIL $f: drop_text lost <strong>"; fail=1; }
	grep -q '<code>rverify</code>' "$f" || { echo "FAIL $f: report_note lost <code>rverify</code>"; fail=1; }
	grep -q 'footer_link: "thingino-verify"' "$f" || { echo "FAIL $f: footer_link must stay \"thingino-verify\""; fail=1; }

	[ "$fail" -eq 0 ] && echo "ok   $lang ($(keys "$f" | wc -l) keys)"
done

# Keys referenced by the page/app must exist, or the UI shows raw key names.
python3 - <<'PY' || fail=1
import re, sys
html = open("index.html").read()
app = open("app.js").read()
have = set(re.findall(r'^  ([a-zA-Z_0-9]+):', open("i18n-vfy-en.js").read(), re.M))
used = set()
for a in ("data-i18n", "data-i18n-ph", "data-i18n-title", "data-i18n-html", "data-help"):
    used |= set(re.findall(a + r'="([^"]+)"', html))
used |= set(re.findall(r'I18N\.t\(\s*"([^"]+)"', app))
# ternary form inside a lookup: I18N.t(cond ? "a" : "b")
used |= {k for pair in re.findall(r'I18N\.t\([^)]*\?\s*"([^"]+)"\s*:\s*"([^"]+)"', app)
         for k in pair}
missing = sorted(used - have)
if missing:
    print("FAIL index.html/app.js reference keys absent from the dictionary:")
    for k in missing:
        print("      " + k)
    sys.exit(1)
print("ok   all %d referenced keys resolve" % len(used))
PY

# Every language the runtime advertises must actually have a dictionary,
# or the selector offers a language that silently renders English.
python3 - <<'PY' || fail=1
import re, os, sys
rt = open("i18n.js").read()
sup = re.search(r'var SUPPORTED = \[(.*?)\]', rt, re.S).group(1)
langs = re.findall(r'"([^"]+)"', sup)
missing = [l for l in langs if not os.path.exists("i18n-vfy-%s.js" % l)]
if missing:
    print("FAIL SUPPORTED lists languages with no dictionary: " + " ".join(missing))
    sys.exit(1)
print("ok   all %d SUPPORTED languages have dictionaries" % len(langs))
PY

[ "$fail" -eq 0 ] && echo "i18n: OK" || { echo "i18n: FAILED"; exit 1; }

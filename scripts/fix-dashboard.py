#!/usr/bin/env python3
"""Rewrite the pw-dashboard HTML to merge single-item categories and add Pushover test."""

with open('/opt/pw-dashboard/index.html', 'r') as f:
    html = f.read()

old_start = html.index('<div class="section-label">PixieWire Site</div>')
old_end = html.index('<div class="footer">Pixiewire Media LLC</div>')

new_body = """<div class="section-label">PixieWire Site</div>
<div class="grid">
  <a class="card" href="https://pixiewire.com/" target="_blank"><div class="card-icon bg-gold">&#127984;</div><div class="card-body"><div class="card-name">PixieWire</div><div class="card-desc">Public website</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://pixiewire.com/admin" target="_blank"><div class="card-icon bg-red">&#128274;</div><div class="card-body"><div class="card-name">PW Admin</div><div class="card-desc">Content management</div></div><div class="card-arrow">&rsaquo;</div></a>
</div>
<div class="section-label">Quick Actions</div>
<div class="grid">
  <div class="card" style="cursor:pointer" onclick="processPhotos(this)"><div class="card-icon bg-accent">&#128247;</div><div class="card-body"><div class="card-name">Process Photos</div><div class="card-desc" id="photo-status">Scan and resize new photos</div></div><div class="card-arrow" id="photo-arrow">&rsaquo;</div></div>
  <a class="card" href="https://auto.pixiewire.com" target="_blank"><div class="card-icon bg-gray">&#120143;</div><div class="card-body"><div class="card-name">X Auto-Poster</div><div class="card-desc">Tweet scheduling &amp; generation</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://business.facebook.com/latest/posts/" target="_blank"><div class="card-icon bg-blue">&#128221;</div><div class="card-body"><div class="card-name">FB &amp; IG Content</div><div class="card-desc">Manage posts, reels, stories</div></div><div class="card-arrow">&rsaquo;</div></a>
  <div class="card" style="cursor:pointer" onclick="testPushover(this)"><div class="card-icon bg-purple">&#128276;</div><div class="card-body"><div class="card-name">Test Pushover</div><div class="card-desc" id="push-status">Send a test notification</div></div><div class="card-arrow" id="push-arrow">&rsaquo;</div></div>
</div>
<div class="section-label">Server Tools</div>
<div class="grid">
  <a class="card" href="https://log.pixiewire.com" target="_blank"><div class="card-icon bg-gold">&#128203;</div><div class="card-body"><div class="card-name">AP &amp; Mileage Tracker</div><div class="card-desc">Annual Pass visits &amp; mileage log</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://umami.pixiewire.com" target="_blank"><div class="card-icon bg-blue">&#128202;</div><div class="card-body"><div class="card-name">Umami</div><div class="card-desc">Website analytics</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://pixiepost.pixiewire.com" target="_blank"><div class="card-icon bg-purple">&#128231;</div><div class="card-body"><div class="card-name">Postiz</div><div class="card-desc">Social media scheduler</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://serp.pixiewire.com" target="_blank"><div class="card-icon bg-green">&#128269;</div><div class="card-body"><div class="card-name">SerpBear</div><div class="card-desc">SEO rank tracking</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://status.pixiewire.com" target="_blank"><div class="card-icon bg-green">&#9889;</div><div class="card-body"><div class="card-name">Uptime Kuma</div><div class="card-desc">Uptime monitoring</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://coolify.pixiewire.com" target="_blank"><div class="card-icon bg-red">&#9881;</div><div class="card-body"><div class="card-name">Coolify</div><div class="card-desc">Server &amp; container management</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://n8n.pixiewire.com" target="_blank"><div class="card-icon bg-orange">&#9881;</div><div class="card-body"><div class="card-name">n8n</div><div class="card-desc">Workflow automation</div></div><div class="card-arrow">&rsaquo;</div></a>
</div>
<div class="section-label">Vendor Dashboards</div>
<div class="grid">
  <a class="card" href="https://supabase.com/dashboard/project/fjawkyijewhevyfcqpww" target="_blank"><div class="card-icon bg-green">&#128215;</div><div class="card-body"><div class="card-name">Supabase</div><div class="card-desc">Database, auth, backend</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://vercel.com/mjr0483s-projects/pixiewire" target="_blank"><div class="card-icon bg-gray">&#9650;</div><div class="card-body"><div class="card-name">Vercel</div><div class="card-desc">Deployments, domains, logs</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://analytics.google.com/analytics/web/#/a386847809p527545555/reports/intelligenthome" target="_blank"><div class="card-icon bg-orange">&#128200;</div><div class="card-body"><div class="card-name">Google Analytics</div><div class="card-desc">Audience and behavior</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://search.google.com/search-console?resource_id=sc-domain%3Apixiewire.com" target="_blank"><div class="card-icon bg-blue">&#128270;</div><div class="card-body"><div class="card-name">Search Console</div><div class="card-desc">Search performance &amp; indexing</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://app.beehiiv.com/" target="_blank"><div class="card-icon bg-gold">&#128232;</div><div class="card-body"><div class="card-name">Beehiiv</div><div class="card-desc">Newsletter platform</div></div><div class="card-arrow">&rsaquo;</div></a>
</div>
<div class="section-label">Socials</div>
<div class="grid">
  <a class="card" href="https://x.com/PixieWireNews" target="_blank"><div class="card-icon bg-gray">&#120143;</div><div class="card-body"><div class="card-name">X / Twitter</div><div class="card-desc">@PixieWireNews</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://www.instagram.com/pixiewirenews" target="_blank"><div class="card-icon bg-purple">&#128247;</div><div class="card-body"><div class="card-name">Instagram</div><div class="card-desc">@pixiewirenews</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://www.facebook.com/pixiewire" target="_blank"><div class="card-icon bg-blue">&#128077;</div><div class="card-body"><div class="card-name">Facebook</div><div class="card-desc">Pixiewire</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://youtube.com/@PixieWire" target="_blank"><div class="card-icon bg-red">&#9654;</div><div class="card-body"><div class="card-name">YouTube</div><div class="card-desc">@PixieWire</div></div><div class="card-arrow">&rsaquo;</div></a>
  <a class="card" href="https://www.tiktok.com/@pixiewirenews" target="_blank"><div class="card-icon bg-gray">&#127925;</div><div class="card-body"><div class="card-name">TikTok</div><div class="card-desc">@pixiewirenews</div></div><div class="card-arrow">&rsaquo;</div></a>
</div>
"""

html = html[:old_start] + new_body + html[old_end:]

# Add testPushover JS
push_js = """<script>
async function testPushover(card) {
  var s = document.getElementById('push-status');
  var a = document.getElementById('push-arrow');
  var orig = s.textContent;
  s.textContent = 'Sending...'; a.innerHTML = '&#9203;';
  card.style.pointerEvents = 'none'; card.style.opacity = '0.7';
  try {
    var r = await fetch('https://auto.pixiewire.com/api/x-poster/test-pushover');
    var d = await r.json();
    if (d.ok) { s.textContent = 'Sent!'; a.innerHTML = '&#10003;'; s.style.color = '#2d6a4f'; }
    else { s.textContent = d.error || 'Failed'; a.innerHTML = '&#10007;'; s.style.color = '#a32d2d'; }
  } catch(e) { s.textContent = 'Failed'; a.innerHTML = '&#10007;'; s.style.color = '#a32d2d'; }
  card.style.pointerEvents = ''; card.style.opacity = '';
  setTimeout(function(){ s.textContent = orig; s.style.color = ''; a.innerHTML = '&rsaquo;'; }, 8000);
}
</script>
"""
html = html.replace('</body>', push_js + '</body>')

with open('/opt/pw-dashboard/index.html', 'w') as f:
    f.write(html)

print('DONE')

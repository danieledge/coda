// Lists Coda's available releases from GitHub, so the page never needs editing for a new one.
(function () {
  "use strict";
  var list = document.getElementById("release-list");
  if (!list) return;
  var API = "https://api.github.com/repos/danieledge/coda/releases?per_page=30";
  var ALL = "https://github.com/danieledge/coda/releases";

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text) e.textContent = text;
    return e;
  }
  function message(text, withLink) {
    list.textContent = "";
    var p = el("p", "body", text);
    if (withLink) {
      p.appendChild(document.createTextNode(" "));
      var a = el("a", "", "See the releases on GitHub");
      a.href = ALL;
      p.appendChild(a);
      p.appendChild(document.createTextNode("."));
    }
    list.appendChild(p);
  }
  function mb(bytes) { return Math.round(bytes / 1000000) + " MB"; }
  function when(iso) {
    try { return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return ""; }
  }

  fetch(API, { headers: { Accept: "application/vnd.github+json" } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (rels) {
      var shown = 0;
      list.textContent = "";
      rels.forEach(function (r) {
        if (r.draft) return;
        var zip = (r.assets || []).filter(function (a) { return /\.zip$/i.test(a.name); })[0];
        if (!zip) return;
        var card = el("div", "card release");
        var top = el("div", "release-top");
        top.appendChild(el("h3", "release-name", r.name || r.tag_name));
        if (shown === 0) top.appendChild(el("span", "beta-tag", "Latest"));
        if (r.prerelease) top.appendChild(el("span", "release-pre", "Beta"));
        card.appendChild(top);
        card.appendChild(el("p", "", "Released " + when(r.published_at) + ". " + zip.name + ", " + mb(zip.size) + "."));
        var row = el("div", "cta-row release-row");
        var dl = el("a", "btn", "Download the zip");
        dl.href = zip.browser_download_url;
        row.appendChild(dl);
        var notes = el("a", "link-arrow", "Release notes");
        notes.href = r.html_url;
        row.appendChild(notes);
        card.appendChild(row);
        list.appendChild(card);
        shown++;
      });
      if (!shown) message("No release is available to download right now. It is being updated, so please check back soon.");
    })
    .catch(function () { message("The list of releases could not be loaded.", true); });
})();

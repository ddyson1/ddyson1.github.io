// devindyson.com — search, suggestions, and layout helpers for the encyclopedia skin.
// Pages set <body data-root=""> (site root) or <body data-root="../"> (wiki/ pages).

(function () {
  var PAGES = [
    { title: "Devin Dyson", url: "index.html", desc: "American entrepreneur and poet",
      aliases: ["devin", "dyson", "devin dyson", "main page", "bio", "founder"] },
    { title: "Moodlog", url: "wiki/moodlog.html", desc: "AI-powered journaling company",
      aliases: ["moodlog llc", "mood log", "journaling", "journal", "founder"] },
    { title: "MiG", url: "wiki/mig.html", desc: "Speed-reading vocabulary trainer for Russian",
      aliases: ["mig", "russian", "vocabulary", "language"] },
    { title: "Plotflow", url: "wiki/plotflow.html", desc: "Independent pen-plotter studio",
      aliases: ["plot flow", "pen plotter", "plotter", "founder"] },
    { title: "worldView", url: "wiki/worldview.html", desc: "Morning dashboard for global markets",
      aliases: ["world view", "dashboard", "markets"] }
  ];

  var root = (document.body && document.body.getAttribute("data-root")) || "";

  function norm(s) {
    return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").replace(/\s+/g, " ").trim();
  }

  function findPage(query) {
    var q = norm(query);
    if (!q) return null;
    var i, p;
    for (i = 0; i < PAGES.length; i++) {
      p = PAGES[i];
      if (norm(p.title) === q || p.aliases.indexOf(q) !== -1) return p;
    }
    for (i = 0; i < PAGES.length; i++) {
      p = PAGES[i];
      if (norm(p.title).indexOf(q) !== -1) return p;
    }
    return null;
  }

  function suggestions(query) {
    var q = norm(query);
    if (!q) return [];
    return PAGES.filter(function (p) {
      if (norm(p.title).indexOf(q) !== -1) return true;
      for (var i = 0; i < p.aliases.length; i++) {
        if (p.aliases[i].indexOf(q) !== -1) return true;
      }
      return false;
    });
  }

  var input = document.getElementById("searchInput");
  var form = document.getElementById("searchform");

  function submitSearch() {
    var q = input ? input.value : "";
    var page = findPage(q);
    if (page) {
      window.location.href = root + page.url;
    } else {
      window.location.href = root + "404.html?search=" + encodeURIComponent(q);
    }
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      submitSearch();
    });
  }

  // Live typeahead, in the style of Wikipedia's search suggestions.
  if (input && form) {
    var box = document.createElement("div");
    box.className = "suggestions";
    box.style.display = "none";
    form.appendChild(box);

    var items = [];
    var sel = -1;

    function highlight(title, q) {
      var i = title.toLowerCase().indexOf(q.toLowerCase());
      if (i < 0 || !q) return document.createTextNode(title);
      var frag = document.createDocumentFragment();
      frag.appendChild(document.createTextNode(title.slice(0, i)));
      var b = document.createElement("b");
      b.textContent = title.slice(i, i + q.length);
      frag.appendChild(b);
      frag.appendChild(document.createTextNode(title.slice(i + q.length)));
      return frag;
    }

    function setActive(n) {
      sel = n;
      for (var i = 0; i < items.length; i++) {
        items[i].className = items[i].className.replace(" active", "") +
          (i === sel ? " active" : "");
      }
    }

    function hideBox() {
      box.style.display = "none";
      items = [];
      sel = -1;
    }

    function render() {
      var q = input.value.trim();
      box.innerHTML = "";
      items = [];
      sel = -1;
      if (!q) { hideBox(); return; }

      suggestions(q).slice(0, 6).forEach(function (p) {
        var a = document.createElement("a");
        a.className = "suggestion";
        a.href = root + p.url;
        var t = document.createElement("span");
        t.className = "s-title";
        t.appendChild(highlight(p.title, q));
        var d = document.createElement("span");
        d.className = "s-desc";
        d.textContent = p.desc;
        a.appendChild(t);
        a.appendChild(d);
        box.appendChild(a);
        items.push(a);
      });

      var f = document.createElement("a");
      f.className = "suggestion s-containing";
      f.href = "#";
      f.textContent = "Search for pages containing “" + q + "”";
      f.addEventListener("click", function (e) {
        e.preventDefault();
        submitSearch();
      });
      box.appendChild(f);
      items.push(f);

      box.style.display = "block";
    }

    // Keep focus in the input while clicking suggestions, so blur
    // doesn't hide the box before the click lands.
    box.addEventListener("mousedown", function (e) { e.preventDefault(); });

    input.addEventListener("input", render);
    input.addEventListener("focus", render);
    input.addEventListener("blur", hideBox);
    input.addEventListener("keydown", function (e) {
      if (box.style.display === "none") return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActive(sel < items.length - 1 ? sel + 1 : 0);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActive(sel > 0 ? sel - 1 : items.length - 1);
      } else if (e.key === "Enter" && sel >= 0) {
        e.preventDefault();
        if (items[sel].className.indexOf("s-containing") !== -1) {
          submitSearch();
        } else {
          window.location.href = items[sel].href;
        }
      } else if (e.key === "Escape") {
        hideBox();
      }
    });
  }

  var random = document.getElementById("randomlink");
  if (random) {
    random.addEventListener("click", function (e) {
      e.preventDefault();
      var here = window.location.pathname.split("/").pop() || "index.html";
      var candidates = PAGES.filter(function (p) {
        return p.url.split("/").pop() !== here;
      });
      var pick = candidates[Math.floor(Math.random() * candidates.length)];
      window.location.href = root + pick.url;
    });
  }

  // Wikipedia's mobile skin moves the infobox below the first lead paragraph;
  // do the same on narrow screens, and restore the desktop position on wide ones.
  var infobox = document.querySelector("#content .infobox");
  if (infobox) {
    var home = document.createComment("infobox-home");
    infobox.parentNode.insertBefore(home, infobox);
    var firstP = document.querySelector("#content > p");
    var placeInfobox = function () {
      if (window.innerWidth <= 850 && firstP) {
        firstP.parentNode.insertBefore(infobox, firstP.nextSibling);
      } else {
        home.parentNode.insertBefore(infobox, home.nextSibling);
      }
    };
    placeInfobox();
    window.addEventListener("resize", placeInfobox);
  }

  // 404 / missing-article page: fill in the searched-for title.
  var missing = document.getElementById("missing-title");
  if (missing) {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("search") || params.get("title");
    if (wanted) {
      wanted = wanted.replace(/[<>&]/g, "").slice(0, 80);
      if (wanted) {
        missing.textContent = wanted;
        var heading = document.getElementById("firstHeading");
        if (heading) heading.textContent = wanted;
        document.title = wanted + " - devindyson.com";
      }
    }
  }
})();

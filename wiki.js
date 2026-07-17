// devindyson.com — search + random article for the encyclopedia skin.
// Pages set <body data-root=""> (site root) or <body data-root="../"> (wiki/ pages).

(function () {
  var PAGES = [
    { title: "Devin Dyson", url: "index.html", aliases: ["devin", "dyson", "devin dyson", "main page", "bio"] },
    { title: "Moodlog", url: "wiki/moodlog.html", aliases: ["moodlog llc", "mood log", "journaling", "journal"] },
    { title: "MiG", url: "wiki/mig.html", aliases: ["mig", "russian", "vocabulary"] },
    { title: "Plotflow", url: "wiki/plotflow.html", aliases: ["plot flow", "pen plotter", "plotter"] },
    { title: "worldView", url: "wiki/worldview.html", aliases: ["world view", "dashboard"] }
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

  var form = document.getElementById("searchform");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = document.getElementById("searchInput");
      var q = input ? input.value : "";
      var page = findPage(q);
      if (page) {
        window.location.href = root + page.url;
      } else {
        window.location.href = root + "404.html?search=" + encodeURIComponent(q);
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

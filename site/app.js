// Theme toggle, language toggle and term search. No dependencies.

(function () {
  var root = document.documentElement;
  // URL prefix of this page's language: "" for the default one, "/en" for
  // English. Set by site/build.ts.
  var base = root.dataset.base || "";

  // ------------------------------------------------------------- language
  // Switching language keeps the current search and selection: the query
  // string and fragment travel with the link.
  var languages = document.getElementById("lang-toggle");
  if (languages) {
    languages.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link) return;
      var target = new URL(link.href, window.location.href);
      target.search = window.location.search;
      target.hash = window.location.hash;
      link.href = target.href;
    });
  }

  // ---------------------------------------------------------------- theme
  var toggle = document.getElementById("theme-toggle");

  function activeTheme() {
    if (root.dataset.theme) return root.dataset.theme;
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  }

  if (toggle) {
    toggle.addEventListener("click", function () {
      var next = activeTheme() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try {
        localStorage.setItem("theme", next);
      } catch (e) {
        // Storage can be unavailable. The choice then lasts for this page only.
      }
    });
  }

  // --------------------------------------------------------------- search
  var input = document.getElementById("search-input");
  var list = document.getElementById("search-results");
  if (!input || !list) return;

  var MAX_RESULTS = 8;
  var index = null;
  var loading = null;
  var results = [];
  var active = -1;

  function loadIndex() {
    if (index) return Promise.resolve(index);
    if (!loading) {
      loading = fetch(base + "/search.json")
        .then(function (res) {
          if (!res.ok) throw new Error("search index: " + res.status);
          return res.json();
        })
        .then(function (data) {
          index = data;
          return data;
        })
        .catch(function (err) {
          loading = null;
          throw err;
        });
    }
    return loading;
  }

  // Lower-case and strip accents, so "ngu canh" finds "ngữ cảnh".
  function fold(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  function rankName(name, q) {
    if (name === q) return 0;
    if (name.indexOf(q) === 0) return 1;
    var words = name.split(/[\s-]+/);
    for (var i = 0; i < words.length; i++) {
      if (words[i].indexOf(q) === 0) return 2;
    }
    return name.indexOf(q) !== -1 ? 3 : -1;
  }

  // item.a is the term's name in the page's language, when it has one.
  function rank(item, q) {
    var best = rankName(fold(item.t), q);
    if (item.a) {
      var other = rankName(fold(item.a), q);
      if (other !== -1 && (best === -1 || other < best)) best = other;
    }
    if (best !== -1) return best;
    return fold(item.d).indexOf(q) !== -1 ? 4 : -1;
  }

  function close() {
    list.hidden = true;
    list.textContent = "";
    results = [];
    active = -1;
    input.setAttribute("aria-expanded", "false");
    input.removeAttribute("aria-activedescendant");
  }

  function setActive(next) {
    var options = list.querySelectorAll('[role="option"]');
    if (!options.length) return;
    active = (next + options.length) % options.length;
    options.forEach(function (el, i) {
      el.setAttribute("aria-selected", i === active ? "true" : "false");
    });
    var el = options[active];
    input.setAttribute("aria-activedescendant", el.id);
    el.scrollIntoView({ block: "nearest" });
  }

  function message(text) {
    list.textContent = "";
    var li = document.createElement("li");
    li.className = "search-empty";
    li.textContent = text;
    list.appendChild(li);
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function render(q) {
    results = index
      .map(function (item, order) {
        return { item: item, score: rank(item, q), order: order };
      })
      .filter(function (r) {
        return r.score !== -1;
      })
      .sort(function (a, b) {
        return a.score - b.score || a.order - b.order;
      })
      .slice(0, MAX_RESULTS)
      .map(function (r) {
        return r.item;
      });

    active = -1;
    input.removeAttribute("aria-activedescendant");
    if (!results.length) {
      message((input.dataset.noMatch || "").replace("{q}", input.value.trim()));
      return;
    }

    list.textContent = "";
    results.forEach(function (item, i) {
      var li = document.createElement("li");
      li.id = "search-option-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");

      var a = document.createElement("a");
      a.href = base + "/" + item.s;
      a.dataset.slug = item.s;
      a.tabIndex = -1;

      var term = document.createElement("span");
      term.className = "term";
      term.textContent = item.t;

      var desc = document.createElement("span");
      desc.className = "desc";
      desc.textContent = item.d;

      a.appendChild(term);
      if (item.a) {
        var alt = document.createElement("span");
        alt.className = "alt";
        alt.textContent = item.a;
        a.appendChild(alt);
      }
      a.appendChild(desc);
      li.appendChild(a);
      list.appendChild(li);
    });
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  // A page can handle the choice itself (the map selects the term in place)
  // by cancelling this event. Otherwise the term's page opens.
  function open(slug) {
    var event = new CustomEvent("dictionary:select", {
      detail: { slug: slug },
      cancelable: true,
    });
    if (document.dispatchEvent(event)) {
      window.location.href = base + "/" + slug;
      return;
    }
    close();
    input.blur();
  }

  function update() {
    document.dispatchEvent(
      new CustomEvent("dictionary:query", {
        detail: { query: input.value.trim() },
      })
    );
    var q = fold(input.value.trim());
    if (!q) {
      close();
      return;
    }
    loadIndex().then(
      function () {
        // Ignore a response that arrives after the query changed.
        if (fold(input.value.trim()) === q) render(q);
      },
      function () {
        message(input.dataset.error || "");
      }
    );
  }

  input.addEventListener("focus", function () {
    loadIndex().catch(function () {});
    if (input.value.trim()) update();
  });
  input.addEventListener("input", update);

  input.addEventListener("keydown", function (event) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive(active + 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive(active <= 0 ? results.length - 1 : active - 1);
    } else if (event.key === "Enter") {
      var target = results[active === -1 ? 0 : active];
      if (target) {
        event.preventDefault();
        open(target.s);
      }
    } else if (event.key === "Escape") {
      if (list.hidden) input.blur();
      close();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }
    var el = document.activeElement;
    var typing =
      el &&
      (el.tagName === "INPUT" ||
        el.tagName === "TEXTAREA" ||
        el.isContentEditable);
    if (typing) return;
    event.preventDefault();
    input.focus();
    input.select();
  });

  list.addEventListener("click", function (event) {
    var link = event.target.closest("a[data-slug]");
    // Leave modified clicks alone so "open in new tab" still works.
    if (!link || event.metaKey || event.ctrlKey || event.shiftKey) return;
    event.preventDefault();
    open(link.dataset.slug);
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".search")) close();
  });
})();

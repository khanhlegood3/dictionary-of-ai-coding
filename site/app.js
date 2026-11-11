// Theme toggle and term search. No dependencies.

(function () {
  // ---------------------------------------------------------------- theme
  var root = document.documentElement;
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
      loading = fetch("/search.json")
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

  function rank(item, q) {
    var term = item.t.toLowerCase();
    if (term === q) return 0;
    if (term.indexOf(q) === 0) return 1;
    var words = term.split(/[\s-]+/);
    for (var i = 0; i < words.length; i++) {
      if (words[i].indexOf(q) === 0) return 2;
    }
    if (term.indexOf(q) !== -1) return 3;
    if (item.d.toLowerCase().indexOf(q) !== -1) return 4;
    return -1;
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
      message("No term matches “" + q + "”.");
      return;
    }

    list.textContent = "";
    results.forEach(function (item, i) {
      var li = document.createElement("li");
      li.id = "search-option-" + i;
      li.setAttribute("role", "option");
      li.setAttribute("aria-selected", "false");

      var a = document.createElement("a");
      a.href = "/" + item.s;
      a.tabIndex = -1;

      var term = document.createElement("span");
      term.className = "term";
      term.textContent = item.t;

      var desc = document.createElement("span");
      desc.className = "desc";
      desc.textContent = item.d;

      a.appendChild(term);
      a.appendChild(desc);
      li.appendChild(a);
      list.appendChild(li);
    });
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
  }

  function update() {
    var q = input.value.trim().toLowerCase();
    if (!q) {
      close();
      return;
    }
    loadIndex().then(
      function () {
        // Ignore a response that arrives after the query changed.
        if (input.value.trim().toLowerCase() === q) render(q);
      },
      function () {
        message("Search could not load. Try the A–Z list.");
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
        window.location.href = "/" + target.s;
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

  document.addEventListener("click", function (event) {
    if (!event.target.closest(".search")) close();
  });
})();

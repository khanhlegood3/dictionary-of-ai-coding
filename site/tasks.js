// The tasks page: reads the repository's issues from the public GitHub API
// and draws them as a task list. No dependencies.
//
// site/build.ts writes the page, the interface text and, when it can, a copy
// of the issue list into #tasks-data. The decision records are already in the
// page as HTML.

(function () {
  var holder = document.getElementById("tasks-data");
  var rows = document.getElementById("tk-rows");
  if (!holder || !rows) return;

  var data;
  try {
    data = JSON.parse(holder.textContent || "{}");
  } catch (e) {
    return;
  }
  var ui = data.ui || {};
  var repo = data.repo;
  var locale = data.lang === "vi" ? "vi-VN" : "en-GB";

  // GitHub allows 60 requests an hour from one address without a token, so a
  // list that was just fetched is reused.
  var CACHE_KEY = "tasks:" + repo;
  var CACHE_MS = 2 * 60 * 1000;
  var IN_PROGRESS = "in-progress";
  var VIEWS = ["open", "doing", "done", "all"];
  var MAX_PAGES = 3;

  var table = document.getElementById("tk-table");
  var empty = document.getElementById("tk-empty");
  var notice = document.getElementById("tk-notice");
  var sync = document.getElementById("tk-sync");
  var refresh = document.getElementById("tk-refresh");
  var views = document.getElementById("tk-views");
  var labelsGroup = document.getElementById("tk-labels-group");
  var labelsBox = document.getElementById("tk-labels");

  var tasks = null;
  var shownAt = null;
  var view = "open";
  var label = "";
  var busy = false;

  // ---------------------------------------------------------------- helpers

  function fill(template, values) {
    return String(template || "").replace(/\{(\w+)\}/g, function (whole, key) {
      return key in values ? String(values[key]) : whole;
    });
  }

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text != null) node.textContent = text;
    return node;
  }

  function labelName(name) {
    var names = ui.labelNames || {};
    return Object.prototype.hasOwnProperty.call(names, name)
      ? names[name]
      : name;
  }

  function status(task) {
    if (!task.open) return "done";
    return task.labels.indexOf(IN_PROGRESS) >= 0 ? "doing" : "open";
  }

  function inView(task, name) {
    if (name === "all") return true;
    if (name === "open") return task.open;
    return status(task) === name;
  }

  // "today", "3 days ago", then a plain date once it is over a month old.
  function when(iso) {
    var date = new Date(iso);
    if (isNaN(date.getTime())) return "";
    var startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    var startOfThat = new Date(date.getTime());
    startOfThat.setHours(0, 0, 0, 0);
    var days = Math.round((startOfThat - startOfToday) / 86400000);
    try {
      if (days > -31 && days <= 0 && window.Intl && Intl.RelativeTimeFormat) {
        var text = new Intl.RelativeTimeFormat(locale, {
          numeric: "auto",
        }).format(days, "day");
        return text.charAt(0).toUpperCase() + text.slice(1);
      }
      return new Intl.DateTimeFormat(locale, {
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(date);
    } catch (e) {
      return date.toISOString().slice(0, 10);
    }
  }

  function clock(time) {
    var date = new Date(time);
    var sameDay = date.toDateString() === new Date().toDateString();
    try {
      return new Intl.DateTimeFormat(
        locale,
        sameDay
          ? { hour: "2-digit", minute: "2-digit" }
          : {
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }
      ).format(date);
    } catch (e) {
      return date.toISOString().slice(0, 16).replace("T", " ");
    }
  }

  // ------------------------------------------------------------------ data

  // The same cut-down shape the build saves: see `Task` in site/build.ts.
  function fromApi(issue) {
    return {
      n: issue.number,
      title: issue.title || "",
      url: issue.html_url || "",
      open: issue.state === "open",
      labels: (issue.labels || [])
        .map(function (l) {
          return typeof l === "string" ? l : l.name || "";
        })
        .filter(Boolean),
      assignees: (issue.assignees || []).map(function (a) {
        return { login: a.login || "", avatar: a.avatar_url || "" };
      }),
      comments: issue.comments || 0,
      updated: issue.closed_at || issue.updated_at || "",
    };
  }

  function fetchPage(page, found) {
    return fetch(
      "https://api.github.com/repos/" +
        repo +
        "/issues?state=all&per_page=100&page=" +
        page,
      { headers: { Accept: "application/vnd.github+json" } }
    )
      .then(function (response) {
        if (!response.ok) throw new Error("GitHub " + response.status);
        return response.json();
      })
      .then(function (list) {
        list.forEach(function (issue) {
          // The issues endpoint also returns pull requests.
          if (!issue.pull_request) found.push(fromApi(issue));
        });
        if (list.length === 100 && page < MAX_PAGES)
          return fetchPage(page + 1, found);
        return found;
      });
  }

  function readCache() {
    try {
      var saved = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (saved && Array.isArray(saved.tasks) && saved.at) return saved;
    } catch (e) {
      // No storage, or something else wrote the key: fetch again.
    }
    return null;
  }

  function writeCache(list, at) {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ at: at, tasks: list })
      );
    } catch (e) {
      // The list is fetched again on the next page view.
    }
  }

  // ---------------------------------------------------------------- drawing

  function order(a, b) {
    var rank = { doing: 0, open: 1, done: 2 };
    var byStatus = rank[status(a)] - rank[status(b)];
    if (byStatus) return byStatus;
    // Finished tasks: the latest first. Open tasks: the oldest first.
    if (!a.open)
      return a.updated < b.updated ? 1 : a.updated > b.updated ? -1 : 0;
    return a.n - b.n;
  }

  function commentIcon() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "12");
    svg.setAttribute("height", "12");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(ns, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.4");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("d", "M2.5 3h11v8h-6l-3 2.5V11h-2z");
    svg.appendChild(path);
    return svg;
  }

  function row(task) {
    var tr = document.createElement("tr");

    var first = document.createElement("td");
    var title = el("a", "tk-task__title", task.title);
    title.href = task.url;
    title.rel = "noopener";
    first.appendChild(title);
    var meta = el("div", "tk-task__meta");
    meta.appendChild(el("span", "num", "#" + task.n));
    task.labels.forEach(function (name) {
      // The in-progress label is already shown as the status.
      if (name !== IN_PROGRESS)
        meta.appendChild(el("span", "tk-chip", labelName(name)));
    });
    if (task.comments > 0) {
      var comments = el("span", "tk-comments");
      comments.title = fill(ui.comments, { count: task.comments });
      comments.setAttribute("aria-label", comments.title);
      comments.appendChild(commentIcon());
      comments.appendChild(document.createTextNode(String(task.comments)));
      meta.appendChild(comments);
    }
    first.appendChild(meta);
    tr.appendChild(first);

    var who = document.createElement("td");
    if (task.assignees.length) {
      task.assignees.forEach(function (a) {
        var person = el("div", "tk-person");
        if (a.avatar) {
          var img = document.createElement("img");
          img.src = a.avatar + (a.avatar.indexOf("?") < 0 ? "?" : "&") + "s=48";
          img.alt = "";
          img.width = 24;
          img.height = 24;
          img.loading = "lazy";
          img.onerror = function () {
            this.remove();
          };
          person.appendChild(img);
        }
        person.appendChild(el("span", "", a.login));
        who.appendChild(person);
      });
    } else {
      who.appendChild(el("div", "tk-person tk-person--none", ui.unassigned));
    }
    tr.appendChild(who);

    var state = document.createElement("td");
    var kind = status(task);
    state.appendChild(el("span", "tk-pill tk-pill--" + kind, ui[kind]));
    tr.appendChild(state);

    var time = el("td", "tk-when", when(task.updated));
    if (task.updated)
      time.title = new Date(task.updated).toLocaleString(locale);
    tr.appendChild(time);

    return tr;
  }

  function setCounts() {
    VIEWS.forEach(function (name) {
      var count = tasks
        ? tasks.filter(function (task) {
            return inView(task, name);
          }).length
        : null;
      var nodes = document.querySelectorAll('[data-count="' + name + '"]');
      for (var i = 0; i < nodes.length; i++)
        nodes[i].textContent = count == null ? "–" : String(count);
    });
  }

  function drawLabels() {
    var counts = {};
    var visible = tasks.filter(function (task) {
      return inView(task, view);
    });
    visible.forEach(function (task) {
      task.labels.forEach(function (name) {
        if (name !== IN_PROGRESS) counts[name] = (counts[name] || 0) + 1;
      });
    });
    var names = Object.keys(counts).sort(function (a, b) {
      return counts[b] - counts[a] || labelName(a).localeCompare(labelName(b));
    });
    // A label that left the list can no longer be chosen, so let go of it.
    if (label && !counts[label]) label = "";
    labelsBox.textContent = "";
    names.forEach(function (name) {
      var button = el("button", "tk-label");
      button.type = "button";
      button.setAttribute("data-label", name);
      button.setAttribute("aria-pressed", String(name === label));
      button.appendChild(el("span", "tk-label__name", labelName(name)));
      button.appendChild(el("span", "tk-count", String(counts[name])));
      labelsBox.appendChild(button);
    });
    labelsGroup.hidden = names.length === 0;
  }

  function draw() {
    var buttons = views.querySelectorAll("[data-view]");
    for (var i = 0; i < buttons.length; i++)
      buttons[i].setAttribute(
        "aria-pressed",
        String(buttons[i].getAttribute("data-view") === view)
      );
    setCounts();
    if (!tasks) return;
    drawLabels();

    var shown = tasks
      .filter(function (task) {
        return (
          inView(task, view) && (!label || task.labels.indexOf(label) >= 0)
        );
      })
      .sort(order);
    rows.textContent = "";
    shown.forEach(function (task) {
      rows.appendChild(row(task));
    });
    table.hidden = shown.length === 0;
    empty.hidden = shown.length > 0;
    if (!shown.length)
      empty.textContent = !tasks.length
        ? ui.emptyAll
        : view === "open" && !label
          ? ui.emptyOpen
          : ui.empty;
  }

  function show(list, at) {
    tasks = list;
    shownAt = at;
    draw();
  }

  // The filters live in the address, so a shared link opens the same list.
  function readAddress() {
    var params = new URLSearchParams(window.location.search);
    var wanted = params.get("view");
    if (VIEWS.indexOf(wanted) >= 0) view = wanted;
    label = params.get("label") || "";
  }

  function writeAddress() {
    var params = new URLSearchParams(window.location.search);
    if (view === "open") params.delete("view");
    else params.set("view", view);
    if (label) params.set("label", label);
    else params.delete("label");
    var query = params.toString();
    try {
      history.replaceState(
        null,
        "",
        window.location.pathname +
          (query ? "?" + query : "") +
          window.location.hash
      );
    } catch (e) {
      // The filters still work; only the address stays as it was.
    }
  }

  // ---------------------------------------------------------------- loading

  function setNotice(text) {
    notice.textContent = "";
    notice.hidden = !text;
    if (!text) return;
    notice.appendChild(document.createTextNode(text + " "));
    var link = el("a", "", ui.onGithub);
    link.href = "https://github.com/" + repo + "/issues";
    link.rel = "noopener";
    notice.appendChild(link);
  }

  function load(force) {
    if (busy) return;
    var cached = force ? null : readCache();
    if (cached && Date.now() - new Date(cached.at).getTime() < CACHE_MS) {
      show(cached.tasks, cached.at);
      sync.textContent = fill(ui.updated, { time: clock(cached.at) });
      setNotice("");
      refresh.hidden = false;
      return;
    }

    busy = true;
    refresh.disabled = true;
    sync.textContent = ui.loading;
    // Something to look at while GitHub answers: the newest copy at hand.
    if (!tasks) {
      var fallback = cached || data.snapshot;
      if (fallback && Array.isArray(fallback.tasks))
        show(fallback.tasks, fallback.at);
    }

    fetchPage(1, [])
      .then(function (list) {
        var at = new Date().toISOString();
        writeCache(list, at);
        show(list, at);
        sync.textContent = fill(ui.updated, { time: clock(at) });
        setNotice("");
      })
      .catch(function () {
        if (tasks) {
          sync.textContent = "";
          setNotice(fill(ui.stale, { time: clock(shownAt) }));
        } else {
          sync.textContent = "";
          setNotice(ui.error);
          setCounts();
        }
      })
      .then(function () {
        busy = false;
        refresh.disabled = false;
        refresh.hidden = false;
      });
  }

  // ----------------------------------------------------------------- events

  views.addEventListener("click", function (event) {
    var button = event.target.closest("[data-view]");
    if (!button) return;
    view = button.getAttribute("data-view");
    writeAddress();
    draw();
  });

  labelsBox.addEventListener("click", function (event) {
    var button = event.target.closest("[data-label]");
    if (!button) return;
    var name = button.getAttribute("data-label");
    label = label === name ? "" : name;
    writeAddress();
    draw();
    // The buttons were drawn again, so put the focus back on the same label.
    var again = labelsBox.querySelector(
      '[data-label="' + name.replace(/["\\]/g, "\\$&") + '"]'
    );
    if (again) again.focus();
  });

  refresh.addEventListener("click", function () {
    load(true);
  });

  var share = document.getElementById("tk-share");
  var shareLabel = document.getElementById("tk-share-label");
  var shareTimer = null;
  if (share && shareLabel) {
    share.addEventListener("click", function () {
      var address = window.location.href;
      function copied() {
        shareLabel.textContent = ui.copied;
        clearTimeout(shareTimer);
        shareTimer = setTimeout(function () {
          shareLabel.textContent = ui.share;
        }, 2500);
      }
      if (navigator.share) {
        navigator
          .share({ title: document.title, url: address })
          .catch(function () {
            // The visitor closed the share sheet.
          });
      } else if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(copied, function () {
          window.prompt(ui.share, address);
        });
      } else {
        window.prompt(ui.share, address);
      }
    });
  }

  var dateLine = document.getElementById("tk-date");
  if (dateLine) {
    try {
      var today = new Intl.DateTimeFormat(locale, {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date());
      dateLine.textContent = today.charAt(0).toUpperCase() + today.slice(1);
    } catch (e) {
      // The line stays empty.
    }
  }

  readAddress();
  draw();
  load(false);
})();

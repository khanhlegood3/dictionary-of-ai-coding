// The tasks page: reads the repository's issues and pull requests from the
// public GitHub API and draws them as two lists. No dependencies.
//
// site/build.ts writes the page, the interface text and, when it can, a copy
// of both lists into #tasks-data. The decision records are already in the
// page as HTML.
//
// The page only reads. It holds no token, so it cannot label, assign or merge:
// a task is handed to an agent by copying a brief, and a pull request is
// merged on GitHub.

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
  var API = "https://api.github.com/repos/" + repo;
  // The key changed when pull requests joined the saved list.
  var CACHE_KEY = "tasks2:" + repo;
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
  var pullsList = document.getElementById("tk-pulls");
  var pullsEmpty = document.getElementById("tk-pulls-empty");
  var mergedFold = document.getElementById("tk-merged");
  var mergedSummary = document.getElementById("tk-merged-summary");
  var mergedList = document.getElementById("tk-merged-list");
  var branchesFold = document.getElementById("tk-branches");
  var branchesCheck = document.getElementById("tk-branches-check");
  var branchesList = document.getElementById("tk-branches-list");
  var branchesNote = document.getElementById("tk-branches-note");

  var tasks = null;
  var pulls = null;
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
      body: String(issue.body || "").slice(0, data.bodyLimit || 4000),
    };
  }

  // The same cut-down shape the build saves: see `Pull` in site/build.ts.
  function pullFromApi(issue) {
    return {
      n: issue.number,
      title: issue.title || "",
      url: issue.html_url || "",
      open: issue.state === "open",
      draft: issue.draft === true,
      merged: (issue.pull_request && issue.pull_request.merged_at) || "",
      author: (issue.user && issue.user.login) || "",
      created: issue.created_at || "",
      head: "",
      base: "",
    };
  }

  function getJson(path) {
    return fetch(API + path, {
      headers: { Accept: "application/vnd.github+json" },
    }).then(function (response) {
      if (!response.ok) throw new Error("GitHub " + response.status);
      return response.json();
    });
  }

  function fetchPage(page, found) {
    return getJson("/issues?state=all&per_page=100&page=" + page).then(
      function (list) {
        list.forEach(function (issue) {
          // The issues endpoint also returns pull requests.
          if (issue.pull_request) found.pulls.push(pullFromApi(issue));
          else found.tasks.push(fromApi(issue));
        });
        if (list.length === 100 && page < MAX_PAGES)
          return fetchPage(page + 1, found);
        return found;
      }
    );
  }

  // The branch names come from another endpoint. It is asked only when a
  // pull request is open, so most page views cost one request, not two.
  function addBranches(found) {
    var open = found.pulls.filter(function (pull) {
      return pull.open;
    });
    if (!open.length) return found;
    return getJson("/pulls?state=open&per_page=100").then(
      function (list) {
        list.forEach(function (detail) {
          open.forEach(function (pull) {
            if (pull.n !== detail.number) return;
            pull.draft = detail.draft === true;
            pull.head = (detail.head && detail.head.ref) || "";
            pull.base = (detail.base && detail.base.ref) || "";
          });
        });
        return found;
      },
      function () {
        // The pull requests are listed without their branches.
        return found;
      }
    );
  }

  // Every open pull request, then the newest merged ones.
  function keptPulls(list) {
    var merged = list
      .filter(function (pull) {
        return pull.merged;
      })
      .sort(function (a, b) {
        return a.merged < b.merged ? 1 : a.merged > b.merged ? -1 : 0;
      })
      .slice(0, data.mergedShown || 5);
    return list
      .filter(function (pull) {
        return pull.open;
      })
      .concat(merged);
  }

  function readCache() {
    try {
      var saved = JSON.parse(sessionStorage.getItem(CACHE_KEY) || "null");
      if (
        saved &&
        Array.isArray(saved.tasks) &&
        Array.isArray(saved.pulls) &&
        saved.at
      )
        return saved;
    } catch (e) {
      // No storage, or something else wrote the key: fetch again.
    }
    return null;
  }

  function writeCache(list, pullList, at) {
    try {
      sessionStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ at: at, tasks: list, pulls: pullList })
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

  // What an agent needs to start on a task, as text to paste into it.
  function brief(task) {
    var values = {
      n: task.n,
      repo: repo,
      title: task.title,
      url: task.url,
      labels: task.labels.join(", "),
    };
    var body = String(task.body || "").trim();
    var lines = [
      fill(ui.briefIntro, values),
      "",
      fill(ui.briefTitle, values),
      fill(ui.briefLink, values),
    ];
    if (task.labels.length) lines.push(fill(ui.briefLabels, values));
    lines.push("", ui.briefBody, body || ui.briefNoBody);
    if (body.length >= (data.bodyLimit || 4000)) lines.push(ui.briefCut);
    lines.push("", ui.briefStepsTitle);
    (ui.briefSteps || []).forEach(function (step) {
      lines.push("- " + fill(step, values));
    });
    return lines.join("\n") + "\n";
  }

  // Copy text, also where the clipboard API is missing or refused.
  function copyText(text) {
    function byHand() {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.top = "0";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      var done = false;
      try {
        done = document.execCommand("copy");
      } catch (e) {
        done = false;
      }
      area.remove();
      return done ? Promise.resolve() : Promise.reject(new Error("no copy"));
    }
    if (navigator.clipboard && navigator.clipboard.writeText)
      return navigator.clipboard.writeText(text).catch(byHand);
    return byHand();
  }

  function copyIcon() {
    var ns = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(ns, "svg");
    svg.setAttribute("viewBox", "0 0 16 16");
    svg.setAttribute("width", "14");
    svg.setAttribute("height", "14");
    svg.setAttribute("aria-hidden", "true");
    var path = document.createElementNS(ns, "path");
    path.setAttribute("fill", "none");
    path.setAttribute("stroke", "currentColor");
    path.setAttribute("stroke-width", "1.4");
    path.setAttribute("stroke-linejoin", "round");
    path.setAttribute("d", "M5.5 5.5v-3h8v8h-3M2.5 5.5h8v8h-8z");
    svg.appendChild(path);
    return svg;
  }

  function briefButton(task) {
    var button = el("button", "tk-brief");
    button.type = "button";
    button.title = ui.briefHint;
    button.setAttribute("data-brief", String(task.n));
    button.appendChild(copyIcon());
    button.appendChild(el("span", "", ui.brief));
    return button;
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
    // A finished task needs no brief.
    if (task.open) {
      var actions = el("div", "tk-task__actions");
      actions.appendChild(briefButton(task));
      first.appendChild(actions);
    }
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

  function pullItem(pull) {
    var item = el("li", "tk-pull");
    var main = el("div", "tk-pull__main");
    var title = el("a", "tk-task__title", pull.title);
    title.href = pull.url;
    title.target = "_blank";
    title.rel = "noopener";
    main.appendChild(title);
    var meta = el("div", "tk-task__meta");
    meta.appendChild(el("span", "num", "#" + pull.n));
    if (pull.head) {
      meta.appendChild(el("span", "tk-branch", pull.head));
      if (pull.base) {
        meta.appendChild(el("span", "tk-pull__into", ui.pullsInto));
        meta.appendChild(el("span", "tk-branch", pull.base));
      }
    }
    if (pull.author) meta.appendChild(el("span", "tk-pull__who", pull.author));
    main.appendChild(meta);
    item.appendChild(main);
    if (pull.open) {
      var kind = pull.draft ? "draft" : "doing";
      item.appendChild(
        el(
          "span",
          "tk-pill tk-pill--" + kind,
          pull.draft ? ui.pullsDraft : ui.pullsReady
        )
      );
    }
    var date = pull.open ? pull.created : pull.merged;
    var time = el("span", "tk-when", when(date));
    if (date) time.title = new Date(date).toLocaleString(locale);
    item.appendChild(time);
    return item;
  }

  function drawPulls() {
    var open = pulls
      ? pulls
          .filter(function (pull) {
            return pull.open;
          })
          .sort(function (a, b) {
            // The one that has waited longest comes first.
            return a.created < b.created ? -1 : a.created > b.created ? 1 : 0;
          })
      : null;
    var nodes = document.querySelectorAll('[data-count="pulls"]');
    for (var i = 0; i < nodes.length; i++)
      nodes[i].textContent = open ? String(open.length) : "–";
    if (!pullsList || !open) return;

    pullsList.textContent = "";
    open.forEach(function (pull) {
      pullsList.appendChild(pullItem(pull));
    });
    pullsList.hidden = open.length === 0;
    pullsEmpty.hidden = open.length > 0;
    pullsEmpty.textContent = ui.pullsEmpty;

    var merged = pulls.filter(function (pull) {
      return !pull.open && pull.merged;
    });
    mergedList.textContent = "";
    merged.forEach(function (pull) {
      mergedList.appendChild(pullItem(pull));
    });
    mergedSummary.textContent = fill(ui.pullsMerged, { count: merged.length });
    mergedFold.hidden = merged.length === 0;
    if (branchesFold) branchesFold.hidden = false;
  }

  function show(list, pullList, at) {
    tasks = list;
    pulls = pullList || [];
    shownAt = at;
    draw();
    drawPulls();
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
      show(cached.tasks, cached.pulls, cached.at);
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
        show(fallback.tasks, fallback.pulls, fallback.at);
    }

    fetchPage(1, { tasks: [], pulls: [] })
      .then(addBranches)
      .then(function (found) {
        var at = new Date().toISOString();
        var kept = keptPulls(found.pulls);
        writeCache(found.tasks, kept, at);
        show(found.tasks, kept, at);
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
          drawPulls();
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

  var briefTimers = {};
  rows.addEventListener("click", function (event) {
    var button = event.target.closest("[data-brief]");
    if (!button || !tasks) return;
    var number = Number(button.getAttribute("data-brief"));
    var task = null;
    tasks.forEach(function (one) {
      if (one.n === number) task = one;
    });
    if (!task) return;
    var text = brief(task);
    var name = button.querySelector("span");
    copyText(text).then(
      function () {
        name.textContent = ui.briefCopied;
        button.classList.add("is-copied");
        clearTimeout(briefTimers[number]);
        briefTimers[number] = setTimeout(function () {
          name.textContent = ui.brief;
          button.classList.remove("is-copied");
        }, 2500);
      },
      function () {
        // No way to copy here: show the text, so it can be copied by hand.
        window.prompt(ui.briefHint, text);
      }
    );
  });

  // Branches whose last commit a merged pull request already carried. This
  // costs two requests, so it runs only when asked for.
  function checkBranches() {
    branchesCheck.disabled = true;
    branchesList.hidden = true;
    branchesNote.hidden = false;
    branchesNote.textContent = ui.branchesChecking;
    Promise.all([
      getJson("/branches?per_page=100"),
      getJson("/pulls?state=closed&per_page=100&sort=updated&direction=desc"),
    ])
      .then(function (answers) {
        var own = String(repo).toLowerCase();
        // The newest merged pull request of each branch.
        var latest = {};
        answers[1].forEach(function (pull) {
          var head = pull.head;
          if (!pull.merged_at || !head || !head.repo) return;
          if (String(head.repo.full_name).toLowerCase() !== own) return;
          var known = latest[head.ref];
          if (!known || known.merged_at < pull.merged_at)
            latest[head.ref] = pull;
        });
        var inUse = {};
        (pulls || []).forEach(function (pull) {
          if (pull.open && pull.head) inUse[pull.head] = true;
        });
        var done = [];
        var other = 0;
        answers[0].forEach(function (branch) {
          if (branch.name === (data.defaultBranch || "main")) return;
          var pull = latest[branch.name];
          if (
            pull &&
            !inUse[branch.name] &&
            branch.commit &&
            pull.head.sha === branch.commit.sha
          )
            done.push({ name: branch.name, pull: pull });
          else other += 1;
        });

        branchesList.textContent = "";
        done.forEach(function (found) {
          var item = el("li", "tk-branches__item");
          var name = el("a", "tk-branch", found.name);
          name.href =
            "https://github.com/" +
            repo +
            "/tree/" +
            found.name.split("/").map(encodeURIComponent).join("/");
          name.target = "_blank";
          name.rel = "noopener";
          item.appendChild(name);
          var by = el(
            "a",
            "tk-branches__by",
            fill(ui.branchesMergedBy, { n: found.pull.number })
          );
          by.href = found.pull.html_url;
          by.target = "_blank";
          by.rel = "noopener";
          item.appendChild(by);
          branchesList.appendChild(item);
        });
        branchesList.hidden = done.length === 0;
        var notes = [];
        if (!done.length) notes.push(ui.branchesNone);
        if (other) notes.push(fill(ui.branchesOther, { count: other }));
        branchesNote.textContent = notes.join(" ");
        branchesNote.hidden = notes.length === 0;
      })
      .catch(function () {
        branchesNote.textContent = ui.branchesError;
        branchesNote.hidden = false;
      })
      .then(function () {
        branchesCheck.disabled = false;
      });
  }

  if (branchesCheck && branchesList && branchesNote)
    branchesCheck.addEventListener("click", checkBranches);

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
  drawPulls();
  load(false);
})();

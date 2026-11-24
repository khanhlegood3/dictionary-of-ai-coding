// The Learn view: a curriculum tree, a link diagram of the current term and
// a guide that walks through the term one step at a time. No dependencies.
//
// Addresses are "#/<term-slug>" and "#/<term-slug>/<step number>". Progress
// is kept in localStorage and is shared by both languages.

(function () {
  var shell = document.getElementById("learn");
  if (!shell) return;

  var root = document.documentElement;
  // URL prefix of this page's language. Set by site/build.ts.
  var base = root.dataset.base || "";
  var SVG = "http://www.w3.org/2000/svg";
  var DONE_KEY = "learn:done";
  var LAST_KEY = "learn:last";

  function $(id) {
    return document.getElementById(id);
  }

  var el = {
    side: $("lx-side"),
    sideClose: $("lx-side-close"),
    backdrop: $("lx-backdrop"),
    menu: $("lx-menu"),
    progress: $("lx-progress"),
    progressToggle: $("lx-progress-toggle"),
    progressCount: $("lx-progress-count"),
    progressFill: $("lx-progress-fill"),
    progressList: $("lx-progress-list"),
    reset: $("lx-reset"),
    main: shell.querySelector(".lx-main"),
    head: shell.querySelector(".lx-head"),
    crumb: $("lx-crumb"),
    title: $("lx-title"),
    tags: $("lx-tags"),
    sub: $("lx-sub"),
    hudOut: $("lx-hud-out"),
    hudIn: $("lx-hud-in"),
    hudBoth: $("lx-hud-both"),
    toolMap: $("lx-tool-map"),
    toolPage: $("lx-tool-page"),
    canvas: $("lx-canvas"),
    links: $("lx-links"),
    nodes: $("lx-nodes"),
    status: $("lx-status"),
    timeline: shell.querySelector(".lx-timeline"),
    stepCount: $("lx-step-count"),
    railFill: $("lx-rail-fill"),
    steps: $("lx-steps"),
    guideStep: $("lx-guide-step"),
    chapter: $("lx-chapter"),
    guide: $("lx-guide"),
    back: $("lx-back"),
    next: $("lx-next"),
    nextLabel: $("lx-next-label"),
    prereq: $("lx-prereq"),
    bothIcon: $("lx-both-icon"),
    checkIcon: $("lx-check-icon"),
    toast: $("lx-toast"),
    toastText: $("lx-toast-text"),
  };

  var ui = null;
  var sections = [];
  var terms = [];
  var bySlug = {};
  // Per term: the terms it links to, in the order the text mentions them,
  // and the terms that link to it.
  var outbound = [];
  var inbound = [];

  var current = -1; // index of the term on screen
  var step = 0; // index of the step on screen
  var steps = []; // the steps of that term, with the recap added
  var nodeEls = {}; // diagram node of each linked term
  var pathEls = {}; // diagram link of each linked term
  var selfNode = null;
  var done = {};
  var packets = 0; // bumped to cancel packets that are still travelling
  var toastTimer = 0;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var drawerMode = window.matchMedia("(max-width: 1179.98px)");
  var pageScrolls = window.matchMedia("(max-width: 899.98px)");

  // -------------------------------------------------------------- helpers

  function fill(template, values) {
    return template.replace(/\{(\w+)\}/g, function (whole, key) {
      return key in values ? String(values[key]) : whole;
    });
  }

  function make(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function twoDigits(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function sectionOf(term) {
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].n === term.c) return sections[i];
    }
    return sections[0];
  }

  function hashFor(i, s) {
    return "#/" + terms[i].s + (s > 0 ? "/" + (s + 1) : "");
  }

  function kindLabel(item) {
    return ui.kinds[item.k] || "";
  }

  // The name a step goes by on a button or a chip. A note uses its own label.
  function stepName(item) {
    return item.k === "note" && item.t ? item.t : kindLabel(item);
  }

  // -------------------------------------------------------------- storage

  function readDone() {
    done = {};
    try {
      var list = JSON.parse(localStorage.getItem(DONE_KEY) || "[]");
      if (Array.isArray(list)) {
        list.forEach(function (slug) {
          done[slug] = true;
        });
      }
    } catch (e) {
      // No stored progress, or storage is unavailable.
    }
  }

  function writeDone() {
    try {
      localStorage.setItem(DONE_KEY, JSON.stringify(Object.keys(done)));
    } catch (e) {
      // Progress then lasts for this visit only.
    }
  }

  function remember(i, s) {
    try {
      localStorage.setItem(LAST_KEY, terms[i].s + "/" + (s + 1));
    } catch (e) {
      // Nothing to do: the address still holds the place.
    }
  }

  function lastPlace() {
    try {
      return localStorage.getItem(LAST_KEY) || "";
    } catch (e) {
      return "";
    }
  }

  // ------------------------------------------------------------- progress

  function paintProgress() {
    var total = 0;
    var perSection = {};
    terms.forEach(function (term) {
      if (!perSection[term.c]) perSection[term.c] = 0;
      if (done[term.s]) {
        perSection[term.c]++;
        total++;
      }
    });

    el.progressCount.textContent = total + " / " + terms.length;
    el.progressFill.style.width =
      (terms.length ? (total / terms.length) * 100 : 0) + "%";

    sections.forEach(function (section) {
      var count = perSection[section.n] || 0;
      var text = count + "/" + section.c;
      var mod = el.side.querySelector(
        '.lx-mod[data-section="' + section.n + '"] .lx-mod__count'
      );
      if (mod) mod.textContent = text;
      var row = el.progressList.querySelector(
        '[data-section="' + section.n + '"]'
      );
      if (!row) return;
      var check = row.querySelector(".lx-check");
      check.classList.toggle("is-on", count === section.c);
      check.classList.toggle("is-part", count > 0 && count < section.c);
      row.querySelector(".lx-progress__n").textContent = text;
    });

    el.side.querySelectorAll(".lx-lesson").forEach(function (link) {
      link.classList.toggle("is-done", Boolean(done[link.dataset.slug]));
    });
  }

  function toast(text) {
    el.toastText.textContent = text;
    el.toast.classList.add("is-on");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () {
      el.toast.classList.remove("is-on");
    }, 2400);
  }

  function markDone(i) {
    var term = terms[i];
    if (done[term.s]) return;
    done[term.s] = true;
    writeDone();
    paintProgress();
    paintPrereq();
    paintTags();
    toast(fill(ui.termDone, { term: term.t }));
  }

  // -------------------------------------------------------------- sidebar

  function setModule(mod, open) {
    mod.classList.toggle("is-open", open);
    mod.querySelector(".lx-mod__head").setAttribute("aria-expanded", open);
  }

  function setDrawer(open) {
    shell.classList.toggle("is-side-open", open);
    el.backdrop.hidden = !open;
    el.menu.setAttribute("aria-expanded", open);
    if (open) {
      var here = el.side.querySelector('.lx-lesson[aria-current="page"]');
      (here || el.sideClose).focus();
    }
  }

  function paintSidebar() {
    var slug = terms[current].s;
    el.side.querySelectorAll(".lx-lesson").forEach(function (link) {
      if (link.dataset.slug === slug) {
        link.setAttribute("aria-current", "page");
        setModule(link.closest(".lx-mod"), true);
        // Wait for the section to open before bringing the row into view.
        window.setTimeout(function () {
          link.scrollIntoView({ block: "nearest" });
        }, 360);
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  // ----------------------------------------------------------------- head

  function paintTags() {
    var term = terms[current];
    el.tags.textContent = "";
    [
      ["sand", fill(ui.steps, { count: steps.length })],
      ["violet", fill(ui.links, { count: outbound[current].length })],
      ["mint", fill(ui.termOf, { i: current + 1, total: terms.length })],
    ].forEach(function (tag) {
      el.tags.appendChild(make("li", "lx-tag lx-tag--" + tag[0], tag[1]));
    });
    if (done[term.s]) {
      var tag = make("li", "lx-tag lx-tag--green");
      var check = make("span", "lx-check is-on");
      check.setAttribute("aria-hidden", "true");
      tag.appendChild(check);
      tag.appendChild(document.createTextNode(ui.done));
      el.tags.appendChild(tag);
    }
  }

  function paintHead() {
    var term = terms[current];
    var section = sectionOf(term);
    var place = 0;
    for (var i = 0; i <= current; i++) {
      if (terms[i].c === term.c) place++;
    }

    el.crumb.textContent = "";
    el.crumb.appendChild(
      make("b", "", twoDigits(section.n) + ". " + section.t)
    );
    el.crumb.appendChild(make("i", "", "/"));
    el.crumb.appendChild(
      document.createTextNode(
        fill(ui.termInSection, { i: place, total: section.c })
      )
    );

    el.title.textContent = term.t;
    if (term.a) {
      el.title.appendChild(document.createTextNode(" "));
      el.title.appendChild(make("span", "lx-title__alt", term.a));
    }
    el.sub.textContent = term.d;
    paintTags();

    el.toolMap.href = (base || "/") + "?term=" + term.s;
    el.toolPage.href = base + "/" + term.s;

    var both = outbound[current].filter(function (j) {
      return inbound[current].indexOf(j) !== -1;
    });
    el.hudOut.textContent = outbound[current].length;
    el.hudIn.textContent = inbound[current].length;
    el.hudBoth.textContent = both.length;

    document.title = term.t + " — " + ui.title + " — " + ui.siteName;

    el.head.classList.remove("is-in");
    void el.head.offsetWidth;
    el.head.classList.add("is-in");
  }

  // -------------------------------------------------------------- diagram

  function buildStage() {
    var term = terms[current];
    el.nodes.textContent = "";
    el.links.textContent = "";
    nodeEls = {};
    pathEls = {};
    el.canvas.setAttribute("aria-label", fill(ui.diagram, { term: term.t }));

    outbound[current].forEach(function (j) {
      var other = terms[j];
      var path = document.createElementNS(SVG, "path");
      path.setAttribute("class", "lx-link");
      el.links.appendChild(path);
      pathEls[j] = path;

      var node = make("a", "lx-node lx-c" + other.c);
      node.href = "#/" + other.s;
      node.title = other.d;
      node.appendChild(make("span", "lx-node__dot"));
      node.appendChild(make("span", "lx-node__name", other.t));
      if (inbound[current].indexOf(j) !== -1) {
        // Reuse the two-way icon drawn in the legend.
        var mark = make("span", "lx-both");
        mark.innerHTML = el.bothIcon.innerHTML;
        node.appendChild(mark);
      }
      el.nodes.appendChild(node);
      nodeEls[j] = node;
    });

    selfNode = make("div", "lx-node lx-node--self", term.t);
    el.nodes.appendChild(selfNode);
    el.status.textContent = outbound[current].length ? "" : ui.noLinks;
    layoutStage();
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function place(node, x, y, width) {
    node.style.left = Math.round(x) + "px";
    node.style.top = Math.round(y) + "px";
    node.style.width = Math.round(width) + "px";
  }

  // Wide stages put the term in the middle with its links in a column on
  // each side. Narrow ones put it on top, with two columns hung from a trunk.
  function layoutStage() {
    if (current === -1 || !selfNode) return;
    var list = outbound[current];
    var n = list.length;
    var width = el.canvas.clientWidth;
    if (!width) return;
    var NODE = 28;

    if (width >= 470) {
      var leftCount = Math.ceil(n / 2);
      var pitch = 36;
      el.canvas.style.minHeight =
        Math.max(190, Math.max(leftCount, 1) * pitch + 20) + "px";
      var height = el.canvas.clientHeight;
      var inner = Math.min(width, 900);
      var x0 = (width - inner) / 2;
      var selfWidth = clamp(inner * 0.27, 124, 190);
      var nodeWidth = clamp((inner - selfWidth) / 2 - 46, 96, 210);
      var cx = width / 2;
      var cy = height / 2;

      place(selfNode, cx - selfWidth / 2, 0, selfWidth);
      selfNode.style.top = Math.round(cy - selfNode.offsetHeight / 2) + "px";

      list.forEach(function (j, i) {
        var onLeft = i < leftCount;
        var k = onLeft ? i : i - leftCount;
        var count = onLeft ? leftCount : n - leftCount;
        var y = cy + (k - (count - 1) / 2) * pitch;
        var x = onLeft ? x0 : x0 + inner - nodeWidth;
        place(nodeEls[j], x, y - NODE / 2, nodeWidth);
        var from = onLeft ? cx - selfWidth / 2 : cx + selfWidth / 2;
        var to = onLeft ? x + nodeWidth : x;
        var mid = (from + to) / 2;
        pathEls[j].setAttribute(
          "d",
          "M" +
            from +
            " " +
            cy +
            "C" +
            mid +
            " " +
            cy +
            " " +
            mid +
            " " +
            y +
            " " +
            to +
            " " +
            y
        );
      });
      sizeLinks(width, height);
      return;
    }

    var gutter = 26;
    var column = (width - gutter) / 2;
    var selfW = Math.min(width, 230);
    place(selfNode, (width - selfW) / 2, 0, selfW);
    var top = selfNode.offsetHeight + 16;
    var rowPitch = 36;
    list.forEach(function (j, i) {
      var onLeft = i % 2 === 0;
      var row = Math.floor(i / 2);
      var y = top + row * rowPitch + NODE / 2;
      place(nodeEls[j], onLeft ? 0 : width - column, y - NODE / 2, column);
      pathEls[j].setAttribute(
        "d",
        "M" +
          width / 2 +
          " " +
          selfNode.offsetHeight +
          "V" +
          y +
          "H" +
          (onLeft ? column : width - column)
      );
    });
    var rows = Math.ceil(n / 2);
    var total = n ? top + rows * rowPitch : selfNode.offsetHeight + 34;
    el.canvas.style.minHeight = total + "px";
    sizeLinks(width, total);
  }

  function sizeLinks(width, height) {
    el.links.setAttribute("width", width);
    el.links.setAttribute("height", height);
    el.links.setAttribute("viewBox", "0 0 " + width + " " + height);
  }

  // A dot that travels from the term to a linked term.
  function sendPacket(path, token) {
    var length = path.getTotalLength();
    if (!length) return;
    var dot = document.createElementNS(SVG, "circle");
    dot.setAttribute("class", "lx-pkt");
    dot.setAttribute("r", 4.5);
    el.links.appendChild(dot);
    var start = null;
    var DURATION = 620;

    function frame(now) {
      if (start === null) start = now;
      var t = Math.min(1, (now - start) / DURATION);
      if (token !== packets || !dot.parentNode) {
        dot.remove();
        return;
      }
      // Ease in and out.
      var eased = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      var point = path.getPointAtLength(length * eased);
      dot.setAttribute("cx", point.x);
      dot.setAttribute("cy", point.y);
      if (t < 1) window.requestAnimationFrame(frame);
      else dot.remove();
    }
    window.requestAnimationFrame(frame);
  }

  function paintStage(animate) {
    var seen = {};
    var hit = {};
    var item = steps[step];
    for (var k = 0; k < step; k++) {
      (steps[k].l || []).forEach(function (j) {
        seen[j] = true;
      });
    }
    (item.l || []).forEach(function (j) {
      hit[j] = true;
    });
    var isRecap = item.k === "recap";

    packets++;
    el.links.querySelectorAll(".lx-pkt").forEach(function (dot) {
      dot.remove();
    });

    outbound[current].forEach(function (j) {
      var state = hit[j]
        ? "is-hit"
        : seen[j] || isRecap
          ? "is-seen"
          : "is-ahead";
      ["is-hit", "is-seen", "is-ahead"].forEach(function (name) {
        nodeEls[j].classList.toggle(name, name === state);
        pathEls[j].classList.toggle(name, name === state);
      });
      if (hit[j] && animate && !reducedMotion.matches) {
        sendPacket(pathEls[j], packets);
      }
    });
  }

  // ------------------------------------------------------------- timeline

  function buildTimeline() {
    el.steps.textContent = "";
    el.steps.style.setProperty("--n", steps.length);
    el.timeline.style.setProperty("--n", steps.length);
    steps.forEach(function (item, i) {
      var li = make("li");
      var button = make("button");
      button.type = "button";
      button.dataset.step = i;
      button.appendChild(make("span", "lx-timeline__dot", String(i + 1)));
      button.appendChild(make("span", "lx-timeline__label", kindLabel(item)));
      li.appendChild(button);
      el.steps.appendChild(li);
    });
    fitTimeline();
  }

  function fitTimeline() {
    if (!steps.length) return;
    var cell = el.steps.clientWidth / steps.length;
    el.timeline.classList.toggle("is-dense", cell < 84);
  }

  function paintTimeline() {
    var items = el.steps.children;
    for (var i = 0; i < items.length; i++) {
      items[i].classList.toggle("is-done", i < step);
      items[i].classList.toggle("is-current", i === step);
      var button = items[i].firstChild;
      if (i === step) button.setAttribute("aria-current", "step");
      else button.removeAttribute("aria-current");
    }
    el.railFill.style.width =
      (steps.length > 1 ? (step / (steps.length - 1)) * 100 : 0) + "%";
    el.stepCount.textContent = fill(ui.stepOf, {
      i: step + 1,
      total: steps.length,
    });
  }

  // ---------------------------------------------------------------- guide

  function chip(j, withCheck) {
    var other = terms[j];
    var link = make("a", "lx-chip");
    link.href = "#/" + other.s;
    link.title = other.d;
    if (withCheck) {
      var check = make("span", "lx-check" + (done[other.s] ? " is-on" : ""));
      check.setAttribute("aria-hidden", "true");
      link.appendChild(check);
    }
    link.appendChild(document.createTextNode(other.t));
    if (withCheck && done[other.s]) {
      link.setAttribute("aria-label", other.t + " (" + ui.done + ")");
    }
    return link;
  }

  function callout(tone, icon, title, bodyHtml, bodyText) {
    var box = make("div", "lx-callout lx-callout--" + tone);
    var mark = make("span", "lx-callout__icon");
    mark.setAttribute("aria-hidden", "true");
    if (icon) mark.textContent = icon;
    else mark.innerHTML = el.checkIcon.innerHTML;
    box.appendChild(mark);
    var body = make("div", "lx-callout__body");
    body.appendChild(make("p", "lx-callout__title", title));
    if (bodyHtml) {
      // Entry text rendered by site/build.ts from the dictionary files.
      body.insertAdjacentHTML("beforeend", bodyHtml);
    } else {
      body.appendChild(make("p", "", bodyText));
    }
    box.appendChild(body);
    return box;
  }

  function paintGuide(direction) {
    var term = terms[current];
    var item = steps[step];

    el.guideStep.textContent = fill(ui.stepOf, {
      i: step + 1,
      total: steps.length,
    });
    el.chapter.textContent = stepName(item);
    el.chapter.className =
      "lx-chapter lx-chapter--" +
      (item.k === "note" && item.w ? "warn" : item.k);

    el.guide.textContent = "";
    if (term.e && ui.notTranslated) {
      el.guide.appendChild(make("p", "lx-notice", ui.notTranslated));
    }
    if (item.k === "recap") {
      el.guide.appendChild(callout("tip", "", ui.keyIdea, "", term.d));
      if (inbound[current].length) {
        el.guide.appendChild(make("h3", "lx-recap__title", ui.mentionedIn));
        var list = make("ul", "lx-chips");
        inbound[current].forEach(function (j) {
          var li = make("li");
          li.appendChild(chip(j, false));
          list.appendChild(li);
        });
        el.guide.appendChild(list);
      }
    } else if (item.k === "note") {
      el.guide.appendChild(
        callout(item.w ? "warn" : "insight", item.w ? "!" : "i", item.t, item.h)
      );
    } else {
      el.guide.insertAdjacentHTML("beforeend", item.h);
    }
    if (term.e) el.guide.lang = "en";
    else el.guide.removeAttribute("lang");
    el.guide.scrollTop = 0;

    el.guide.style.setProperty("--slide", direction < 0 ? "-14px" : "14px");
    el.guide.classList.remove("is-in");
    void el.guide.offsetWidth;
    el.guide.classList.add("is-in");

    // Back and Next cross from one term to the next.
    el.back.disabled = step === 0 && current === 0;
    var nextStep = steps[step + 1];
    var nextTerm = terms[current + 1];
    if (nextStep) {
      el.nextLabel.textContent = fill(ui.next, { label: stepName(nextStep) });
      el.next.disabled = false;
    } else if (nextTerm) {
      el.nextLabel.textContent = fill(ui.next, { label: nextTerm.t });
      el.next.disabled = false;
    } else {
      el.nextLabel.textContent = ui.finished;
      el.next.disabled = true;
    }
  }

  // Terms this one links to that come earlier in the course.
  function paintPrereq() {
    el.prereq.textContent = "";
    var earlier = outbound[current]
      .filter(function (j) {
        return j < current;
      })
      .sort(function (a, b) {
        return a - b;
      });
    if (!earlier.length) {
      el.prereq.appendChild(make("li", "lx-goals__none", ui.prereqNone));
      return;
    }
    earlier.forEach(function (j) {
      var li = make("li");
      li.appendChild(chip(j, true));
      el.prereq.appendChild(li);
    });
  }

  // ------------------------------------------------------------ navigation

  function show(i, s) {
    var termChanged = i !== current;
    var direction = i > current || (i === current && s >= step) ? 1 : -1;
    if (!termChanged && s === step) return;

    if (termChanged) {
      current = i;
      steps = terms[i].steps.concat([{ k: "recap", l: [] }]);
    }
    step = clamp(s, 0, steps.length - 1);

    if (termChanged) {
      paintHead();
      buildStage();
      buildTimeline();
      paintPrereq();
      paintSidebar();
      if (pageScrolls.matches) window.scrollTo(0, 0);
      else el.main.scrollTop = 0;
    }
    paintStage(true);
    paintTimeline();
    paintGuide(direction);
    remember(current, step);
    if (step === steps.length - 1) markDone(current);
  }

  // Changing term adds a history entry; changing step replaces the current one.
  function go(i, s, push) {
    var hash = hashFor(i, s);
    if (push && window.location.hash !== hash) {
      window.location.hash = hash; // fires "hashchange", which calls route()
      return;
    }
    if (window.location.hash !== hash) {
      window.history.replaceState(null, "", hash);
    }
    show(i, s);
  }

  function parse(text) {
    var parts = text.replace(/^#?\/?/, "").split("/");
    var i = bySlug[decodeURIComponent(parts[0] || "")];
    if (i === undefined) return null;
    var s = parseInt(parts[1], 10);
    var count = terms[i].steps.length + 1;
    return { i: i, s: s >= 1 ? Math.min(s, count) - 1 : 0 };
  }

  function route() {
    var hash = window.location.hash;
    // Other fragments, such as the skip link's, are not addresses of ours.
    if (hash && hash.indexOf("#/") !== 0 && current !== -1) return;
    var target = hash.indexOf("#/") === 0 ? parse(hash) : null;
    if (!target) {
      target = parse(lastPlace()) || { i: 0, s: 0 };
      window.history.replaceState(null, "", hashFor(target.i, target.s));
    }
    show(target.i, target.s);
  }

  function next() {
    if (current === -1) return;
    if (step < steps.length - 1) go(current, step + 1, false);
    else if (current < terms.length - 1) go(current + 1, 0, true);
  }

  function back() {
    if (current === -1) return;
    if (step > 0) go(current, step - 1, false);
    else if (current > 0)
      go(current - 1, terms[current - 1].steps.length, true);
  }

  // ---------------------------------------------------------------- events

  function bind() {
    el.next.addEventListener("click", next);
    el.back.addEventListener("click", back);

    el.steps.addEventListener("click", function (event) {
      var button = event.target.closest("button[data-step]");
      if (button) go(current, Number(button.dataset.step), false);
    });

    el.side.addEventListener("click", function (event) {
      var head = event.target.closest(".lx-mod__head");
      if (head) {
        var mod = head.closest(".lx-mod");
        setModule(mod, !mod.classList.contains("is-open"));
        return;
      }
      if (event.target.closest(".lx-lesson")) setDrawer(false);
    });

    el.progressToggle.addEventListener("click", function () {
      var open = !el.progress.classList.contains("is-open");
      el.progress.classList.toggle("is-open", open);
      el.progressToggle.setAttribute("aria-expanded", open);
    });

    el.reset.addEventListener("click", function () {
      if (!window.confirm(ui.resetConfirm)) return;
      done = {};
      writeDone();
      paintProgress();
      paintPrereq();
      paintTags();
    });

    el.menu.addEventListener("click", function () {
      setDrawer(!shell.classList.contains("is-side-open"));
    });
    el.sideClose.addEventListener("click", function () {
      setDrawer(false);
      el.menu.focus();
    });
    el.backdrop.addEventListener("click", function () {
      setDrawer(false);
    });
    drawerMode.addEventListener("change", function () {
      setDrawer(false);
    });

    // Links to term pages inside the entry text stay in this view.
    shell.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link || link === el.toolPage || link === el.toolMap) return;
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
        return;
      }
      var target = new URL(link.href, window.location.href);
      if (target.origin !== window.location.origin) return;
      var path = target.pathname.replace(/\/$/, "");
      if (path.indexOf(base + "/") !== 0) return;
      var i = bySlug[decodeURIComponent(path.slice(base.length + 1))];
      if (i === undefined) return;
      event.preventDefault();
      go(i, 0, true);
    });

    // The header search opens its result here instead of the term's page.
    document.addEventListener("dictionary:select", function (event) {
      var i = bySlug[event.detail.slug];
      if (i === undefined) return;
      event.preventDefault();
      var search = document.getElementById("search-input");
      if (search) search.value = "";
      go(i, 0, true);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && shell.classList.contains("is-side-open")) {
        setDrawer(false);
        el.menu.focus();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        var search = document.getElementById("search-input");
        if (search) {
          event.preventDefault();
          search.focus();
          search.select();
        }
        return;
      }
      if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
        return;
      }
      if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
      var active = document.activeElement;
      var typing =
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          active.isContentEditable);
      if (typing) return;
      event.preventDefault();
      if (event.key === "ArrowRight") next();
      else back();
    });

    window.addEventListener("hashchange", route);

    if ("ResizeObserver" in window) {
      var lastWidth = 0;
      var lastHeight = 0;
      new ResizeObserver(function () {
        var width = el.canvas.clientWidth;
        var height = el.canvas.clientHeight;
        if (width === lastWidth && height === lastHeight) return;
        lastWidth = width;
        lastHeight = height;
        layoutStage();
        fitTimeline();
        // The layout can change the height once more. Remember the result so
        // that the observer settles.
        lastHeight = el.canvas.clientHeight;
      }).observe(el.canvas);
    } else {
      window.addEventListener("resize", function () {
        layoutStage();
        fitTimeline();
      });
    }
  }

  // ----------------------------------------------------------------- start

  function start(data) {
    ui = data.ui;
    sections = data.sections;
    terms = data.terms;

    terms.forEach(function (term, i) {
      bySlug[term.s] = i;
      inbound[i] = [];
    });
    terms.forEach(function (term, i) {
      var list = [];
      term.steps.forEach(function (item) {
        item.l.forEach(function (j) {
          if (list.indexOf(j) === -1) list.push(j);
        });
      });
      outbound[i] = list;
      list.forEach(function (j) {
        inbound[j].push(i);
      });
    });

    // On a short window the checklist would leave little room for the tree.
    if (window.innerHeight < 800) {
      el.progress.classList.remove("is-open");
      el.progressToggle.setAttribute("aria-expanded", "false");
    }

    readDone();
    paintProgress();
    bind();
    route();
    shell.setAttribute("aria-busy", "false");
  }

  fetch(base + "/learn.json")
    .then(function (response) {
      if (!response.ok) throw new Error("learn.json: " + response.status);
      return response.json();
    })
    .then(start)
    .catch(function (error) {
      el.status.textContent = shell.dataset.error || "";
      shell.setAttribute("aria-busy", "false");
      if (window.console) console.error(error);
    });
})();

// The 3D term map on the home page.
//
// Positions are computed at build time (site/layout.ts), so this file only
// projects and draws them. It uses a 2D canvas with a hand-written perspective
// projection: about 70 labelled points do not need WebGL or a library.
//
// URL state, so any view can be linked to:
//   ?term=<slug>  the selected term, shown in the side panel
//   ?q=<text>     the search text, which highlights matching terms

(function () {
  "use strict";

  var stage = document.getElementById("graph-stage");
  var canvas = document.getElementById("graph-canvas");
  if (!stage || !canvas || !canvas.getContext) return;

  var ctx = canvas.getContext("2d");
  var statusLine = document.getElementById("graph-status");
  var intro = document.getElementById("graph-intro");
  var searchInput = document.getElementById("search-input");
  var searchList = document.getElementById("search-results");
  var panel = {
    root: document.getElementById("term-panel"),
    body: document.getElementById("term-panel-body"),
    eyebrow: document.getElementById("term-panel-eyebrow"),
    title: document.getElementById("term-panel-title"),
    content: document.getElementById("term-panel-content"),
    relatedSection: document.getElementById("term-panel-related-section"),
    related: document.getElementById("term-panel-related"),
    page: document.getElementById("term-panel-page"),
    prev: document.getElementById("term-panel-prev"),
    next: document.getElementById("term-panel-next"),
    close: document.getElementById("term-panel-close"),
  };

  // Camera. Distances are in map units: the cloud of terms has radius 1.
  var FOCAL = 2.6;
  var DIST_HOME = 3;
  var DIST_FOCUS = 2.3;
  var DIST_MIN = 1.25;
  var DIST_MAX = 6;
  var PITCH_HOME = 0.18;
  var PITCH_LIMIT = 1.25;
  var ROTATE_PER_PIXEL = 0.006;
  var DRIFT_PER_SECOND = 0.045;
  // Below this stage width the panel is a bottom sheet. Keep in step with CSS.
  var WIDE = 900;

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var baseTitle = document.title;

  var nodes = [];
  var sections = {};
  var bySlug = {};
  var order = [];

  var selected = -1;
  var hovered = -1;
  var query = "";
  var matches = null;

  var cam = { yaw: 0.6, pitch: PITCH_HOME, dist: DIST_HOME, x: 0, y: 0, z: 0 };
  var goal = { dist: DIST_HOME, x: 0, y: 0, z: 0, pitch: null };
  var spin = { yaw: 0, pitch: 0 };
  var view = { w: 0, h: 0, cx: 0, cy: 0, unit: 1, gcx: 0, gcy: 0, gunit: 1 };
  var sizeFactor = 1;
  var introBox = null;

  var colors = {};
  var labelFont = "serif";

  var pointers = new Map();
  var drag = null;
  var pinch = null;

  var frameRequested = false;
  var lastTime = 0;
  var moving = false;

  // ---------------------------------------------------------------- helpers

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  // Move `current` toward `target`. Flags the frame as still moving until the
  // value arrives, so the render loop knows when it can stop.
  function ease(current, target, k, epsilon) {
    var delta = target - current;
    if (Math.abs(delta) <= epsilon) return target;
    moving = true;
    return current + delta * k;
  }

  function wake() {
    if (frameRequested) return;
    frameRequested = true;
    window.requestAnimationFrame(frame);
  }

  function readTheme() {
    var style = window.getComputedStyle(document.documentElement);
    colors.ink = style.getPropertyValue("--ink").trim() || "#1f1b16";
    colors.accent = style.getPropertyValue("--accent").trim() || "#a83f19";
    colors.bg = style.getPropertyValue("--bg").trim() || "#faf7f2";
    labelFont = style.getPropertyValue("--serif").trim() || "serif";
    measureLabels();
    wake();
  }

  // Text is measured once at 100px. A label's width at any size is a
  // proportion of that, which keeps measuring out of the render loop.
  function measureLabels() {
    ctx.font = "600 100px " + labelFont;
    nodes.forEach(function (n) {
      n.width100 = ctx.measureText(n.term).width;
    });
  }

  function isRelated(index, focus) {
    return index === focus || nodes[focus].near.indexOf(index) !== -1;
  }

  // ----------------------------------------------------------------- layout

  function resize() {
    var w = stage.clientWidth;
    var h = stage.clientHeight;
    if (!w || !h) return;
    var first = view.w === 0;
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    view.w = w;
    view.h = h;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    sizeFactor = w < 640 ? 0.86 : 1;
    updateInsets();
    if (first) snapView();
    wake();
  }

  // The map is centred in whatever the intro text and the panel leave free.
  function updateInsets() {
    var top = 0;
    var right = 0;
    var bottom = 0;
    var wide = view.w >= WIDE;
    if (selected >= 0) {
      if (wide) right = panel.root.offsetWidth;
      else bottom = panel.root.offsetHeight;
    } else if (!wide && intro) {
      top = intro.offsetHeight;
    }
    var freeW = Math.max(view.w - right, 160);
    var freeH = Math.max(view.h - top - bottom, 160);
    view.gcx = freeW / 2;
    view.gcy = top + freeH / 2;
    view.gunit = Math.max(Math.min(freeW * 0.46, freeH * 0.56), 90);

    // On a wide screen the intro sits over the map, so labels keep clear of it.
    introBox = null;
    if (selected === -1 && wide && intro) {
      introBox = {
        x: 0,
        y: 0,
        w: intro.offsetLeft + intro.offsetWidth + 12,
        h: intro.offsetTop + intro.offsetHeight + 12,
      };
    }
  }

  function snapView() {
    view.cx = view.gcx;
    view.cy = view.gcy;
    view.unit = view.gunit;
    cam.dist = goal.dist;
    cam.x = goal.x;
    cam.y = goal.y;
    cam.z = goal.z;
  }

  // ------------------------------------------------------------------ frame

  function frame(time) {
    frameRequested = false;
    var dt = lastTime ? Math.min((time - lastTime) / 1000, 0.05) : 0.016;
    lastTime = time;
    moving = false;

    var instant = reducedMotion.matches;
    var k = instant ? 1 : 1 - Math.exp(-dt * 7);

    if (!drag && !pinch) {
      if (
        !instant &&
        (Math.abs(spin.yaw) > 0.01 || Math.abs(spin.pitch) > 0.01)
      ) {
        // Carry on turning for a moment after the pointer lets go.
        cam.yaw += spin.yaw * dt;
        cam.pitch = clamp(
          cam.pitch + spin.pitch * dt,
          -PITCH_LIMIT,
          PITCH_LIMIT
        );
        var decay = Math.pow(0.004, dt);
        spin.yaw *= decay;
        spin.pitch *= decay;
        moving = true;
      } else {
        spin.yaw = 0;
        spin.pitch = 0;
      }

      if (goal.pitch !== null) {
        cam.pitch = ease(cam.pitch, goal.pitch, k, 0.001);
        if (cam.pitch === goal.pitch) goal.pitch = null;
      }

      // Slow turn while nothing is selected or pointed at.
      if (!instant && selected === -1 && hovered === -1) {
        cam.yaw += DRIFT_PER_SECOND * dt;
        moving = true;
      }
    }

    cam.dist = ease(cam.dist, goal.dist, k, 0.001);
    cam.x = ease(cam.x, goal.x, k, 0.0005);
    cam.y = ease(cam.y, goal.y, k, 0.0005);
    cam.z = ease(cam.z, goal.z, k, 0.0005);
    view.cx = ease(view.cx, view.gcx, k, 0.3);
    view.cy = ease(view.cy, view.gcy, k, 0.3);
    view.unit = ease(view.unit, view.gunit, k, 0.3);

    project();
    placeLabels();
    fade(k);
    draw();

    if (moving || drag || pinch) wake();
    else lastTime = 0;
  }

  function project() {
    var cosYaw = Math.cos(cam.yaw);
    var sinYaw = Math.sin(cam.yaw);
    var cosPitch = Math.cos(cam.pitch);
    var sinPitch = Math.sin(cam.pitch);

    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var x = n.x - cam.x;
      var y = n.y - cam.y;
      var z = n.z - cam.z;
      var x1 = x * cosYaw - z * sinYaw;
      var z1 = x * sinYaw + z * cosYaw;
      var y2 = y * cosPitch - z1 * sinPitch;
      var z2 = y * sinPitch + z1 * cosPitch;
      var depth = z2 + cam.dist;

      n.visible = depth > 0.25;
      if (!n.visible) continue;
      n.depth = depth;
      n.scale = FOCAL / depth;
      n.sx = view.cx + x1 * n.scale * view.unit;
      n.sy = view.cy + y2 * n.scale * view.unit;
      // Far terms fade, which is most of what makes the cloud read as 3D.
      n.fog = 1 - 0.72 * clamp((z2 + 0.9) / 1.9, 0, 1);
      n.r = Math.max((2.4 + 3.6 * n.weight) * n.scale * sizeFactor, 1.4);
      n.fontSize = clamp(
        (11.5 + 3 * n.weight) * Math.pow(n.scale, 0.85) * sizeFactor,
        8.5,
        26
      );
    }

    order.sort(function (a, b) {
      return nodes[b].depth - nodes[a].depth;
    });
  }

  // How much a label matters right now. Lower numbers are placed first.
  function labelRank(index) {
    if (index === selected) return 0;
    if (index === hovered) return 1;
    var focus = selected >= 0 ? selected : hovered;
    if (focus >= 0 && isRelated(index, focus)) return 2;
    if (matches && matches[index]) return 3;
    return 4;
  }

  // Labels are placed most important first, then nearest first. A label that
  // would cover one already placed is left out for this frame.
  function placeLabels() {
    var queue = [];
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      n.rank = labelRank(i);
      if (n.visible) queue.push(i);
      else n.placed = false;
    }
    queue.sort(function (a, b) {
      var na = nodes[a];
      var nb = nodes[b];
      if (na.rank !== nb.rank) return na.rank - nb.rank;
      // Keep labels that were already showing, so they do not flicker.
      if (na.placed !== nb.placed) return na.placed ? -1 : 1;
      return na.depth - nb.depth;
    });

    var taken = introBox ? [introBox] : [];
    queue.forEach(function (index) {
      var n = nodes[index];
      var size = index === selected ? n.fontSize * 1.15 : n.fontSize;
      var width = (n.width100 * size) / 100;
      var gap = n.r + 5;
      var left = n.sx + gap;
      if (left + width > view.w - 4 && n.sx - gap - width > 4) {
        left = n.sx - gap - width;
      }
      var rect = {
        x: left,
        y: n.sy - size * 0.62,
        w: width,
        h: size * 1.24,
        size: size,
      };

      var onScreen =
        rect.x < view.w &&
        rect.x + rect.w > 0 &&
        rect.y < view.h &&
        rect.y + rect.h > 0;
      var free = onScreen;
      if (free && n.rank > 1) {
        for (var t = 0; t < taken.length; t++) {
          var other = taken[t];
          if (
            rect.x < other.x + other.w + 4 &&
            rect.x + rect.w + 4 > other.x &&
            rect.y < other.y + other.h + 1 &&
            rect.y + rect.h + 1 > other.y
          ) {
            free = false;
            break;
          }
        }
      }

      n.rect = rect;
      n.placed = free;
      if (free) taken.push(rect);
    });
  }

  // Ease every term toward how visible it should be in the current state.
  function fade(k) {
    var focus = selected >= 0 ? selected : hovered;
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      var dot = 1;
      if (selected >= 0) dot = isRelated(i, selected) ? 1 : 0.2;
      else if (matches) dot = matches[i] ? 1 : 0.18;
      else if (hovered >= 0) dot = isRelated(i, hovered) ? 1 : 0.45;

      var label = 0;
      if (n.placed) {
        if (n.rank <= 3) label = 1;
        else label = focus >= 0 || matches ? dot : 0.78;
      }

      n.alpha = ease(n.alpha, dot, k, 0.01);
      n.labelAlpha = ease(n.labelAlpha, label, k, 0.01);
    }
  }

  function draw() {
    ctx.clearRect(0, 0, view.w, view.h);

    var focus = selected >= 0 ? selected : hovered;
    if (focus >= 0 && nodes[focus].visible) {
      var from = nodes[focus];
      ctx.strokeStyle = selected >= 0 ? colors.accent : colors.ink;
      ctx.lineWidth = 1.1;
      from.near.forEach(function (index) {
        var to = nodes[index];
        if (!to.visible) return;
        ctx.globalAlpha =
          (selected >= 0 ? 0.5 : 0.26) * to.alpha * Math.max(to.fog, 0.45);
        ctx.beginPath();
        ctx.moveTo(from.sx, from.sy);
        ctx.lineTo(to.sx, to.sy);
        ctx.stroke();
      });
    }

    // Far to near, so near terms draw over far ones.
    order.forEach(function (index) {
      var n = nodes[index];
      if (!n.visible) return;
      var isSelected = index === selected;
      ctx.globalAlpha = n.alpha * (n.rank <= 2 ? Math.max(n.fog, 0.7) : n.fog);
      ctx.fillStyle = isSelected ? colors.accent : colors.ink;
      ctx.beginPath();
      ctx.arc(n.sx, n.sy, isSelected ? n.r * 1.25 : n.r, 0, Math.PI * 2);
      ctx.fill();
      if (isSelected || index === hovered) {
        ctx.strokeStyle = isSelected ? colors.accent : colors.ink;
        ctx.lineWidth = 1.25;
        ctx.globalAlpha = isSelected ? 0.6 : 0.5;
        ctx.beginPath();
        ctx.arc(n.sx, n.sy, n.r * 1.25 + 4.5, 0, Math.PI * 2);
        ctx.stroke();
      }
    });

    ctx.textBaseline = "middle";
    ctx.lineJoin = "round";
    order.forEach(function (index) {
      var n = nodes[index];
      if (!n.visible || n.labelAlpha <= 0.02 || !n.rect) return;
      var isSelected = index === selected;
      ctx.font =
        (isSelected ? "700 " : "600 ") + n.rect.size + "px " + labelFont;
      ctx.globalAlpha =
        n.labelAlpha * (n.rank <= 2 ? Math.max(n.fog, 0.8) : n.fog);
      // A stroke in the page colour keeps text readable over lines and dots.
      ctx.strokeStyle = colors.bg;
      ctx.lineWidth = 3.5;
      ctx.strokeText(n.term, n.rect.x, n.sy);
      ctx.fillStyle = isSelected ? colors.accent : colors.ink;
      ctx.fillText(n.term, n.rect.x, n.sy);
    });

    ctx.globalAlpha = 1;
  }

  // ------------------------------------------------------------ interaction

  // The nearest term whose dot or label is under the point, or -1.
  function hitTest(x, y) {
    for (var i = order.length - 1; i >= 0; i--) {
      var index = order[i];
      var n = nodes[index];
      if (!n.visible) continue;
      var reach = Math.max(n.r + 6, 13);
      var dx = x - n.sx;
      var dy = y - n.sy;
      if (dx * dx + dy * dy <= reach * reach) return index;
      var rect = n.rect;
      if (
        rect &&
        n.labelAlpha > 0.25 &&
        x >= rect.x - 2 &&
        x <= rect.x + rect.w + 2 &&
        y >= rect.y &&
        y <= rect.y + rect.h
      ) {
        return index;
      }
    }
    return -1;
  }

  function setHovered(index) {
    if (index === hovered) return;
    hovered = index;
    updateCursor();
    wake();
  }

  function updateCursor() {
    canvas.style.cursor =
      drag && drag.moved ? "grabbing" : hovered >= 0 ? "pointer" : "grab";
  }

  function localPoint(event) {
    var box = canvas.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }

  function pointerGap() {
    var points = Array.from(pointers.values());
    return Math.hypot(points[0].x - points[1].x, points[0].y - points[1].y);
  }

  canvas.addEventListener("pointerdown", function (event) {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    var point = localPoint(event);
    pointers.set(event.pointerId, point);
    try {
      canvas.setPointerCapture(event.pointerId);
    } catch (e) {
      // Capture is a nicety. Dragging still works inside the canvas without it.
    }
    spin.yaw = 0;
    spin.pitch = 0;
    goal.pitch = null;

    if (pointers.size === 1) {
      drag = {
        id: event.pointerId,
        startX: point.x,
        startY: point.y,
        x: point.x,
        y: point.y,
        time: event.timeStamp,
        moved: false,
      };
    } else if (pointers.size === 2) {
      pinch = { gap: pointerGap() || 1, dist: goal.dist };
      drag = null;
    }
    wake();
  });

  canvas.addEventListener("pointermove", function (event) {
    var point = localPoint(event);

    if (pointers.has(event.pointerId)) pointers.set(event.pointerId, point);

    if (pinch && pointers.size >= 2) {
      goal.dist = clamp(
        (pinch.dist * pinch.gap) / (pointerGap() || 1),
        DIST_MIN,
        DIST_MAX
      );
      wake();
      return;
    }

    if (drag && drag.id === event.pointerId) {
      var dx = point.x - drag.x;
      var dy = point.y - drag.y;
      if (
        !drag.moved &&
        Math.hypot(point.x - drag.startX, point.y - drag.startY) > 5
      ) {
        drag.moved = true;
        hovered = -1;
        updateCursor();
      }
      if (drag.moved) {
        var seconds = Math.max((event.timeStamp - drag.time) / 1000, 0.008);
        cam.yaw += dx * ROTATE_PER_PIXEL;
        cam.pitch = clamp(
          cam.pitch + dy * ROTATE_PER_PIXEL,
          -PITCH_LIMIT,
          PITCH_LIMIT
        );
        spin.yaw = spin.yaw * 0.4 + ((dx * ROTATE_PER_PIXEL) / seconds) * 0.6;
        spin.pitch =
          spin.pitch * 0.4 + ((dy * ROTATE_PER_PIXEL) / seconds) * 0.6;
      }
      drag.x = point.x;
      drag.y = point.y;
      drag.time = event.timeStamp;
      wake();
      return;
    }

    if (event.pointerType === "mouse") setHovered(hitTest(point.x, point.y));
  });

  function endPointer(event) {
    var point = localPoint(event);
    pointers.delete(event.pointerId);

    if (pinch) {
      if (pointers.size < 2) pinch = null;
      return;
    }
    if (!drag || drag.id !== event.pointerId) return;

    var wasDrag = drag.moved;
    var idle = event.timeStamp - drag.time > 90;
    drag = null;

    if (event.type === "pointerup" && !wasDrag) {
      var hit = hitTest(point.x, point.y);
      if (hit >= 0) select(hit, { push: true, focus: true });
      else if (selected >= 0) deselect({ push: true });
    } else if (idle) {
      // The pointer stopped before letting go, so the map should stop too.
      spin.yaw = 0;
      spin.pitch = 0;
    }
    updateCursor();
    wake();
  }

  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  canvas.addEventListener("pointerleave", function (event) {
    if (event.pointerType === "mouse" && !drag) setHovered(-1);
  });

  canvas.addEventListener(
    "wheel",
    function (event) {
      event.preventDefault();
      var step = event.deltaMode === 1 ? 0.05 : 0.0015;
      zoomBy(Math.exp(event.deltaY * step));
    },
    { passive: false }
  );

  function zoomBy(factor) {
    goal.dist = clamp(goal.dist * factor, DIST_MIN, DIST_MAX);
    wake();
  }

  function resetView() {
    spin.yaw = 0;
    spin.pitch = 0;
    goal.pitch = PITCH_HOME;
    goal.dist = selected >= 0 ? DIST_FOCUS : DIST_HOME;
    wake();
  }

  canvas.addEventListener("keydown", function (event) {
    var handled = true;
    if (event.key === "ArrowLeft") cam.yaw -= 0.16;
    else if (event.key === "ArrowRight") cam.yaw += 0.16;
    else if (event.key === "ArrowUp") {
      cam.pitch = clamp(cam.pitch - 0.12, -PITCH_LIMIT, PITCH_LIMIT);
    } else if (event.key === "ArrowDown") {
      cam.pitch = clamp(cam.pitch + 0.12, -PITCH_LIMIT, PITCH_LIMIT);
    } else if (event.key === "+" || event.key === "=") zoomBy(0.8);
    else if (event.key === "-" || event.key === "_") zoomBy(1.25);
    else if (event.key === "0") resetView();
    else handled = false;
    if (handled) {
      event.preventDefault();
      wake();
    }
  });

  document
    .getElementById("graph-zoom-in")
    .addEventListener("click", function () {
      zoomBy(0.8);
    });
  document
    .getElementById("graph-zoom-out")
    .addEventListener("click", function () {
      zoomBy(1.25);
    });
  document.getElementById("graph-reset").addEventListener("click", resetView);

  // -------------------------------------------------------------- selection

  function termUrl(slug) {
    return "/?term=" + encodeURIComponent(slug);
  }

  function fillPager(link, index) {
    var n = nodes[index];
    link.hidden = !n;
    if (!n) return;
    link.href = termUrl(n.slug);
    link.querySelector(".term").textContent = n.term;
  }

  function renderPanel(index) {
    var n = nodes[index];
    panel.eyebrow.textContent =
      "Section " +
      n.section +
      " — " +
      sections[n.section] +
      " · Term " +
      (index + 1) +
      " of " +
      nodes.length;
    panel.title.textContent = n.term;
    // Built from this repository's markdown by site/build.ts.
    panel.content.innerHTML = n.html;
    panel.page.href = "/" + n.slug;

    panel.related.textContent = "";
    n.near.forEach(function (other) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = termUrl(nodes[other].slug);
      a.textContent = nodes[other].term;
      li.appendChild(a);
      panel.related.appendChild(li);
    });
    panel.relatedSection.hidden = n.near.length === 0;

    fillPager(panel.prev, index - 1);
    fillPager(panel.next, index + 1);
    panel.body.scrollTop = 0;
  }

  function select(index, options) {
    options = options || {};
    var n = nodes[index];
    if (!n) return;
    var changed = index !== selected;

    selected = index;
    hovered = -1;
    goal.x = n.x;
    goal.y = n.y;
    goal.z = n.z;
    goal.dist = Math.min(goal.dist, DIST_FOCUS);

    renderPanel(index);
    panel.root.inert = false;
    stage.classList.add("has-panel");
    stage.dataset.selected = n.slug;
    document.title = n.term + " — " + baseTitle;
    updateInsets();
    if (options.instant) snapView();
    if (options.push && changed) writeUrl(true);
    if (options.focus) panel.title.focus({ preventScroll: true });
    updateCursor();
    wake();
  }

  function deselect(options) {
    options = options || {};
    if (selected === -1) return;
    var hadFocus = panel.root.contains(document.activeElement);

    selected = -1;
    goal.x = 0;
    goal.y = 0;
    goal.z = 0;
    goal.dist = DIST_HOME;

    stage.classList.remove("has-panel");
    panel.root.inert = true;
    delete stage.dataset.selected;
    document.title = baseTitle;
    updateInsets();
    if (options.push) writeUrl(true);
    if (hadFocus) canvas.focus({ preventScroll: true });
    wake();
  }

  panel.close.addEventListener("click", function () {
    deselect({ push: true });
  });

  // Links to other terms inside the panel select that term in the map
  // instead of leaving the page.
  panel.root.addEventListener("click", function (event) {
    var link = event.target.closest("a[href]");
    if (!link || link === panel.page) return;
    if (
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }
    var url = new URL(link.href, window.location.href);
    if (url.origin !== window.location.origin) return;
    var slug =
      url.pathname === "/"
        ? url.searchParams.get("term")
        : url.pathname.replace(/^\/|\/$/g, "");
    var index = bySlug[slug];
    if (index === undefined) return;
    event.preventDefault();
    select(index, { push: true, focus: true });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape" || selected === -1) return;
    // Escape belongs to the search box while it is in use.
    if (document.activeElement === searchInput) return;
    if (searchList && !searchList.hidden) return;
    deselect({ push: true });
  });

  // ------------------------------------------------------------- search, URL

  function setQuery(text) {
    query = (text || "").trim();
    if (!query) {
      matches = null;
    } else {
      var q = query.toLowerCase();
      matches = nodes.map(function (n) {
        return (
          n.term.toLowerCase().indexOf(q) !== -1 ||
          n.description.toLowerCase().indexOf(q) !== -1
        );
      });
    }
    wake();
  }

  function writeUrl(push) {
    var params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selected >= 0) params.set("term", nodes[selected].slug);
    var search = params.toString();
    var url = window.location.pathname + (search ? "?" + search : "");
    if (url === window.location.pathname + window.location.search) return;
    window.history[push ? "pushState" : "replaceState"](null, "", url);
  }

  function readUrl(initial) {
    var params = new URLSearchParams(window.location.search);
    var text = params.get("q") || "";
    setQuery(text);
    if (searchInput && searchInput.value.trim() !== query) {
      searchInput.value = query;
    }

    var term = params.get("term");
    var index = term ? bySlug[term] : undefined;
    if (index !== undefined) {
      select(index, { instant: initial });
    } else {
      deselect({});
      // Drop a term that does not exist, so the address matches the view.
      if (term) writeUrl(false);
    }
  }

  window.addEventListener("popstate", function () {
    readUrl(false);
  });

  document.addEventListener("dictionary:query", function (event) {
    setQuery(event.detail.query);
    writeUrl(false);
  });

  document.addEventListener("dictionary:select", function (event) {
    var index = bySlug[event.detail.slug];
    if (index === undefined) return;
    event.preventDefault();
    select(index, { push: true, focus: true });
  });

  // ------------------------------------------------------------------ start

  function start(data) {
    data.sections.forEach(function (s) {
      sections[s.n] = s.t;
    });

    nodes = data.nodes.map(function (raw) {
      return {
        slug: raw.s,
        term: raw.t,
        description: raw.d,
        section: raw.c,
        x: raw.p[0],
        y: raw.p[1],
        z: raw.p[2],
        out: raw.l,
        near: [],
        html: raw.h,
        mentions: 0,
        weight: 0,
        alpha: 0,
        labelAlpha: 0,
        placed: false,
        visible: false,
        depth: 0,
      };
    });

    // A link counts in both directions: "near" is every term this one links
    // to plus every term that links to it.
    nodes.forEach(function (n, index) {
      bySlug[n.slug] = index;
      order.push(index);
      n.out.forEach(function (target) {
        nodes[target].mentions += 1;
        if (n.near.indexOf(target) === -1) n.near.push(target);
        if (nodes[target].near.indexOf(index) === -1) {
          nodes[target].near.push(index);
        }
      });
    });
    var most = 1;
    nodes.forEach(function (n) {
      n.near.sort(function (a, b) {
        return a - b;
      });
      most = Math.max(most, n.mentions);
    });
    // Terms that many entries mention are drawn larger.
    nodes.forEach(function (n) {
      n.weight = Math.sqrt(n.mentions / most);
    });

    panel.root.hidden = false;
    panel.root.inert = true;

    readTheme();
    resize();
    readUrl(true);

    new MutationObserver(readTheme).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", readTheme);
    reducedMotion.addEventListener("change", wake);
    if (window.ResizeObserver) new ResizeObserver(resize).observe(stage);
    else window.addEventListener("resize", resize);

    if (statusLine) statusLine.hidden = true;
    stage.dataset.ready = "true";
    updateCursor();
    wake();
  }

  fetch("/graph.json")
    .then(function (response) {
      if (!response.ok) throw new Error("graph data: " + response.status);
      return response.json();
    })
    .then(start)
    .catch(function () {
      if (!statusLine) return;
      statusLine.textContent = "The map could not load. ";
      var link = document.createElement("a");
      link.href = "/curriculum";
      link.textContent = "Read the curriculum list";
      statusLine.appendChild(link);
      statusLine.appendChild(document.createTextNode(" instead."));
    });
})();

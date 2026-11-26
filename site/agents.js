// The /agents pages: ask the MCP server whether it is up, and let a visitor
// run its search tool. Both talk to the server the way an agent does, with
// JSON-RPC over POST.

(function () {
  "use strict";

  var nextId = 1;

  /** Send one JSON-RPC request to the MCP server and give back its result. */
  function call(endpoint, method, params) {
    return fetch(endpoint, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: nextId++,
        method: method,
        params: params || {},
      }),
    })
      .then(function (response) {
        return response.json();
      })
      .then(function (message) {
        if (!message || message.error || !message.result) {
          throw new Error(
            (message && message.error && message.error.message) || "No result"
          );
        }
        return message.result;
      });
  }

  // ---------------------------------------------------------------- status

  Array.prototype.forEach.call(
    document.querySelectorAll("[data-mcp-status]"),
    function (el) {
      call(el.dataset.endpoint, "tools/list")
        .then(function (result) {
          el.textContent = el.dataset.ok.replace(
            "{count}",
            String(result.tools.length)
          );
          el.dataset.state = "ok";
        })
        .catch(function () {
          el.textContent = el.dataset.down;
          el.dataset.state = "down";
        });
    }
  );

  // ---------------------------------------------------------------- try it

  var form = document.getElementById("mcp-try");
  if (!form) return;
  var input = document.getElementById("mcp-query");
  var results = document.getElementById("mcp-results");
  var raw = document.getElementById("mcp-raw");
  var button = form.querySelector("button");
  var latest = 0;

  function say(text) {
    results.textContent = "";
    var p = document.createElement("p");
    p.className = "try-message";
    p.textContent = text;
    results.appendChild(p);
  }

  function show(found) {
    results.textContent = "";
    if (!found.results.length) {
      say(form.dataset.empty);
      return;
    }
    var list = document.createElement("ol");
    found.results.forEach(function (hit) {
      var li = document.createElement("li");
      var a = document.createElement("a");
      a.href = new URL(hit.url).pathname;
      a.textContent = hit.name ? hit.term + " (" + hit.name + ")" : hit.term;
      var desc = document.createElement("span");
      desc.textContent = hit.description;
      li.appendChild(a);
      li.appendChild(desc);
      list.appendChild(li);
    });
    results.appendChild(list);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var query = input.value.trim();
    if (!query) return;
    var mine = ++latest;
    button.disabled = true;
    call(form.dataset.endpoint, "tools/call", {
      name: "search",
      arguments: { query: query, lang: form.dataset.lang, limit: 5 },
    })
      .then(function (result) {
        if (mine !== latest) return;
        raw.hidden = false;
        raw.querySelector("code").textContent = JSON.stringify(
          result.structuredContent || result,
          null,
          2
        );
        if (result.isError) {
          say(result.content[0].text);
          return;
        }
        show(result.structuredContent);
      })
      .catch(function () {
        if (mine !== latest) return;
        raw.hidden = true;
        say(form.dataset.error);
      })
      .then(function () {
        if (mine === latest) button.disabled = false;
      });
  });
})();

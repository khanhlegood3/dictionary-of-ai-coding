// Bản xem thử P02, màn hình "gửi phiên bản". Tệp này đóng vai máy chủ, và làm
// thật ba việc ngay trong trình duyệt:
// - tính mã băm SHA-256 của tệp được chọn;
// - đọc mục lục của tệp .zip để xem có index.html ở gốc không;
// - so mã băm với các phiên bản đang có trong bảng.
// Tệp không được gửi đi đâu và không có gì được lưu.
(function () {
  var preview = window.g9kPreview;
  var form = document.querySelector("[data-send]");
  if (!preview || !form) return;

  var studio = document.getElementById("studio");
  var game = document.getElementById("game");
  var file = document.getElementById("goi");
  var refusal = document.getElementById("goi-loi");
  var button = form.querySelector("[data-submit]");
  var versions = document.querySelector("[data-versions]");

  function out(name, text) {
    document.querySelector('[data-out="' + name + '"]').textContent = text;
  }

  function hex(buffer) {
    return Array.prototype.map
      .call(new Uint8Array(buffer), function (b) {
        return b.toString(16).padStart(2, "0");
      })
      .join("");
  }

  function megabytes(bytes) {
    var mb = bytes / (1024 * 1024);
    return mb < 0.1
      ? Math.max(1, Math.round(bytes / 1024)) + " kB"
      : mb.toFixed(1).replace(".", ",") + " MB";
  }

  // Tên các tệp trong một gói .zip, đọc từ mục lục ở cuối tệp.
  // Trả về null khi tệp không phải .zip đọc được.
  function namesInZip(buffer) {
    var view = new DataView(buffer);
    var size = view.byteLength;
    var at = size - 22;
    var stop = Math.max(0, size - 22 - 65535);
    for (; at >= stop; at--) if (view.getUint32(at, true) === 0x06054b50) break;
    if (at < stop || at < 0) return null;
    var count = view.getUint16(at + 10, true);
    var offset = view.getUint32(at + 16, true);
    var names = [];
    var decoder = new TextDecoder();
    for (var i = 0; i < count; i++) {
      if (offset + 46 > size || view.getUint32(offset, true) !== 0x02014b50)
        return null;
      var nameLength = view.getUint16(offset + 28, true);
      var extraLength = view.getUint16(offset + 30, true);
      var commentLength = view.getUint16(offset + 32, true);
      names.push(
        decoder.decode(new Uint8Array(buffer, offset + 46, nameLength))
      );
      offset += 46 + nameLength + extraLength + commentLength;
    }
    return names;
  }

  function mark(input, error, ok) {
    error.hidden = ok;
    input.setAttribute("aria-invalid", ok ? "false" : "true");
    return ok;
  }

  function refuse(reason) {
    refusal.textContent = "Lỗi: " + reason;
    file.setAttribute("aria-invalid", "true");
    preview.go("refused");
    file.focus();
  }

  function busy(on) {
    button.disabled = on;
    button.textContent = on ? "Đang gửi…" : "Gửi gói";
    form.setAttribute("aria-busy", on ? "true" : "false");
  }

  function cell(label, text, className) {
    var td = document.createElement("td");
    td.setAttribute("data-label", label);
    if (className) td.className = className;
    td.textContent = text;
    return td;
  }

  function addRow(hash, chosen) {
    var row = document.createElement("tr");
    row.setAttribute("data-hash", hash);
    row.setAttribute("data-game", game.value.trim());
    row.setAttribute("data-studio", studio.value.trim());
    row.setAttribute("data-when", "vừa xong");
    var head = document.createElement("th");
    head.scope = "row";
    var code = document.createElement("code");
    code.textContent = hash.slice(0, 8);
    head.appendChild(code);
    row.appendChild(head);
    row.appendChild(cell("Game", game.value.trim()));
    row.appendChild(cell("Studio", studio.value.trim()));
    row.appendChild(cell("Gói", chosen.name));
    row.appendChild(cell("Cỡ", megabytes(chosen.size), "num"));
    row.appendChild(cell("Gửi lúc", "Vừa xong", "when"));
    versions.prepend(row);
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var chosen = file.files[0];
    var ok = [
      mark(
        studio,
        document.getElementById("studio-loi"),
        !!studio.value.trim()
      ),
      mark(game, document.getElementById("game-loi"), !!game.value.trim()),
    ].every(Boolean);
    if (!chosen) {
      refuse("hãy chọn một tệp .zip.");
      return;
    }
    if (!ok) {
      preview.go("form");
      (studio.value.trim() ? game : studio).focus();
      return;
    }
    if (!window.crypto || !crypto.subtle) {
      refuse(
        "trình duyệt này không tính được mã băm ở địa chỉ không có https. Hãy mở bản xem thử qua https."
      );
      return;
    }

    file.setAttribute("aria-invalid", "false");
    busy(true);
    preview.go("sending");
    chosen
      .arrayBuffer()
      .then(function (buffer) {
        return crypto.subtle.digest("SHA-256", buffer).then(function (digest) {
          return { hash: hex(digest), names: namesInZip(buffer) };
        });
      })
      .then(function (got) {
        busy(false);
        if (got.names === null) {
          refuse(
            "tệp “" +
              chosen.name +
              "” không phải một gói .zip đọc được. Hệ thống không tạo phiên bản."
          );
          return;
        }
        if (got.names.indexOf("index.html") === -1) {
          refuse(
            "gói “" +
              chosen.name +
              "” không có tệp index.html ở gốc. Hệ thống không tạo phiên bản. Hãy nén lại sao cho index.html nằm ngay ở gốc của gói, rồi gửi lại."
          );
          return;
        }
        var known = versions.querySelector('tr[data-hash="' + got.hash + '"]');
        // Dòng mẫu của trạng thái "Đã tạo" không phải một phiên bản thật.
        if (known && known.hasAttribute("data-state")) known = null;
        if (known) {
          out("same-hash", got.hash);
          out(
            "same-with",
            known.getAttribute("data-game") +
              " của " +
              known.getAttribute("data-studio") +
              ", gửi " +
              (known.getAttribute("data-when") === "vừa xong" ? "" : "lúc ") +
              known.getAttribute("data-when")
          );
          preview.go("same");
          document.querySelector('.notice[data-state="same"]').focus();
          return;
        }
        var files = got.names.filter(function (name) {
          return name.slice(-1) !== "/";
        }).length;
        out("hash", got.hash);
        out(
          "file",
          chosen.name + ", " + megabytes(chosen.size) + ", " + files + " tệp"
        );
        out("game", game.value.trim() + " của " + studio.value.trim());
        var sample = versions.querySelector("tr[data-state]");
        if (sample) sample.remove();
        addRow(got.hash, chosen);
        preview.go("created");
        document.querySelector('.notice[data-state="created"]').focus();
      })
      .catch(function () {
        busy(false);
        refuse(
          "không đọc được tệp “" +
            chosen.name +
            "”. Hệ thống không tạo phiên bản."
        );
      });
  });

  // Chọn tệp khác thì lời từ chối của tệp trước không còn đúng nữa.
  file.addEventListener("change", function () {
    if (preview.view() === "refused") preview.go("form");
  });

  [studio, game].forEach(function (input) {
    input.addEventListener("input", function () {
      if (input.value.trim())
        mark(input, document.getElementById(input.id + "-loi"), true);
    });
  });

  // Vào thẳng ?state=sending thì nút hiện ở dạng đang gửi, như lúc chờ.
  function onView(view) {
    if (view === "sending" && !button.disabled) {
      button.disabled = true;
      button.textContent = "Đang gửi…";
    } else if (
      view !== "sending" &&
      form.getAttribute("aria-busy") !== "true"
    ) {
      button.disabled = false;
      button.textContent = "Gửi gói";
    }
    file.setAttribute("aria-invalid", view === "refused" ? "true" : "false");
  }
  document.addEventListener("g9k:view", function (event) {
    onView(event.detail);
  });
  onView(preview.view());
})();

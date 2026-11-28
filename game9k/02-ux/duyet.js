// Bản xem thử P02, màn hình duyệt báo cáo. Tệp này đóng vai máy chủ: nó đếm
// phiên chơi làm bằng chứng của từng phát hiện, từ chối duyệt khi một phát
// hiện không có bằng chứng, và cho bỏ rồi hoàn tác một phát hiện.
// Không có gì được lưu: tải lại trang là về dữ liệu mẫu ban đầu.
(function () {
  var form = document.querySelector("[data-approve]");
  var refusal = document.querySelector("[data-refusal]");
  if (!form || !refusal) return;
  var list = refusal.querySelector("ul");

  function kept() {
    return Array.prototype.slice
      .call(document.querySelectorAll("details.finding[data-finding]"))
      .filter(function (d) {
        return !d.parentElement.hidden;
      });
  }

  function evidence(d) {
    return d.querySelectorAll('input[type="checkbox"]:checked').length;
  }

  function refresh(d) {
    var n = evidence(d);
    d.querySelector(".finding__count").textContent = n
      ? n + " phiên chơi"
      : "Chưa có bằng chứng";
    d.classList.toggle("finding--bare", n === 0);
  }

  function bare() {
    return kept().filter(function (d) {
      return evidence(d) === 0;
    });
  }

  function setView(view) {
    history.replaceState(null, "", "?state=" + view);
    document.querySelectorAll("[data-view-link]").forEach(function (a) {
      if (a.getAttribute("data-view-link") === view) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
  }

  // Chỉ ra từng phát hiện thiếu bằng chứng. Trả về số phát hiện như vậy.
  function showRefusal() {
    var missing = bare();
    list.textContent = "";
    missing.forEach(function (d) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + d.id;
      link.textContent = "Phát hiện " + d.getAttribute("data-finding");
      item.appendChild(link);
      item.appendChild(
        document.createTextNode(
          " không dẫn về phiên chơi nào. Hãy chọn ít nhất một phiên chơi làm bằng chứng, hoặc bỏ phát hiện này."
        )
      );
      list.appendChild(item);
    });
    refusal.hidden = missing.length === 0;
    return missing.length;
  }

  function afterChange() {
    if (refusal.hidden) return;
    if (showRefusal() === 0) setView("draft");
  }

  kept().forEach(function (d) {
    refresh(d);
    d.addEventListener("change", function () {
      refresh(d);
      afterChange();
    });

    var say = d.querySelector("[data-say]");
    say.addEventListener("input", function () {
      d.querySelector(".finding__say").textContent = say.value;
    });

    d.querySelector("[data-remove]").addEventListener("click", function () {
      var li = d.parentElement;
      var note = document.createElement("li");
      note.className = "undo";
      note.setAttribute("role", "status");
      var text = document.createElement("span");
      text.textContent =
        "Đã bỏ phát hiện " + d.getAttribute("data-finding") + ".";
      var back = document.createElement("button");
      back.type = "button";
      back.className = "btn";
      back.textContent = "Hoàn tác";
      back.addEventListener("click", function () {
        li.hidden = false;
        note.remove();
        afterChange();
        d.querySelector("summary").focus();
      });
      note.appendChild(text);
      note.appendChild(back);
      li.hidden = true;
      li.after(note);
      afterChange();
      back.focus();
    });
  });

  form.addEventListener("submit", function (event) {
    if (showRefusal() === 0) return;
    event.preventDefault();
    setView("refused");
    refusal.focus();
  });

  // ?state=refused hiện sẵn lời từ chối, như sau khi bấm duyệt.
  if (new URLSearchParams(location.search).get("state") === "refused") {
    showRefusal();
  }
})();

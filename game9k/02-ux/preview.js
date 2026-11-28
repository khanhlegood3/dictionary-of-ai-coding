// Bản xem thử P02. Tệp này không thuộc sản phẩm: nó chỉ đổi trạng thái của màn
// hình theo địa chỉ (?state=…), để người duyệt xem được mọi trạng thái.
// Các trạng thái của một màn hình là các liên kết trong dải trên cùng; liên kết
// đầu tiên là trạng thái mặc định. Không có script thì trang hiện trạng thái đó.
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll("[data-view-link]")
  );
  var views = links.map(function (a) {
    return a.getAttribute("data-view-link");
  });

  function fromAddress() {
    var wanted = new URLSearchParams(location.search).get("state");
    return views.indexOf(wanted) === -1 ? views[0] : wanted;
  }

  // Hiện một trạng thái. Một vùng có thể thuộc nhiều trạng thái:
  // data-state="draft refused".
  function show(view) {
    document.querySelectorAll("[data-state]").forEach(function (el) {
      var own = el.getAttribute("data-state").split(/\s+/);
      el.hidden = own.indexOf(view) === -1;
    });
    links.forEach(function (a) {
      if (a.getAttribute("data-view-link") === view) {
        a.setAttribute("aria-current", "page");
      } else {
        a.removeAttribute("aria-current");
      }
    });
    document.dispatchEvent(new CustomEvent("g9k:view", { detail: view }));
  }

  // Cho script của từng màn hình: đổi trạng thái và ghi nó vào địa chỉ, để
  // nút Quay lại của trình duyệt đi đúng các bước.
  window.g9kPreview = {
    view: fromAddress,
    go: function (view) {
      history.pushState(null, "", "?state=" + view);
      show(view);
      window.scrollTo(0, 0);
    },
  };

  show(fromAddress());
  window.addEventListener("popstate", function () {
    show(fromAddress());
  });

  // Một địa chỉ có #phat-hien-2 mở sẵn phát hiện đó.
  function openFromHash() {
    var el = location.hash && document.getElementById(location.hash.slice(1));
    if (el && el.tagName === "DETAILS") el.open = true;
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);

  // Mở một phát hiện thì địa chỉ ghi lại phát hiện đó.
  document.querySelectorAll("details.finding > summary").forEach(function (s) {
    s.addEventListener("click", function () {
      var d = s.parentElement;
      setTimeout(function () {
        if (d.open) history.replaceState(null, "", "#" + d.id);
      }, 0);
    });
  });
})();

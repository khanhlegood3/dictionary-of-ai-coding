// Bản xem thử P02. Tệp này không thuộc sản phẩm: nó chỉ đổi trạng thái của màn
// hình theo địa chỉ, để người duyệt xem được cả bốn trạng thái.
// Không có script thì trang hiện trạng thái đầy đủ.
(function () {
  var VIEWS = ["full", "draft", "loading", "error"];
  var wanted = new URLSearchParams(location.search).get("state");
  var view = VIEWS.indexOf(wanted) === -1 ? "full" : wanted;

  document.querySelectorAll("[data-state]").forEach(function (el) {
    el.hidden = el.getAttribute("data-state") !== view;
  });
  document.querySelectorAll("[data-view-link]").forEach(function (a) {
    if (a.getAttribute("data-view-link") === view) {
      a.setAttribute("aria-current", "page");
    } else {
      a.removeAttribute("aria-current");
    }
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

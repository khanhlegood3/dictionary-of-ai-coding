// Bản xem thử P02, màn hình "vào và chơi". Tệp này đóng vai máy chủ và vai
// game của studio:
// - chỉ cho vào game sau khi người chơi đồng ý;
// - đếm thời lượng, và chỉ đếm lúc thẻ đang hiện (US-04);
// - nhận mốc tiến trình và lỗi mà game gửi ra từ khung cô lập (US-03);
// - kiểm câu trả lời trước khi gửi.
// Không có gì được lưu hay gửi đi: tải lại trang là mất phiên chơi thử này.
(function () {
  var preview = window.g9kPreview;
  if (!preview) return;

  // Game mẫu, đứng thay gói của studio. Nó chạy trong khung có
  // sandbox="allow-scripts": nguồn của nó là nguồn rỗng, nên nó không đọc
  // được cookie, bộ nhớ hay trang của cổng (FR-02).
  var GAME = [
    "<!doctype html><html lang='vi'><meta charset='utf-8'><title>Game mẫu</title>",
    "<style>",
    "html,body{height:100%;margin:0}",
    "body{display:grid;place-items:center;background:#cfe6dc;color:#14202b;font:500 16px/1.4 system-ui,sans-serif}",
    "main{text-align:center;padding:16px}",
    "h1{margin:0 0 4px;font-size:20px}",
    "p{margin:0 0 16px}",
    ".pads{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}",
    "button{width:64px;height:64px;border-radius:50%;border:2px solid #14202b;background:#7fb89a;cursor:pointer}",
    "button.lit{background:#f6d31f}",
    "button:focus-visible{outline:3px solid #1c5fc4;outline-offset:3px}",
    "</style>",
    "<main><h1>Game mẫu của bản xem thử</h1>",
    "<p id='say'>Màn 1. Bấm vào lá sen màu vàng.</p>",
    "<div class='pads' id='pads'></div></main>",
    "<script>",
    "var level=1,hops=0,lit=0,pads=document.getElementById('pads'),say=document.getElementById('say');",
    "function tell(m){parent.postMessage(m,'*')}",
    "window.onerror=function(message){tell({type:'error',message:String(message)})};",
    "window.onunhandledrejection=function(e){tell({type:'error',message:'Unhandled rejection: '+String(e.reason)})};",
    "window.addEventListener('message',function(e){if(e.data==='throw'){setTimeout(function(){undefinedPad.x=1},0)}});",
    "function draw(){pads.textContent='';for(var i=0;i<5;i++){(function(i){var b=document.createElement('button');b.type='button';b.setAttribute('aria-label','Lá sen '+(i+1)+(i===lit?', màu vàng':''));if(i===lit)b.className='lit';b.onclick=function(){hop(i)};pads.appendChild(b)})(i)}}",
    "function hop(i){if(i!==lit){say.textContent='Màn '+level+'. Rơi xuống nước rồi. Bấm vào lá sen màu vàng.';return}",
    "hops++;if(hops===4){hops=0;level++;if(level>3){say.textContent='Hết game mẫu. Cảm ơn bạn.';pads.textContent='';tell({type:'progress',mark:'Hết game'});return}tell({type:'progress',mark:'Màn '+level})}",
    "say.textContent='Màn '+level+'. Bấm vào lá sen màu vàng.';lit=(lit+1+Math.floor(Math.random()*4))%5;draw()}",
    "draw();tell({type:'ready'});",
    "</scr" + "ipt></html>",
  ].join("\n");

  var frame = document.querySelector("[data-game]");
  var clock = document.querySelector("[data-clock]");
  var session = null;

  function minutes(ms) {
    var s = Math.floor(ms / 1000);
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  // Thời lượng: cộng dồn các khoảng thẻ đang hiện.
  function elapsed() {
    if (!session) return 0;
    return (
      session.shown + (session.since === null ? 0 : Date.now() - session.since)
    );
  }

  function tick() {
    if (session) clock.textContent = minutes(elapsed());
  }

  function pause() {
    if (!session || session.since === null) return;
    session.shown += Date.now() - session.since;
    session.since = null;
  }

  function resume() {
    if (session && session.since === null && !session.ended)
      session.since = Date.now();
  }

  function start() {
    session = {
      started: new Date(),
      shown: 0,
      since: document.visibilityState === "visible" ? Date.now() : null,
      mark: "Màn 1",
      errors: [],
      ended: false,
    };
    clock.textContent = "0:00";
    frame.srcdoc = GAME;
    endAsk(false);
    // Game không báo "sẵn sàng" sau 8 giây thì coi là không khởi động được.
    var mine = session;
    setTimeout(function () {
      if (session === mine && !mine.ready && !mine.ended) preview.go("failed");
    }, 8000);
  }

  function stop() {
    if (!session || session.ended) return;
    pause();
    session.ended = true;
    frame.removeAttribute("srcdoc");
  }

  document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") resume();
    else pause();
  });
  setInterval(tick, 500);

  window.addEventListener("message", function (event) {
    if (!session || event.source !== frame.contentWindow) return;
    var data = event.data || {};
    if (data.type === "ready") session.ready = true;
    if (data.type === "progress") session.mark = String(data.mark);
    if (data.type === "error")
      session.errors.push({
        message: String(data.message),
        at: minutes(elapsed()),
      });
  });

  // Khi bàn phím đi vào khung game, trang không tự vẽ vòng tiêu điểm cho
  // khung. Đánh dấu khung để người dùng bàn phím biết mình đang ở trong game.
  function markFrame() {
    frame.classList.toggle("is-focused", document.activeElement === frame);
  }
  window.addEventListener("blur", function () {
    setTimeout(markFrame, 0);
  });
  window.addEventListener("focus", markFrame);
  document.addEventListener("focusin", markFrame);

  // Vào game chỉ sau khi đồng ý.
  var consent = document.querySelector("[data-consent]");
  var agree = document.getElementById("dong-y");
  var agreeError = document.getElementById("dong-y-loi");
  consent.addEventListener("submit", function (event) {
    event.preventDefault();
    var ok = agree.checked;
    agreeError.hidden = ok;
    agree.setAttribute("aria-invalid", ok ? "false" : "true");
    if (!ok) return agree.focus();
    preview.go("playing");
  });
  agree.addEventListener("change", function () {
    if (agree.checked) {
      agreeError.hidden = true;
      agree.setAttribute("aria-invalid", "false");
    }
  });

  // Kết thúc phiên chơi: hỏi lại một lần, vì không quay lại chơi tiếp được.
  var endFirst = document.querySelector("[data-end]");
  var endSure = document.querySelector("[data-end-sure]");
  function endAsk(asking) {
    endFirst.hidden = asking;
    endSure.hidden = !asking;
  }
  endFirst.addEventListener("click", function () {
    endAsk(true);
    endSure.querySelector("[data-end-yes]").focus();
  });
  endSure.querySelector("[data-end-no]").addEventListener("click", function () {
    endAsk(false);
    endFirst.focus();
  });
  endSure
    .querySelector("[data-end-yes]")
    .addEventListener("click", function () {
      stop();
      preview.go("questions");
    });

  document.querySelector("[data-retry]").addEventListener("click", function () {
    preview.go("playing");
  });

  document.querySelector("[data-throw]").addEventListener("click", function () {
    if (frame.contentWindow) frame.contentWindow.postMessage("throw", "*");
  });

  // Câu hỏi sau phiên chơi.
  var answers = document.querySelector("[data-answers]");
  var first = document.getElementById("cau-1");
  var firstError = document.getElementById("cau-1-loi");
  answers.addEventListener("submit", function (event) {
    event.preventDefault();
    var ok = first.value.trim() !== "";
    firstError.hidden = ok;
    first.setAttribute("aria-invalid", ok ? "false" : "true");
    if (!ok) return first.focus();
    preview.go("done");
  });
  first.addEventListener("input", function () {
    if (first.value.trim() !== "") {
      firstError.hidden = true;
      first.setAttribute("aria-invalid", "false");
    }
  });

  // Tóm tắt phiên chơi cho người chơi thấy. Vào thẳng bằng địa chỉ thì chưa
  // có phiên chơi nào, nên hiện số mẫu.
  function summary() {
    var real = session && session.ended;
    var errors = real ? session.errors.length : 0;
    document.querySelectorAll("[data-sum-time]").forEach(function (el) {
      el.textContent = real ? minutes(session.shown) : "3:05";
    });
    document.querySelectorAll("[data-sum-mark]").forEach(function (el) {
      el.textContent = real ? session.mark : "Màn 2";
    });
    document.querySelectorAll("[data-sum-errors]").forEach(function (el) {
      el.textContent = errors === 0 ? "Không có" : errors + " lỗi";
    });
    document.querySelectorAll("[data-sum-sample]").forEach(function (el) {
      el.hidden = real;
    });
  }

  function onView(view) {
    if (view === "playing") {
      if (!session || session.ended) start();
    } else {
      stop();
    }
    if (view === "questions" || view === "done") summary();
  }
  document.addEventListener("g9k:view", function (event) {
    onView(event.detail);
  });
  onView(preview.view());
})();

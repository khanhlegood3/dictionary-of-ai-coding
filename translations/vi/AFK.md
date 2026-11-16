---
description: "Kiểu làm việc trong đó người dùng khởi động một phiên rồi để agent tự chạy không ai trông (away from keyboard, rời bàn phím)."
---

Away from keyboard, tức rời bàn phím. Kiểu làm việc trong đó người dùng khởi động một [phiên](./Session.md) rồi để [agent](./Agent.md) tự chạy không ai trông. Đây là thứ nhân năng suất của lập trình với [AI](./AI.md): nhiều phiên AFK có thể chạy song song trong lúc bạn ngủ, ăn, hoặc làm việc khác. Để an toàn, nó thường đòi hỏi một [chế độ phân quyền](./Permission%20mode.md) dễ dãi cộng với [sandbox](./Sandbox.md).

Khi bạn không có mặt, agent xử lý sự mơ hồ theo cách khác. Lúc bạn đang theo dõi, một quyết định mơ hồ hiện ra thành câu hỏi và bạn trả lời; khi bạn đã rời đi, agent chọn một mặc định rồi đi tiếp, và mọi quyết định về sau đều dựng trên phỏng đoán đó. Kiểu thất bại đặc trưng là quay lại và thấy hàng giờ công việc hoàn chỉnh, tự tin, dựng trên một lựa chọn sai ở mười phút đầu. Công việc không cẩu thả. Nó mạch lạc, chỉ là mạch lạc về sai thứ.

Vì bạn không đưa được ý kiến trong lúc chạy, hãy đưa trước và sau. Trước: giải quyết sự mơ hồ từ đầu, bằng một phiên [grilling](./Grilling.md), một bản [spec](./Spec.md) viết ra, để có ít khoảng trống hơn cho agent tự lấp. Trong lúc chạy: [kiểm tra tự động](./Automated%20check.md) và [review tự động](./Automated%20review.md) thay cho sự chú ý mà bạn không dành ra, báo hỏng nhanh với những gì bắt được bằng máy. Sau: đợt chạy kết thúc ở thứ xem lại được, một PR chứ không phải thay đổi đã merge. AFK không bỏ [review của con người](./Human%20review.md); nó dồn tất cả về cuối, vì vậy thứ tới ở cuối phải đáng để review. Đây cũng là lý do [AX](./AX.md) quan trọng nhất trong các đợt chạy AFK: không ai theo dõi thì môi trường là chỗ dựa duy nhất của agent.

_Nên tránh:_ "background agent". Cách gọi đó đặt trọng tâm vào máy ("chạy nền") thay vì kiểu làm việc của con người ("người dùng đã rời đi"). AFK gọi đúng điều quan trọng: người dùng không theo dõi.

_Usage:_

"Mình đang chạy cái này AFK: ba agent trong sandbox làm phần refactor, sáng mai review các PR."

"[Bypass permissions](./Agent%20mode.md) à?"

"Ừ, [hệ thống tệp](./Filesystem.md) chỉ đọc, không có mạng."

---
name: Chế độ phân quyền
description: "Phần kiểm soát quyền của một chế độ agent: lệnh gọi công cụ nào kích hoạt yêu cầu cấp quyền và lệnh nào được chạy tự động."
---

Phần kiểm soát quyền của một [chế độ agent](./Agent%20mode.md): [lệnh gọi công cụ](./Tool%20call.md) nào kích hoạt một [yêu cầu cấp quyền](./Permission%20request.md) và lệnh nào được chạy tự động. Đây là mục đích ban đầu của các hệ thống chế độ, trước khi [harness](./Harness.md) bắt đầu gói thêm chỉ dẫn hành vi lên trên.

Harness đưa ra một thang các chế độ như sau:

| Chế độ             | Đọc     | Ghi và shell                | Thường dùng cho                                       |
| ------------------ | ------- | --------------------------- | ----------------------------------------------------- |
| Read-only / plan   | Tự động | Bị chặn                     | Nghiên cứu, lập kế hoạch, review                      |
| Default            | Tự động | Hỏi                         | Công việc hằng ngày có giám sát                       |
| Auto-edit          | Tự động | Sửa tự động, shell phải hỏi | Repo đáng tin, thay đổi máy móc                       |
| "Yolo" / full-auto | Tự động | Tự động                     | [Sandbox](./Sandbox.md), các đợt chạy [AFK](./AFK.md) |

Chọn một nấc là đánh đổi giữa an toàn và bị ngắt quãng, và cả hai kiểu thất bại đều cảm nhận được. Chặt quá thì bạn thành nút thắt cổ chai: [agent](./Agent.md) dừng lại vài giây một lần cho những thao tác đọc vô hại, bạn bấm đồng ý như máy, và các lần phê duyệt không còn ý nghĩa gì. Duyệt cho có là tệ nhất của cả hai phía: chịu đủ sự ngắt quãng mà không được bảo vệ gì. Lỏng quá thì agent sửa tệp và chạy những lệnh mà lẽ ra bạn muốn xem trước.

Đầu lỏng dễ biện minh nhất khi ở trong sandbox, nơi phạm vi thiệt hại của một lệnh gọi [công cụ](./Tool.md) sai được khoanh lại. Ở ngoài sandbox, phần lớn mọi người chọn tự động duyệt thao tác đọc và giữ [con người trong vòng lặp](./Human-in-the-loop.md) cho bất cứ điều gì không đảo ngược được.

_Usage:_

"Nó dừng ở từng lần grep, phá hỏng cả đợt chạy AFK."

"Nới chế độ phân quyền cho các công cụ chỉ đọc, vẫn hỏi với thao tác ghi và shell. Phần lớn yêu cầu cấp quyền trong một [phiên](./Session.md) nghiên cứu chỉ là nhiễu."

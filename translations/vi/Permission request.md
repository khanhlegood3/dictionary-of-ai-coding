---
name: Yêu cầu cấp quyền
description: "Thứ harness hiển thị cho người dùng trước khi thực thi một lệnh gọi công cụ chưa được duyệt sẵn. Cơ chế đưa con người vào vòng lặp."
---

Thứ [harness](./Harness.md) hiển thị cho người dùng trước khi thực thi một [lệnh gọi công cụ](./Tool%20call.md) chưa được duyệt sẵn. [Mô hình](./Model.md) tạo ra lệnh gọi công cụ; thay vì chạy ngay, harness dừng lại và hỏi. Đồng ý thì nó chạy; từ chối thì harness báo việc từ chối về cho mô hình dưới dạng [kết quả công cụ](./Tool%20result.md). Đây là cơ chế để harness đưa [con người vào vòng lặp](./Human-in-the-loop.md) với những hành động rủi ro hoặc nhạy cảm.

Vòng đời của một yêu cầu cấp quyền:

| Bước | Ai         | Điều gì xảy ra                                                                    |
| ---- | ---------- | --------------------------------------------------------------------------------- |
| 1    | Mô hình    | Tạo ra một lệnh gọi công cụ                                                       |
| 2    | Harness    | Đối chiếu với [chế độ phân quyền](./Permission%20mode.md) và các phê duyệt đã lưu |
| 3    | Harness    | Đã duyệt sẵn: thực thi ngay. Nếu chưa: dừng lại và hiển thị yêu cầu               |
| 4    | Người dùng | Đồng ý một lần, đồng ý cho tới hết [phiên](./Session.md), hoặc từ chối            |
| 5    | Harness    | Thực thi lệnh gọi, hoặc gửi việc từ chối về dưới dạng kết quả công cụ             |

Từ chối một yêu cầu là một cách điều hướng agent. Mô hình đọc lời từ chối như mọi kết quả công cụ khác và phản ứng lại: nó thử cách khác, hoặc hỏi bạn muốn thế nào. Phần lớn harness cho bạn đính kèm một tin nhắn vào lời từ chối, biến yêu cầu thành một điểm điều hướng: câu "đừng làm vậy, dùng script migration đi" tới đúng lúc mô hình đang quyết định bước tiếp theo.

Cái giá là mỗi yêu cầu là một lần chờ đồng bộ vào bạn. [Agent](./Agent.md) bị chặn cho tới khi bạn trả lời. Điều đó ổn khi bạn đang theo dõi và thành vấn đề khi bạn không có mặt: một agent liên tục kích hoạt yêu cầu thì không thể để tự làm việc kiểu [AFK](./AFK.md). Chế độ phân quyền là núm chỉnh: lệnh gọi nào được chạy tự do, lệnh nào phải hỏi trước, và lý tưởng là có một [sandbox](./Sandbox.md) để việc mở rộng nhóm chạy tự do được an toàn.

_Usage:_

"Nó bị chặn ở một yêu cầu cấp quyền mười phút rồi. Lúc đó mình đang họp."

"Đó là cái giá của việc có con người trong vòng lặp. Duyệt sẵn các [công cụ](./Tool.md) an toàn để yêu cầu chỉ bật lên với những lệnh gọi thực sự rủi ro."

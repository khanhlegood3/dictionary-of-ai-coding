---
name: Không lưu trạng thái
description: "Không mang thông tin nào sang lần sau. Mô hình không lưu trạng thái giữa các yêu cầu; agent mặc định không lưu trạng thái giữa các phiên."
---

Không mang thông tin nào sang lần sau. [Mô hình](./Model.md) không lưu trạng thái giữa các [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md): mỗi yêu cầu gửi lại toàn bộ [cửa sổ ngữ cảnh](./Context%20window.md), vì mô hình không có cách nào thấy được thứ gì khác. Một [agent](./Agent.md) mặc định không lưu trạng thái giữa các [phiên](./Session.md): phiên mới bắt đầu trống trơn, không còn dấu vết của các phiên trước. Đối lập với [có lưu trạng thái](./Stateful.md).

Bản thân mô hình vĩnh viễn không lưu trạng thái: [tham số](./Parameters.md) của nó bị đóng băng sau khi [huấn luyện](./Training.md), và không việc gì bạn làm lúc [suy luận](./Inference.md) thay đổi được chúng. Mô hình không học từ lời sửa của bạn, không nhớ hôm qua đã được dặn đúng điều đó, và không dần hiểu bạn hơn, dù cuộc trò chuyện có tạo cảm giác ngược lại tới đâu. Cảm giác liên tục trong một phiên là do [harness](./Harness.md) tạo ra: nó giữ bản ghi cuộc trò chuyện và gửi lại ở mỗi yêu cầu. Mô hình không nhớ cuộc trò chuyện; nó đọc lại cuộc trò chuyện.

Hệ quả thực tế: nếu muốn điều gì được nhớ qua các phiên, bạn phải ghi nó ra một nơi mà agent sẽ đọc lại. Các tệp [AGENTS.md](./AGENTS.md.md), [hệ thống bộ nhớ](./Memory%20system.md) và [tài liệu bàn giao](./Handoff%20artifact.md) chính là như vậy: những tệp được nạp vào [ngữ cảnh](./Context.md) của các phiên sau, thay cho trí nhớ mà mô hình không có. Khi agent cứ lặp lại một lỗi bạn đã sửa trước đây, câu hỏi không phải là vì sao nó không học được, vì nó không thể, mà là lời sửa đó nên được ghi ở đâu để mọi phiên sau đều đọc thấy.

_Usage:_

"Sao lần nào mình [xoá ngữ cảnh](./Clearing.md) nó cũng quên quy ước?"

"Mô hình không lưu trạng thái, phiên mới bắt đầu trống trơn. Muốn mang theo thì ghi vào AGENTS.md hoặc một tệp bộ nhớ mà harness nạp lúc bắt đầu phiên."

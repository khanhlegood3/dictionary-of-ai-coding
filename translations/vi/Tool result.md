---
name: Kết quả công cụ
description: "Thứ harness gửi về sau khi thực thi một lệnh gọi công cụ: nội dung tệp, đầu ra hoặc lỗi. Cách duy nhất để agent thấy môi trường."
---

Thứ [harness](./Harness.md) gửi về sau khi thực thi một [lệnh gọi công cụ](./Tool%20call.md): nội dung tệp, đầu ra của lệnh, thông báo lỗi. Đây là cách duy nhất để [agent](./Agent.md) thấy [môi trường](./Environment.md). Nó quay về [mô hình](./Model.md) trong [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md) _kế tiếp_, nơi mô hình quyết định làm gì với nó. Lệnh gọi công cụ và kết quả công cụ là hai đầu của cùng một lần trao đổi, cả hai nằm trong một [lượt](./Turn.md).

Vòng đời của một kết quả công cụ:

| Bước | Ai      | Điều gì xảy ra                                                                       |
| ---- | ------- | ------------------------------------------------------------------------------------ |
| 1    | Harness | Thực thi lệnh gọi công cụ: chạy lệnh, đọc tệp                                        |
| 2    | Harness | Ghi nhận kết quả: đầu ra, nội dung hoặc lỗi                                          |
| 3    | Harness | Nối nó vào [ngữ cảnh](./Context.md) như một tin nhắn                                 |
| 4    | Harness | Gửi toàn bộ ngữ cảnh cho nhà cung cấp trong yêu cầu tới nhà cung cấp mô hình kế tiếp |
| 5    | Mô hình | Đọc kết quả và quyết định: gọi thêm công cụ, hay đưa ra câu trả lời cuối             |

Kết quả nằm lại trong ngữ cảnh cho tới hết [phiên](./Session.md). Kết quả công cụ thường chiếm phần lớn ngữ cảnh của một phiên lập trình: mỗi lần đọc tệp, chạy test, tìm kiếm đều được đưa vào đầy đủ và tiếp tục chiếm [token](./Token.md) rất lâu sau khi hết hữu ích. Vài kết quả lớn, như một log test dài dòng hay một tệp sinh tự động được đọc nguyên, có thể đẩy phiên tới sát giới hạn [cửa sổ ngữ cảnh](./Context%20window.md) nhanh hơn chính cuộc trò chuyện.

Vì kết quả là tất cả những gì mô hình thấy, mô hình không có cách nào kiểm tra môi trường đằng sau nó. Nếu đầu ra bị cắt bớt, lệnh thất bại âm thầm, hoặc harness trả về lỗi thay vì nội dung, mô hình suy luận từ thứ nó nhận được. Khi hình dung của agent về hệ thống của bạn có vẻ sai, kết quả công cụ là nơi cần xem: ở đâu đó trong bản ghi phiên có một kết quả nói khác với điều bạn biết là đúng.

_Usage:_

"Nó đang suy luận về tệp đó như thể tệp trống."

"Kết quả công cụ trả về là một lần bị từ chối quyền, không phải nội dung. Mô hình chỉ thấy chuỗi báo lỗi. Nó không có cách nào khác để thấy tệp."

---
name: Lệnh gọi công cụ
description: "Đầu ra của mô hình nêu tên một công cụ và các đối số, chỉ là văn bản có cấu trúc. Harness phải đọc nó và thực thi."
---

Đầu ra của [mô hình](./Model.md) nêu tên một [công cụ](./Tool.md) và các đối số của nó, chỉ là văn bản có cấu trúc. Tự nó không làm được gì; [harness](./Harness.md) phải đọc nó và thực thi. Mô hình tạo ra nó trong một [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md).

Vòng đời của một lệnh gọi công cụ:

| Bước | Ai      | Điều gì xảy ra                                                                       |
| ---- | ------- | ------------------------------------------------------------------------------------ |
| 1    | Mô hình | Biết có những công cụ nào qua các mô tả trong [system prompt](./System%20prompt.md)  |
| 2    | Mô hình | Phát ra một lệnh gọi, gồm tên công cụ và đối số, thường là JSON, rồi dừng            |
| 3    | Harness | Phân tích lệnh gọi và đối chiếu với [chế độ phân quyền](./Permission%20mode.md)      |
| 4    | Harness | Thực thi nếu được phép                                                               |
| 5    | Harness | Gửi kết quả về dưới dạng [kết quả công cụ](./Tool%20result.md) trong yêu cầu kế tiếp |

Một [lượt](./Turn.md) làm việc của [agent](./Agent.md) thường là nhiều vòng đi về như vậy nối với nhau.

Vì lệnh gọi được sinh ra bằng [dự đoán token tiếp theo](./Next-token%20prediction.md) như mọi thứ khác, nó có thể sai theo cách mọi đầu ra của mô hình có thể sai: một đường dẫn không tồn tại, một cờ mà lệnh không có, các đối số nghe hợp lý chứ không đúng. Harness thực thi cái đã được viết ra, không phải cái được định viết. Một đường dẫn gõ nhầm không báo lỗi nhẹ nhàng; nó sửa nhầm tệp.

_Usage:_

"Nó bảo đã chạy test nhưng thời gian sửa đổi của các tệp không hề thay đổi."

"Xem bản ghi phiên đi. Nó có thực sự phát ra lệnh gọi công cụ không, hay chỉ mô tả việc chạy test? Mô hình tạo ra lệnh gọi, nhưng nếu harness không thực thi thì chẳng có gì xảy ra cả."

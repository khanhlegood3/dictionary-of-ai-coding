---
name: Suy luận
description: "Chạy một mô hình đã huấn luyện để sinh đầu ra. Việc này xảy ra ở mỗi yêu cầu tới nhà cung cấp mô hình. Tham số giữ nguyên."
---

Chạy một [mô hình](./Model.md) đã huấn luyện để sinh đầu ra. Việc này xảy ra ở mỗi [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md). [Tham số](./Parameters.md) giữ nguyên; mô hình chỉ [dự đoán token tiếp theo](./Next-token%20prediction.md) trên [ngữ cảnh](./Context.md) được cung cấp. Rẻ so với [huấn luyện](./Training.md), nhưng được tính tiền theo [token](./Token.md) và là chi phí chủ yếu khi dùng mô hình.

Vòng đời của một mô hình chia làm hai giai đoạn:

| Giai đoạn  | Xảy ra khi nào                | Làm gì                                                            | Tham số       |
| ---------- | ----------------------------- | ----------------------------------------------------------------- | ------------- |
| Huấn luyện | Một lần, trước khi phát hành  | Tạo ra tham số từ một kho dữ liệu huấn luyện                      | Đang được ghi |
| Suy luận   | Mỗi khi có ai đó dùng mô hình | Chạy các tham số đã đóng băng trên ngữ cảnh của bạn để sinh token | Chỉ đọc       |

Không việc gì bạn làm lúc suy luận được ghi ngược lại vào tham số. Đó là lý do một lời sửa hôm nay không còn hiệu lực vào ngày mai. Khi mô hình lặp lại đúng lỗi cũ ở [phiên](./Session.md) sau, dù bạn đã giải thích cẩn thận cách sửa, nó không phớt lờ bạn; nó không có khả năng học từ cuộc trao đổi đó. Mô hình [không lưu trạng thái](./Stateless.md). Tính liên tục phải đến từ bên ngoài nó: từ [cửa sổ ngữ cảnh](./Context%20window.md) hoặc một [hệ thống bộ nhớ](./Memory%20system.md).

Cơ chế này cũng giải thích cách bạn bị tính tiền. Mỗi yêu cầu chạy mô hình trên toàn bộ ngữ cảnh, nên chi phí tăng theo [token đầu vào](./Input%20tokens.md) và [token đầu ra](./Output%20tokens.md), và một agent thực hiện hàng chục lần gọi [công cụ](./Tool.md) phải trả tiền suy luận cho từng vòng. Vì vậy kích thước ngữ cảnh vừa là câu hỏi về chất lượng, vừa là câu hỏi về chi phí.

_Usage:_

"Sao hoá đơn lại tăng theo mức sử dụng mà không phải một khoản phí bản quyền cố định?"

"Bạn đang trả tiền cho suy luận. Mỗi yêu cầu tới nhà cung cấp mô hình đều chạy mô hình trên phần cứng của họ. Huấn luyện thì đã xong từ trước, nhưng chi phí suy luận cộng dồn theo từng yêu cầu, và một [lượt](./Turn.md) có thể nở ra thành nhiều yêu cầu khi có gọi công cụ."

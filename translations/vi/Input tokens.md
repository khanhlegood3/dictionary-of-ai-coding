---
name: Token đầu vào
description: "Các token harness gửi đi ở mỗi yêu cầu tới nhà cung cấp mô hình. Được tính giá thấp hơn token đầu ra."
---

Các [token](./Token.md) mà [harness](./Harness.md) gửi đi ở mỗi [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md): [system prompt](./System%20prompt.md), lịch sử trò chuyện, [kết quả công cụ](./Tool%20result.md), tức là mọi thứ [mô hình](./Model.md) đọc trước khi viết. Chúng được tính giá thấp hơn [token đầu ra](./Output%20tokens.md), vì xử lý chúng ít tốn kém hơn.

Khi lập trình với [AI](./AI.md), token đầu vào chiếm phần lớn hoá đơn. Mô hình [không lưu trạng thái](./Stateless.md), nên mỗi [lượt](./Turn.md) gửi lại toàn bộ [phiên](./Session.md) làm đầu vào: tin nhắn đầu tiên của bạn, mọi phản hồi, mọi kết quả công cụ kể từ đó. Đầu vào của lượt thứ năm mươi chứa cả bốn mươi chín lượt trước. Một yêu cầu tới nhà cung cấp mô hình có thể chỉ sinh vài trăm token đầu ra nhưng gửi lại một trăm nghìn token đầu vào là lịch sử tích luỹ.

[Bộ đệm tiền tố](./Prefix%20cache.md) làm giảm chi phí này: phần lịch sử khớp chính xác với một yêu cầu trước đó được tính như [token đã cache](./Cache%20tokens.md) giá rẻ thay vì đầu vào nguyên giá. Khi chi phí đầu vào vẫn còn cao, cách xử lý là thu nhỏ phần bị gửi lại: [xoá ngữ cảnh](./Clearing.md) hoặc [nén ngữ cảnh](./Compaction.md) giữa các việc.

_Usage:_

"Hoá đơn cao mà [agent](./Agent.md) hầu như chẳng viết gì."

"Là do token đầu vào. Mỗi lượt gửi lại cả phiên. Không có bộ đệm tiền tố thì yêu cầu nào bạn cũng trả lại tiền cho phần lịch sử."

---
description: "Các chỉ dẫn harness đặt vào đầu mỗi yêu cầu tới nhà cung cấp mô hình, là bản chỉ thị thường trực của agent. Thường giữ nguyên suốt phiên."
---

Các chỉ dẫn mà [harness](./Harness.md) đặt vào đầu mỗi [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md). Đây là bản chỉ thị thường trực của [agent](./Agent.md): nó là ai, hành xử thế nào, được gọi những [công cụ](./Tool.md) nào, theo quy ước gì. Thường giữ nguyên suốt một [phiên](./Session.md).

System prompt do hãng làm harness viết, không phải bạn, và trong các harness lập trình thì nó lớn: thường hàng chục nghìn [token](./Token.md) gồm quy tắc hành xử, mô tả công cụ và cách xử lý tình huống biên, tất cả đều được trả tiền như [token đầu vào](./Input%20tokens.md) ở mỗi [lượt](./Turn.md). Các chỉ dẫn thường trực của riêng bạn đi kèm với nó: những tệp như [AGENTS.md](./AGENTS.md.md) được nạp cạnh system prompt lúc bắt đầu phiên, nên [mô hình](./Model.md) đọc chỉ thị của hãng và của bạn cùng nhau trước khi thấy tin nhắn của bạn.

Vì giống hệt nhau ở mọi yêu cầu, nó tạo thành phần mở đầu của [bộ đệm tiền tố](./Prefix%20cache.md). Đó là một phần lý do harness giữ nó cố định suốt phiên thay vì sửa dần trong lúc chạy.

Mô hình được huấn luyện để ưu tiên system prompt hơn tin nhắn người dùng. Vì vậy khi agent khăng khăng theo một quy ước bạn chưa từng yêu cầu, hoặc định dạng đầu ra theo kiểu bạn không sao bỏ được, thường là nó đang tuân theo system prompt, và tin nhắn của bạn đang thua trong cuộc tranh luận đó. Một số harness cho phép tuỳ biến: chúng cho bạn toàn quyền truy cập system prompt, để bạn đọc được agent thực sự đang được dặn gì và thay đổi nó.

_Usage:_

"Hai harness, cùng một mô hình, mà hành xử khác hẳn với cùng một prompt."

"System prompt khác nhau. Một cái được tinh chỉnh để sửa mã ngắn gọn, cái kia để giải thích. Sự khác biệt nằm ở đó, trước cả khi tin nhắn của bạn tới."

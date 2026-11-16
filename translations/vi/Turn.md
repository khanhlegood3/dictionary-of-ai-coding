---
name: Lượt
description: "Một tin nhắn của người dùng cộng mọi việc agent làm để đáp lại, cho tới khi trả quyền về người dùng. Gồm một hoặc nhiều yêu cầu."
---

Một tin nhắn của người dùng cộng với mọi việc [agent](./Agent.md) làm để đáp lại, cho tới khi nó trả quyền về cho người dùng. Một lượt gồm một hoặc nhiều [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md), và sẽ là nhiều nếu agent gọi [công cụ](./Tool.md). Một câu hỏi làm rõ sẽ khép lượt lại; câu trả lời của bạn mở lượt kế tiếp. Thứ bậc là [phiên](./Session.md) **> Lượt > Yêu cầu tới nhà cung cấp mô hình**.

Lượt đáng được đặt tên vì độ dài của nó do agent quyết định, không phải bạn. Bạn đưa một tin nhắn; agent quyết định nối bao nhiêu lệnh gọi công cụ trước khi trả quyền. Một lượt có thể là câu trả lời một câu, hoặc hai mươi phút đọc, sửa và chạy test. Đó là cùng một đặc tính nhìn từ hai phía: lượt dài là thứ giúp làm việc kiểu [AFK](./AFK.md) khả thi, và lượt dài cũng là nơi mọi thứ đi sai khi không ai giám sát. Tới lúc agent trả quyền, có thể nó đã trôi rất xa khỏi ý bạn.

Lượt cũng là đơn vị tự nhiên để điều hướng. Mọi thứ bên trong một lượt diễn ra mà không có bạn; khoảng giữa các lượt là nơi bạn chỉnh hướng. Phần lớn [harness](./Harness.md) làm mềm điều này: bạn có thể ngắt giữa lượt để dừng agent và chỉnh hướng nó, hoặc gõ tin nhắn trong lúc nó làm việc, và tin nhắn đó được đọc khi lượt kết thúc. Nếu bạn nhiều lần không hài lòng với nơi các lượt kết thúc, cách xử lý thường là yêu cầu lượt nhỏ hơn: lập kế hoạch trước, mỗi lần một bước. Bạn đổi sự tự chủ của agent lấy nhiều khoảng trống hơn để điều hướng.

_Usage:_

"Một lượt mà mất hai phút?"

"Trong lượt đó nó thực hiện mười bốn [lệnh gọi công cụ](./Tool%20call.md), mỗi lệnh là một yêu cầu tới nhà cung cấp mô hình riêng. Độ trễ cộng dồn lại trước khi agent trả quyền về cho bạn."

---
name: Token đầu ra
description: "Các token mô hình sinh ra để trả về. Được tính giá cao hơn token đầu vào, vì tốn nhiều năng lực tính toán hơn để tạo ra."
---

Các [token](./Token.md) mà [mô hình](./Model.md) sinh ra để trả về. Chúng được tính giá cao hơn [token đầu vào](./Input%20tokens.md), thường khoảng gấp năm lần, vì tốn nhiều năng lực tính toán hơn để tạo ra.

Mọi thứ mô hình viết đều được tính: phần văn bạn đọc, mã nó phát ra, các [lệnh gọi công cụ](./Tool%20call.md), và bất kỳ phần suy nghĩ mở rộng nào mô hình thực hiện trước khi trả lời. Điểm cuối hay làm mọi người bất ngờ: token suy luận được tính là đầu ra kể cả khi [harness](./Harness.md) thường không cho bạn thấy chúng, và tăng [effort](./Effort.md) sẽ tiêu nhiều token loại này hơn.

Token đầu ra cũng quyết định nhịp độ của một [phiên](./Session.md). Mô hình đọc đầu vào nhanh nhưng sinh đầu ra từng token một, nên khi một [lượt](./Turn.md) có vẻ chậm, hầu như luôn là do đầu ra đang được viết chứ không phải đầu vào đang được đọc. Chờ lâu thường nghĩa là một câu trả lời dài sắp tới.

_Usage:_

"Phiên refactor này đang ngốn credit dù đầu vào nhỏ."

"Agent đang viết lại cả tệp thay vì vá từng chỗ. Token đầu ra đắt khoảng gấp năm lần đầu vào. Bảo nó phát ra các chỉnh sửa thôi là hoá đơn giảm."

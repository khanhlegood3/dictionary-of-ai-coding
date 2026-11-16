---
description: "Giao thức để cắm các máy chủ công cụ bên ngoài vào harness. Đây là cách agent có thêm công cụ ngoài những thứ harness có sẵn."
---

**Model Context Protocol.** Một giao thức để cắm các máy chủ công cụ bên ngoài vào [harness](./Harness.md). Đây là cách [agent](./Agent.md) có thêm [công cụ](./Tool.md) ngoài những thứ harness có sẵn. Agent không bao giờ "gọi MCP"; nó gọi một công cụ, và harness tình cờ lấy công cụ đó từ một máy chủ MCP. Giao thức cũng cung cấp resource (dữ liệu chỉ đọc) và prompt (mẫu dùng lại được), nhưng cung cấp công cụ là công dụng chính.

Giao thức giải quyết một bài toán tích hợp. Không có chuẩn chung, mỗi harness sẽ cần bản tích hợp Linear riêng, bản tích hợp Slack riêng, bản tích hợp cơ sở dữ liệu riêng, mỗi cái được viết và bảo trì riêng. Với MCP, phần tích hợp được viết một lần dưới dạng máy chủ, và harness nào tương thích MCP cũng dùng được. Harness kết nối tới máy chủ, máy chủ công bố nó có những công cụ gì, và các công cụ đó trở nên sẵn dùng cho agent bên cạnh các công cụ dựng sẵn.

Cái giá được trả bằng [ngữ cảnh](./Context.md). Mỗi công cụ mà máy chủ công bố đi kèm một định nghĩa, gồm tên, mô tả, schema tham số, và [mô hình](./Model.md) chỉ gọi được những công cụ nó biết. Cách làm ngây thơ là nạp sẵn mọi định nghĩa vào [cửa sổ ngữ cảnh](./Context%20window.md): cài vài máy chủ nhiều công cụ là một [phiên](./Session.md) bắt đầu với hàng nghìn [token](./Token.md) schema công cụ trước khi bạn gõ gì, tiêu [ngân sách chú ý](./Attention%20budget.md) vào những công cụ mà công việc sẽ không bao giờ dùng.

Nhiều harness hiện giảm nhẹ điều này bằng tìm kiếm công cụ: thay vì định nghĩa đầy đủ, ngữ cảnh chỉ giữ một [con trỏ ngữ cảnh](./Context%20pointer.md) tới các công cụ có sẵn. Agent tìm công cụ theo tên hoặc mục đích và chỉ nạp định nghĩa khi cần. Nếu harness của bạn không làm vậy, chi phí trả trước vẫn còn, và bạn chỉ nên bật những máy chủ mà dự án thực sự cần.

_Usage:_

"Agent cần đọc ticket từ Linear."

"Cấu hình harness dùng máy chủ MCP của Linear. Nó đưa API của Linear ra thành các công cụ agent gọi được. Bạn đỡ phải viết lớp bọc công cụ riêng."

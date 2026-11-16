---
name: Nguồn thứ cấp
description: "Lời kể về một nguồn sơ cấp, cách một bước: bản tóm tắt, tài liệu, bản tóm tắt khi nén. Rẻ khi nạp, mất mát thông tin ngay từ bản chất."
---

Lời kể về một [nguồn sơ cấp](./Primary%20source.md), cách một bước: tài liệu mô tả mã nguồn, bản tóm tắt mô tả một bản ghi, báo cáo mô tả kết quả tìm kiếm. Nạp nó vào [cửa sổ ngữ cảnh](./Context%20window.md) rẻ hơn nguồn mà nó mô tả, và nó mất mát thông tin ngay từ bản chất: người viết đã quyết định điều gì quan trọng, và những gì họ bỏ đi thì vô hình với người chỉ có bản tóm tắt.

Phần lớn [context](./Context.md) engineering là việc sản xuất nguồn thứ cấp. [Nén ngữ cảnh](./Compaction.md) biến lịch sử [phiên](./Session.md) thành một bản tóm tắt làm hạt giống cho phiên sau. Một [subagent](./Subagent.md) đốt ngữ cảnh riêng của nó cho một lần tìm kiếm nhiều nhiễu rồi trả về một báo cáo ngắn. Một [tài liệu bàn giao](./Handoff%20artifact.md) cô đọng các quyết định của một phiên thành văn bản cho phiên sau đọc. [Hệ thống bộ nhớ](./Memory%20system.md) chắt những gì phiên đã học thành ghi chú. Tất cả đều đánh đổi như nhau: độ trung thực lấy khoảng trống.

Nguồn thứ cấp hỏng theo hai cách. Chúng mất mát thông tin: bản tóm tắt khi nén làm mất quyết định về schema, bản báo cáo không nhắc tới trường hợp biên. Và chúng trôi lệch: nguồn sơ cấp thay đổi mà lời kể không theo kịp, nên tài liệu mô tả kiến trúc của quý trước với sự tự tin của quý này. Khi một [agent](./Agent.md) hành động theo một nguồn thứ cấp đã hỏng theo cách nào trong hai cách đó, nó tự tin làm việc từ thông tin sai; cách xử lý là đưa nó quay lại nguồn sơ cấp.

Cả hai kiểu hỏng đều không khiến nguồn thứ cấp thành sai lầm. Cửa sổ ngữ cảnh hữu hạn, và nguồn sơ cấp thì đắt; không có bản tóm tắt, báo cáo và tài liệu bàn giao thì không việc lớn nào chứa vừa. Kỹ năng nằm ở chỗ biết chi tiết nào chịu được mất mát, và kiểm chứng với nguồn sơ cấp khi một chi tiết không chịu được. Một nguồn thứ cấp làm tốt có mang theo [con trỏ ngữ cảnh](./Context%20pointer.md) về bản gốc, như bản tóm tắt nêu tên bản ghi nó được rút ra, tài liệu nêu tên tệp nó mô tả. Khi lời kể không đủ, người đọc đi theo con trỏ thay vì làm việc từ phần đã mất mát.

_Usage:_

"Tài liệu bàn giao ghi phần auth đã xong, nhưng phiên mới cứ gặp lỗi làm mới token."

"Tài liệu đó là nguồn thứ cấp. Phiên trước ghi lại điều nó tin, không phải điều đúng. Cho phiên mới chạy các test auth và tin vào nguồn sơ cấp."

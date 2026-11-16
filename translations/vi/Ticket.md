---
description: "Tài liệu bàn giao khoanh phạm vi một phiên làm việc. Đứng riêng hoặc thuộc một spec. Có thể chặn hoặc bị chặn bởi các ticket khác."
---

Một [tài liệu bàn giao](./Handoff%20artifact.md) khoanh phạm vi một [phiên](./Session.md) làm việc. Nó đứng riêng, hoặc thuộc một [spec](./Spec.md) như một phần tử con. Ticket có thể chặn hoặc bị chặn bởi các ticket cùng cấp, nên thứ tự công việc sinh ra từ đồ thị phụ thuộc của chúng chứ không từ một kế hoạch tuyến tính.

Ràng buộc quyết định là kích thước: một phiên. Một ticket phải làm xong được trước khi phiên trôi khỏi [vùng thông minh](./Smart%20zone.md), và ràng buộc đó kiểm chứng được. Nếu các phiên làm ticket của bạn thường xuyên xuống cấp trước khi xong việc, ticket đang quá lớn; hãy chia ra. Nếu mỗi phiên tiêu phần lớn [ngữ cảnh](./Context.md) để chuẩn bị rồi mới làm năm phút, ticket đang quá nhỏ; hãy gộp lại.

Một ticket tốt được viết cho người đọc không có ngữ cảnh nào khác. Mục tiêu, tiêu chí nghiệm thu, và các [con trỏ ngữ cảnh](./Context%20pointer.md) tới những tệp và quyết định liên quan: đủ để phiên bắt tay vào việc mà không phải suy lại những gì phiên trước đã biết.

Đồ thị phụ thuộc cũng là thứ mở ra khả năng chạy song song. Các ticket độc lập, tức các lá của đồ thị, có thể chạy cùng lúc, mỗi cái trong phiên riêng. Đây là một cách hiệu quả để chạy nhiều agent cùng lúc. Trong một [nhà máy phần mềm](./Software%20factory.md), việc một ticket được đánh dấu sẵn sàng chính là thứ kích hoạt phiên của nó.

_Usage:_

"Mình bắt đầu từ đâu với spec migration?"

"Nhìn đồ thị ticket: thay đổi schema chặn việc backfill, backfill chặn việc chuyển API. Chọn một lá và chạy một phiên cho nó."

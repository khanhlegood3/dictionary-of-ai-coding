---
name: Bàn giao
description: "Chuyển ngữ cảnh của agent từ phiên này sang phiên khác, không có đường quay lại. Cách mang theo thì đa dạng: tài liệu, nén ngữ cảnh, v.v."
---

Chuyển [ngữ cảnh](./Context.md) của [agent](./Agent.md) từ [phiên](./Session.md) này sang phiên khác. Cách mang theo thì đa dạng: một [tài liệu bàn giao](./Handoff%20artifact.md) được viết ra, một bản tóm tắt nằm trong bộ nhớ ([nén ngữ cảnh](./Compaction.md)), và các cách khác. Khác với [xoá ngữ cảnh](./Clearing.md) (không chuyển gì cả). Lý do cũng đa dạng: đổi vai (người lập kế hoạch → người thực hiện), khởi động một đợt chạy [AFK](./AFK.md), toả ra nhiều phiên song song, hoặc giải phóng chỗ trong [cửa sổ ngữ cảnh](./Context%20window.md).

Phiên nhận bắt đầu với ngữ cảnh bằng không. [Mô hình](./Model.md) [không lưu trạng thái](./Stateless.md), và phiên mới không thấy được gì từ phiên cũ. Bất cứ thứ gì phiên sau cần đều phải được mang theo một cách tường minh; mọi thứ khác mất đi. "Không có đường quay lại" là ràng buộc định hình thứ được mang theo: phiên mới không thể hỏi phiên cũ ý nó là gì, nên tài liệu mang theo phải tự đứng vững.

| Cơ chế            | Hình thức                                | Đặc điểm                                                                            |
| ----------------- | ---------------------------------------- | ----------------------------------------------------------------------------------- |
| Tài liệu bàn giao | Tệp trong [môi trường](./Environment.md) | Bạn đọc và sửa được trước khi có gì phụ thuộc vào nó; dùng lại được cho nhiều phiên |
| Nén ngữ cảnh      | Bản tóm tắt trong cửa sổ ngữ cảnh        | Tự động và rẻ; khó kiểm tra hơn; chỉ nuôi một phiên kế nhiệm                        |

Thất bại dễ thấy của một lần bàn giao tồi là tranh luận lại từ đầu: phiên mới mở lại những quyết định mà phiên cũ đã chốt, vì thứ được mang theo ghi lại điều gì đã được quyết định mà không ghi vì sao. Hãy đánh giá một lần bàn giao bằng việc một phiên có ngữ cảnh bằng không làm được gì với nó.

_Usage:_

"Phiên lập kế hoạch đang nặng dần. Mình cứ làm tiếp à?"

"Bàn giao đi. Ghi các quyết định ra một tài liệu, xoá ngữ cảnh, rồi bắt đầu phần thực hiện trong một phiên mới đọc từ tài liệu đó."

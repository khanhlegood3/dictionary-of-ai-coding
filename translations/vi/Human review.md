---
name: Review của con người
description: "Người dùng đọc mã agent tạo ra và tự đưa ra phán đoán về nó. Đọc diff thì tính; đọc bản tóm tắt thì không."
---

Người dùng đọc mã mà [agent](./Agent.md) tạo ra và tự đưa ra phán đoán về nó. Đọc diff hoặc các tệp đã thay đổi thì tính; đọc _lời mô tả_ của agent về việc nó đã làm thì không. Lời kể không phải là sản phẩm. Lời mô tả là một [nguồn thứ cấp](./Secondary%20source.md), do chính bên được review viết; diff là [nguồn sơ cấp](./Primary%20source.md), và review nghĩa là đọc nó.

Agent làm tăng lượng mã được tạo ra, nên review trở thành nút thắt cổ chai. Một ý tưởng hữu ích là xếp lớp các chiến lược review khác nhau. [Kiểm tra tự động](./Automated%20check.md) bắt các lỗi máy móc, [review tự động](./Automated%20review.md) bắt các lỗi mô tả được, và review của con người được dành cho những gì chỉ bạn phán đoán được: thay đổi này có phải thay đổi đúng không, hướng làm có hợp với codebase không, thứ này có nên tồn tại không.

Review càng sớm càng rẻ. Đọc một bản kế hoạch trước khi bắt đầu việc, hoặc một diff nhỏ giữa chừng, mất vài phút; đào bới một nhánh đã hoàn chỉnh sau một đợt chạy [AFK](./AFK.md) thì lâu hơn. Đặt điểm kiểm tra review ở đâu là một quyết định về [con người trong vòng lặp](./Human-in-the-loop.md), không phải việc nghĩ tới sau cùng.

_Nên tránh:_ chỉ nói "code review". Nó mơ hồ giữa con người và tự động.

_Usage:_

"Mình đã tự review kết quả của đợt chạy AFK rồi."

"Bạn đọc diff hay chỉ đọc bản tóm tắt?"

"Diff. Bản tóm tắt bảo nó xoá mã chết, hoá ra hàm đó được gọi từ một tệp sinh tự động."

---
name: Review tự động
description: "Một agent review công việc của agent khác, thường với mô hình hoặc system prompt khác. Không tất định: nó đưa ra một phán đoán."
---

Một [agent](./Agent.md) review công việc của agent khác, thường với [mô hình](./Model.md) hoặc [system prompt](./System%20prompt.md) khác. Không tất định: nó đưa ra một phán đoán. Nó chạy ở đâu cũng được: trước khi merge trên một PR, sau khi việc đã xong trên lịch sử commit, giữa phiên dưới dạng một [subagent](./Subagent.md). Một LLM đóng vai giám khảo trong CI là review tự động, không phải [kiểm tra tự động](./Automated%20check.md). Thứ quyết định loại là phép khẳng định _làm gì_, không phải nó chạy ở đâu.

Sự tách rời khỏi agent đang làm việc là thứ khiến nó hiệu quả. Nhờ chính agent viết mã review việc của nó thì thu được rất ít: [phiên](./Session.md) đã sinh ra lỗi cũng chứa lập luận đã sinh ra lỗi, và agent đọc lại kết luận của chính mình như lời xác nhận. Một bên review với [cửa sổ ngữ cảnh](./Context%20window.md) mới không có sự gắn bó đó: nó nhìn diff như một người lạ, và review dựa vào chính điều này. Một mô hình khác hoặc một system prompt riêng cho review làm điều này sắc hơn nữa: điểm mù khác nhau, và một system prompt khoanh vào điều bạn thực sự quan tâm (bảo mật, hợp đồng API, hiệu năng) thay vì một câu "tìm vấn đề" chung chung.

Nó nằm giữa các tầng review khác. Kiểm tra tự động thì tất định và bắt được những gì khẳng định được bằng máy; [review của con người](./Human%20review.md) thì đắt và khó mở rộng nhất. Review tự động ở giữa: nó bắt các vấn đề cần phán đoán, như một tên hàm gây hiểu lầm, một trường hợp biên bị sót, với chi phí của máy. Vì không tất định, nó có thể bỏ sót và báo nhầm những thứ không phải vấn đề. Hãy coi nó là một bộ lọc nâng mức sàn trước khi con người xem, không phải một cái cổng thay thế con người.

_Nên tránh:_ "AI review" / "agent review". Quá mơ hồ để phân biệt với chính agent đang làm việc.

_Usage:_

"Bọn mình nhận quá nhiều PR tệ từ các đợt chạy [AFK](./AFK.md)."

"Thêm một bước review tự động trước khi merge: mô hình khác, system prompt riêng, khoanh vào bảo mật và các thay đổi hợp đồng."

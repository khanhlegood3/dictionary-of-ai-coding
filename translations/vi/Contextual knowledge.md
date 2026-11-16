---
name: Kiến thức ngữ cảnh
description: "Các dữ kiện agent đọc được trực tiếp từ ngữ cảnh ngay lúc này. Đối lập với kiến thức tham số."
---

Các dữ kiện mà [agent](./Agent.md) đọc được trực tiếp từ [ngữ cảnh](./Context.md) ngay lúc này: nhiệm vụ của người dùng, các tệp agent đã đọc, [kết quả công cụ](./Tool%20result.md), nội dung [AGENTS.md](./AGENTS.md.md) được nạp lúc bắt đầu [phiên](./Session.md). Đối lập với [kiến thức tham số](./Parametric%20knowledge.md): kiến thức tham số được _nhớ lại_ từ tham số; kiến thức ngữ cảnh được _đọc_ từ [cửa sổ](./Context%20window.md). [Ảo giác](./Hallucination.md) hiếm hơn nhiều khi agent làm việc từ kiến thức ngữ cảnh, vì câu trả lời nằm ngay trước mắt nó chứ không phải được vớt lên từ một ký ức đã nhoè.

Trong hai loại kiến thức, chỉ kiến thức ngữ cảnh nằm trong tầm kiểm soát của bạn. Tham số đã đóng băng, nên cách duy nhất để cho [mô hình](./Model.md) kiến thức nó thiếu, như một SDK nội bộ, một thư viện ra sau [mốc kiến thức](./Knowledge%20cutoff.md), một quyết định vừa đưa ra hôm qua, là đặt nó vào ngữ cảnh. Rất nhiều công việc thực tế khi lập trình với [AI](./AI.md) quy về điều này: đưa đúng dữ kiện tới trước mô hình vào lúc nó cần.

Khi kiến thức ngữ cảnh và kiến thức tham số mâu thuẫn, kiến thức ngữ cảnh thường thắng. Dán tài liệu API hiện hành vào thì mô hình làm theo nó thay vì ký ức cũ về API cũ. Dù vậy phiên bản cũ vẫn có thể rỉ ra, nhất là khi đã vào sâu một phiên dài. Nếu agent cứ quay về một cách viết lỗi thời dù tài liệu đã được nạp, đó là kiến thức tham số rò qua kiến thức ngữ cảnh; nhắc lại lời sửa hoặc đưa nó tới gần chỗ làm việc hơn sẽ có ích.

Khác với kiến thức tham số, dùng kiến thức ngữ cảnh thì tốn chi phí. Mọi thứ nạp vào cửa sổ đều tiêu [token](./Token.md) và cạnh tranh [ngân sách chú ý](./Attention%20budget.md) của mô hình, nên nạp nhiều hơn không tự động là tốt hơn. Mục tiêu là các dữ kiện liên quan nằm trong cửa sổ, không phải mọi dữ kiện.

_Chỉ dùng thuật ngữ này_ khi đối chiếu với kiến thức tham số; còn lại cứ nói **ngữ cảnh**.

_Nên tránh:_ "bộ nhớ làm việc". Kiến thức ngữ cảnh là thứ đang có trong cửa sổ _lúc này_; [hệ thống bộ nhớ](./Memory%20system.md) là thứ đưa nội dung xuyên phiên vào đó. Hai quy mô khác nhau, đừng gộp lại.

_Usage:_

"Sao khi mình dán tài liệu thì nó làm đúng API, còn không dán thì nó bịa?"

"Có tài liệu thì đó là kiến thức ngữ cảnh, nó đọc ngay trên trang. Không có thì là kiến thức tham số, và các endpoint hiếm bị nhoè."

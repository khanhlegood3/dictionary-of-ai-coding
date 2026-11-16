---
name: Mô hình
description: "Chính là các tham số. Không lưu trạng thái, chỉ làm một việc là dự đoán token tiếp theo. Tự nó không thể hành động như một agent."
---

Chính là các [tham số](./Parameters.md). [Không lưu trạng thái](./Stateless.md), chỉ làm một việc là [dự đoán token tiếp theo](./Next-token%20prediction.md). "Claude Opus 4.x" và "GPT-5.x" là các mô hình. Tự nó, mô hình không thể hành động như một agent; nó phải được đặt trong một [harness](./Harness.md).

Mô hình không đọc được tệp, không chạy được lệnh, không duyệt web, không nhớ được hôm qua. Nó nhận [token](./Token.md) vào và dự đoán token ra, mỗi lần một [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md). Mọi thứ trông giống một [agent](./Agent.md) đang làm việc, như chọn [công cụ](./Tool.md), đọc kết quả, lặp lại cho tới khi xong việc, thực chất là harness điều phối nhiều lần dự đoán như vậy nối tiếp nhau.

[Nhà cung cấp mô hình](./Model%20provider.md) phát hành mô hình theo nhiều hạng: một bản lớn, thông minh nhất nhưng chậm và đắt, cùng các bản nhỏ hơn, nhanh và rẻ hơn nhưng kém năng lực hơn. Chọn hạng nào là một quyết định cần cân nhắc: bản nặng cho việc lập kế hoạch và gỡ lỗi khó, bản nhẹ cho các thay đổi máy móc. Harness cho phép bạn đổi mô hình giữa [phiên](./Session.md).

Dùng từ này cho chặt cũng giúp chẩn đoán chính xác hơn. "Mô hình làm việc này kém" là một nhận định cụ thể. Cùng mô hình đó, đặt trong harness khác hoặc với [ngữ cảnh](./Context.md) khác, thường hành xử khác hẳn. Trước khi đổ lỗi cho mô hình, hãy xem nó đã được cung cấp những gì: phần lớn kết quả đáng thất vọng bắt nguồn từ ngữ cảnh hoặc harness, không phải từ tham số.

_Usage:_

"Mình có nên đổi mô hình từ Sonnet sang Opus cho bước lập kế hoạch không?"

"Cứ thử, nhưng với việc này harness mới là thứ gánh phần lớn. Đổi mô hình cũng không giúp gì nếu [system prompt](./System%20prompt.md) và công cụ đang sai."

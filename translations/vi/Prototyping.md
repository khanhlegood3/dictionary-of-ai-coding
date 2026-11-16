---
name: Làm bản mẫu
description: "Để agent dựng nhanh một bản thô khi trò chuyện không đủ độ chi tiết và bạn cần một sản phẩm thật để bàn."
---

Để [agent](./Agent.md) dựng nhanh một bản thô của thứ gì đó (làm bản mẫu), dùng khi trò chuyện không đủ độ chi tiết và bạn cần một sản phẩm thật để bàn.

[Grilling](./Grilling.md) giải quyết các quyết định thiết kế bằng trò chuyện. Trò chuyện thì rẻ, nhưng độ chi tiết thấp: có những câu hỏi không trả lời được bằng lời, như một tương tác cho cảm giác thế nào, hình dạng một API có thuận tay trong mã gọi thật không, bố cục có ổn với kích thước dữ liệu thật không. Cuộc phỏng vấn chạm tới một câu hỏi mà câu trả lời thật lòng của bạn là "mình không biết, phải nhìn thấy mới được". Qua điểm đó, cuộc thảo luận đi vòng quanh. Thay vào đó, hãy để agent dựng thứ đó lên, nhìn nó, rồi quay lại cuộc trò chuyện với một câu trả lời.

Agent hạ chi phí xây dựng, và đó là điều khiến cách này khả thi. Một bản thô từng mất một ngày để dựng thử thì giờ mất vài phút, nên đáng làm thường xuyên. Đây là kỹ thuật [có con người trong vòng lặp](./Human-in-the-loop.md): bản mẫu có đó để bạn phản ứng.

Thường bạn không dừng ở một lần nhìn. Hãy lặp cùng bản mẫu: phản ứng, yêu cầu một thay đổi, phản ứng tiếp. Mỗi vòng giải quyết thêm một quyết định dựa trên sản phẩm thật, với độ chi tiết cao hơn mức trò chuyện cho phép.

Bản mẫu không nhất thiết phải thô toàn bộ. Bạn có thể dựng những phần mình thực sự đang đánh giá ở chất lượng production, để khi quyết định được chốt, component hay API bạn đã phản ứng có thể chuyển vào codebase thật. Điều này khiến bản mẫu thành tư liệu thiết yếu để [spec](./Spec.md) tham chiếu.

_Usage:_

"Bọn mình đã cãi nhau nửa tiếng xem wizard nên là một trang hay ba bước."

"Lời nói không phân xử được đâu. Để agent làm bản mẫu cả hai. Mình bấm thử qua là năm phút sau biết ngay."

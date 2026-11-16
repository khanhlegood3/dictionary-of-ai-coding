---
name: Ý niệm thiết kế
description: "Sự hiểu chung về thứ đang được xây, do người dùng và agent cùng nắm giữ nhưng tách khỏi mọi tài sản cụ thể."
---

Sự hiểu chung về thứ đang được xây, do người dùng và [agent](./Agent.md) cùng nắm giữ nhưng tách khỏi mọi tài sản cụ thể. Đây là thuật ngữ của Brooks (_The Design of Design_): cuộc trò chuyện, các [tài liệu bàn giao](./Handoff%20artifact.md) và mã nguồn đều là những tài sản cố nắm bắt hoặc vươn tới ý niệm thiết kế, nhưng không cái nào _là_ nó. Chất lượng của ý niệm thiết kế được cảm nhận qua chất lượng của cuộc trò chuyện đã dựng nên nó.

Thuật ngữ này gọi tên khoảng trống đằng sau một nỗi bực quen thuộc: agent viết đúng thứ bạn yêu cầu mà vẫn sai. Nguyên nhân thường gặp là bạn chưa nghĩ ra trọn vẹn mình muốn gì. Ý niệm thiết kế chưa hoàn chỉnh trong chính đầu bạn: prompt của bạn nắm được những phần bạn đã nghĩ xong, và im lặng ở những phần chưa. Agent lấp các khoảng im lặng đó bằng giả định của riêng nó, vì không có gì để căn theo. Không có gì trục trặc cả. Không có ý niệm thiết kế chung, vì chưa có một ý niệm trọn vẹn để mà chia sẻ.

Bạn nhận ra một ý niệm thiết kế đã được chia sẻ theo đúng cách bạn nhận ra với một đồng nghiệp: bên kia bắt đầu trả lời những câu hỏi bạn chưa hỏi theo đúng cách bạn sẽ trả lời. Cho tới lúc đó, công việc là trò chuyện, và [grilling](./Grilling.md) là phiên bản có chủ ý của nó. Viết [spec](./Spec.md) quá sớm chỉ ghi lại sự lệch nhau vào một tài sản bền hơn. Ý niệm thiết kế cũng dịch chuyển khi bạn hiểu thêm; các tài sản đi sau nó, nên một spec trung thành với sự hiểu của tuần trước vẫn có thể dẫn phiên của tuần này đi sai.

_Usage:_

"Nó viết đúng thứ mình yêu cầu mà vẫn sai."

"Hai bên chưa có chung ý niệm thiết kế. Nó đang lấp khoảng trống bằng giả định. Cứ trao đổi tiếp cho tới khi phần huỷ đơn, hoàn tiền và giao hàng một phần đều khớp giữa hai bên rồi hãy để nó viết spec."

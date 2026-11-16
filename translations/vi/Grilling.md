---
description: "Kỹ thuật phát triển ý niệm thiết kế: agent phỏng vấn người dùng theo kiểu Socrates, mỗi lần một quyết định."
---

Một kỹ thuật phát triển [ý niệm thiết kế](./Design%20concept.md) cùng một [agent](./Agent.md): agent phỏng vấn người dùng theo kiểu Socrates, mỗi lần một quyết định, và đề xuất một câu trả lời khuyến nghị cho từng quyết định. Nó làm chậm lại sự vội vàng đi tới một kế hoạch hoàn chỉnh: không [tài liệu bàn giao](./Handoff%20artifact.md) nào được viết cho tới khi ý niệm ổn định.

Kỹ thuật này tồn tại vì agent lấp khoảng trống một cách âm thầm. Được yêu cầu viết một [spec](./Spec.md) từ một prompt hai dòng, agent không dừng lại ở những quyết định bạn chưa đưa ra. Nó chọn mặc định và ghi luôn vào. Kết quả trông hoàn chỉnh, và phỏng đoán không phân biệt được với lựa chọn, nên bạn phát hiện ra chúng muộn: lúc review, hoặc khi tính năng đã xây xử lý một trường hợp biên theo cách bạn chưa từng chọn. Grilling đảo ngược điều này: thay vì đoán, agent phải hỏi.

Đây là kỹ thuật [có con người trong vòng lặp](./Human-in-the-loop.md): câu trả lời của bạn là đầu vào. Khi một câu hỏi không trả lời được bằng trò chuyện, vì bạn phải nhìn thấy thứ đó, hãy chuyển sang [làm bản mẫu](./Prototyping.md).

_Usage:_

"Nó nhảy thẳng vào viết spec và làm sai logic huỷ đơn."

"Cho nó grilling bạn trước. Bắt nó hỏi bạn về huỷ một phần, hoàn tiền và thời điểm trước khi nó ghi bất cứ gì vào tài liệu. Giải quyết trong lúc trò chuyện rẻ hơn giải quyết trong mã."

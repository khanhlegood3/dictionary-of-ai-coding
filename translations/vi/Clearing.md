---
name: Xoá ngữ cảnh
description: "Kết thúc phiên hiện tại và bắt đầu một phiên mới. Tin nhắn kế tiếp mở đầu với phiên trống và cửa sổ ngữ cảnh trống."
---

Kết thúc [phiên](./Session.md) hiện tại và bắt đầu một phiên mới. Tin nhắn kế tiếp mở đầu với một phiên trống và một [cửa sổ ngữ cảnh](./Context%20window.md) trống. Thường do người dùng chủ động.

Xoá ngữ cảnh là thuốc chữa cho một ngữ cảnh bị ô nhiễm. Phiên tích luỹ mọi thứ: các lần thử thất bại, các hướng đi sai, [kết quả công cụ](./Tool%20result.md) đã cũ, các kế hoạch bị bỏ. [Mô hình](./Model.md) đọc lại tất cả ở mỗi [lượt](./Turn.md), và lịch sử xấu kéo lùi công việc mới. Vào sâu một phiên dài, [agent](./Agent.md) trở nên mơ hồ hơn và kém nghe lời hơn: chỉ dẫn bạn nói rõ ràng bị bỏ qua, chất lượng tuột, và thúc nó làm tốt hơn cũng không ích gì, vì đống nhiễu nó phải lội qua vẫn nằm trong [ngữ cảnh](./Context.md). Xoá ngữ cảnh loại bỏ đống nhiễu đó.

Xoá ngữ cảnh không xoá cuộc trò chuyện. Phần lớn [harness](./Harness.md) giữ lịch sử phiên trên máy của bạn, nên bản ghi vẫn còn đó để đọc hoặc tiếp tục. Thứ mất đi là trạng thái làm việc của agent: mô hình [không lưu trạng thái](./Stateless.md), nên phiên mới không biết gì về những điều phiên cũ biết. Nếu phiên đang giữ các quyết định hoặc tiến độ mà phiên sau sẽ cần, hãy để agent viết một [tài liệu bàn giao](./Handoff%20artifact.md) trước, rồi bắt đầu phiên mới bằng cách chỉ vào nó.

So sánh với [nén ngữ cảnh](./Compaction.md), vốn tóm tắt phiên vào ngữ cảnh mới thay vì bắt đầu trống. Xoá ngữ cảnh là công cụ thô hơn: không có gì được mang sang, kể cả rác.

_Usage:_

"Nó kẹt trong vòng lặp với bài test lỗi."

"Xoá ngữ cảnh đi. Bắt đầu phiên mới với tài liệu kế hoạch và tệp test. Vật lộn với ngữ cảnh hiện tại chẳng ích gì."

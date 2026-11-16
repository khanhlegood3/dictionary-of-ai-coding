---
name: Ngữ cảnh
description: "Những thông tin liên quan mà agent đang có trong tay lúc này, tức là những gì agent biết và cần cho việc đang làm."
---

Những thông tin liên quan mà [agent](./Agent.md) đang có trong tay lúc này. Đây là một danh từ trừu tượng. Nó không phải đầu vào thô mà mô hình nhìn thấy (đó là [cửa sổ ngữ cảnh](./Context%20window.md)), cũng không phải lịch sử đang chạy (đó là [phiên](./Session.md)), mà là _những gì agent biết và cần cho việc đang làm_. "Nạp thứ gì đó vào ngữ cảnh" nghĩa là đưa nó vào tập hợp này; "context engineering" là kỹ năng chọn lọc tập hợp ấy.

Ba thuật ngữ tách bạch rõ ràng:

| Thuật ngữ       | Nó gọi tên cái gì                                               |
| --------------- | --------------------------------------------------------------- |
| Ngữ cảnh        | Thông tin liên quan tới công việc mà agent hiện có              |
| Cửa sổ ngữ cảnh | Chuỗi [token](./Token.md) thực tế mà mô hình thấy ở mỗi yêu cầu |
| Phiên           | Cuộc trò chuyện đang diễn ra mà [harness](./Harness.md) lưu giữ |

Sự tách bạch này quan trọng vì ngữ cảnh là thước đo chất lượng, không phải số lượng. Một cửa sổ ngữ cảnh có thể gần đầy mà ngữ cảnh vẫn nghèo: hàng nghìn token đầu ra công cụ đã cũ, không cái nào nói về việc đang làm. Nó cũng có thể gần trống mà ngữ cảnh lại rất tốt: đúng một định nghĩa kiểu dữ liệu mà cả công việc xoay quanh.

Phần lớn sự cố hằng ngày đều truy về ngữ cảnh. Khi agent bịa ra một API, làm trái một quyết định, hay đoán mò một schema, câu hỏi đầu tiên là lúc đó trong ngữ cảnh có gì. Thường thì dữ kiện liên quan chưa từng được nạp, hoặc bị vùi lấp do [suy giảm chú ý](./Attention%20degradation.md). Cách xử lý là chọn lọc: nạp những gì công việc cần, để ngoài những gì nó không cần.

_Usage:_

"Nó cứ bịa ra những trường không có trong kiểu dữ liệu."

"Tệp định nghĩa kiểu không nằm trong ngữ cảnh. Nó đang đọc các chỗ gọi rồi đoán. Cho nó đọc phần định nghĩa trước đã."

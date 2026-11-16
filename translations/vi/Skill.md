---
description: "Một năng lực dạy được, đóng gói thành một đơn vị, nằm ngoài cửa sổ ngữ cảnh cho tới khi một con trỏ ngữ cảnh kéo nó vào cho việc đang làm."
---

Một năng lực dạy được, đóng gói thành một đơn vị: các chỉ dẫn và tài nguyên để làm tốt một việc, nằm trong [môi trường](./Environment.md) cho tới khi một [con trỏ ngữ cảnh](./Context%20pointer.md) kéo nó vào [cửa sổ ngữ cảnh](./Context%20window.md) cho việc đang làm. Đây là đơn vị của [tiết lộ dần](./Progressive%20disclosure.md) trong một [harness](./Harness.md).

Skill là một chuẩn mở, được định nghĩa tại [agentskills.io](https://agentskills.io). Chuẩn này ban đầu do Anthropic phát triển và sau đó được phần lớn harness lớn áp dụng, nên một skill viết một lần chạy được trên nhiều harness. Định dạng là một thư mục chứa:

- Một tệp `SKILL.md`: siêu dữ liệu (tối thiểu là tên và mô tả) cộng với chính các chỉ dẫn
- Tuỳ chọn: các script mà [agent](./Agent.md) chạy được
- Tuỳ chọn: các mẫu và tài liệu tham khảo mà chỉ dẫn trỏ tới

Mặc định chỉ có tên và mô tả nằm trong [ngữ cảnh](./Context.md). Khi công việc của agent khớp, nó nạp phần còn lại. Cho tới lúc đó, skill hầu như không chiếm chỗ: một hai câu [token](./Token.md), dù chỉ dẫn đầy đủ của nó lớn tới đâu.

Điều này phân biệt skill với [AGENTS.md](./AGENTS.md.md), thứ được nạp vào mọi [phiên](./Session.md) bất kể công việc. Skill được đọc khi một loại việc cụ thể xuất hiện, như release, dựng khung một dịch vụ mới, viết một migration, và bị bỏ qua vào những lúc khác.

_Nên tránh:_ "[công cụ](./Tool.md)". Công cụ là thứ agent _gọi_; skill là chỉ dẫn agent _đọc_.

_Usage:_

"Mình nên đặt quy trình deploy ở đâu?"

"Làm thành skill. Agent chỉ nạp nó khi công việc liên quan tới deploy. Để trong AGENTS.md thì nó đốt token ở mỗi [lượt](./Turn.md) cho một thứ mình dùng mỗi tuần một lần."

---
description: "Một mô hình đặt trong harness với công cụ, system prompt và cửa sổ ngữ cảnh, trao đổi theo lượt với người dùng. Mô hình khi vận hành."
---

Một [mô hình](./Model.md) đặt trong [harness](./Harness.md) với [công cụ](./Tool.md), [system prompt](./System%20prompt.md) và [cửa sổ ngữ cảnh](./Context%20window.md), trao đổi theo [lượt](./Turn.md) với người dùng. _Claude Code là một agent. Cursor là một agent. Claude.ai là một agent._ Agent là thứ bạn thực sự nói chuyện cùng: đó là mô hình khi vận hành, được cấu hình cho một mục đích.

Khác với phần lớn thuật ngữ trong từ điển này, "agent" không gọi tên một bộ phận cơ học. Mô hình là một tệp [tham số](./Parameters.md); harness là phần mềm bạn có thể chỉ vào. Agent không phải cái nào trong hai thứ đó. Nó là đơn vị bạn đang nói chuyện cùng. Người ta nhân cách hoá [AI](./AI.md) liên tục, và agent chính là đơn vị được nhân cách hoá: thứ bạn giao việc, thứ đọc tin nhắn của bạn và trả lời, chữ "nó" trong câu "nó lại làm hỏng build rồi". Khi bạn nói agent đã làm gì đó, ý bạn là mô hình cộng harness đã làm, nhưng bạn đang gọi cả tổ hợp ấy như một tác nhân duy nhất.

Ý tưởng này có trước làn sóng AI hiện nay. Software agent, tức chương trình mà bạn giao cho một mục tiêu và nó hành động thay bạn, là khái niệm đã có từ khi có AI.

_Nên tránh:_ "con AI", "con bot". Chúng quá mơ hồ, che mất việc bạn đang nói tới các tham số hay thứ đã được đặt trong harness.

_Usage:_

"Bạn đang dùng agent nào cho đợt migration?"

"Claude Code ở máy, Cursor cho phần giao diện. Bên dưới là cùng một mô hình, chỉ khác harness."

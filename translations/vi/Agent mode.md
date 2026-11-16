---
name: Chế độ agent
description: "Một thiết lập sẵn, gói chế độ phân quyền cùng các chỉ dẫn hành vi được chèn vào system prompt. Có thể đổi giữa phiên."
---

Một thiết lập sẵn định hình cách [agent](./Agent.md) vận hành lúc chạy. Nó gói một [chế độ phân quyền](./Permission%20mode.md) cùng các chỉ dẫn hành vi được chèn vào [system prompt](./System%20prompt.md). Ví dụ: chế độ mặc định hỏi trước các lệnh gọi rủi ro, **plan mode** chặn chỉnh sửa và hướng agent sang nghiên cứu, chế độ **accept-edits** tự động duyệt chỉnh sửa, chế độ **bypass permissions** (thường gọi vui là **YOLO mode**) tự động duyệt mọi thứ. Có thể đổi [giữa phiên](./Session.md).

Việc gói chung là thứ phân biệt một chế độ với một thiết lập quyền đơn thuần. Chế độ phân quyền chỉ là một cái cổng: nó quyết định [lệnh gọi công cụ](./Tool%20call.md) nào được đi qua. Chỉ có cổng thì bạn có một agent muốn sửa mà không sửa được: nó đề xuất thao tác ghi, bị chặn, rồi thử đường khác. Các chỉ dẫn được chèn vào gỡ bỏ cái muốn đó: plan mode không chỉ chặn chỉnh sửa, nó còn bảo agent rằng đang ở giai đoạn lập kế hoạch, nên agent đọc, hỏi và đề xuất thay vì cố vượt cổng. Cổng và hướng dẫn cùng chỉ về một phía.

Trên thực tế, bạn đổi chế độ khi mức tin tưởng của bạn thay đổi trong quá trình làm một việc. Cùng một việc có thể đi qua vài chế độ: plan mode khi hướng làm còn đang được định hình, chế độ mặc định có hỏi cho những chỉnh sửa tế nhị đầu tiên, accept-edits khi agent đã cho thấy nó hiểu thay đổi, bypass cho một đợt chạy [AFK](./AFK.md) bên trong [sandbox](./Sandbox.md). Đổi chế độ không tốn gì: cuộc trò chuyện tiếp tục đúng chỗ cũ, với quyền mới và chỉ dẫn mới. Nếu bạn thấy mình duyệt mọi câu hỏi mà không đọc, chế độ đang chặt hơn mức tin tưởng thật của bạn; nếu bạn cứ từ chối các chỉnh sửa, nó đang lỏng hơn.

_Thuật ngữ của các hãng:_ Claude Code gọi chúng là "permission modes", Codex gọi là "approval modes". Cả hai tên đều có trước việc gói thêm chỉ dẫn hành vi.

_Usage:_

"Nó cứ sửa tệp trong khi mình chỉ muốn một bản kế hoạch."

"Chuyển sang plan mode. Nó sẽ chặn thao tác ghi và chỉ nghiên cứu."

"Còn đợt chạy AFK lát nữa thì sao?"

"Bypass mode, nhưng chỉ ở trong sandbox."

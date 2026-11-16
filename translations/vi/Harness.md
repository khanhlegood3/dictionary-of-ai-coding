---
description: "Mọi thứ bao quanh mô hình để biến nó thành agent: công cụ, system prompt, quản lý cửa sổ ngữ cảnh, phân quyền, hook."
---

Mọi thứ bao quanh [mô hình](./Model.md) để biến nó thành một [agent](./Agent.md): [công cụ](./Tool.md), [system prompt](./System%20prompt.md), [quản lý cửa sổ ngữ cảnh](./Context%20window.md), phân quyền, hook. **Claude.ai** và **Claude Code** chạy trên cùng một mô hình nhưng hành xử khác nhau vì harness của chúng khác nhau.

Bản thân mô hình chỉ làm một việc: nhận văn bản vào, sinh văn bản ra. Nó không đọc được tệp, không chạy được lệnh, không nhớ được [lượt](./Turn.md) trước. Harness cung cấp tất cả những thứ đó. Nó lắp ghép [ngữ cảnh](./Context.md) cho từng [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md), thực thi các [lệnh gọi công cụ](./Tool%20call.md) mà mô hình yêu cầu, đưa [kết quả công cụ](./Tool%20result.md) trở lại, lưu lịch sử [phiên](./Session.md), xin phép bạn trước các hành động rủi ro, và quyết định khi nào cần [nén ngữ cảnh](./Compaction.md). Vòng lặp agent, tức là mô hình đề xuất, harness thực thi, rồi lặp lại, do harness điều khiển.

Điều này quan trọng khi chẩn đoán. Khi hành vi khác nhau giữa hai sản phẩm, hoặc giữa hôm qua và hôm nay, biến số thường không phải mô hình mà là harness. Một system prompt khác, một bộ công cụ khác, một mặc định phân quyền bị đổi, hay một chiến lược quản lý ngữ cảnh mới đều làm hành vi thay đổi mà mô hình không hề đổi. Nó cũng có nghĩa harness là nơi chứa phần lớn cấu hình của bạn: các tệp [AGENTS.md](./AGENTS.md.md), thiết lập phân quyền và hook đều là chỉ dẫn cho harness, không phải cho mô hình.

Ví dụ: Claude Code, Cursor, Codex CLI, và cả Claude.ai, vốn là harness để trò chuyện chứ không phải để lập trình.

_Usage:_

"Cùng một mô hình, sao Claude Code thì sửa tệp còn Claude.ai chỉ trả lời câu hỏi?"

"Harness khác nhau. Claude Code có công cụ làm việc với [hệ thống tệp](./Filesystem.md), system prompt khác, và một lớp phân quyền. Ở đây mô hình không phải là biến số."

---
description: "Developer experience: codebase và bộ công cụ giúp con người làm tốt việc dễ tới đâu, gồm tài liệu, tốc độ phản hồi, thông báo lỗi."
---

Developer experience (trải nghiệm của lập trình viên): một codebase và bộ công cụ của nó giúp con người làm tốt việc dễ tới đâu. DX tốt là phản hồi nhanh, thông báo lỗi rõ ràng, tài liệu trả lời đúng câu hỏi bạn đang có, và phần cài đặt chạy được ngay lần đầu. Thuật ngữ này có từ rất lâu trước lập trình với AI; nó có trong từ điển này chủ yếu để đối chiếu với [AX](./AX.md).

DX là sự tương tác giữa con người và codebase, không hơn. Khác biệt chính giữa hai nhóm đối tượng là con người [có lưu trạng thái](./Stateful.md) còn agent [không lưu trạng thái](./Stateless.md). Con người học codebase một lần và mang kiến thức đó sang mọi ngày sau, vì vậy DX kém vẫn sống được: họ đi vòng qua CI chậm bằng cách gộp các lần push, qua tài liệu thiếu bằng cách hỏi một lần trên Slack, qua cấu trúc rối bằng cách nhớ mọi thứ nằm ở đâu. Các cách đi vòng tích luỹ lại, và nhóm rốt cuộc vẫn làm việc năng suất trong một codebase chống lại họ.

[Agent](./Agent.md) đối mặt với cùng codebase đó mà không có sự tích luỹ nào. Không lưu trạng thái qua các [phiên](./Session.md), agent học lại codebase từ đầu mỗi lần. Nó hưởng lợi từ bộ test nhanh và thông báo lỗi rõ ràng, nhưng điều gì nó nghĩ ra hôm qua đều mất, trừ khi được ghi vào [môi trường](./Environment.md), thứ agent chỉ nhận biết qua [kết quả công cụ](./Tool%20result.md). Đó là khoảng trống mà AX gọi tên: những phần của DX còn giá trị khi lập trình viên là agent, cộng với những mối quan tâm con người không có, như giữ cho [cửa sổ ngữ cảnh](./Context%20window.md) còn trống.

Phần trùng nhau nghĩa là đầu tư cho DX thường cải thiện luôn AX: kiểu chặt chẽ, test nhanh và cấu trúc dễ đoán giúp cả hai. Phần khác nhau nghĩa là không phải lúc nào cũng vậy: một tài liệu onboarding đẹp giúp con người trong một tuần và không giúp gì agent, trừ khi tới được nó từ [AGENTS.md](./AGENTS.md.md).

_Usage:_

"DX của bọn mình ổn mà, người mới làm việc được sau một tuần."

"Làm việc được vì có người ngồi kèm họ cả tuần đó. Agent không có tuần đó; hãy kiểm tra AX riêng."

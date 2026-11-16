---
description: "Agent experience: môi trường được sắp đặt tốt tới đâu để agent làm tốt việc, gồm kiểm tra tự động, kiến trúc và ngữ cảnh còn trống."
---

Agent experience (trải nghiệm của agent): [môi trường](./Environment.md) được sắp đặt tốt tới đâu để một [agent](./Agent.md) làm tốt việc trong một codebase. Đây là phiên bản hướng tới agent của [DX](./DX.md). Khi cùng một agent làm tốt ở repo này và làm tệ ở repo khác, cùng [mô hình](./Model.md), cùng [harness](./Harness.md), khác biệt thường là AX. Phản xạ là đổ lỗi cho mô hình hoặc viết lại prompt; cách xử lý thường nằm trong repo hơn.

AX tốt có ba chiều chính:

| Chiều              | AX tốt trông thế nào                                                                                                                                                                                                                            |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Kiểm tra tự động   | Các [kiểm tra tự động](./Automated%20check.md) nhanh và tất định, như kiểu, test, lint, để agent tự sửa mà không cần con người                                                                                                                  |
| Kiến trúc          | Một codebase agent đi lại được mà không phải đọc hết: cấu trúc dễ đoán, nhiều hành vi nằm sau các giao diện nhỏ, tên gọi nói rõ thứ đó làm gì                                                                                                   |
| Ngữ cảnh còn trống | [AGENTS.md](./AGENTS.md.md), các [skill](./Skill.md) và [công cụ](./Tool.md) được giữ gọn, để phần lớn [cửa sổ ngữ cảnh](./Context%20window.md) dành cho công việc và agent ở lại trong [vùng thông minh](./Smart%20zone.md) thay vì chìm nghỉm |

AX và DX có phần trùng nhau, vì kiểm tra tốt và kiến trúc sạch giúp cả hai nhóm đối tượng, nhưng cũng có chỗ khác. Con người chịu được kiến thức truyền miệng, CI chậm, và câu "hỏi Sarah về module billing"; agent thì không. Agent không hưởng lợi từ tooltip trong IDE hay dashboard đẹp; nó cần lỗi ở dạng văn bản trong một [kết quả công cụ](./Tool%20result.md). Một codebase có thể có DX tốt và AX kém.

_Nên tránh:_ coi AX là từ đồng nghĩa với DX. Hai nhóm đối tượng cần những khoản đầu tư khác nhau.

_Usage:_

"Agent viết mã rất tốt ở repo API và viết rác ở frontend."

"Repo API có kiểu chặt chẽ và bộ test nhanh; frontend không có cả hai và có bốn mươi skill luôn được nạp. Đó là khoảng cách về AX, không phải vấn đề của mô hình."

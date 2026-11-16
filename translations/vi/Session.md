---
name: Phiên
description: "Một đợt tương tác có giới hạn với agent. Bắt đầu trống, tích luỹ dần, kết thúc khi bị xoá, đóng, hoặc được nén thành một phiên mới."
---

Một đợt tương tác có giới hạn với một [agent](./Agent.md). Nó bắt đầu trống, tích luỹ tin nhắn, [kết quả công cụ](./Tool%20result.md) và các tệp đã đọc, rồi kết thúc khi bị [xoá](./Clearing.md), bị đóng, hoặc được [nén](./Compaction.md) thành một phiên mới. Phiên là thứ _lấp đầy_ [cửa sổ ngữ cảnh](./Context%20window.md): nếu cửa sổ ngữ cảnh là cái hộp thì phiên là những thứ đang từ từ làm đầy nó. Công việc quá lớn cho một cửa sổ ngữ cảnh phải được chia ra nhiều phiên.

Lịch sử tin nhắn của phiên là bộ nhớ làm việc của agent. [Mô hình](./Model.md) [không lưu trạng thái](./Stateless.md), nên mọi thứ nó có vẻ nhớ, như bạn đã yêu cầu gì, test báo gì, ba lượt trước nó quyết định gì, đều nằm trong lịch sử tin nhắn và được gửi lại ở mỗi [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md). Thứ gì không có trong phiên thì không tồn tại đối với agent.

Bộ nhớ đó kết thúc cùng với phiên. Phiên mới bắt đầu từ con số không: agent hiểu rõ codebase của bạn vào cuối phiên hôm qua thì sáng nay không biết gì về nó. Thứ còn lại là [hệ thống tệp](./Filesystem.md). Tệp được ghi trong phiên này có thể được phiên sau đọc, và đó là thứ mà [bàn giao](./Handoff.md), [hệ thống bộ nhớ](./Memory%20system.md) và [AGENTS.md](./AGENTS.md.md) dựa vào.

Bạn là người chọn nơi phiên kết thúc. Mọi thứ trong phiên đều ảnh hưởng tới mọi [lượt](./Turn.md) về sau, nên các việc không liên quan làm chung một phiên sẽ để lại dư âm làm lệch câu trả lời kế tiếp. Mỗi phiên một việc giúp ngữ cảnh luôn liên quan; làm xong một việc là thời điểm tự nhiên để xoá ngữ cảnh.

_Usage:_

"Một phiên chạy được bao lâu thì bắt đầu rệu rã?"

"Tuỳ việc. Một đợt refactor tập trung giữ được sự sắc bén lâu hơn một đợt nghiên cứu mở. Khi phiên đã phình to thì bàn giao hoặc nén lại, đừng cố chạy tiếp."

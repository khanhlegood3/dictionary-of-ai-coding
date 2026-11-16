---
description: "Một tệp trong môi trường mà harness nạp vào cửa sổ ngữ cảnh lúc bắt đầu phiên. Đây là bản chỉ thị thường trực của dự án cho agent."
---

Một tệp trong [môi trường](./Environment.md) mà [harness](./Harness.md) nạp vào [cửa sổ ngữ cảnh](./Context%20window.md) lúc bắt đầu [phiên](./Session.md). Đây là bản chỉ thị thường trực của dự án cho [agent](./Agent.md). Đây là quy ước dùng chung giữa các harness; một số harness còn có biến thể riêng (của Claude Code là CLAUDE.md).

Vì được nạp tự động, nó là một cách để bạn khỏi phải lặp lại chính mình qua các phiên. [Mô hình](./Model.md) [không lưu trạng thái](./Stateless.md): một lời sửa bạn đưa ra ở phiên này mất đi ở phiên sau, và rốt cuộc bạn phải nói với mọi phiên mới rằng dự án dùng pnpm, test chạy với một cờ nhất định, một thư mục là thư mục sinh tự động và không được đụng vào. Khi bạn đã sửa agent hai lần về cùng một điều, lời sửa đó là ứng viên cho một dòng trong AGENTS.md.

Nội dung phù hợp là bất cứ điều gì agent không suy ra được từ mã nguồn: lệnh build và test, các quy ước mà codebase không thể hiện rõ, các ràng buộc cứng ("không bao giờ sửa client sinh tự động"). Ngắn gọn và mang tính khẳng định. Nó là bản chỉ thị, không phải tài liệu.

Đánh đổi là mọi thứ trong đó luôn được nạp. Chỉ dẫn tích luỹ dần, phần lớn không liên quan tới một việc cụ thể, và một AGENTS.md dài vừa tốn token vừa tự làm loãng mình: càng nhiều chỉ dẫn trong ngữ cảnh, mô hình càng kém tin cậy khi làm theo từng chỉ dẫn.

_Nên tránh:_ dùng AGENTS.md cho nội dung nên được [tiết lộ dần](./Progressive%20disclosure.md). Bất cứ thứ gì trong đó đều trả chi phí [token](./Token.md) ở mỗi [lượt](./Turn.md), trong mọi phiên, dù phiên đó có cần hay không. Một bản hướng dẫn phong cách có thể đặt sau một [skill](./Skill.md) hoặc một [con trỏ ngữ cảnh](./Context%20pointer.md); hãy dành AGENTS.md cho những dòng áp dụng ở mọi nơi.

_Usage:_

"Sao phiên nào cũng bắt đầu với 4k token đã bị đốt sẵn?"

"Xem AGENTS.md đi. Ai đó đã dán nguyên bản hướng dẫn phong cách vào đó thay vì đặt nó sau một skill."

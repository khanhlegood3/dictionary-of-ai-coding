---
name: Hệ thống bộ nhớ
description: "Hệ thống cố làm cho agent có lưu trạng thái qua các phiên bằng cách ghi xuống môi trường và nạp lại lúc bắt đầu phiên."
---

Một hệ thống cố làm cho [agent](./Agent.md) [có lưu trạng thái](./Stateful.md) qua các [phiên](./Session.md). Nó ghi thông tin xuống [môi trường](./Environment.md) trong lúc phiên chạy và nạp lại vào [cửa sổ ngữ cảnh](./Context%20window.md) khi các phiên sau bắt đầu, nhờ đó agent giữ được sự liên tục kể cả khi người dùng [xoá ngữ cảnh](./Clearing.md) của phiên.

Một hệ thống bộ nhớ có hai nửa. Đường ghi: trong phiên, agent ghi lại những gì nó học được, như một tuỳ chọn bạn nêu ra, một dữ kiện về dự án, thành các tệp trong môi trường. Đường đọc: lúc bắt đầu phiên, [harness](./Harness.md) nạp các tệp đó, hoặc một bảng chỉ mục của chúng, trở lại cửa sổ ngữ cảnh. Nhiều harness có sẵn hệ thống bộ nhớ riêng, `/memory` của Claude Code là một ví dụ, nhưng bạn cũng tự dựng được: một thư mục ghi chú cộng một chỉ dẫn trong [AGENTS.md](./AGENTS.md.md) bảo agent tham khảo nó.

Các đánh đổi của mọi nội dung luôn được nạp cũng áp dụng ở đây. Ký ức tích luỹ dần, nên phần lớn hệ thống chỉ nạp một chỉ mục mỗi mục một dòng và để phần thân sau các [con trỏ ngữ cảnh](./Context%20pointer.md) thay vì chèn hết vào. Và ký ức là [nguồn thứ cấp](./Secondary%20source.md), nên chúng trôi lệch: một dữ kiện ghi hồi tháng Ba được nạp với cùng độ tự tin vào tháng Sáu, khi dự án đã đi tiếp. Hệ thống bộ nhớ cần được tỉa bớt, giống như AGENTS.md.

_Usage:_

"Mình cứ phải nhắc lại là mình dùng Postgres chứ không phải MySQL."

"Dựng một hệ thống bộ nhớ đi: ghi những gì nó học được xuống [hệ thống tệp](./Filesystem.md) ở [lượt](./Turn.md) đầu, nạp lại lúc bắt đầu phiên. Bản thân [mô hình](./Model.md) [không lưu trạng thái](./Stateless.md); tầng bộ nhớ giả lập sự liên tục."

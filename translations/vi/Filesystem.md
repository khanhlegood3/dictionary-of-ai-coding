---
name: Hệ thống tệp
description: "Cây tệp và thư mục mà agent đọc, ghi và chạy lệnh trong đó. Đây là môi trường mặc định của một agent lập trình."
---

Cây tệp và thư mục mà [agent](./Agent.md) đọc, ghi và chạy lệnh trong đó. Đây là loại [môi trường](./Environment.md) mặc định của một agent lập trình. [AGENTS.md](./AGENTS.md.md), các [skill](./Skill.md), mã nguồn, script build và cấu hình [công cụ](./Tool.md) đều nằm trong một hệ thống tệp. Khi một [harness](./Harness.md) "khởi động trong dự án của bạn", nó đang trỏ agent vào một hệ thống tệp.

Agent chỉ chạm tới nó qua [lệnh gọi công cụ](./Tool%20call.md): đọc một tệp, ghi một tệp, chạy một lệnh shell. Không có gì trên đĩa nằm trong [cửa sổ ngữ cảnh](./Context%20window.md) cho tới khi một lệnh gọi công cụ nạp nó vào. Nhờ vậy agent làm việc được trong một kho mã lớn hơn cửa sổ rất nhiều: hệ thống tệp chứa mọi thứ, ngữ cảnh chỉ chứa những gì việc hiện tại đã đọc. Một số harness mặc định nạp tên các tệp trong thư mục hiện tại vào cửa sổ ngữ cảnh, chỉ cây thư mục chứ không phải nội dung. Chúng đóng vai trò [con trỏ ngữ cảnh](./Context%20pointer.md): agent thấy có những gì và đọc các tệp nó cần.

Và nó được dùng chung với bạn. Các tệp agent sửa chính là các tệp bạn mở trong trình soạn thảo và xem diff trong git. Hệ thống tệp là không gian làm việc chung, nơi bạn xem lại những gì agent đã làm.

_Usage:_

"Sao nó không nhận AGENTS.md của mình?"

"Nó đang chạy trên một hệ thống tệp khác. [Sandbox](./Sandbox.md) đã mount thư mục cha chứ không phải thư mục gốc của dự án. Trỏ lại harness đi."

---
name: Môi trường
description: "Thế giới mà agent tác động lên: mọi thứ nằm ngoài harness mà agent nhận biết qua kết quả công cụ và thay đổi qua lệnh gọi công cụ."
---

Thế giới mà [agent](./Agent.md) tác động lên: mọi thứ nằm ngoài [harness](./Harness.md) mà agent nhận biết qua [kết quả công cụ](./Tool%20result.md) và thay đổi qua [lệnh gọi công cụ](./Tool%20call.md). Harness _chạy_ agent; môi trường là nơi agent _làm việc_. Một tệp như [`AGENTS.md`](./AGENTS.md.md) nằm trong môi trường; harness là thứ nạp nó vào [cửa sổ ngữ cảnh](./Context%20window.md). [Hệ thống tệp](./Filesystem.md) là loại môi trường phổ biến nhất, nhưng không phải duy nhất (một cơ sở dữ liệu, một API từ xa, một phiên trình duyệt đều có thể là môi trường).

Agent chỉ thấy môi trường khi nó nhìn. Mọi điều nó biết về môi trường đều đến qua một kết quả công cụ, nên bức tranh của nó là một tập ảnh chụp, mỗi ảnh đúng tại thời điểm chụp. Nếu một tệp thay đổi sau khi agent đọc, vì bạn sửa tay hoặc một bước build sinh lại nó, agent vẫn suy luận từ bản cũ cho tới khi có gì đó khiến nó đọc lại. Một agent tự tin mô tả một tệp vốn không còn trông như vậy thường là trường hợp này: môi trường đã đổi, ảnh chụp thì chưa.

Môi trường cũng là tầng tồn tại lâu dài, tầng duy nhất luôn [có lưu trạng thái](./Stateful.md). Ngữ cảnh của một [phiên](./Session.md) mất đi khi phiên kết thúc, nhưng các tệp đã ghi vào môi trường vẫn còn đó để phiên sau đọc. [Hệ thống bộ nhớ](./Memory%20system.md), [tài liệu bàn giao](./Handoff%20artifact.md) và `AGENTS.md` đều dựa vào điều này. Bất cứ điều gì agent cần còn biết vào ngày mai đều phải được đưa vào môi trường.

Bạn quyết định môi trường lớn tới đâu. Một [sandbox](./Sandbox.md) thu hẹp nó, giới hạn những gì agent với tới được; thêm một [công cụ](./Tool.md) thì mở rộng nó, đưa một cơ sở dữ liệu hay một API vào tầm với. Những gì nằm trong ranh giới là thứ agent nhận biết và thay đổi được; mọi thứ bên ngoài không tồn tại đối với agent. Mức độ môi trường được sắp đặt tốt để hỗ trợ công việc của agent chính là [AX](./AX.md) của codebase.

_Nên tránh:_ dùng "môi trường" để chỉ runtime hoặc chính harness. Harness là lớp vỏ bọc, môi trường là không gian làm việc.

_Usage:_

"Agent không thấy được schema của DB staging."

"Nối nó vào môi trường: cho agent một công cụ `psql` giới hạn chỉ đọc trên staging. Harness thì ổn, chỉ là nó chưa có gì để tác động lên."

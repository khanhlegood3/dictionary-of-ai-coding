---
name: Tài liệu bàn giao
description: "Một tài liệu dùng làm cách mang theo trong một lần bàn giao: phiên này viết ra để phiên khác đọc."
---

Một tài liệu dùng làm cách mang theo trong một lần [bàn giao](./Handoff.md): một [phiên](./Session.md) viết nó vào [môi trường](./Environment.md) để phiên khác đọc. [Spec](./Spec.md), [ticket](./Ticket.md) và tài liệu kế hoạch đều là tài liệu bàn giao.

Lý do để viết: [mô hình](./Model.md) [không lưu trạng thái](./Stateless.md), nên không gì trong phiên còn lại sau khi [xoá ngữ cảnh](./Clearing.md). Các quyết định, ràng buộc, kế hoạch dang dở đều mất theo [ngữ cảnh](./Context.md) từng chứa chúng. Môi trường thì còn lại. Ghi phần trạng thái quan trọng vào một tệp là chuyển nó tới nơi phiên sau đọc lại được.

Tài liệu này là một [nguồn thứ cấp](./Secondary%20source.md): lời kể về công việc của phiên, không phải chính công việc. Nhờ vậy nó đủ nhỏ để giới thiệu việc cho một phiên mới, và cũng vì vậy nó có thể dẫn phiên đó đi sai: nó ghi lại điều phiên viết ra tin là đúng, và những gì nó bỏ sót hoặc ghi sai thì vô hình với người đọc. Chỗ nào một nhận định quan trọng, phiên sau nên kiểm chứng với [nguồn sơ cấp](./Primary%20source.md), tức mã nguồn và test, thay vì thừa hưởng nó.

Một tài liệu tốt được viết để đọc vào một phiên có ngữ cảnh bằng không. Đường dẫn tệp cụ thể thay cho "cái tệp mình đã bàn". Điều gì đã được quyết định và vì sao, để phiên sau không tranh luận lại. Cái gì đã xong và cái gì còn lại. Nên nói cho phiên viết biết tài liệu sẽ đi đâu: "viết tài liệu bàn giao cho một phiên mới không biết gì về việc này".

Cách mang theo còn lại là [nén ngữ cảnh](./Compaction.md), vốn tóm tắt ngay trong bộ nhớ. Tài liệu có hai lợi thế: nó nằm trên đĩa, nơi bạn đọc và sửa được trước khi có gì phụ thuộc vào nó, và nó dùng lại được, cùng một spec có thể giới thiệu việc cho năm phiên song song.

_Usage:_

"Mình chia việc này giữa [agent](./Agent.md) lập kế hoạch và agent thực hiện thế nào?"

"Cho agent lập kế hoạch viết một tài liệu bàn giao: đường dẫn tệp, quyết định, ràng buộc. Phiên của agent thực hiện mở đầu bằng một con trỏ tới tài liệu đó và làm theo nó như bản chỉ thị."

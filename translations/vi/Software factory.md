---
name: Nhà máy phần mềm
description: "Hệ thống làm việc trong đó trigger, không phải con người, khởi động phiên của agent, để nhiều việc chạy AFK hơn và dành thời gian con người cho chỗ cần."
---

Một hệ thống làm việc (nhà máy phần mềm) trong đó các [phiên](./Session.md) của [agent](./Agent.md) được khởi động bởi trigger, như một issue được tạo, một lịch chạy, một lần CI hỏng, một phiên khác kết thúc, thay vì bởi con người. Nhờ vậy nhiều việc chạy [AFK](./AFK.md) hơn và sự chú ý của con người được dành cho những quyết định [có con người trong vòng lặp](./Human-in-the-loop.md) còn lại.

Không có nhà máy, phiên nào cũng bắt đầu vì có người bắt đầu nó. Ngay cả việc hoàn toàn AFK cũng chờ một người mở phiên, chỉ nó vào [ticket](./Ticket.md) và cho nó chạy. Các nhóm muốn làm ra nhiều hơn mức đó cho phép. Nhà máy đưa con người ra khỏi việc khởi động phiên, và không nhất thiết ra khỏi việc gì khác.

Các trigger thường gặp và phiên mà chúng khởi động:

| Trigger                        | Phiên được khởi động        | Ví dụ                                                                                                                          |
| ------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Issue được tạo hoặc gắn nhãn   | Thăm dò, sửa lỗi, thực hiện | Một issue gắn nhãn `ready-for-agent` được một phiên xử lý và mở PR                                                             |
| Lịch chạy (cron)               | Bảo trì định kỳ             | Mỗi đêm sửa một quy tắc lint                                                                                                   |
| CI hỏng hoặc cảnh báo giám sát | Chẩn đoán, thử sửa          | Một bản build hỏng trên main được một phiên tìm ra commit gây lỗi và đề xuất cách sửa                                          |
| Một phiên khác kết thúc        | Việc nối tiếp               | Một PR do agent mở kích hoạt [review tự động](./Automated%20review.md), và các nhận xét của nó kích hoạt một phiên sửa bổ sung |

Nhà máy không nhất thiết phải bao trọn quy trình phần mềm. Một cron job chạy một loại phiên và mở một PR xem lại được đã là một nhà máy. Bắt đầu nhỏ như vậy có ích: một vòng lặp hẹp tạo ra các PR nhỏ, giống nhau, và việc review chúng cho thấy vòng lặp đáng tin tới đâu trước khi mở rộng.

Con người có thể ngồi ở bất cứ đâu trong nhà máy: viết và gắn nhãn các issue kích hoạt phiên, duyệt kế hoạch trước khi bắt đầu thực hiện, làm [review của con người](./Human%20review.md) trước khi merge. Quyết định xem những quyết định nào vẫn do con người nắm là câu hỏi thiết kế chính. Một codebase, hoặc một phần của nó, nơi không con người nào review đầu ra của nhà máy là một [nhà máy tối](./Dark%20factory.md).

_Usage:_

"Ai đã sửa hết các vi phạm `no-floating-promises` vậy?"

"Nhà máy đấy. Cron job mỗi đêm chọn một quy tắc lint rồi mở PR. Sáng ra mình chỉ review thôi."

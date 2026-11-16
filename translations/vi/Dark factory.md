---
name: Nhà máy tối
description: "Một codebase, hoặc một phần của nó, nơi nhà máy phần mềm viết mã và không con người nào review mã đó."
---

Một codebase, hoặc một phần của nó, nơi một [nhà máy phần mềm](./Software%20factory.md) viết mã và không con người nào đọc mã đó (nhà máy tối). Không có [review của con người](./Human%20review.md). Con người vẫn có thể viết các issue khởi động công việc. Nhưng không ai đọc mã được tạo ra. Tên gọi đến từ các nhà máy "tắt đèn", nơi sản xuất mà không có người trong xưởng.

Nhà máy tối là [vibe coding](./Vibe%20coding.md) cho cả một vùng mã, không phải cho một thay đổi. Khi vibe coding, bạn chọn không đọc một thay đổi mà bạn đã yêu cầu. Nhưng bạn biết thay đổi đó tồn tại. Trong nhà máy tối, nhóm đưa ra lựa chọn đó một lần, cho cả vùng. Sau đó không ai yêu cầu từng thay đổi hay nhìn thấy nó. Thay đổi tới nhanh ngang với tốc độ các trigger khởi động việc mới.

Vấn đề lộ ra khi có gì đó hỏng. Bạn không biết cái gì đã thay đổi, vì không ai đọc các thay đổi. Bạn phải gỡ lỗi đoạn mã mà không ai trong nhóm từng đọc. Nguyên nhân có thể nằm ở bất kỳ thay đổi nào trong rất nhiều thay đổi, và cái nào cũng đã qua các phép kiểm tra.

[Kiểm tra tự động](./Automated%20check.md) và [review tự động](./Automated%20review.md) là những cánh cổng duy nhất. Nếu chúng không tìm ra một vấn đề thì vấn đề đó đi vào mã.

_Nên tránh:_ gọi một codebase là "tối" chỉ vì nhà máy của nó chạy không ai theo dõi. Nếu các [phiên](./Session.md) của [agent](./Agent.md) chạy [AFK](./AFK.md) và con người review các PR của chúng thì đó là nhà máy phần mềm. Đó không phải nhà máy tối.

_Usage:_

"Ai đã đổi logic retry trong dịch vụ billing vậy? Không ai trong nhóm nhớ cả."

"Dịch vụ billing là một nhà máy tối. Các agent merge mọi thay đổi qua được CI. Không ai đọc thay đổi đó."

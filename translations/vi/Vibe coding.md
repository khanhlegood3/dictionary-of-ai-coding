---
description: "Kiểu làm việc trong đó người dùng chấp nhận mã của agent mà không có review của con người. Diff được coi như hộp đen."
---

Kiểu làm việc trong đó người dùng chấp nhận mã của [agent](./Agent.md) mà không có [review của con người](./Human%20review.md). Diff được coi như hộp đen: điều quan trọng là chương trình có chạy đúng không, không phải bên trong có gì. [Review tự động](./Automated%20review.md) và [kiểm tra tự động](./Automated%20check.md) vẫn có thể chạy; vibe coding không nói gì về cả hai.

Thuật ngữ này đến từ Andrej Karpathy, người [đặt ra nó đầu năm 2025](https://x.com/karpathy/status/1886192184808149383): bạn "buông hẳn theo cảm giác" và "quên rằng mã có tồn tại". Bạn mô tả điều mình muốn, chấp nhận thứ được trả về, và đánh giá nó bằng cách chạy.

Vibe coding đổi việc xem xét lấy tốc độ. Đọc diff thường là bước chậm nhất khi làm việc với agent, nên bỏ nó đi là gỡ nút thắt chính. Với mã mà hỏng thì rẻ, như [bản mẫu](./Prototyping.md), script dùng một lần, công cụ nội bộ, đó là một đánh đổi hợp lý. Rủi ro tăng theo tuổi thọ của mã và mức độ hệ trọng.

Cái giá đến sau. Các thay đổi vibe coding tích lại thành một codebase chưa ai đọc, và hành vi là thứ duy nhất được kiểm tra. Vì vậy bất cứ điều gì hành vi không làm lộ ra, như một bí mật bị ghi vào log, một trường hợp biên bị thiếu, hay xử lý dữ liệu sai âm thầm, đều được đưa đi mà không ai thấy. Lần đầu có người gỡ lỗi hệ thống cũng là lần đầu có người đọc mã. Khi review của con người không còn, những kiểm chứng tự động còn chạy, như test, kiểu, review tự động, là cánh cổng duy nhất mã đi qua. Cùng thái độ đó áp dụng cho cả một codebase, hoặc một phần của nó, mà các thay đổi đến từ một [nhà máy phần mềm](./Software%20factory.md) thì gọi là [nhà máy tối](./Dark%20factory.md).

_Nên tránh:_ dùng "vibe coding" như từ đồng nghĩa với "lập trình bằng AI chất lượng thấp". Thuật ngữ này gọi tên thái độ với việc review, không phải mã thu được.

_Usage:_

"Bạn có đọc nó đã đổi gì trong luồng auth không?"

"Vibe coding thôi. Đăng nhập vẫn chạy, mình chỉ kiểm tra có vậy."

"Đọc diff trước khi push đi. Vibe với phần auth là cách bí mật rò vào log đấy."

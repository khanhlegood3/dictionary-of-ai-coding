---
name: Công cụ
description: "Một hàm harness đưa ra cho agent gọi: Read, Write, Bash, Search. Đây là cách agent nhận biết và tác động lên môi trường."
---

Một hàm mà [harness](./Harness.md) đưa ra cho [agent](./Agent.md) gọi: Read, Write, Bash, Search. Công cụ là cách agent nhận biết và tác động lên [môi trường](./Environment.md): nó không thấy được môi trường nếu không qua [kết quả công cụ](./Tool%20result.md), và không thay đổi được môi trường nếu không qua [lệnh gọi công cụ](./Tool%20call.md). Mỗi lệnh gọi công cụ tốn thêm một [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md), vì kết quả phải quay về mô hình thì nó mới quyết định được bước tiếp theo.

Các công cụ mà phần lớn agent lập trình có sẵn:

| Công cụ | Nó làm gì                                                     |
| ------- | ------------------------------------------------------------- |
| Read    | Trả về nội dung một tệp dưới dạng kết quả công cụ             |
| Write   | Tạo hoặc sửa một tệp trong [hệ thống tệp](./Filesystem.md)    |
| Bash    | Chạy một lệnh shell và trả về đầu ra                          |
| Search  | Tìm các tệp hoặc đoạn văn bản khớp một mẫu trên toàn codebase |

Một công cụ được định nghĩa bởi ba thứ: tên, mô tả nó làm gì, và schema cho các tham số. Harness gửi các định nghĩa này cho [mô hình](./Model.md) ở mọi yêu cầu, và mô hình chọn công cụ theo đúng cách nó tạo ra mọi thứ khác: viết [token](./Token.md), ở đây là một lệnh gọi có cấu trúc kèm đối số. Mô hình không bao giờ tự thực thi gì; harness đọc lệnh gọi, chạy hàm, rồi gửi kết quả về.

Danh sách công cụ quy định agent làm được gì. Một mô hình giỏi với bộ công cụ hẹp là một agent hẹp: nó sẽ dồn mọi việc qua bất cứ thứ gì nó có. Đó là lý do agent dựa rất nhiều vào Bash, vì shell là một công cụ với tới được gần hết hệ thống. Để cho agent một năng lực một cách gọn gàng, hãy thêm công cụ cho việc đó; [MCP](./MCP.md) là chuẩn để cắm công cụ từ bên ngoài harness vào.

Định nghĩa công cụ chiếm [ngữ cảnh](./Context.md) ở mọi yêu cầu, nên một bộ công cụ lớn có chi phí thường trực trước khi bất kỳ công cụ nào được gọi. Nhiều công cụ có mô tả na ná nhau cũng khiến mô hình chọn đúng công cụ kém hơn.

_Usage:_

"Agent có truy vấn thẳng staging được không?"

"Thêm một công cụ `psql` vào harness, giới hạn chỉ đọc trên staging. Không có công cụ cho việc đó thì agent mù với mọi thứ ngoài hệ thống tệp."

---
name: Mốc kiến thức
description: "Mốc ngày mà sau đó mô hình không có kiến thức tham số. Thư viện và API ra sau mốc này là bẫy bịa đặt nếu không nạp tài liệu."
---

Mốc ngày mà sau đó một [mô hình](./Model.md) không có [kiến thức tham số](./Parametric%20knowledge.md). Thư viện, API và sự kiện xuất hiện sau mốc này là bẫy bịa đặt, trừ khi tài liệu của chúng được nạp làm [kiến thức ngữ cảnh](./Contextual%20knowledge.md). Mỗi bản phát hành mô hình có mốc riêng.

Mốc này tồn tại vì cách mô hình được tạo ra: [huấn luyện](./Training.md) nung một bản chụp văn bản vào [tham số](./Parameters.md) của mô hình, sau đó tham số bị đóng băng. Mô hình không biết kiến thức của mình có một đường biên. Khi được hỏi về điều gì sau mốc, nó không từ chối mà ngoại suy từ thứ gần nhất nó biết. Đó là điều khiến cái bẫy này êm: mã viết theo phiên bản cũ của một thư viện trông hợp lý, thường biên dịch được, và hỏng ở những phần đã thay đổi.

Cách xử lý luôn là một: đưa thông tin hiện hành vào [ngữ cảnh](./Context.md). Nạp changelog, chỉ tới các định nghĩa kiểu của phiên bản đang cài, hoặc để agent đọc tài liệu trên web. Có gì đó trong ngữ cảnh luôn hơn là không có gì trong tham số.

_Usage:_

"Nó cứ viết theo cú pháp SDK v3 trong khi bọn mình dùng v5."

"v5 ra sau mốc kiến thức. Nạp changelog v5 làm kiến thức ngữ cảnh, không thì nó sẽ tiếp tục bịa từ phiên bản cũ hơn trong kiến thức tham số."

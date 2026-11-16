---
name: Con trỏ ngữ cảnh
description: "Một lời nhắc trong tài liệu này trỏ tới tài liệu khác, để agent chỉ kéo nó vào ngữ cảnh khi công việc đòi hỏi."
---

Một lời nhắc trong tài liệu này trỏ tới tài liệu khác, để [agent](./Agent.md) chỉ kéo nó vào [cửa sổ ngữ cảnh](./Context%20window.md) khi công việc đòi hỏi. Đây là đơn vị dựng nên [tiết lộ dần](./Progressive%20disclosure.md).

Lý do dùng con trỏ (thay vì chèn thẳng nội dung) là chi phí. Một con trỏ là một dòng trong cửa sổ ngữ cảnh. Tài liệu đằng sau nó có thể dài hàng nghìn [token](./Token.md), nhưng các token đó không tốn gì cho tới khi agent thực sự đi theo con trỏ. Chèn một quy trình 2.000 token vào [AGENTS.md](./AGENTS.md.md) thì [phiên](./Session.md) nào cũng trả tiền cho nó; thay bằng "quy trình deploy: xem `internal/deploy.md`" thì chỉ những phiên có deploy mới nạp nó. Agent đi theo con trỏ bằng một [lệnh gọi công cụ](./Tool%20call.md) khi công việc khớp.

Một con trỏ cần hai phần để hoạt động: một đường dẫn ổn định, và đủ mô tả để agent biết khi nào đáng đi theo. Một đường dẫn trơ trọi là con trỏ mà agent không có lý do gì để theo; "xem `internal/deploy.md`" mà không gợi ý bên trong có gì sẽ bị một phiên đang cần nó bỏ qua. Hãy viết dòng đó sao cho khớp với cách công việc xuất hiện: "release, deploy hoặc rollback: đọc `internal/deploy.md` trước".

Để ý thì thấy con trỏ ở khắp nơi: các dòng trong AGENTS.md, mô tả của [skill](./Skill.md) (harness nạp phần mô tả; phần thân skill chờ phía sau), tên tệp trong danh sách thư mục, liên kết giữa các tài liệu, các dòng trong AGENTS.md của một [Home Repo](./Home%20Repo.md) nêu tên từng repo khác của bạn.

Con trỏ cũng có thể nối một [nguồn thứ cấp](./Secondary%20source.md) về [nguồn sơ cấp](./Primary%20source.md) mà nó được rút ra: bản tóm tắt khi nén nêu tên bản ghi gốc, tài liệu nêu tên tệp nguồn nó mô tả. Nhờ vậy phần mất mát của nguồn thứ cấp lấy lại được: khi bản tóm tắt hoá ra không đủ, agent đi theo con trỏ và đọc bản gốc, thay vì làm việc từ những gì bản tóm tắt còn giữ.

_Nên tránh:_ "tham chiếu" thì quá khô, không cho thấy rằng đi theo nó sẽ kéo thêm ngữ cảnh vào. "Cổng dịch chuyển" thì quá hoa mỹ.

_Usage:_

"AGENTS.md đang phình to quá."

"Phần lớn trong đó nên là con trỏ ngữ cảnh, không phải nội dung. Giữ các quy tắc luôn áp dụng ở dạng chèn thẳng; chuyển quy trình deploy và bản hướng dẫn phong cách thành skill rồi để lại một con trỏ ngữ cảnh."

---
name: Cửa sổ ngữ cảnh
description: "Mọi thứ mô hình thấy ở mỗi yêu cầu tới nhà cung cấp mô hình. Hữu hạn, tuỳ từng mô hình, và là bề mặt duy nhất để mô hình nhận biết."
---

Mọi thứ [mô hình](./Model.md) thấy ở mỗi [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md). Nó hữu hạn, tuỳ từng mô hình, và là bề mặt _duy nhất_ để mô hình nhận biết bất cứ điều gì.

Đó là một chuỗi [token](./Token.md) duy nhất: [system prompt](./System%20prompt.md), cuộc trò chuyện tới lúc đó, mọi [kết quả công cụ](./Tool%20result.md) mà [harness](./Harness.md) đã đưa trở lại. Thứ gì nằm trong chuỗi đó thì mô hình dùng được; thứ gì không nằm trong đó thì mô hình không biết là nó tồn tại: codebase của bạn, tệp bạn sửa hôm qua, chỉ dẫn bạn đưa ra ba phiên trước đều vậy. Bất cứ thứ gì nằm ngoài cửa sổ phải được đưa vào, thường qua một [lệnh gọi công cụ](./Tool%20call.md), rồi mới có thể ảnh hưởng tới điều gì.

Hữu hạn nghĩa là nó sẽ đầy. Mỗi lượt nối thêm nội dung: tin nhắn của bạn, phản hồi của mô hình, kết quả công cụ. Một [phiên](./Session.md) dài cuối cùng sẽ chạm giới hạn, buộc phải [nén ngữ cảnh](./Compaction.md) hoặc [xoá ngữ cảnh](./Clearing.md). Hữu hạn cũng nghĩa là mọi thứ trong cửa sổ cạnh tranh với nhau: mỗi token bạn nạp vào là bớt đi một token cho phần còn lại, và nội dung bạn không cần vẫn chiếm [sự chú ý](./Attention%20budget.md) của mô hình. Thái độ thực tế là coi cửa sổ như một ngân sách: nạp những gì công việc cần, để phần còn lại ở ngoài.

_Nên tránh:_ "bộ nhớ". Cửa sổ ngữ cảnh là trạng thái làm việc và không tồn tại qua các phiên. [Bộ nhớ](./Memory%20system.md) là một khái niệm riêng, xếp chồng lên trên.

_Usage:_

"Mình dán cả monorepo vào prompt luôn được không?"

"Cửa sổ ngữ cảnh là 200k token, chắc chỉ bằng một phần năm repo. Chọn những tệp mà công việc đụng tới, phần còn lại để sau một lệnh gọi công cụ."

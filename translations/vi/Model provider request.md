---
name: Yêu cầu tới nhà cung cấp mô hình
description: "Một vòng đi về từ harness tới nhà cung cấp mô hình. Harness gửi ngữ cảnh; nhà cung cấp trả về một phản hồi."
---

Một vòng đi về từ [harness](./Harness.md) tới [nhà cung cấp mô hình](./Model%20provider.md). Harness gửi [ngữ cảnh](./Context.md) hiện tại; nhà cung cấp trả về một phản hồi (một [lệnh gọi công cụ](./Tool%20call.md) hoặc câu trả lời cuối). Một tin nhắn của người dùng có thể sinh ra nhiều yêu cầu tới nhà cung cấp mô hình nếu [agent](./Agent.md) gọi [công cụ](./Tool.md): mỗi [kết quả công cụ](./Tool%20result.md) kích hoạt thêm một yêu cầu.

Mỗi yêu cầu mang theo tất cả: [system prompt](./System%20prompt.md), toàn bộ cuộc trò chuyện tới lúc đó, mọi kết quả công cụ. [Mô hình](./Model.md) [không lưu trạng thái](./Stateless.md), nên nhà cung cấp không giữ lại gì giữa các yêu cầu. Yêu cầu thứ bốn mươi gửi lại những gì yêu cầu thứ ba mươi chín đã gửi, cộng thêm một kết quả công cụ. [Bộ đệm tiền tố](./Prefix%20cache.md) tồn tại để sự lặp lại này có giá chấp nhận được.

Yêu cầu cũng là đơn vị tính tiền. [Token đầu vào](./Input%20tokens.md), [token đầu ra](./Output%20tokens.md) và mức giảm giá nhờ cache đều được đếm theo từng yêu cầu. Vì thế một câu hỏi trông vô hại có thể tốn nhiều bất ngờ: chi phí không tỷ lệ với tin nhắn của bạn, mà tỷ lệ với số yêu cầu nhân với kích thước ngữ cảnh mỗi yêu cầu mang theo.

Nên phân biệt yêu cầu với [lượt](./Turn.md). Một lượt là một lần trao đổi với bạn, và một lượt duy nhất, chẳng hạn "sửa bài test đang lỗi", diễn ra thành một chuỗi yêu cầu:

| Yêu cầu | Mô hình trả về                          | Harness sau đó                     |
| ------- | --------------------------------------- | ---------------------------------- |
| 1       | Lệnh gọi công cụ: chạy test             | Chạy test, nối thêm đầu ra báo lỗi |
| 2       | Lệnh gọi công cụ: đọc tệp test          | Nối thêm nội dung tệp              |
| 3       | Lệnh gọi công cụ: đọc tệp mã nguồn      | Nối thêm nội dung tệp              |
| 4       | Lệnh gọi công cụ: sửa tệp mã nguồn      | Áp dụng thay đổi, nối thêm kết quả |
| 5       | Lệnh gọi công cụ: chạy lại test         | Chạy test, nối thêm đầu ra báo đạt |
| 6       | Câu trả lời cuối: "đã sửa, test đã đạt" | Hiển thị cho bạn                   |

Sáu yêu cầu cho một lượt, và yêu cầu nào cũng gửi lại toàn bộ ngữ cảnh. Khi bạn tự hỏi [token](./Token.md) đã đi đâu, hãy đếm số yêu cầu, đừng đếm số lượt.

_Usage:_

"Một câu hỏi mà đốt hết bốn mươi nghìn token?"

"Nhìn các lệnh gọi công cụ xem: mười hai lần grep, tám lần đọc, bốn lần sửa. Mỗi kết quả công cụ sinh thêm một yêu cầu tới nhà cung cấp mô hình, và toàn bộ phần đầu của [phiên](./Session.md) được gửi lại mỗi lần."

---
name: Mức nỗ lực
description: "Núm chỉnh lượng suy nghĩ của mô hình trước khi trả lời. Effort cao hơn tốn thêm token đầu ra để có cơ hội giải bài toán khó tốt hơn."
---

Effort (mức nỗ lực) là núm chỉnh lượng suy nghĩ mà một [mô hình](./Model.md) thực hiện trước khi trả lời. Nó được đặt cho từng [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md) và quyết định độ dài phần suy nghĩ mô hình đi qua trước khi bắt đầu viết câu trả lời bạn thấy. Phần suy nghĩ đó được sinh ra lúc [suy luận](./Inference.md) như mọi thứ khác. [Harness](./Harness.md) thường ẩn nó đi, nhưng đó là công việc thật mà mô hình đang làm.

Effort cao hơn thì tốn hơn và chậm hơn. Phần suy nghĩ được phát ra dưới dạng [token](./Token.md), được tính tiền như [token đầu ra](./Output%20tokens.md) kể cả khi bạn không bao giờ thấy chúng, và được sinh từng token một. Vì vậy tăng effort sẽ kéo dài thời gian chờ trước khi có câu trả lời và làm hoá đơn tăng thêm. Bạn đổi tốc độ và chi phí lấy sự cân nhắc kỹ hơn.

Phần lớn harness đưa ra effort dưới dạng một thang ngắn:

| Mức    | Dùng cho việc gì                                                         |
| ------ | ------------------------------------------------------------------------ |
| Low    | Chỉnh sửa máy móc, tra cứu, thay đổi đã mô tả rõ và chỉ có một cách làm. |
| Medium | Lập trình hằng ngày. Đây thường là mặc định.                             |
| High   | Lỗi khó, quyết định thiết kế, kế hoạch nhiều bước.                       |
| Max    | Những bài toán khó nhất, nơi một câu trả lời sai rất tốn công gỡ lại.    |

Đặt sai thì có triệu chứng ở cả hai chiều. Đặt effort quá thấp cho một bài toán khó, bạn nhận được câu trả lời tự tin nhưng nông, bỏ qua phần suy luận mà bài toán cần. Nó đọc thì ổn, nhưng sai theo kiểu khiến bạn trả giá về sau. Đặt max cho một lần đổi tên một dòng, bạn ngồi chờ một đợt suy nghĩ dài mà kết quả không khác gì mức thấp nhất.

Hãy chọn effort theo việc, không theo [phiên](./Session.md). Tăng lên cho phần thực sự khó suy luận, rồi hạ xuống cho những việc lặp lại xung quanh nó.

_Usage:_

"Nó cứ làm hỏng bản sửa lỗi concurrency này. Mình giải thích lại ba lần rồi."

"Tăng effort lên. Đây là lỗi cần suy luận nhiều, mà ở mức mặc định nó chưa nghĩ đủ lâu trước khi chốt một hướng làm."

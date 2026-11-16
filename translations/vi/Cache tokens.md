---
name: Token đã cache
description: "Token đầu vào mà nhà cung cấp đã lưu từ một yêu cầu trước qua bộ đệm tiền tố, được tính với giá thấp hơn nhiều."
---

[Token đầu vào](./Input%20tokens.md) mà [nhà cung cấp](./Model%20provider.md) đã lưu lại từ một [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md) trước đó để không phải xử lý lại. Khi các yêu cầu liên tiếp có chung phần đầu, nhà cung cấp dùng lại công việc đã làm qua [bộ đệm tiền tố](./Prefix%20cache.md) và tính phần đã cache với giá thấp hơn nhiều. Đây là đòn bẩy giúp các [phiên](./Session.md) dài có chi phí chấp nhận được. Không có nó, mỗi [lượt](./Turn.md) phải trả lại tiền cho toàn bộ lịch sử.

Điều này quan trọng vì cách phiên được tính tiền. [Mô hình](./Model.md) [không lưu trạng thái](./Stateless.md), nên mỗi yêu cầu gửi lại toàn bộ cuộc trò chuyện, gồm [system prompt](./System%20prompt.md), mọi tin nhắn, mọi [kết quả công cụ](./Tool%20result.md), dưới dạng token đầu vào. Tới lượt thứ năm mươi, mỗi yêu cầu mang theo năm mươi lượt lịch sử, và lần nào bạn cũng trả nguyên giá cho tất cả. Bộ đệm làm phép tính thay đổi: các token nhà cung cấp đã xử lý trong một tiền tố giống hệt được tính là token đã cache, thường bằng một phần mười giá đầu vào hoặc thấp hơn. Trong một phiên dài, phần lớn những gì bạn gửi là token đã cache, và hoá đơn giữ ở mức hợp lý.

Ví dụ sau cho thấy khi nào token được cache và khi nào không. Mỗi chữ cái là một khối nội dung của cuộc trò chuyện; mỗi yêu cầu gửi cuộc trò chuyện tới thời điểm đó:

| Yêu cầu gửi | Đã cache | Tính nguyên giá | Vì sao                                               |
| ----------- | -------- | --------------- | ---------------------------------------------------- |
| `AB`        | không có | `AB`            | Yêu cầu đầu tiên, chưa có gì để so khớp              |
| `ABC`       | `AB`     | `C`             | `AB` là tiền tố chính xác của yêu cầu trước          |
| `ABCD`      | `ABC`    | `D`             | Tiền tố vẫn nguyên vẹn                               |
| `AXCD`      | `A`      | `XCD`           | Một chỉnh sửa đổi `B` thành `X`; việc khớp dừng ở đó |

Bộ đệm dễ gãy theo một cách cụ thể: nó chỉ khớp các tiền tố chính xác. Nếu có gì thay đổi ở phần trước của cuộc trò chuyện, như [harness](./Harness.md) sắp xếp lại nội dung, một dấu thời gian được cập nhật, hay cách biểu diễn một tệp bị đổi, thì từ điểm đó trở đi bộ đệm không khớp nữa và mọi thứ phía sau bị tính nguyên giá đầu vào. Bộ đệm cũng hết hạn sau vài phút không hoạt động, nên một phiên được tiếp tục sau quãng nghỉ dài phải trả lại tiền cho lịch sử một lần. Khi chi phí của một phiên vọt lên mà không rõ nguyên nhân, hãy so token đã cache với token đầu vào trong báo cáo sử dụng. Bộ đệm bị gãy sẽ lộ ra ở đó trước tiên.

_Usage:_

"Chi phí cho phiên dài cao kinh khủng, tám đô cho một lần refactor."

"Xem token đã cache đi. Nếu harness sắp xếp lại system prompt hoặc các tệp giữa các lượt, tiền tố bị gãy và yêu cầu nào bạn cũng trả nguyên giá đầu vào."

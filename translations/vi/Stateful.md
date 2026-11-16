---
name: Có lưu trạng thái
description: "Mang thông tin sang lần sau. Phiên có lưu trạng thái qua các lượt; agent có thể lưu trạng thái qua các phiên nhờ hệ thống bộ nhớ."
---

Mang thông tin sang lần sau. Một [phiên](./Session.md) có lưu trạng thái qua các [lượt](./Turn.md): [ngữ cảnh](./Context.md) tích luỹ dần khi phiên chạy, và đó là lý do phiên dài trôi dần vào [vùng đần](./Smart%20zone.md). Một [agent](./Agent.md) có thể được làm cho có lưu trạng thái qua các **phiên** bằng cách thêm một [hệ thống bộ nhớ](./Memory%20system.md), thứ ghi thông tin xuống [môi trường](./Environment.md) và nạp lại khi các phiên sau bắt đầu. [Mô hình](./Model.md) thì không bao giờ lưu trạng thái; mọi sự liên tục trông thấy được đều là [harness](./Harness.md) nạp lại ngữ cảnh. Đối lập với [không lưu trạng thái](./Stateless.md).

Trạng thái nằm ở đâu trong từng tầng:

| Tầng       | Có lưu trạng thái? | Bằng cách nào                                                                                                         |
| ---------- | ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Mô hình    | Không bao giờ      | [Tham số](./Parameters.md) bị đóng băng; nó chỉ thấy những gì có trong từng yêu cầu                                   |
| Phiên      | Qua các lượt       | Harness nối mọi tin nhắn và [kết quả công cụ](./Tool%20result.md) vào ngữ cảnh                                        |
| Harness    | Qua các phiên      | Tệp bộ nhớ, [AGENTS.md](./AGENTS.md.md), [tài liệu bàn giao](./Handoff%20artifact.md): được ghi ra rồi nạp lại về sau |
| Môi trường | Luôn luôn          | Tệp vẫn tồn tại dù có phiên nào đang chạy hay không                                                                   |

Khả năng lưu trạng thái của mỗi tầng được dựng nên bằng cách đọc lại thứ được lưu ở tầng dưới nó: phiên có cảm giác liên tục vì harness gửi lại lịch sử tin nhắn cho mô hình không lưu trạng thái, và agent nhớ được qua các phiên vì harness nạp lại các tệp từ môi trường. Không có trạng thái nào được lưu trong chính mô hình.

Không phải lúc nào cũng nên có trạng thái. Mọi thứ được mang theo đều ảnh hưởng tới những gì đến sau, nên một giả định sai ở đầu phiên cũng được mang theo. [Xoá ngữ cảnh](./Clearing.md) là hành động có chủ ý: bỏ trạng thái của phiên đi và bắt đầu lại từ những gì đã được ghi ra.

_Usage:_

"Nó nhớ các tuỳ chọn của mình từ hôm qua. Vậy là mô hình đã học được chúng à?"

"Không, agent có lưu trạng thái vì harness đã ghi chúng vào một tệp bộ nhớ và nạp lại lúc bắt đầu phiên. Bản thân mô hình không thấy gì của hôm qua cả."

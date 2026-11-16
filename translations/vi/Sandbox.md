---
description: "Môi trường cách ly mà agent chạy bên trong: container, máy ảo hoặc shell bị hạn chế. Giới hạn phạm vi thiệt hại do hành động của agent."
---

Một [môi trường](./Environment.md) cách ly mà [agent](./Agent.md) chạy bên trong: container, máy ảo, [hệ thống tệp](./Filesystem.md) tạm thời, hoặc shell bị hạn chế quyền. Nó giới hạn phạm vi thiệt hại do hành động của agent: kể cả khi agent chạy lệnh phá hoại hoặc tải về thứ gì độc hại, thiệt hại vẫn được khoanh lại. Đây là nền tảng an toàn giúp làm việc kiểu [AFK](./AFK.md) khả thi.

Sandbox và [chế độ phân quyền](./Permission%20mode.md) giải cùng một bài toán từ hai đầu ngược nhau. Phân quyền hỏi trước khi một hành động chạy; sandbox giới hạn những gì hành động với tới được nếu nó chạy. Phân quyền cần bạn có mặt [trong vòng lặp](./Human-in-the-loop.md), mỗi câu hỏi là một lần ngắt quãng, và một phiên hỏi liên tục thì hầu như không còn tự chủ. Sandbox tiêu hạ tầng thay cho sự chú ý: cách ly càng mạnh, càng ít câu hỏi cần đặt ra.

Cách ly có nhiều mức:

| Mức              | Nó là gì                                                          | Nó khoanh lại được gì                      |
| ---------------- | ----------------------------------------------------------------- | ------------------------------------------ |
| Shell bị hạn chế | Giam ở mức hệ điều hành quanh từng lệnh                           | Thao tác ghi ra ngoài dự án, truy cập mạng |
| Container        | Hệ thống tệp mới, không mount thông tin xác thực, dùng xong bỏ đi | Mọi thứ agent làm với chính máy của nó     |
| Máy ảo / cloud   | Một máy hoàn toàn riêng, thường do harness cung cấp               | Tất cả, kể cả việc thoát ra ở mức kernel   |

Thứ không sandbox nào khoanh lại được: những hành động rời khỏi nó một cách hợp lệ. Một agent có thông tin xác thực git của bạn thì push được; agent có truy cập mạng thì gọi được API production. Hãy quyết định cái gì được đi qua ranh giới trước khi quyết định làm ranh giới dày tới đâu.

_Usage:_

"Mình muốn để nó chạy [bypass-permissions](./Agent%20mode.md) qua đêm nhưng chưa sẵn sàng cho việc đó."

"Cho nó vào sandbox: container mới, không mount thông tin xác thực, không cho ra mạng. Tệ nhất thì nó xoá sạch hệ thống tệp của chính nó và bạn bỏ container đi."

---
name: Nén ngữ cảnh
description: "Bàn giao làm ngay trong bộ nhớ: lịch sử phiên trước được tóm tắt và làm hạt giống cho phiên mới. Có mất mát: đổi chi tiết lấy khoảng trống."
---

Một lần [bàn giao](./Handoff.md) làm ngay trong bộ nhớ: lịch sử của [phiên](./Session.md) trước được tóm tắt, và bản tóm tắt làm hạt giống cho một phiên mới. Nó có mất mát theo đúng thiết kế: bản ghi là [nguồn sơ cấp](./Primary%20source.md), bản tóm tắt là [nguồn thứ cấp](./Secondary%20source.md), tức đổi chi tiết lấy khoảng trống. Nó được người dùng kích hoạt bằng tay, hoặc tự động qua [autocompact](./Autocompact.md).

Cơ chế: [cửa sổ ngữ cảnh](./Context%20window.md) hữu hạn, và một phiên dài làm đầy nó. Mọi [kết quả công cụ](./Tool%20result.md), mọi tệp đã đọc, mọi hướng đi sai đều nằm lại trong lịch sử. Khi nó nặng lên, [harness](./Harness.md) yêu cầu [mô hình](./Model.md) tóm tắt phiên, bỏ lịch sử gốc đi, rồi gieo bản tóm tắt vào một phiên mới. Thứ gì không lọt vào bản tóm tắt thì mất khỏi ngữ cảnh. Một số harness làm mềm điều này bằng cách giữ bản ghi cũ trên đĩa và để một [con trỏ ngữ cảnh](./Context%20pointer.md) tới nó trong bản tóm tắt. Nguồn thứ cấp liên kết ngược về nguồn sơ cấp của nó, nên một chi tiết bản tóm tắt làm mất có thể được lấy lại bằng cách đọc lại bản gốc.

Bản tóm tắt do mô hình viết, nên có thể dùng prompt để định hướng nó. "Giữ lại các quyết định về schema" khiến sản phẩm sinh ra có chủ ý hơn. Thời điểm cũng quan trọng: nén ở ranh giới giữa các giai đoạn, sau khi kế hoạch đã chốt, không phải giữa chừng công việc.

Đối chiếu với [xoá ngữ cảnh](./Clearing.md), vốn bỏ hết và bắt đầu nguội: nén ngữ cảnh cố mang những thứ cốt yếu sang; xoá ngữ cảnh đặt cược rằng chúng đã được ghi ở một nơi tốt hơn.

_Usage:_

"[Ngữ cảnh](./Context.md) đang nặng dần mà mình còn phải làm cho test đạt."

"Nén trước khi bắt đầu. Ghi những gì phải được giữ vào prompt tóm tắt để phiên mới giữ các quyết định về schema và bỏ phần thăm dò."

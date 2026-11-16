---
description: "Nén ngữ cảnh do harness tự động kích hoạt khi cửa sổ ngữ cảnh sắp đầy."
---

[Nén ngữ cảnh](./Compaction.md) do [harness](./Harness.md) tự động kích hoạt khi [cửa sổ ngữ cảnh](./Context%20window.md) sắp đầy.

Harness theo dõi cửa sổ ngữ cảnh đầy tới đâu. Khi vượt một ngưỡng, thường quanh 80%, nó dừng lại, yêu cầu [mô hình](./Model.md) tóm tắt [phiên](./Session.md) tới lúc đó, rồi gieo bản tóm tắt vào một phiên mới. Công việc sau đó tiếp tục như chưa có gì xảy ra.

Chỉ có điều là đã có chuyện xảy ra. Nén ngữ cảnh có mất mát, và autocompact gây mất mát vào thời điểm bạn không chọn. Nén bằng tay diễn ra ở ranh giới giữa các giai đoạn, khi bạn nói được cho mô hình cần giữ gì. Autocompact nổ giữa chừng công việc, bất cứ khi nào chạm ngưỡng, có thể là giữa một đợt refactor, và bản tóm tắt tự quyết định quyết định nào của bạn đáng giữ. Triệu chứng kinh điển: [agent](./Agent.md) tự tin làm tiếp nhưng đã âm thầm quên một ràng buộc bạn đặt ra một giờ trước, và bạn chỉ nhận ra khi công việc của nó bắt đầu trái với ràng buộc đó.

Cách phòng là đừng để nó nổ. Theo dõi chỉ báo ngữ cảnh và nén bằng tay ở một ranh giới tự nhiên, hoặc ghi các quyết định vào một tài liệu kế hoạch hay [tài liệu bàn giao](./Handoff%20artifact.md) trên đĩa, nơi không bản tóm tắt nào làm mất được. Phần lớn harness cũng cho bạn tuỳ chỉnh vùng đệm: dời ngưỡng sớm hơn hoặc muộn hơn, hoặc tắt hẳn autocompact, để bạn chỉnh được mình giữ bao nhiêu khoảng trống trước khi nó nổ.

_Usage:_

"Hình như nó không nhớ lúc nãy mình đã quyết định gì về schema."

"Autocompact đã nổ giữa các [lượt](./Turn.md). Các quyết định ban đầu bị tóm tắt lại và chắc mình đã mất gì đó. Nạp lại tài liệu kế hoạch, hoặc lần sau nén bằng tay để bạn kiểm soát cái gì được giữ."

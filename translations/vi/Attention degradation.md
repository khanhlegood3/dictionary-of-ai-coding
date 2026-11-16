---
name: Suy giảm chú ý
description: "Khi phiên lớn lên, ngân sách chú ý của mỗi token bị chia cho nhiều đối thủ hơn; tín hiệu trên các quan hệ có ý nghĩa co lại."
---

Khi một [phiên](./Session.md) lớn lên, [ngân sách chú ý](./Attention%20budget.md) của mỗi [token](./Token.md) bị chia cho nhiều đối thủ hơn. Tín hiệu trên bất kỳ [quan hệ có ý nghĩa](./Attention%20relationship.md) nào cũng co lại; nhiễu từ phần [ngữ cảnh](./Context.md) không liên quan chen vào. Vẫn [mô hình](./Model.md) đó, vẫn [tham số](./Parameters.md) đó, chỉ là thêm nhiều miệng ăn chung một mâm. Đây là nguyên nhân của hiệu ứng [vùng thông minh / vùng đần](./Smart%20zone.md).

Nó biểu hiện như việc mô hình kém đi giữa phiên: những ràng buộc nó tuân theo suốt một giờ bắt đầu tuột, nó hỏi lại điều đã được dặn, nó viết mã bỏ qua một tệp đã đọc trước đó. Mô hình không có gì thay đổi. Biến số duy nhất là lượng ngữ cảnh mà giờ nó phải chú ý tới.

Nó diễn ra từ từ, và đó là điều khiến khó nhận ra khi đang ở trong phiên. Không có lỗi, không có ngưỡng; mỗi [lượt](./Turn.md) chỉ tệ hơn lượt trước một chút, và tới lúc các lần tuột trở nên rõ ràng thì bạn đã ở vùng đần một lúc rồi.

Bạn hồi phục bằng cách bớt ngữ cảnh, không phải thêm. Dán lại chỉ dẫn bị phớt lờ là thêm một đối thủ nữa vào cùng cửa sổ đông đúc và chỉ có ích trong chốc lát. Những cách hiệu quả: [xoá ngữ cảnh](./Clearing.md) rồi chỉ nạp lại những gì công việc cần, hoặc [nén ngữ cảnh](./Compaction.md), hoặc [bàn giao](./Handoff.md) sang một phiên mới. Hãy coi việc làm theo chỉ dẫn kém dần là tín hiệu về độ dài ngữ cảnh, không phải về mô hình.

_Usage:_

"Nó vào sâu vùng đần rồi, đang bịa ra các generic không có trong tệp kiểu."

"Suy giảm chú ý. Các định nghĩa kiểu vẫn còn trong ngữ cảnh, nhưng tín hiệu của chúng bị vùi dưới mọi thứ mình thêm vào từ đó. Xoá ngữ cảnh rồi nạp lại đi."

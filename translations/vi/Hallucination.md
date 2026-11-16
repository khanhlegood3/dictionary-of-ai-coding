---
name: Ảo giác
description: "Đầu ra của mô hình sai nhưng tự tin. Có hai loại: sai sự thật (bịa ra dữ kiện) và thiếu trung thành (lệch khỏi ngữ cảnh đã nạp)."
---

Đầu ra của [mô hình](./Model.md) sai nhưng tự tin (ảo giác). Có hai loại với nguyên nhân và cách xử lý khác nhau:

| Loại                | Sai ở đâu                                                                                                              | Nguyên nhân                                                                                                            | Cách xử lý                                                         |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| _Sai sự thật_       | Dữ kiện về thế giới bị bịa ra hoặc sai: một hàm không tồn tại, một chữ ký API sai, một trích dẫn giả                   | Lỗ hổng trong [kiến thức tham số](./Parametric%20knowledge.md), thường là sau [mốc kiến thức](./Knowledge%20cutoff.md) | Nạp đúng [kiến thức ngữ cảnh](./Contextual%20knowledge.md)         |
| _Thiếu trung thành_ | Đầu ra lệch khỏi kiến thức ngữ cảnh đã nạp, khỏi chỉ dẫn của người dùng, hoặc khỏi chính lập luận trước đó của mô hình | [Suy giảm chú ý](./Attention%20degradation.md); nặng hơn khi ở [vùng đần](./Smart%20zone.md)                           | [Xoá ngữ cảnh](./Clearing.md) hoặc [nén ngữ cảnh](./Compaction.md) |

[Dự đoán token tiếp theo](./Next-token%20prediction.md) tạo ra đầu ra trôi chảy dù dữ kiện bên dưới có thật hay không. Mô hình không có tín hiệu nội tại nào báo rằng nó không biết điều gì đó, nên một phương thức bịa ra xuất hiện với cùng giọng chắc chắn như một phương thức đúng. Mã bị ảo giác thì hợp lý ngay từ cách nó được tạo: đó là hình dạng API _sẽ có_ nếu nó tồn tại, và chính điều đó khiến nó lọt qua một lần review lướt và chỉ hỏng khi chạy.

Bạn cần biết mình đang gặp loại nào, vì cách xử lý loại này làm loại kia tệ hơn. Sai sự thật nghĩa là thiếu kiến thức: cách xử lý là thêm ngữ cảnh, như tài liệu, định nghĩa kiểu, tệp. Thiếu trung thành nghĩa là kiến thức có đó nhưng đang thua trong cuộc cạnh tranh giành sự chú ý: cách xử lý là bớt ngữ cảnh. Chẩn đoán nhầm thiếu trung thành thành sai sự thật thì bạn dán thêm tài liệu vào, làm ngữ cảnh lớn thêm và độ lệch nặng hơn. Khi agent làm sai điều gì, hãy kiểm tra xem thông tin đúng đã có trong ngữ cảnh chưa rồi mới quyết định bạn đang gặp vấn đề nào.

_Nên tránh:_ dùng "ảo giác" như một từ đồng nghĩa trần trụi của "sai". Không nêu rõ loại thì thuật ngữ này không có giá trị chẩn đoán.

_Usage:_

"Nó bịa ra một phương thức `parseAsync` trên schema."

"Sai sự thật hay thiếu trung thành?"

"Phương thức đó có trong tài liệu mình đã dán. Chỉ là sau [lượt](./Turn.md) thứ bốn mươi nó thôi không đọc nữa."

"Vậy là thiếu trung thành. Nén ngữ cảnh rồi nạp lại, đừng thêm tài liệu làm gì."

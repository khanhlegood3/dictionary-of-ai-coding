---
name: Kiến thức tham số
description: "Những gì mô hình biết từ huấn luyện, lưu trong tham số. Bị đóng băng lúc huấn luyện. Đối lập với kiến thức ngữ cảnh."
---

Những gì [mô hình](./Model.md) "biết" từ [huấn luyện](./Training.md), lưu trong [tham số](./Parameters.md) của nó. Nó bị đóng băng lúc huấn luyện: mô hình không nhìn được tham số của chính mình, cũng không cập nhật được chúng. Chi tiết bị mất trong quá trình nén: hàng tỷ dữ kiện bị nhồi vào một số tham số cố định, và những dữ kiện hiếm thì nhoè đi. Đây là nguồn của sự trôi chảy với chủ đề phổ biến, và của sự bịa đặt với chủ đề ít gặp. Đối lập với [kiến thức ngữ cảnh](./Contextual%20knowledge.md).

Kiến thức tham số không được lưu dưới dạng dữ kiện. Huấn luyện không hề cho mô hình một cơ sở dữ liệu để tra cứu; nó điều chỉnh tham số cho tới khi mô hình dự đoán văn bản tốt, và một mô hình dự đoán tốt văn bản về một chủ đề thì hành xử như thể nó biết chủ đề đó. Kiến thức đáng tin tới đâu thì tuỳ vào tần suất thứ đó xuất hiện trong dữ liệu huấn luyện: chủ đề có hàng triệu ví dụ được tái hiện chính xác; với chủ đề chỉ có vài ví dụ, mô hình đoán dựa trên hình dạng của các chủ đề tương tự. Với mô hình, tái hiện và đoán là cùng một quá trình, nên nó không phân biệt được mình đang làm cái nào. Một câu trả lời bịa ra cũng trôi chảy như một câu trả lời đúng. [Ảo giác](./Hallucination.md) là khi mô hình đoán sai.

Kiến thức tham số cũng cũ đi. Tham số ngừng thay đổi tại [mốc kiến thức](./Knowledge%20cutoff.md), nên một thư viện phát hành hoặc đổi tên sau ngày đó không tồn tại trong chúng, và một API đã thay đổi thì được nhớ ở dạng cũ.

Với cả hai lỗ hổng, quá hiếm và quá mới, cách khắc phục là một: không thể thêm kiến thức vào tham số, nên nó phải được cung cấp dưới dạng kiến thức ngữ cảnh.

_Usage:_

"Nó viết React không chê vào đâu được nhưng lại bịa ra phương thức trên SDK nội bộ của mình."

"React có rất dày trong kiến thức tham số, hàng triệu ví dụ huấn luyện. SDK của bạn thì không, nên mô hình điền vào những hình dạng trông hợp lý. Nạp tài liệu SDK vào [ngữ cảnh](./Context.md) đi."

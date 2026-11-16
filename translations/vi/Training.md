---
name: Huấn luyện
description: "Quá trình đặt giá trị cho tham số của mô hình: cho nó đọc lượng văn bản khổng lồ và điều chỉnh để dự đoán token tiếp theo tốt hơn."
---

Quá trình đặt giá trị cho [tham số](./Parameters.md) của một [mô hình](./Model.md), bằng cách cho nó tiếp xúc với lượng văn bản khổng lồ và điều chỉnh tham số để [dự đoán token tiếp theo](./Next-token%20prediction.md) tốt hơn. Đây là quá trình làm một lần, tốn kém, do [nhà cung cấp mô hình](./Model%20provider.md) thực hiện. Nó gồm cả tiền huấn luyện (đợt chạy chính) và hậu huấn luyện (các tinh chỉnh về sau như làm theo chỉ dẫn và an toàn); ở mức của bảng thuật ngữ này, sự phân biệt đó không quan trọng.

Cơ chế là lặp lại ở quy mô lớn: đưa cho mô hình một đoạn văn bản, để nó dự đoán [token](./Token.md) tiếp theo, đẩy nhẹ tham số về phía token thực sự xuất hiện, rồi lặp lại qua hàng nghìn tỷ token. Không có gì được lưu dưới dạng sự kiện hay quy tắc. Mọi điều mô hình "biết" là hệ quả phụ của việc dự đoán ngày càng tốt hơn, được nén vào tham số thành [kiến thức tham số](./Parametric%20knowledge.md).

Có hai hệ quả ảnh hưởng tới công việc hằng ngày. Huấn luyện kết thúc tại một thời điểm, nên mô hình có [mốc kiến thức](./Knowledge%20cutoff.md): nó chưa từng thấy phiên bản thư viện bạn vừa nâng cấp tháng trước. Và huấn luyện không phải việc bạn làm được. Khi mô hình không biết codebase, quy ước hay API nội bộ của bạn, cách giải quyết không bao giờ là "dạy mô hình", mà là đưa những tài liệu đó vào [ngữ cảnh](./Context.md), đầu vào duy nhất bạn kiểm soát.

_Usage:_

"Có cách nào để nó biết API nội bộ của mình không?"

"Không phải qua huấn luyện, đó là quá trình kéo dài hàng tháng của nhà cung cấp mô hình. Hãy nạp tài liệu API vào ngữ cảnh, đó mới là đòn bẩy bạn thực sự có."

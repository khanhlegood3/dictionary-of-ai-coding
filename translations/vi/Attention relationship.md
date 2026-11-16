---
name: Quan hệ chú ý
description: "Sự ghép cặp giữa hai token. Cặp có ý nghĩa ảnh hưởng lẫn nhau nhiều hơn cặp không liên quan. Ngữ cảnh N token có khoảng N² cặp như vậy."
---

Khi dự đoán mỗi [token](./Token.md), [mô hình](./Model.md) tính tới mọi token khác trong [ngữ cảnh](./Context.md), có cái nhiều, có cái hầu như không. Sự ghép cặp giữa hai token là một **quan hệ chú ý**, và các cặp có ý nghĩa ("cô ấy" với "Sarah", hay một lời gọi `getUser()` với định nghĩa `function getUser` của nó) ảnh hưởng lẫn nhau nhiều hơn các cặp không liên quan. Một ngữ cảnh N token có số quan hệ cỡ N².

Các cặp này là nơi chứa cái có vẻ là sự hiểu của mô hình. Khi nó xác định được một đại từ chỉ ai, đó là vì quan hệ chú ý giữa "cô ấy" và "Sarah" mạnh. Khi nó gọi một hàm với đúng đối số, quan hệ giữa chỗ gọi và phần định nghĩa nó đọc trước đó đang làm việc. Không có gì trong số này được tra cứu. Tất cả được tính mới ở mỗi [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md), cho từng cặp.

Con số N² đáng để ngẫm, vì nó tăng nhanh hơn trực giác gợi ý:

| Kích thước ngữ cảnh | Số cặp (~N²) |
| ------------------- | ------------ |
| 1.000 token         | ~1 triệu     |
| 10.000 token        | ~100 triệu   |
| 100.000 token       | ~10 tỷ       |

Mỗi cặp còn được tính nhiều hơn một lần. Mô hình có nhiều attention head. Con số chính xác của các mô hình hàng đầu không được công bố, nhưng năm mươi tới một trăm là một ước đoán hợp lý. Mỗi head tính phiên bản riêng của mọi quan hệ. Vậy mỗi cặp trong bảng trên được nhân bản qua mọi head. Đó là rất nhiều cặp.

Chỉ một số ít quan hệ này quan trọng với một công việc cụ thể. Cặp giữa chỉ dẫn của bạn và đoạn mã mà nó chi phối là một trong số ít cặp có giá trị; hầu hết phần còn lại là nhiễu. Và hai thứ này tăng với tốc độ khác nhau: các quan hệ quan trọng gần như giữ nguyên số lượng, còn tổng số cặp tăng theo bình phương kích thước ngữ cảnh. Ở 1.000 token, cặp bạn quan tâm là một trên một triệu; ở 100.000 token, nó là một trên mười tỷ. Đây là phép tính nằm dưới [ngân sách chú ý](./Attention%20budget.md), và [suy giảm chú ý](./Attention%20degradation.md) là điều bạn cảm thấy khi các quan hệ quan trọng nhận được phần quá mỏng.

_Usage:_

"Nó cứ nhầm hai ký hiệu `user` trong diff. Nghe như mình đang ở [vùng đần](./Smart%20zone.md) rồi."

"Ừ, quan hệ chú ý giữa mỗi chỗ gọi và phần khai báo của nó đang giành nhau với cặp kia: cùng hình dạng token, khác ràng buộc. Đổi tên một cái là các cặp rõ nét lại."

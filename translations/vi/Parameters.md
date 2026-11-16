---
name: Tham số
description: "Những con số bên trong mô hình, thường tới hàng tỷ, được tinh chỉnh khi huấn luyện. Mọi điều mô hình biết đều nằm ở đó. Còn gọi là trọng số."
---

Những con số bên trong một [mô hình](./Model.md), thường tới hàng tỷ, được tinh chỉnh trong quá trình [huấn luyện](./Training.md). Mọi điều mô hình "biết" đều nằm trong đó. Huấn luyện đặt giá trị cho chúng; [suy luận](./Inference.md) dùng chúng mà không thay đổi gì. Còn gọi là _trọng số_ (weights).

Về mặt cơ học, tham số là thứ biến đầu vào thành đầu ra. [Dự đoán token tiếp theo](./Next-token%20prediction.md) là một phép tính khổng lồ: các [token](./Token.md) trong [cửa sổ ngữ cảnh](./Context%20window.md) đi vào, được nhân qua các tham số, và một dự đoán cho token kế tiếp đi ra. Bên trong mô hình không có cơ sở dữ liệu sự kiện, không có bảng tra cứu mã nguồn. Chỉ có những con số này, được sắp xếp sao cho phép tính thường cho ra kết quả hữu ích. Những điều mô hình thuộc lòng từ lúc huấn luyện, chẳng hạn API của một thư viện chuẩn, là [kiến thức tham số](./Parametric%20knowledge.md): được lưu trong tham số, không phải truy xuất từ đâu cả.

Điều đáng ghi nhớ là tham số bị đóng băng sau khi huấn luyện. Không việc gì bạn làm trong một [phiên](./Session.md) thay đổi được chúng: không lời sửa nào của bạn, không codebase nào bạn cho nó xem, không lỗi nào nó rút kinh nghiệm được. Phiên nào cũng chạy trên cùng những con số ấy. Đó là lý do mô hình [không lưu trạng thái](./Stateless.md), kiến thức có sẵn của nó dừng ở [mốc kiến thức](./Knowledge%20cutoff.md), và mọi thứ riêng của dự án phải đến qua [ngữ cảnh](./Context.md). Cách duy nhất để tham số thay đổi là huấn luyện thêm, và việc đó trên thực tế tạo ra một mô hình khác.

_Usage:_

"Mình fine-tune nó trên codebase của mình được không?"

"Làm vậy sẽ cập nhật tham số, tức là sau đó thành một mô hình khác. Với một dự án thì nạp codebase làm ngữ cảnh gần như luôn rẻ hơn huấn luyện lại."

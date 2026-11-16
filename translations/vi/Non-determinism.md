---
name: Tính bất định
description: "Cùng một đầu vào có thể cho ra đầu ra khác nhau. Đây là đặc tính của cách mô hình sinh văn bản và cách nhà cung cấp phục vụ yêu cầu."
---

Cùng một đầu vào có thể cho ra đầu ra khác nhau. Chạy một [mô hình](./Model.md) hai lần với [ngữ cảnh](./Context.md) giống hệt, bạn có thể nhận hai câu trả lời khác nhau: có khi khác một từ, có khi là một hướng tiếp cận hoàn toàn khác. Không cần thay đổi gì trong mã của bạn thì điều này vẫn xảy ra.

Đây là đặc tính của cách mô hình sinh văn bản và cách [nhà cung cấp mô hình](./Model%20provider.md) phục vụ [yêu cầu](./Model%20provider%20request.md). Khi [suy luận](./Inference.md), mô hình tạo ra một phân phối xác suất trên các [token](./Token.md) có thể đứng kế tiếp, và một token được lấy mẫu từ đó. Việc lấy mẫu thường cố ý có chút ngẫu nhiên, vì luôn chọn token khả dĩ nhất sẽ cho ra văn bản lặp lại và kém chất lượng hơn. Một token được lấy mẫu khác đi ở đầu câu trả lời làm thay đổi mọi token sau nó. Đó là cách một từ khác đi trở thành một hướng tiếp cận hoàn toàn khác. Phía nhà cung cấp còn thêm biến động nữa: các yêu cầu được gộp thành lô trên phần cứng dùng chung, và những sai khác rất nhỏ về dấu phẩy động giữa các lô có thể làm nghiêng một lựa chọn sít sao giữa hai token. Không có thiết lập nào để bạn tắt hết những điều này.

Hãy chờ đợi một dải kết quả khi giao cùng một việc cho một [agent](./Agent.md). Phần lớn câu trả lời nằm trong một đường cong chuông hợp lý về chất lượng, nhờ vậy tính bất định mới chấp nhận được. Nhưng hai đuôi của phân phối là có thật: có ngày mô hình tỏ ra sắc sảo, có ngày nó như mất phương hướng. Cùng một việc, khác lần gieo xúc xắc. Điều này dẫn tới hai hệ quả thực tế. Thử lại là một chiến lược chính đáng: một lần thất bại chỉ là một lần rút từ phân phối, và một lần thử mới cho cùng việc đó có thể đơn giản là rơi vào chỗ tốt hơn. Và việc kiểm chứng quan trọng hơn so với khi dùng công cụ tất định. Bạn không thể kiểm thử hành vi của agent một lần rồi tin rằng nó sẽ lặp lại, nên các [kiểm tra tự động](./Automated%20check.md) phải bắt được những lần rút xấu.

Cẩn thận đừng dựng thành câu chuyện quá mức. Con người là cỗ máy tìm quy luật, và một chuỗi lần chạy tệ có thể tạo cảm giác như bằng chứng rằng "tuần này mô hình kém đi". Thường thì đó chỉ là phân phối.

_Usage:_

"Hôm nay Claude tệ quá. Họ vừa phát hành bản kém hơn à?"

"Chắc là không. Đầu ra của mô hình có tính bất định. Với cùng một việc, bạn sẽ có ngày tốt và ngày xấu. Mai thử lại đã, rồi hãy đi tìm nguyên nhân."

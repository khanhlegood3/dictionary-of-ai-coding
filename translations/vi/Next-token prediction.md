---
name: Dự đoán token tiếp theo
description: "Việc mô hình thực sự làm. Lấy mẫu một token tiếp theo từ ngữ cảnh, nối vào, rồi chạy lại. Đây là cách hoạt động duy nhất của nó."
---

Việc [mô hình](./Model.md) thực sự làm. Cho trước một [ngữ cảnh](./Context.md), nó lấy mẫu một [token](./Token.md) tiếp theo, nối vào, rồi chạy lại. Mọi đầu ra, dù là một câu, một [lệnh gọi công cụ](./Tool%20call.md) hay một tệp nghìn dòng, đều được dựng từng token một. Mô hình không có cách hoạt động nào khác.

Bước nào cũng diễn ra như nhau: các token trong [cửa sổ ngữ cảnh](./Context%20window.md) được chạy qua các [tham số](./Parameters.md), cho ra xác suất của từng token trong bộ từ vựng. Token này rất có khả năng đứng kế tiếp, token kia ít hơn. Một token được lấy mẫu theo các xác suất đó, được nối vào, và vòng lặp chạy lại với ngữ cảnh dài hơn một chút. Bước lấy mẫu là lý do cùng một prompt cho ra kết quả khác nhau ở các lần chạy khác nhau: [tính bất định](./Non-determinism.md) nằm sẵn trong cơ chế, không phải một lỗi chồng thêm lên trên.

Nắm chắc cơ chế này sẽ giải thích được những hành vi thoạt nhìn có vẻ lạ. Mô hình không bao giờ kiểm tra một token có _đúng_ hay không trước khi phát ra, mà chỉ xét nó có _khả dĩ_ hay không. Đó là gốc rễ của [ảo giác](./Hallucination.md). Nó chốt từng token ngay khi sinh ra, nên một câu mở đầu nghe tự tin có thể kéo cả phần còn lại của câu trả lời đi sai hướng. Và vì [token đầu ra](./Output%20tokens.md) được sinh tuần tự từng cái một, tốc độ sinh đặt ra giới hạn dưới cho thời gian làm việc của bất kỳ [agent](./Agent.md) nào.

_Usage:_

"Agent 'quyết định' gọi công cụ bằng cách nào?"

"Nó không quyết định gì cả, từ trên xuống dưới chỉ là dự đoán token tiếp theo. Lệnh gọi công cụ chỉ là một chuỗi có cấu trúc mà [harness](./Harness.md) tách ra từ dòng đầu ra."

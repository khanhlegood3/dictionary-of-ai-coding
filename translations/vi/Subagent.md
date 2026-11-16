---
description: "Một agent do agent khác sinh ra qua lệnh gọi công cụ. Chạy trong phiên riêng, trả về một kết quả công cụ. Không sinh thêm subagent được."
---

Một [agent](./Agent.md) do agent khác sinh ra qua một [lệnh gọi công cụ](./Tool%20call.md). Nó chạy trong [phiên](./Session.md) riêng với [cửa sổ ngữ cảnh](./Context%20window.md) riêng, và trả về một [kết quả công cụ](./Tool%20result.md) duy nhất. Nó khác với [bàn giao](./Handoff.md): agent cha chủ đích chờ kết quả trả về; bàn giao thì không có đường quay lại. **Không sinh thêm subagent được**: cây chỉ sâu một tầng. Subagent tồn tại để cách ly [ngữ cảnh](./Context.md), không phải để dựng nên các tầng bậc.

Mục đích là giữ những việc nhiều nhiễu ở ngoài ngữ cảnh của agent cha. Một lần tìm kiếm rộng hay một chuyến đọc tệp dài tạo ra hàng trang kết quả công cụ, phần lớn chỉ quan trọng cho tới khi tìm ra câu trả lời. Chạy trong agent cha thì tất cả nằm lại trong ngữ cảnh của nó cho tới hết phiên. Chạy trong subagent thì nhiễu lấp vào một cửa sổ dùng xong bỏ, và chỉ bản báo cáo cuối rơi vào ngữ cảnh của agent cha. Bản báo cáo là một [nguồn thứ cấp](./Secondary%20source.md): agent cha nhận lời kể của subagent về những gì nó tìm thấy, không phải kết quả thô, nên điều gì bản báo cáo bỏ sót thì vô hình với agent cha.

Subagent cũng chạy đồng thời được: agent cha có thể toả vài subagent cùng lúc cho các phần việc độc lập.

_Usage:_

"Kết quả grep đang làm nổ ngữ cảnh của mình."

"Sinh một subagent để tìm. Nó sẽ đốt cửa sổ ngữ cảnh riêng cho phần nhiễu và báo về đúng hai đường dẫn tệp bạn thực sự cần."

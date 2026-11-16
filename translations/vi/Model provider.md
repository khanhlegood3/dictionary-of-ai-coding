---
name: Nhà cung cấp mô hình
description: "Bên phục vụ mô hình để suy luận. Thường là dịch vụ từ xa (Anthropic, OpenAI, Google), nhưng cũng có thể chạy cục bộ (Ollama, llama.cpp)."
---

Bên phục vụ một [mô hình](./Model.md) để [suy luận](./Inference.md). Thường là một dịch vụ từ xa (Anthropic, OpenAI, Google), nhưng cũng có thể chạy cục bộ: Ollama, LM Studio, llama.cpp trên máy của chính bạn. [Harness](./Harness.md) không tự chạy mô hình; nó nhờ một nhà cung cấp làm việc đó.

Nhà cung cấp sở hữu bộ máy: các [tham số](./Parameters.md) nằm trên phần cứng của họ, và mỗi [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md) là harness gửi [token](./Token.md) qua mạng rồi nhận dự đoán về. Vì vậy nhà cung cấp là nguồn gốc của cả một nhóm vấn đề hay bị quy nhầm cho mô hình hoặc harness: giới hạn tốc độ, năng lực phục vụ suy giảm và sự cố ngừng dịch vụ đều nằm ở đây. Khi [agent](./Agent.md) khựng lại giữa [phiên](./Session.md) hoặc báo lỗi ở mọi [lượt](./Turn.md), trang trạng thái của nhà cung cấp là thứ nên xem trước tiên.

Nhà cung cấp cũng đặt ra điều khoản thương mại: giá theo token cho [token đầu vào](./Input%20tokens.md) và [token đầu ra](./Output%20tokens.md), mức giảm giá nhờ [bộ đệm tiền tố](./Prefix%20cache.md), và có những mô hình nào để dùng. Lưu ý rằng nhà cung cấp và bên làm ra mô hình có thể là hai công ty khác nhau: Bedrock, Vertex và OpenRouter phục vụ mô hình của bên khác.

Nhà cung cấp cục bộ đổi năng lực lấy quyền kiểm soát: các mô hình chạy vừa trên phần cứng của bạn nhỏ hơn nhiều so với các mô hình hàng đầu, nhưng không có gì rời khỏi máy và không có hoá đơn theo token.

_Usage:_

"Mình chạy cái này offline cho khách hàng dùng mạng cách ly được không?"

"Đổi nhà cung cấp mô hình sang bản cục bộ, Ollama hoặc llama.cpp trên máy của họ. Harness không quan tâm, nó chỉ gọi tới một endpoint khác."

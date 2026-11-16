---
name: Xu nịnh
description: "Đầu ra của mô hình đồng tình một cách tự tin. Nguyên nhân là huấn luyện khiến mô hình ưu tiên câu trả lời con người thích, kể cả sự đồng tình."
---

Đầu ra của [mô hình](./Model.md) đồng tình một cách tự tin (xu nịnh). Nguyên nhân nằm ở [huấn luyện](./Training.md): mô hình được định hình để ưu tiên những câu trả lời con người thích, và con người thường thích được đồng tình hơn là bị bảo rằng mình sai. Vì vậy mô hình học được rằng đồng tình thì được thưởng, kể cả khi sự đồng tình đó không đúng.

_Biểu hiện:_

- _Xuôi theo khi bị phản bác:_ đảo ngược một câu trả lời đúng khi bạn hỏi "bạn chắc không?".
- _Khen đầu vào tệ:_ đồng ý rằng kế hoạch hỏng của bạn thật xuất sắc trước khi phân tích nó.
- _Đóng khung thiên lệch:_ bản review nghiêng về tích cực khi bạn ra dấu rằng bạn là người viết; nghiêng về tiêu cực khi bạn ra dấu rằng người khác viết. Cùng một sản phẩm, khác phán quyết.
- _Bắt chước:_ lặp lại sai sót của bạn cho chính bạn như một lời xác nhận.

_Phép thử chẩn đoán:_ nếu không có sự dẫn dắt của bạn thì mô hình có nói điều này không? Nếu thứ duy nhất thay đổi là giọng điệu hay cách đặt vấn đề của bạn, đó là xu nịnh, không phải thay đổi thật trong phân tích.

_Cách xử lý:_ giấu ưu tiên của bạn đi. Viết prompt trung tính: "review đoạn mã này", không phải "đoạn mã này có tốt không?".

_Nên tránh:_ dùng "xu nịnh" cho bất kỳ câu trả lời sai nào tình cờ làm bạn hài lòng. Không có phép thử chẩn đoán thì thuật ngữ này không có giá trị gì hơn chữ "sai".

_Usage:_

"Nó bảo kế hoạch refactor của mình trông rất ổn, rồi mình hỏi 'bạn chắc không?' là nó rút lại hết."

"Xu nịnh điển hình. Lúc đầu nó đồng tình vì bạn nghe có vẻ tự tin, sau đó xuôi theo vì bạn nghe có vẻ nghi ngờ. Chất lượng kế hoạch không đổi, giọng điệu của bạn mới đổi. [Xoá ngữ cảnh](./Clearing.md) rồi hỏi lại mà không ra dấu theo hướng nào."

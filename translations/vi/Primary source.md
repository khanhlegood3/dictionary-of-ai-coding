---
name: Nguồn sơ cấp
description: "Chính thứ đó: mã nguồn, bản ghi, dữ liệu thô. Đầy đủ và có thẩm quyền, nhưng tốn kém khi nạp vào ngữ cảnh."
---

Một nguồn sự thật ở dạng nguyên gốc: mã nguồn, bản ghi cuộc trò chuyện, log thô, phản hồi API thực tế. Không phải lời kể về thứ đó, mà là chính nó. Đối lập với [nguồn thứ cấp](./Secondary%20source.md).

Nếu bạn muốn biết codebase làm gì thì mã nguồn là nguồn sơ cấp. Tài liệu, sơ đồ kiến trúc và README đều là mô tả về nó: đúng vào lúc được viết, và từ đó đi theo nhịp riêng. Khi một [agent](./Agent.md) tự tin khẳng định điều gì sai về dự án của bạn, câu hỏi cần đặt ra là nó đang dựa vào nguồn nào. Agent đọc một tài liệu thì thừa hưởng độ cũ của tài liệu đó; agent đọc mã nguồn thì đang đọc sự thật hiện hành.

Chi phí là thứ khiến nguồn sơ cấp không thành lựa chọn mặc định. Nạp một nguồn như vậy vào [cửa sổ ngữ cảnh](./Context%20window.md) thì đắt: cả tệp, cả bản ghi, mỗi [token](./Token.md) đều được tính là [đầu vào](./Input%20tokens.md) và cạnh tranh [ngân sách chú ý](./Attention%20budget.md). Thứ bạn nhận lại là sự đầy đủ: chưa có gì bị lọc trước bởi phán đoán của người khác về điều gì quan trọng. Một bản tóm tắt viết tháng trước không thể chứa chi tiết mà hôm nay mới hoá ra quan trọng; nguồn sơ cấp thì vẫn chứa.

Hãy tìm tới nguồn sơ cấp khi cần chính xác: chữ ký chính xác, lỗi thực tế, dòng ném ra ngoại lệ. Phần lớn việc quản lý [ngữ cảnh](./Context.md) là quyết định khi nào trả giá cho nguồn sơ cấp và khi nào nguồn thứ cấp là đủ.

_Usage:_

"Agent bảo logic retry lùi theo cấp số nhân, nhưng mình đang thấy nó dội liên tục vào endpoint."

"Nó đọc điều đó từ tài liệu thiết kế. Chỉ nó vào module retry thật. Khi hành vi là thứ quan trọng thì hãy làm việc từ nguồn sơ cấp."

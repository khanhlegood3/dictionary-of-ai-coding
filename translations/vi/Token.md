---
description: "Đơn vị nhỏ nhất mà mô hình đọc và viết. Gần bằng một từ nhưng không hẳn. Kích thước cửa sổ ngữ cảnh, chi phí và độ trễ đều đếm bằng token."
---

Đơn vị nhỏ nhất mà một [mô hình](./Model.md) đọc và viết. Gần bằng một từ nhưng không hẳn: từ thông dụng là một token, từ hiếm hoặc dài bị tách thành vài token. Kích thước [cửa sổ ngữ cảnh](./Context%20window.md), chi phí và độ trễ đều được đếm bằng token.

Văn bản trở thành token qua một tokenizer: một bộ từ vựng cố định gồm hàng chục nghìn mảnh, được học trước khi [huấn luyện](./Training.md), dùng để tách bất kỳ đầu vào nào thành một chuỗi các mục trong bộ từ vựng. Mô hình không bao giờ thấy ký tự hay từ. Mọi đoạn văn bản được đổi thành token trên đường vào, và [dự đoán token tiếp theo](./Next-token%20prediction.md) sinh đầu ra từng token một trên đường ra.

Theo kinh nghiệm, một token bằng khoảng ba phần tư một từ tiếng Anh, nên một nghìn token là khoảng 750 từ. Mã nguồn thì khó đoán hơn: từ khoá và cách viết thông dụng được mã hoá gọn, còn định danh sinh tự động, mã hash, khối base64 và mã đã minify bị tách thành nhiều token cho mỗi "từ". Quy luật là: văn bản xuất hiện nhiều trong dữ liệu gốc của tokenizer được mã hoá ngắn và hiệu quả; văn bản không xuất hiện thì bị cắt thành nhiều mảnh nhỏ. Một mã hash như `a3f9c2e1` chưa từng xuất hiện ở đâu, nên nó bị tách thành nhiều token, còn `function` chỉ là một. Vì vậy một tệp trông nhỏ nhưng chứa đầy chuỗi lạ có thể chiếm một phần lớn bất ngờ của cửa sổ ngữ cảnh.

Token là đơn vị để đo mọi thứ khác. Chi phí tính theo token, và nhà cung cấp tính [token đầu vào](./Input%20tokens.md) và [token đầu ra](./Output%20tokens.md) riêng. Tốc độ là số token mỗi giây, vì đầu ra được sinh từng token một. Và cửa sổ ngữ cảnh là một số token cố định, nên số token của các tệp quyết định chứa vừa được bao nhiêu.

_Nên tránh:_ "từ". Ranh giới token không trùng ranh giới từ, và token mỗi giây hay token mỗi đô la mới là những đơn vị thực sự quan trọng.

_Usage:_

"Prompt này sẽ lớn cỡ nào?"

"Chạy nó qua tokenizer đi. Schema thì gọn nhưng các khoá JSON khá lạ, nên chúng sẽ tách thành nhiều token hơn bạn nghĩ."

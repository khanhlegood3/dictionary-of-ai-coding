---
name: Kiểm tra tự động
description: "Một phép kiểm chứng tất định chạy trong môi trường: test, kiểm tra kiểu, lint, build, pre-commit hook. Đạt hoặc không đạt, không phán đoán."
---

Một phép kiểm chứng tất định chạy trong [môi trường](./Environment.md): test, kiểm tra kiểu, lint, build, pre-commit hook. Đạt hoặc không đạt, không phán đoán. Đây là tín hiệu để [agent](./Agent.md) tự sửa mà không cần tới ai khác. Một bài test chập chờn là một phép kiểm tra bị hỏng, không phải một thứ không phải kiểm tra; kiểm tra tự động là tất định _theo thiết kế_.

Tự sửa hoạt động như một vòng lặp. Agent thay đổi mã, chạy phép kiểm tra bằng một [lệnh gọi công cụ](./Tool%20call.md), và đầu ra báo lỗi rơi vào [cửa sổ ngữ cảnh](./Context%20window.md) của nó: một lỗi kiểu kèm tệp và dòng, một assertion không đạt kèm giá trị mong đợi và giá trị thực tế. Chừng đó đủ để agent sửa vấn đề và chạy lại phép kiểm tra, cứ thế cho tới khi đạt, không cần con người trong vòng lặp. Tính tất định là thứ khiến vòng lặp đáng tin: cùng một đoạn mã luôn cho cùng một phán quyết, nên một lần đạt có ý nghĩa. Một phép kiểm tra chập chờn đầu độc điều này: agent "sửa" đoạn mã vốn ổn, hoặc thử lại cho qua một lỗi thật.

Vì vậy các phép kiểm tra tốt là một phần lớn trong [AX](./AX.md) của codebase. Agent trong một repo có kiểu chặt chẽ, bộ test nhanh và linter sẽ bắt được phần lớn lỗi của chính nó trước khi bạn thấy; agent trong một repo không có những thứ đó thì đưa ra bất cứ thứ gì nó tạo ra. Khác biệt này quan trọng nhất trong các đợt chạy [AFK](./AFK.md), nơi các phép kiểm tra là sự kiểm chứng duy nhất diễn ra trong lúc chạy. Nhưng một phép kiểm tra chỉ bắt được điều nó khẳng định. Kiểm tra xanh nghĩa là các thuộc tính được khẳng định đều đúng, không phải mã đúng. Những khoảng trống cần phán đoán là việc của [review tự động](./Automated%20review.md) và [review của con người](./Human%20review.md).

_Nên tránh:_ "feedback loop" / "backpressure". Cả hai gộp kiểm tra với review. _Nên tránh:_ "test". Test là kiểm tra tự động, nhưng không phải kiểm tra tự động nào cũng là test.

_Usage:_

"Agent cứ đưa ra mã hỏng trong các đợt chạy AFK."

"Những kiểm tra tự động nào đang được nối vào [sandbox](./Sandbox.md)?"

"Chỉ có unit test."

"Thêm typecheck và lint. Nó sẽ tự sửa từ những thứ đó trước khi PR tới nơi."

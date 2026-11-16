---
name: Tiết lộ dần
description: "Chỉ nạp phần ngữ cảnh agent cần ngay lúc này, kèm con trỏ ngữ cảnh tới phần còn lại. Mượn từ thiết kế giao diện."
---

Chỉ nạp phần [ngữ cảnh](./Context.md) mà [agent](./Agent.md) cần ngay lúc này, kèm các [con trỏ ngữ cảnh](./Context%20pointer.md) tới phần còn lại (tiết lộ dần). Khái niệm này mượn từ thiết kế giao diện, nơi nó nghĩa là chỉ hiển thị cho người dùng các nút điều khiển liên quan tới việc đang làm và giấu phần còn lại sau một cú nhấp.

Kỹ thuật này tồn tại vì ngữ cảnh tốn chi phí hai lần. Mỗi [token](./Token.md) nạp sẵn đều được tính là [token đầu vào](./Input%20tokens.md) ở mỗi [lượt](./Turn.md), và mỗi token đều tiêu [ngân sách chú ý](./Attention%20budget.md) dù agent có cần nó hay không. Một [AGENTS.md](./AGENTS.md.md) nhồi đầy bản hướng dẫn phong cách, quy trình triển khai và quy ước cơ sở dữ liệu khiến agent làm kém đi ở tất cả những việc đó: các chỉ dẫn quan trọng cho việc hiện tại bị pha loãng bởi những chỉ dẫn không liên quan. Dấu hiệu nhận biết là agent phớt lờ những quy tắc mà bạn biết có trong ngữ cảnh của nó: chúng có ở đó, nhưng bị vùi lấp.

Tiết lộ dần đảo ngược điều này. Giữ tầng luôn được nạp thật nhỏ: mỗi chủ đề một câu và một con trỏ tới nơi chứa chi tiết. Agent đọc bản hướng dẫn phong cách khi viết component, đọc quy trình triển khai khi triển khai, và không đọc cái nào khi sửa một bài test. [Skill](./Skill.md) là mẫu hình này được dựng sẵn trong [harness](./Harness.md): một mô tả ngắn được nạp ở mọi [phiên](./Session.md), còn chỉ dẫn đầy đủ chỉ được nạp khi được kích hoạt.

_Usage:_

"Mình có nên đổ nguyên bản hướng dẫn phong cách vào AGENTS.md không?"

"Không, hãy tiết lộ dần. Đưa bản hướng dẫn phong cách thành một skill mà agent nạp khi thực sự cần viết component. AGENTS.md thì lượt nào cũng trả chi phí token."

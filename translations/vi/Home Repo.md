---
description: "Một repo chứa các skill, AGENTS.md và tài liệu dùng chung của bạn, và trỏ tới các repo khác. Bạn chạy agent từ đó."
---

Một repository chứa các [skill](./Skill.md), [AGENTS.md](./AGENTS.md.md) và tài liệu dùng chung của bạn, và trỏ tới các repo khác của bạn. Bạn chạy [agent](./Agent.md) trong Home Repo, và nó mở hoặc clone các repo khác khi công việc cần.

Khi một dự án trải trên nhiều repo, một agent khởi động trong một repo chỉ thấy repo đó. Mỗi repo rốt cuộc có bản sao riêng của các skill và phần thiết lập agent, các bản sao trôi lệch nhau, và việc [grilling](./Grilling.md) một tính năng đi qua nhiều repo diễn ra mà thiếu bức tranh tổng thể. Home Repo giữ một bản duy nhất của phần dùng chung, và các [phiên](./Session.md) bắt đầu ở đó thay vì bên trong một repo đơn lẻ.

| Nằm trong Home Repo                                                          | Ở lại trong từng repo               |
| ---------------------------------------------------------------------------- | ----------------------------------- |
| Các skill dùng cho nhiều repo                                                | Mã nguồn của repo                   |
| AGENTS.md, kèm một con trỏ tới từng repo                                     | AGENTS.md riêng, lệnh build và test |
| Tài liệu dùng chung: chuẩn viết mã, bảng thuật ngữ, quyết định toàn hệ thống | Tài liệu chỉ nói về repo đó         |
| Công cụ, chẳng hạn một CLI nối agent với các dịch vụ bên ngoài               |                                     |

Mỗi con trỏ là một [con trỏ ngữ cảnh](./Context%20pointer.md): một dòng nêu tên repo, nó nằm ở đâu trên đĩa, và clone từ đâu nếu chưa có. Khoảng 20 repo thì cách này chạy ổn. Tới vài trăm repo, mỗi repo một con trỏ là quá nhiều để agent chọn, nên hãy trỏ tới một tệp cho mỗi mảng nghiệp vụ và liệt kê các repo của mảng đó trong tệp ấy ([tiết lộ dần](./Progressive%20disclosure.md)). Tới hàng nghìn repo, các skill có đủ nhiều bên dùng để một chợ skill phù hợp hơn.

Home Repo thay cho monorepo khi bạn không thể có monorepo: khi bạn trộn repo công khai với repo riêng tư, hoặc khi một nhóm không chịu dùng monorepo. Với một nhóm, Home Repo là thứ các bạn dùng chung. Trong một [nhà máy phần mềm](./Software%20factory.md), Home Repo được đặt vào [sandbox](./Sandbox.md) và clone các repo khác khi cần.

_Nên tránh:_ "agent repo" và "meta-repo", các tên cũ hơn của cùng thứ này.

_Usage:_

"Mình cứ chép cùng mấy skill đó vào từng repo, và các bản sao đã lệch nhau."

"Chuyển chúng vào một Home Repo. Một bản duy nhất của các skill, AGENTS.md trỏ tới từng repo, và bạn bắt đầu các phiên ở đó."

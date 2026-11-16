---
name: Ngân sách chú ý
description: "Mỗi token có một lượng ảnh hưởng hữu hạn để phân bổ cho phần còn lại của ngữ cảnh. Tính theo từng token, không tăng khi ngữ cảnh lớn lên."
---

Mỗi [token](./Token.md) có một lượng ảnh hưởng hữu hạn để phân bổ cho phần còn lại của [ngữ cảnh](./Context.md). Ảnh hưởng mạnh lên [một quan hệ](./Attention%20relationship.md) thì còn lại ít hơn cho các quan hệ khác. Ngân sách tính theo từng token và không tăng khi ngữ cảnh lớn lên, vì vậy các [phiên](./Session.md) dài bị loãng đi.

Hãy hình dung nó như tín hiệu và nhiễu. Chỉ dẫn của bạn là một tín hiệu có âm lượng cố định; mọi token khác trong [cửa sổ ngữ cảnh](./Context%20window.md) là âm thanh cạnh tranh. Chỉ dẫn không hề nhỏ đi, nó vẫn ở đó, đúng từng ký tự. Nhưng khi ngữ cảnh lớn lên, căn phòng quanh nó ồn hơn và tỷ lệ tín hiệu trên nhiễu giảm xuống. Một chỉ dẫn từng là thứ to nhất ở 10k token ngữ cảnh thì thành tiếng rì rầm nền ở 150k. Đây là cơ chế đằng sau [suy giảm chú ý](./Attention%20degradation.md): mô hình không quên; tín hiệu bị lẫn vào nhiễu.

Triệu chứng trông như sự bất tuân: agent đồng ý với một ràng buộc từ sớm rồi dần trôi khỏi nó, và dán lại ràng buộc chỉ có ích trong chốc lát. Nguyên nhân không phải chỉ dẫn, mà là mọi thứ khác trong cửa sổ đang cạnh tranh với nó.

Thứ bạn kiểm soát được là cái gì đi vào ngữ cảnh. Nội dung không phục vụ công việc không hề trung tính; nó là nhiễu đè lên mọi thứ có phục vụ. Giữ cửa sổ nhỏ, [xoá ngữ cảnh](./Clearing.md) khi phần ngữ cảnh tích luỹ không còn đáng giá, và nhắc lại những ràng buộc quan trọng thay vì tin rằng lần nhắc từ sớm vẫn còn hiệu lực.

_Usage:_

"Sao nó cứ phớt lờ schema mình dán ở đầu?"

"Mình đã vào sâu [vùng đần](./Smart%20zone.md) rồi. Ngân sách chú ý của mỗi token là cố định, nhưng ngữ cảnh thì cứ lớn lên. Tín hiệu của schema giờ đang cạnh tranh với hàng nghìn token mới hơn."

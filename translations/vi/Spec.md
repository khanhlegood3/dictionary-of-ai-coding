---
description: "Tài liệu bàn giao mô tả một phần việc kéo dài nhiều phiên: xây cái gì, không phải mỗi phiên làm phần mình thế nào. Gồm các ticket."
---

Một [tài liệu bàn giao](./Handoff%20artifact.md) mô tả một phần việc kéo dài nhiều [phiên](./Session.md): xây cái gì, không phải mỗi phiên làm phần của mình thế nào. Nó thay đổi theo tiến độ công việc. Nó gồm các [ticket](./Ticket.md).

Spec tồn tại vì phiên thì dùng xong bỏ, còn việc lớn thì không. Bất cứ việc gì cần nhiều hơn một [cửa sổ ngữ cảnh](./Context%20window.md) đều cần một chỗ ở ngoài [ngữ cảnh](./Context.md): đâu đó trong [môi trường](./Environment.md) của agent, còn lại sau khi [xoá ngữ cảnh](./Clearing.md), dù là một tệp trong repo, một issue trên GitHub, hay một hệ thống theo dõi issue mà agent với tới được. Spec là chỗ ở đó: mục tiêu, các ràng buộc, các quyết định tới giờ, và danh sách ticket kèm trạng thái. Phiên mới nào cũng đọc được nó và biết việc đang ở đâu mà không thừa hưởng đống nhiễu tích luỹ của phiên trước.

Spec có vài kiểu dễ nhận ra, phần lớn kế thừa từ cách các nhóm vốn ghi chép. Một _product requirements document_ (PRD) nghiêng về cái gì và vì sao ở phía người dùng: tính năng, hành vi, tiêu chí nghiệm thu. Một _design doc_ hay _RFC_ nghiêng về kỹ thuật: hướng được chọn, các phương án bị loại, các đánh đổi. Ở đầu nhỏ, một tệp `plan.md` đơn giản với danh sách ticket làm cùng việc đó cho một tính năng nhiều phiên. Kiểu nào không quan trọng bằng vai trò: với [agent](./Agent.md), tất cả đều là một thứ, bản tuyên bố ý định bền vững mà nó đọc lúc bắt đầu mỗi phiên.

_Usage:_

"Tất cả việc này có nên làm trong một phiên không?"

"Không, viết nó thành spec, chia thành các ticket, mỗi ticket chạy trong một phiên riêng. Cố làm hết trong một ngữ cảnh thì sẽ chạm [vùng đần](./Smart%20zone.md) trước khi được nửa đường."

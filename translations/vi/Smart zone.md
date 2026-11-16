---
name: Vùng thông minh
description: "Đầu phiên, agent sắc bén và tập trung. Khi phiên lớn lên, nó trôi vào vùng đần: cẩu thả hơn, hay quên, nhiều lỗi hơn."
---

Đầu một [phiên](./Session.md), [agent](./Agent.md) ở trong "vùng thông minh": sắc bén, tập trung, nhớ tốt. Khi phiên lớn lên, nó trôi vào "vùng đần": cẩu thả hơn, hay quên, nhiều lỗi hơn, và nhiều [ảo giác](./Hallucination.md) kiểu thiếu trung thành hơn. Vẫn [mô hình](./Model.md) đó, vẫn [harness](./Harness.md) đó, chỉ là nhiều [ngữ cảnh](./Context.md) hơn. Đây là hiệu ứng cảm nhận được của [suy giảm chú ý](./Attention%20degradation.md). Với các mô hình hàng đầu, vùng đần thường bắt đầu quanh 125K–150K [token](./Token.md), dù con số này còn gây tranh cãi. Hãy [xoá ngữ cảnh](./Clearing.md) hoặc [nén ngữ cảnh](./Compaction.md) khi phiên phình to; đừng cố chạy tiếp.

Sự sa sút diễn ra từ từ nên dễ bỏ lỡ. Không có thông báo lỗi, không có ranh giới nhìn thấy được; agent chỉ bắt đầu làm kém đi một chút, rồi kém đi rõ rệt. Dấu hiệu thường gặp: nó quên một chỉ dẫn bạn đưa hai mươi lượt trước, lặp lại một lỗi đã sửa, hoặc tự tin khẳng định điều mà ngữ cảnh nói ngược lại. Vì đường trượt rất êm, phản ứng thường thấy là cố chạy tiếp và giải thích lại, việc này thêm ngữ cảnh và làm vấn đề tệ hơn.

Các vùng này không đi theo giới hạn của [cửa sổ ngữ cảnh](./Context%20window.md). Một phiên có thể đã vào sâu vùng đần khi phần lớn cửa sổ vẫn còn trống: giới hạn là nơi harness từ chối chạy tiếp, nhưng chất lượng đã rơi từ rất lâu trước đó. Hãy lập kế hoạch theo vùng thông minh, không theo cửa sổ. Ngân sách thực tế cho một việc là số token mà agent còn làm việc tốt, không phải số token về lý thuyết nó chứa được.

Vùng thông minh là một ngân sách, và việc không liên quan tiêu mất nó. Mỗi việc làm trong phiên đều dùng hết một phần token, nên bắt đầu việc thứ hai trong cùng phiên nghĩa là bắt đầu nó gần vùng đần hơn. Mỗi phiên một việc cho mỗi việc phần sắc bén nhất của phiên. Khi một việc lớn hơn một vùng thông minh, hãy chia ra: [bàn giao](./Handoff.md) hoặc nén ngữ cảnh ở một ranh giới tự nhiên, và để một phiên mới làm phần kế tiếp.

_Usage:_

"Nó làm ngon ba component đầu rồi phá nát cái thứ tư."

"Bạn ra khỏi vùng thông minh rồi. Vẫn mô hình đó, chỉ là giờ đã vào sâu vùng đần. Nén ngữ cảnh rồi nạp lại bản kế hoạch, component kế tiếp sẽ ổn."

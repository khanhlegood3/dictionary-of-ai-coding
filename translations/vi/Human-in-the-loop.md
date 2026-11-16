---
name: Có con người trong vòng lặp
description: "Kiểu làm việc trong đó một hoặc nhiều người cặp cùng agent trong suốt phiên: xem lại, chỉnh hướng hoặc cộng tác theo thời gian thực."
---

Kiểu làm việc trong đó một hoặc nhiều người cặp cùng [agent](./Agent.md) trong suốt một [phiên](./Session.md): xem lại, chỉnh hướng hoặc cộng tác theo thời gian thực (có con người trong vòng lặp). Con người có mặt và tham gia, không chỉ đứng gác từng hành động.

Đối lập là làm việc kiểu [AFK](./AFK.md), khi agent chạy không ai trông và bạn đánh giá kết quả sau đó. Có con người trong vòng lặp nghĩa là bắt vấn đề khi chúng còn rẻ: bạn thấy agent với lấy nhầm tệp, hiểu sai yêu cầu, hoặc bắt đầu đi vào ngõ cụt, và bạn chỉnh hướng nó bằng một câu, thay vì phát hiện hai mươi phút làm việc tự tin dựng trên sai lầm đó. Agent không biết một cách đáng tin khi nào mình lệch hướng; để một mình, nó thường đi tiếp thay vì dừng lại hỏi.

Kiểu nào phù hợp thì tuỳ việc. Việc đã mô tả rõ, rủi ro thấp, dễ kiểm chứng thì hợp với AFK. Việc mơ hồ, không đảo ngược được, hoặc việc mà bạn khó xem lại kết quả hoàn chỉnh, như một lần migration schema, một quyết định thiết kế khó, bất cứ thứ gì đụng tới production, thì hợp với việc ở lại trong vòng lặp. Về cơ bản, phán đoán ở đây là: một bước đi sai đắt tới đâu, và bạn sẽ bắt được nó muộn tới mức nào?

Có những việc tự bản chất là trong vòng lặp, vì phản ứng của bạn chính là đầu vào. [Grilling](./Grilling.md) chỉ hiệu quả khi bạn có mặt để trả lời câu hỏi; [làm bản mẫu](./Prototyping.md) chỉ hiệu quả khi bạn có mặt để phản ứng với sản phẩm.

Ở lại trong vòng lặp tốn sự chú ý của bạn, và đó là tài nguyên khan hiếm. Một phần của việc dùng agent giỏi hơn là đưa thêm nhiều việc ra khỏi vòng lặp một cách an toàn: bằng kế hoạch, [kiểm tra tự động](./Automated%20check.md), và [review của con người](./Human%20review.md) ở cuối thay cho giám sát từ đầu tới cuối. Một [nhà máy phần mềm](./Software%20factory.md) đi xa hơn bằng cách khởi động phiên từ các trigger, nên ngay cả việc bắt đầu công việc cũng không cần tới bạn.

_Usage:_

"Chạy cái này AFK qua đêm nhé?"

"Không, đây là migration schema, giữ con người trong vòng lặp. Mình muốn thấy từng bước và chỉnh hướng nếu nó chọn nhầm cột để backfill."

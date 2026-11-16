---
name: Bộ đệm tiền tố
description: "Kho lưu phía nhà cung cấp, giúp các yêu cầu liên tiếp không phải xử lý lại phần đầu chung và tính các token đó với giá thấp hơn."
---

Kho lưu phía [nhà cung cấp](./Model%20provider.md), giúp các [yêu cầu tới nhà cung cấp mô hình](./Model%20provider%20request.md) liên tiếp không phải xử lý lại phần đầu (tiền tố) chung. Khi phần đầu của một yêu cầu khớp với phần đầu của một yêu cầu gần đây, tức là cùng [system prompt](./System%20prompt.md), cùng lịch sử tới một điểm nào đó, nhà cung cấp dùng lại công việc đã làm và tính các [token](./Token.md) đó như [token đã cache](./Cache%20tokens.md) với giá thấp hơn nhiều.

Bộ đệm có lợi vì phiên chỉ lớn lên bằng cách nối thêm vào cuối. Mỗi yêu cầu gửi lại toàn bộ lịch sử làm [token đầu vào](./Input%20tokens.md) (xem mục đó để biết lý do), và trong một [phiên](./Session.md) bình thường, lịch sử chỉ thay đổi ở cuối: mỗi yêu cầu là yêu cầu trước cộng thêm vài tin nhắn mới. Nhà cung cấp xử lý phần đầu chung dài đó một lần, lưu kết quả, rồi tiếp tục từ chỗ tiền tố kết thúc. Không có bộ đệm, một phiên 50 [lượt](./Turn.md) sẽ phải trả tiền xử lý lại lượt một tới năm mươi lần.

Bộ đệm cũng hết hạn. Một mục được giữ ấm bao lâu thì tuỳ nhà cung cấp mô hình, thường là vài phút chứ không phải vài giờ. Để phiên nghỉ quá khoảng đó thì yêu cầu kế tiếp phải dựng lại tiền tố với giá đầy đủ một lần trước khi việc cache tiếp tục. Đây chủ yếu là mối quan tâm của người xây dựng [harness](./Harness.md). Với người dùng, tác động nhìn thấy được là các yêu cầu sau một quãng nghỉ dài tốn hơn các yêu cầu trước đó.

_Usage:_

"Sao hoá đơn lại vọt lên giữa phiên?"

"Harness bắt đầu chèn giờ hiện tại vào system prompt ở mỗi lượt. Bộ đệm tiền tố gãy ngay tại token đầu tiên bị đổi, nên mọi yêu cầu sau đó đều bị tính nguyên giá."

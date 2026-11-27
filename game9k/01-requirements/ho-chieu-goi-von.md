# Hộ chiếu gọi vốn Game9K

> **Bản nháp, chưa qua cổng P01.** Agent viết ngày 2026-11-27 theo yêu cầu của
> chủ dự án: chuyển nội dung của `../sources/kien-truc-kvu-kau.md` sang hình ảnh
> hộ chiếu và bỏ phần so sánh với trái phiếu chính phủ.
>
> Chủ dự án chưa chọn hướng Launchpad KVU–KAU (nói ngày 2026-11-27). Vì vậy
> các cửa vốn KVU và KAU dưới đây là điểm đến có thể có, chưa phải kế hoạch.
>
> Mọi con số trong tài liệu này lấy từ tài liệu nguồn, ghi theo mục của nó
> ("nguồn §2"). Chưa con số nào được kiểm lại bằng phép đo ở kho này.

## Ý tưởng

Chỉ số Hộ chiếu Henley xếp hạng hộ chiếu của các nước theo số điểm đến mà
người mang nó vào được không cần xin thị thực trước. Nó không nói nước nào
giàu hay đáng sống. Nó chỉ nói tấm hộ chiếu đó mở được bao nhiêu cửa.

Hộ chiếu gọi vốn làm điều đó cho một game. Mỗi phiên bản game được đo bằng dữ
liệu chơi thật. Mỗi phép đo đạt ngưỡng là một con dấu. Đủ dấu thì một cửa vốn
mở ra mà bên cấp vốn không phải thẩm định lại từ đầu. Hộ chiếu càng nhiều dấu
thì càng nhiều cửa mở.

| Hộ chiếu Henley       | Hộ chiếu gọi vốn Game9K                                           |
| --------------------- | ----------------------------------------------------------------- |
| Hộ chiếu của một nước | Hộ chiếu của một game                                             |
| Trang hộ chiếu        | Một phiên bản của game                                            |
| Dấu xuất nhập cảnh    | Một phép đo đạt ngưỡng trên phiên bản đó                          |
| Điểm đến              | Cửa vốn: một nguồn tiền studio có thể nhận                        |
| Miễn thị thực         | Cửa mở khi đủ dấu, không cần xét riêng                            |
| Cần thị thực          | Cửa chỉ mở sau một bước xét riêng: danh tính, hợp đồng, giấy phép |
| Điểm của hộ chiếu     | Số cửa vốn đang vào được miễn thị thực                            |
| Cập nhật hằng tháng   | Cập nhật mỗi khi một phiên bản được đo xong                       |
| Lịch sử nhiều năm     | Các trang cũ giữ nguyên, không sửa                                |

## Hộ chiếu gồm gì

**Đơn vị là phiên bản, không phải cả game.** Mỗi phiên bản có điểm chất lượng,
dữ liệu giờ chơi và phần vốn của riêng nó. Rủi ro của bản sau không kéo theo
bản trước (nguồn §2).

**Trang phiên bản** ghi số phiên bản và mã băm SHA-256 của gói game, tính theo
một cách cố định để ai cũng tính lại được, kèm liên kết tới bản trước (nguồn
§2, tầng 3).

**Các con dấu.** Ngưỡng dưới đây là ngưỡng trong tài liệu nguồn.

| Dấu                | Điều kiện                                                                                                                                                         | Nguồn      |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| Bản mới thật       | Gói thay đổi ít nhất 8 khối 4 KiB (khoảng 32 KiB) và thêm ít nhất 1 tệp nội dung. Bản vá nhỏ hơn là HOTFIX, không được dấu                                        | §2, tầng 3 |
| Có người chơi thật | Ít nhất 500 phiên chơi, thời lượng trung bình từ 180 giây                                                                                                         | §1, §2     |
| Ổn định            | Không có lỗi sập (crash = 0)                                                                                                                                      | §1         |
| Tốt hơn bản trước  | Ít nhất 50 lượt đấu mù A/B, mỗi bản được chơi ít nhất 90 giây; cận dưới khoảng tin cậy 95% trên 0,50; độ tin cậy đánh giá từ 0,85. Bản đầu tiên được miễn dấu này | §2, tầng 3 |
| Không bị bot thổi  | Tỉ lệ giờ chơi do bot không quá 8%                                                                                                                                | §3         |
| Có người kiểm      | Người duyệt bản phát hành; lấy mẫu hậu kiểm 0,5% bằng người thật                                                                                                  | §2, §3     |
| Giữ chân           | Chỉ số D7. Nguồn nêu tên chỉ số, không nêu ngưỡng                                                                                                                 | §1         |
| Đã giao hàng       | Biên bản giao vật phẩm khớp với đơn đã bán                                                                                                                        | §4         |

## Cửa vốn

Tài liệu nguồn mô tả hai nhóm cửa. Cột "Nhập cảnh" là cách agent xếp loại
theo hình ảnh hộ chiếu, không có trong nguồn.

| Cửa vốn                | Tiền từ ai         | Mở khi                                                                                   | Nhập cảnh                             |
| ---------------------- | ------------------ | ---------------------------------------------------------------------------------------- | ------------------------------------- |
| Đặt trước, đợt A (30%) | Người mua vật phẩm | Chiến dịch đặt trước đóng                                                                | Miễn thị thực                         |
| Đặt trước, đợt B (70%) | Người mua vật phẩm | Có dấu "Đã giao hàng"                                                                    | Miễn thị thực                         |
| Vốn theo mốc M0 (30%)  | Người mua token    | Các dấu là điều kiện trước khi giải ngân (nguồn §1). Nguồn không ghi mốc nào cần dấu nào | Cần thị thực: xem "Thị thực" bên dưới |
| Vốn theo mốc M1 (40%)  | Người mua token    | Như trên                                                                                 | Cần thị thực                          |
| Vốn theo mốc M2 (30%)  | Người mua token    | Như trên                                                                                 | Cần thị thực                          |

Tỉ lệ 30/40/30 của ba mốc và 30/70 của hai đợt lấy từ nguồn §2 và §4.

**Nơi cấp dấu không phải là cửa vốn.** Dịch vụ chơi thử trả phí cho studio
(hướng "Playtest B2B" trong issue #10) là nơi một phiên bản được đo và nhận
dấu. Vì thế hộ chiếu dùng được cho cả hai hướng đang cân nhắc: hướng chơi thử
tạo ra dấu, hướng launchpad dùng dấu để mở cửa.

**Cửa khác có thể thêm.** Đây là đề xuất của agent, không có trong nguồn: hợp
đồng phát hành trên cổng Game9K, và nhà phát hành hay quỹ bên ngoài đọc hộ
chiếu thay cho một phần thẩm định của họ.

### Quy tắc của cửa đặt trước

Nguồn §4 gọi cơ chế này là KAU.

- Studio công bố toàn bộ thang giá trước khi mở bán. Mọi người mua đặt cọc
  theo giá cao nhất.
- Mỗi khi tổng lượng mua lấp đầy một bậc, giá hạ cho mọi người đã mua, kể cả
  người mua đầu tiên. Phần chênh được trả lại khi chiến dịch đóng.
- Studio nhận 30% "ngay" để làm bản tiếp theo. Nguồn không ghi thời điểm;
  bản nháp này hiểu là khi chiến dịch đóng, vì lúc đó giá mới chốt. 70% còn lại bị giữ cho đến khi
  giao hàng xong.
- Để không ai có lãi khi tự mua thêm cho đủ bậc, mỗi ví bị giới hạn số gói,
  và mức giảm giữa hai bậc liền nhau phải thoả:
  `(W − 1) × (giá bậc trước − giá bậc sau) < giá bậc sau`, với `W` là trần số
  gói mỗi ví. Nguồn dùng `W = 5` và thang 25,00 → 22,00 → 19,00 → 16,50 USD.
- Hoa hồng cho người giới thiệu là một tỉ lệ cố định, không tăng theo bậc, và
  không được tự giới thiệu mình.

Ví dụ trong nguồn: 660 gói, giá chốt 16,50 USD, studio thực nhận 9.817,50 USD
sau phí nền tảng 5% và hoa hồng 8% trên 400 đơn. Agent đã tính lại các phép
cộng trừ này và chúng khớp. Đây là ví dụ số học, không phải số liệu bán hàng.

### Quy tắc của cửa vốn theo mốc

Nguồn §2 gọi cơ chế này là KVU.

- Tiền của người mua nằm trong một tài khoản khoá. Studio chỉ nhận từng phần
  khi phiên bản đạt mốc.
- Nếu dự án đứng yên quá 60–90 ngày, người mua rút lại phần của mình trong số
  tiền còn lại, không mất phí. Số tiền nhận về có thể ít hơn số đã bỏ vào.
- Bản vá HOTFIX không được mở mốc.
- Quyền sửa hợp đồng cần 4 trên 7 chữ ký và chờ 48 giờ, rồi bị khoá vĩnh viễn
  sau 90 ngày, để ban điều hành không nới ngưỡng về sau.

Phần toán của đường giá và các tham số cụ thể nằm ở nguồn §2, tầng 1. Tài
liệu này không chép lại, vì chúng chỉ cần khi hướng này được chọn.

### Thị thực

Một số cửa không thể chỉ mở bằng dấu. Nguồn §4 nêu các ràng buộc pháp lý:

- Tại Việt Nam, tài sản mã hoá chỉ được chào bán cho nhà đầu tư nước ngoài
  qua tổ chức được cấp phép. Vì vậy cửa vốn theo mốc phải chặn người dùng ở
  Việt Nam và xác minh danh tính.
- Gói vật phẩm bán cho người chơi ở Việt Nam phải thu bằng tiền pháp định qua
  cổng thanh toán hợp lệ, công bố hạn giao hàng và cách hoàn cọc.
- Tại Hoa Kỳ, hàng đặt trước phải giao đúng hạn đã hứa, và phải hoàn tiền mặt
  khi huỷ đơn.
- Nguồn đề nghị tách hai pháp nhân: một cho cổng game và đặt trước, một ở
  nước ngoài cho việc phát hành token.

Phần này chưa được một luật sư xem. Nó là danh sách việc phải hỏi, không phải
kết luận pháp lý.

## Chỉ số hộ chiếu

Điểm của một game là số cửa vốn mà phiên bản hiện hành của nó vào được miễn
thị thực. Các game được xếp hạng theo điểm; bằng điểm thì đồng hạng, như
Henley. Mỗi game có lịch sử điểm theo từng phiên bản.

Chỉ số đo số cửa mở được. Nó không đo game hay hay dở, không đo giá trị của
một khoản đầu tư, và không hứa lợi nhuận.

## Ai cấp dấu, và ai kiểm người cấp

- Hiện tại trong đặc tả: hai bên đo độc lập cùng ký, lấy kết quả thấp hơn,
  cộng với lấy mẫu 0,5% do người thật kiểm (nguồn §3).
- Điểm và phiếu bầu được băm và ghi lên chuỗi mỗi giờ, để cổng game không sửa
  được điểm về sau (nguồn §2, tầng 3).
- Về sau: bằng chứng không tiết lộ (ZK) cho phép giữ kín cách chấm điểm mà
  vẫn chứng minh nó được tính đúng. Nguồn §3 ước lượng chi phí vài xu mỗi
  giờ, và ghi rõ đặc tả hiện tại chưa dùng ZK.
- ZK chỉ chứng minh công thức chạy đúng trên dữ liệu đã thu. Nó không phát
  hiện được dữ liệu giả từ người thật ngồi bấm thuê. Vì thế bước người kiểm
  không bỏ được.

## Hộ chiếu không phải là gì

- **Không phải lời hứa hoàn vốn.** Khi một dự án đứng yên, người mua chỉ rút
  được phần của mình trong số tiền còn lại.
- **Không nói gì về giá sau này** của bất cứ thứ gì được mua qua một cửa vốn.
- **Không thay cho kiểm toán.** Nguồn §3 ghi mã hợp đồng chưa viết xong, chưa
  kiểm toán và chưa triển khai.
- **Hai giả thuyết còn cần dữ liệu** (nguồn §2, tầng 2): cày giờ chơi bằng bot
  có thật sự lỗ không, và người mua có thật sự định giá từng phiên bản riêng
  hay chỉ theo tên studio.

## Đã bỏ gì so với tài liệu nguồn

- Toàn bộ phần đối chiếu với trái phiếu chính phủ (nguồn §3, nửa đầu), và
  cách gọi mỗi phiên bản là một "trái phiếu".
- Bộ số "Game Portal 2026", vì chưa có nguồn (issue #27).
- Toán của đường giá token (nguồn §2, tầng 1), giữ ở nguồn.

Tài liệu nguồn không bị sửa: `game9k/sources/` giữ nguyên văn theo ADR 0011.

## Đổi tên

| Trong tài liệu nguồn                    | Trong hộ chiếu   |
| --------------------------------------- | ---------------- |
| Trái phiếu phiên bản (Version Bond)     | Trang phiên bản  |
| Cổng, ngưỡng nghiệm thu                 | Dấu              |
| Mốc giải ngân M0–M2, Tranche A và B     | Cửa vốn          |
| Giải ngân tự động khi có chứng thực     | Miễn thị thực    |
| Xác minh danh tính, pháp nhân phát hành | Thị thực         |
| Sổ cái phiên bản                        | Lịch sử hộ chiếu |

Hai bộ tham số trong nguồn mang tên `VBOND-LV` và `VGBC-4T`. Nếu hướng vốn
theo mốc được chọn, chúng cần tên mới không có chữ "bond".

## Câu hỏi còn mở cho chủ dự án

1. Hộ chiếu cấp cho game hay cho studio? Nguồn lấy phiên bản làm đơn vị, nên
   bản nháp này cấp cho game, mỗi phiên bản một trang.
2. Bản đầu tiên có những cửa vốn nào, khi hướng KVU–KAU chưa được chọn?
3. Dấu nào mở cửa nào? Nguồn không ghi mốc M0, M1, M2 mỗi mốc cần dấu gì.
4. Một chiến dịch đặt trước có cần dấu nào trước khi mở không? Nguồn không
   đặt điều kiện.
5. Ngưỡng của dấu "Giữ chân" là bao nhiêu?
6. Bảng xếp hạng công khai, hay chỉ cho bên cấp vốn xem?

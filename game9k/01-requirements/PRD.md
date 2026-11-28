# Bản yêu cầu sản phẩm: Game9K Playtest, bản đầu

> **Đã được chủ dự án duyệt ở cổng P01 ngày 2026-11-28** (pull request #44).
> Agent viết ngày 2026-11-28 theo yêu cầu "viết PRD" của chủ dự án, cho issue
> #28. Lõi kinh doanh theo ADR 0012: dịch vụ chơi thử trả phí cho studio.
>
> Duyệt nghĩa là bản này được dùng làm gốc cho pha P02. Các giả định ở mục 3
> vẫn là giả định, mỗi cái có mã `GĐ-n` và được nhắc lại ở chỗ nó chi phối. Các
> câu hỏi ở mục 11 vẫn chưa có trả lời. Chủ dự án đổi giả định nào thì phần phụ
> thuộc đổi theo, bằng một pull request sửa bản này.
>
> Chưa điều gì trong bản này được kiểm bằng khách hàng thật.

## 1. Tóm tắt

Một studio gửi một phiên bản game web. Một nhóm nhỏ người chơi thử chơi nó
ngay trong trình duyệt. Game9K ghi lại số đo của từng phiên chơi, gom nhận
xét, viết một báo cáo có bằng chứng và gửi cho studio. Studio trả một khoản
phí cố định cho việc đó.

Bản đầu không phải sản phẩm tự phục vụ. Nó là phần mềm tối thiểu để chạy **đợt
thử có thu tiền** đã mô tả trong `../research/chon-huong-kinh-doanh.md`: năm
người chơi thử, ba người làm studio, và câu hỏi cần trả lời là có ai chịu trả
tiền cho một báo cáo chơi thử không.

## 2. Bài toán

**Của studio.** Làm ra một game trình duyệt đơn giản nay rất rẻ: một lần chạy
mô hình tốn 0,006–0,254 USD [1]. Thứ khó có là bằng chứng rằng người thật chơi
game đó ra sao, trước khi tốn tiền quảng cáo. Mốc thị trường cho bằng chứng đó
là từ 69 USD mỗi người chơi ở PlaytestCloud [2].

**Của Game9K.** ADR 0012 ghi rõ lựa chọn lõi dựa trên lập luận, chưa dựa trên
nhu cầu đã đo. Chưa ai được hỏi có trả tiền không. Bản đầu tồn tại để có câu
trả lời đó với chi phí thấp nhất.

**Thứ đã có và chưa có.** `../research/du-cong-nghe-chua.md` kiểm kê mười một
mảnh lõi này cần. Hai mảnh có bản nháp, một mảnh có một phần, tám mảnh chưa có
[3]. Bản đầu chỉ xây các mảnh mà đợt thử không làm tay được.

## 3. Giả định

Đây là giả định của agent, không phải quyết định. ADR 0012 để ngỏ các điểm
này.

| Mã   | Giả định                                                                                  | Vì sao chọn                                                                                              | Nếu sai thì đổi gì                                            |
| ---- | ----------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| GĐ-1 | **Studio làm ra game là bên trả tiền**                                                    | Bình luận của chủ dự án ở issue #10 mô tả "thu phí dịch vụ B2B từ Studio" [4]                            | Vai "bên đọc hộ chiếu" thành vai chính; US-06 và mục 8 đổi    |
| GĐ-2 | **Phí cố định cho mỗi lượt chơi thử, không phụ thuộc kết quả**                            | Studio trả tiền cho bên chấm game của chính mình; phí theo kết quả tạo động cơ viết báo cáo dễ nghe [5]  | US-07 đổi                                                     |
| GĐ-3 | **Bản đầu chạy với khoảng năm người chơi thử quen biết và ba người làm studio**           | Cỡ của đợt thử đã đề xuất [6]. Chưa biết chủ dự án có sẵn những người này không                          | Thêm việc tuyển người vào phạm vi; lùi ngày                   |
| GĐ-4 | **Chỉ nhận game web chạy trong trình duyệt, studio gửi dưới dạng một gói tệp**            | Game9K tự chạy gói thì mới chèn được phần đo và bắt lỗi. Starter Kit đã có định dạng gói bản nháp [3]    | Nếu studio chỉ đưa địa chỉ web: họ phải tự gắn SDK; US-01 đổi |
| GĐ-5 | **Bản yêu cầu này không phụ thuộc vào nơi chứa mã**                                       | Issue #29 chưa quyết                                                                                     | Không đổi gì ở đây; chặn pha P04                              |
| GĐ-6 | **Tiền thu của studio và tiền thưởng người chơi thử được chuyển tay, ngoài hệ thống**     | Đợt thử làm tay được [3]. Trả bằng USDC hay USDT như bình luận ở issue #10 đề xuất cần xem pháp lý trước | Thêm phần thanh toán vào phạm vi                              |
| GĐ-7 | **Người chơi thử từ 18 tuổi, đồng ý bằng văn bản về dữ liệu và về việc giữ kín bản game** | Bản chưa phát hành bị lộ là rủi ro của studio [5]                                                        | Cần quy trình đồng ý của phụ huynh; chưa lường                |
| GĐ-8 | **Agent chơi thử là phần thử nghiệm của bản đầu, chưa phải thứ đem bán**                  | Chưa biết studio có coi báo cáo của agent ngang báo cáo của người không [1]                              | Nếu bỏ: đợt thử chỉ trả lời "có ai trả tiền không"            |
| GĐ-9 | **Giao diện và báo cáo bằng tiếng Việt, có bản tiếng Anh cho báo cáo**                    | Chủ dự án làm việc bằng tiếng Việt. Chưa biết studio đầu tiên ở đâu                                      | Đổi ngôn ngữ mặc định                                         |

## 4. Người dùng

| Vai                  | Họ là ai                                           | Họ cần gì ở bản đầu                                                              |
| -------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------- |
| **Studio**           | Người làm game, gửi một phiên bản để được chơi thử | Gửi phiên bản, biết nó đang ở bước nào, nhận báo cáo có bằng chứng               |
| **Người chơi thử**   | Người chơi game và cho nhận xét, được trả thưởng   | Vào chơi bằng một đường dẫn, không cài gì, biết mình phải làm gì và được trả gì  |
| **Người vận hành**   | Người của Game9K. Ở bản đầu là chủ dự án           | Mở lượt chơi thử, mời người, xem số đo, duyệt báo cáo, ghi sổ thu chi            |
| **Bên đọc hộ chiếu** | Cổng game, nhà phát hành, quỹ                      | Bản đầu chưa phục vụ vai này. Họ chỉ đọc được trang phiên bản nếu studio chia sẻ |

## 5. Thuật ngữ

| Thuật ngữ           | Nghĩa trong tài liệu này                                                                   |
| ------------------- | ------------------------------------------------------------------------------------------ |
| **Phiên bản**       | Một gói game cụ thể của studio, định danh bằng mã băm của gói. Sửa gói là ra phiên bản mới |
| **Lượt chơi thử**   | Một lần studio đặt Game9K chơi thử một phiên bản. Gồm nhiều phiên chơi và một báo cáo      |
| **Phiên chơi**      | Một lần một người chơi thử (hoặc agent) chơi phiên bản đó, từ lúc mở đến lúc đóng          |
| **Số đo**           | Thứ hệ thống tự ghi trong một phiên chơi: thời lượng, lỗi, mốc tiến trình                  |
| **Nhận xét**        | Thứ người chơi thử viết hoặc nói sau phiên chơi                                            |
| **Phát hiện**       | Một ý trong báo cáo, luôn dẫn về các phiên chơi làm bằng chứng                             |
| **Báo cáo**         | Tài liệu gửi studio cho một lượt chơi thử                                                  |
| **Trang phiên bản** | Trang ghi số đo của một phiên bản; là một trang của hộ chiếu trong `ho-chieu-goi-von.md`   |

## 6. Phạm vi của bản đầu

**Trong phạm vi:** một lượt chơi thử đi trọn từ lúc studio gửi phiên bản đến
lúc studio nhận báo cáo, với người chơi thử là người thật.

**Làm tay, ngoài hệ thống (GĐ-6):** thu phí của studio, trả thưởng người chơi
thử, tuyển người chơi thử, quay màn hình (người chơi tự quay nếu được yêu
cầu).

**Ngoài phạm vi:**

- Token, đặt trước, các cửa vốn và mọi thứ thuộc launchpad (ADR 0012).
- Trả thưởng bằng tiền mã hoá.
- Studio tự đăng ký, tự thanh toán.
- Chợ người chơi thử, tuyển người lạ.
- Game cài đặt trên điện thoại hay máy tính.
- Phát hành game, giải đấu, cửa hàng: giai đoạn hai trong bình luận ở issue
  #10 [4].
- Con dấu của hộ chiếu. Ngưỡng trong tài liệu nguồn là 500 phiên chơi [7]; đợt
  thử có khoảng năm người chơi nên không dấu nào cấp được. Trang phiên bản chỉ
  ghi số đo.

## 7. Yêu cầu chức năng

Xếp theo MoSCoW. "Phải có" là thứ thiếu thì đợt thử không chạy được.

### Phải có

| Mã    | Yêu cầu                                                                                                                                                         | Mảnh [3] |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-01 | Người vận hành hoặc studio gửi một gói game web. Hệ thống tính mã băm của gói, tạo một phiên bản, và không cho sửa phiên bản đó về sau                          | 2        |
| FR-02 | Phiên bản chạy trong trình duyệt, không cần cài gì, trong một khung cô lập: game không đọc được cookie, bộ nhớ hay trang của cổng                               | 1        |
| FR-03 | Người vận hành mở một lượt chơi thử cho một phiên bản, kèm chỉ dẫn cho người chơi và danh sách câu hỏi sau phiên                                                | —        |
| FR-04 | Người chơi thử vào bằng một đường dẫn riêng. Trước khi chơi họ đọc và đồng ý điều khoản về dữ liệu và về việc giữ kín bản game (GĐ-7)                           | 10       |
| FR-05 | Mỗi phiên chơi được ghi: giờ bắt đầu, giờ kết thúc, **thời lượng tính lúc thẻ đang hiện**, trình duyệt và cỡ màn hình, mốc tiến trình game gửi lên              | 3        |
| FR-06 | Lỗi của game trong phiên chơi được ghi vào phiên đó: lỗi không bắt, lời hứa bị từ chối, và gói không tải được                                                   | 4        |
| FR-07 | Sau phiên chơi, người chơi thử trả lời các câu hỏi của lượt đó                                                                                                  | —        |
| FR-08 | Số đo và nhận xét được lưu bền: khởi động lại máy chủ không làm mất                                                                                             | 7        |
| FR-09 | Hệ thống soạn bản nháp báo cáo từ số đo và nhận xét. Mỗi phát hiện dẫn về các phiên chơi làm bằng chứng. Mỗi con số trong báo cáo tính lại được từ số đo đã lưu | 8        |
| FR-10 | Người vận hành đọc, sửa và duyệt báo cáo. Báo cáo chưa duyệt thì studio không xem được                                                                          | 8        |
| FR-11 | Studio xem báo cáo đã duyệt qua một đường dẫn riêng                                                                                                             | —        |
| FR-12 | Người vận hành ghi sổ cho mỗi lượt chơi thử: phí thu của studio và thưởng trả cho từng người chơi. Tiền thật đi ngoài hệ thống (GĐ-6)                           | 9        |

### Nên có

| Mã    | Yêu cầu                                                                                                                                            | Mảnh [3] |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| FR-13 | Một agent chơi một phiên bản và để lại một phiên chơi có cùng loại số đo như người. Phiên đó ghi rõ là của agent (GĐ-8)                            | 5        |
| FR-14 | Mỗi phiên chơi của agent và mỗi lần soạn báo cáo ghi số tiền mô hình đã tốn. Mỗi lượt có một trần tiền; chạm trần thì dừng                         | 5, 8     |
| FR-15 | Trang phiên bản: một trang ghi mã băm, ngày đo và số đo tổng của phiên bản. Chỉ ai có đường dẫn mới xem được, và studio quyết có chia sẻ hay không | —        |
| FR-16 | Studio và người chơi thử đăng nhập bằng tài khoản thay cho đường dẫn riêng                                                                         | 7        |

### Có thì tốt

| Mã    | Yêu cầu                                                                        | Mảnh [3] |
| ----- | ------------------------------------------------------------------------------ | -------- |
| FR-17 | So hai phiên bản của cùng một game trên cùng bộ số đo                          | —        |
| FR-18 | Quay màn hình và giọng nói người chơi thử ngay trong trình duyệt, có sự đồng ý | 6        |
| FR-19 | Báo cáo có bản tiếng Anh (GĐ-9)                                                | 8        |

### Chưa làm ở bản này

Mọi thứ ở mục "Ngoài phạm vi" của mục 6, và một bản dùng thử miễn phí có giới
hạn cho studio lạ.

## 8. User story và kịch bản

Các con số trong kịch bản là ví dụ để kịch bản cụ thể, không phải số liệu.

### US-01. Studio gửi một phiên bản (FR-01, FR-02)

Là một studio, tôi muốn gửi gói game web của mình và biết chắc bản được chơi
thử đúng là bản tôi gửi.

```gherkin
Scenario: Gói hợp lệ tạo ra một phiên bản không sửa được
  Given studio "Sao Mai" có game "Đua Thuyền"
  When người vận hành gửi gói "dua-thuyen-0.3.zip" có tệp "index.html" ở gốc
  Then hệ thống tạo một phiên bản và hiện mã băm của gói
  And gửi lại đúng gói đó lần nữa cho ra cùng mã băm
  And không có thao tác nào cho phép thay tệp bên trong phiên bản đã tạo

Scenario: Gói không chạy được thì bị từ chối kèm lý do
  When người vận hành gửi một gói không có tệp "index.html" ở gốc
  Then hệ thống không tạo phiên bản
  And báo đúng lý do bằng lời đọc hiểu được

Scenario: Game không chạm được vào cổng
  Given phiên bản đang chạy trong trang chơi thử
  When mã của game thử đọc cookie hoặc bộ nhớ của cổng Game9K
  Then nó không đọc được gì
```

### US-02. Người chơi thử vào chơi (FR-04, FR-07)

Là một người chơi thử, tôi muốn bấm một đường dẫn là chơi được, và biết rõ
mình phải làm gì.

```gherkin
Scenario: Vào chơi bằng đường dẫn, không cài gì
  Given lượt chơi thử "Đua Thuyền 0.3" đang mở và chị Lan có đường dẫn mời
  When chị Lan mở đường dẫn trên trình duyệt của máy tính
  Then chị thấy chỉ dẫn của lượt chơi thử và điều khoản về dữ liệu, giữ kín
  And chị chỉ vào được game sau khi bấm đồng ý
  And game chạy trong trang, không cần tải hay cài thêm gì

Scenario: Không đồng ý thì không có phiên chơi nào
  When chị Lan đóng trang mà không bấm đồng ý
  Then không phiên chơi nào được ghi cho chị

Scenario: Trả lời câu hỏi sau khi chơi
  Given chị Lan vừa kết thúc phiên chơi
  When chị trả lời các câu hỏi của lượt chơi thử và bấm gửi
  Then nhận xét của chị được gắn vào đúng phiên chơi đó
```

### US-03. Lỗi của game được ghi lại (FR-06)

Là một studio, tôi muốn biết game sập ở đâu trên máy người chơi, kể cả khi
người chơi không kể lại.

```gherkin
Scenario: Lỗi không bắt được ghi vào phiên chơi
  Given anh Minh đang trong một phiên chơi
  When mã của game ném ra một lỗi không ai bắt
  Then phiên chơi của anh Minh có thêm một bản ghi lỗi
  And bản ghi có thông điệp lỗi và thời điểm tính từ lúc bắt đầu phiên

Scenario: Gói không tải được cũng là lỗi
  When trang chơi thử mở nhưng tệp chính của game không tải được
  Then phiên chơi được ghi với trạng thái "không khởi động được"
  And không được tính là một phiên chơi không lỗi
```

### US-04. Thời lượng chỉ tính lúc đang chơi thật (FR-05)

Là một studio, tôi muốn số "thời lượng chơi" phản ánh lúc người chơi thật sự
nhìn vào game.

```gherkin
Scenario: Chuyển sang thẻ khác thì đồng hồ dừng
  Given chị Lan đã chơi được 2 phút
  When chị chuyển sang thẻ khác trong 10 phút rồi quay lại chơi thêm 1 phút
  Then thời lượng của phiên chơi được ghi là khoảng 3 phút
  And giờ bắt đầu và giờ kết thúc vẫn được ghi riêng
```

### US-05. Người vận hành duyệt báo cáo (FR-09, FR-10)

Là người vận hành, tôi muốn đọc và sửa bản nháp trước khi studio thấy nó, vì
bản nháp do mô hình soạn.

```gherkin
Scenario: Báo cáo chưa duyệt thì studio chưa xem được
  Given lượt chơi thử có 5 phiên chơi đã xong và hệ thống đã soạn bản nháp
  When studio mở đường dẫn báo cáo
  Then studio thấy trạng thái "đang soạn", không thấy nội dung

Scenario: Phát hiện không có bằng chứng thì không duyệt được
  Given bản nháp có một phát hiện không dẫn về phiên chơi nào
  When người vận hành bấm duyệt
  Then hệ thống từ chối và chỉ ra phát hiện đó

Scenario: Duyệt xong thì studio xem được
  When người vận hành duyệt báo cáo
  Then studio mở đường dẫn và đọc được báo cáo
  And báo cáo ghi ai đã duyệt và duyệt lúc nào
```

### US-06. Studio đọc báo cáo có bằng chứng (FR-09, FR-11)

Là một studio, tôi muốn mỗi kết luận trong báo cáo chỉ được về chỗ nó xảy ra,
để tôi tin và sửa được.

```gherkin
Scenario: Từ một phát hiện đi tới phiên chơi
  Given báo cáo có phát hiện "3 trên 5 người dừng ở màn 2"
  When studio bấm vào phát hiện đó
  Then studio thấy 3 phiên chơi liên quan, mỗi phiên có số đo và nhận xét

Scenario: Con số trong báo cáo khớp với số đo
  Given báo cáo ghi "thời lượng trung vị 4 phút"
  When tính lại trung vị từ thời lượng của các phiên chơi đã lưu
  Then kết quả bằng con số trong báo cáo

Scenario: Báo cáo nói rõ nó dựa trên bao nhiêu người
  Then đầu báo cáo ghi số phiên chơi và số người chơi thử
  And ghi rằng với cỡ mẫu này các con số là quan sát, không phải thống kê
```

### US-07. Phí không đổi theo kết quả (GĐ-2, FR-12)

Là người vận hành, tôi muốn phí của một lượt chơi thử được chốt trước, để kết
quả tốt hay xấu không đổi được nó.

```gherkin
Scenario: Báo cáo xấu không làm đổi phí
  Given lượt chơi thử được mở với phí đã ghi vào sổ
  When báo cáo được duyệt, với kết luận là game có nhiều lỗi
  Then phí trong sổ vẫn là con số ghi lúc mở
  And không thao tác nào cho phép sửa phí sau khi phiên chơi đầu tiên bắt đầu
```

### US-08. Agent chơi thử, có ghi tiền (FR-13, FR-14; nên có)

Là người vận hành, tôi muốn cho một agent chơi cùng phiên bản đó và biết lượt
ấy tốn bao nhiêu, để so được với người.

```gherkin
Scenario: Phiên chơi của agent được đánh dấu và có giá
  When người vận hành cho agent chơi phiên bản "Đua Thuyền 0.3"
  Then một phiên chơi mới được ghi, đánh dấu là của agent
  And phiên đó có cùng loại số đo như phiên của người
  And phiên đó ghi số tiền mô hình đã tốn

Scenario: Chạm trần tiền thì dừng
  Given lượt chơi thử có trần tiền mô hình
  When tổng tiền mô hình của lượt đó chạm trần
  Then agent dừng và phiên chơi được ghi là "dừng vì hết ngân sách"

Scenario: Báo cáo không trộn người với agent
  Then báo cáo tách phát hiện từ phiên của người và từ phiên của agent
```

### US-09. Trang phiên bản (FR-15; nên có)

Là một studio, tôi muốn có một trang ghi số đo của phiên bản để đưa cho người
khác xem khi tôi muốn.

```gherkin
Scenario: Chỉ ai có đường dẫn mới xem được
  Given báo cáo của phiên bản "Đua Thuyền 0.3" đã được duyệt
  When studio bật chia sẻ trang phiên bản
  Then trang hiện mã băm, ngày đo, số phiên chơi và các số đo tổng
  And trang ghi rõ số đo do Game9K thực hiện theo đơn đặt của studio
  And trang không hiện nhận xét riêng hay danh tính người chơi thử

Scenario: Studio tắt chia sẻ
  When studio tắt chia sẻ
  Then đường dẫn cũ không còn mở được trang
```

### US-10. Người vận hành mở và theo dõi một lượt chơi thử (FR-03, FR-08, FR-12)

Là người vận hành, tôi muốn mở một lượt chơi thử, mời người và thấy nó đang
tới đâu, mà không sợ mất dữ liệu.

```gherkin
Scenario: Mở một lượt chơi thử
  Given phiên bản "Đua Thuyền 0.3" đã được tạo
  When người vận hành mở một lượt chơi thử với chỉ dẫn, câu hỏi và phí
  Then hệ thống tạo đường dẫn mời riêng cho từng người chơi thử
  And người vận hành thấy mỗi người đã mở, đã chơi xong hay chưa

Scenario: Khởi động lại không làm mất số đo
  Given 3 phiên chơi đã xong
  When máy chủ khởi động lại
  Then cả 3 phiên chơi vẫn còn đủ số đo và nhận xét

Scenario: Sổ thu chi của một lượt
  When người vận hành ghi thưởng đã trả cho từng người chơi thử
  Then sổ của lượt đó hiện phí thu, tổng thưởng và phần chênh
```

## 9. Yêu cầu phi chức năng

Phần này chỉ nêu điều bản đầu buộc phải giữ. Chi tiết thuộc pha P05.

- **Cô lập.** Game của studio là mã lạ. Nó chạy ở một nguồn khác với cổng và
  không có quyền của cổng (FR-02).
- **Giữ kín.** Bản game chưa phát hành chỉ tới được người có đường dẫn mời.
  Đường dẫn mời thu hồi được.
- **Dữ liệu cá nhân.** Chỉ thu thứ báo cáo cần. Người chơi thử biết thu gì
  trước khi chơi và yêu cầu xoá được. Chưa luật sư nào xem phần này.
- **Bền.** Số đo không mất khi máy chủ khởi động lại (FR-08).
- **Tiền mô hình có trần.** Mọi chỗ gọi mô hình ghi chi phí và có trần
  (FR-14). Cửa nào công khai mà làm phát sinh tiền mô hình thì có giới hạn
  lượt, và từ chối khi không đếm được lượt.
- **Không gắn vào một nhà cung cấp mô hình.** Đổi nhà cung cấp là đổi cấu
  hình. Chọn nhà cung cấp nào chưa quyết.
- **Người duyệt cuối.** Không báo cáo nào tới studio mà chưa qua người (FR-10).

## 10. Đợt thử đo cái gì

Bản đầu thành công khi nó trả lời được các câu hỏi dưới đây, kể cả khi câu trả
lời là "không".

| Câu hỏi                                                      | Cách đo                                                                                                           | Ngưỡng                                                                     |
| ------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Có ai trả tiền cho một báo cáo chơi thử không?               | Chào ba người làm studio một lượt chơi thử có thu phí                                                             | Không ai trả đồng nào thì mở lại ADR 0012, như chính ADR đó ghi            |
| Họ trả bao nhiêu?                                            | Ghi số tiền mỗi người chấp nhận. Mốc tham chiếu: từ 69 USD mỗi người chơi [2]                                     | Chưa đặt ngưỡng. Chỉ ghi lại                                               |
| Báo cáo của agent có được coi ngang báo cáo của người không? | Đưa hai báo cáo của cùng một phiên bản, không ghi nguồn, cho ba người làm studio; hỏi họ trả tiền cho bản nào [6] | Chưa đặt ngưỡng. Ba người là quá ít để kết luận; kết quả chỉ để định hướng |
| Một lượt agent chơi thử tốn bao nhiêu tiền mô hình?          | Số ghi ở FR-14. Ước lượng trước khi đo: 0,06–13,50 USD [1]                                                        | Chưa đặt ngưỡng. Chỉ ghi lại                                               |
| Từ lúc studio gửi phiên bản đến lúc có báo cáo mất bao lâu?  | Lấy từ dấu thời gian của hệ thống                                                                                 | Chưa đặt ngưỡng. Chỉ ghi lại                                               |
| Trả người chơi thử bao nhiêu thì họ làm cẩn thận?            | Ghi mức thưởng và tỉ lệ phiên chơi dùng được. Mốc tham chiếu: 5–9 USD cho một bài 15 phút ở PlaytestCloud [8]     | Chưa đặt ngưỡng. Chỉ ghi lại                                               |

Hai câu hỏi về agent cần FR-13 và FR-14. Nếu hai yêu cầu đó chưa xong, đợt thử
vẫn chạy được với người thật và trả lời được hai câu đầu.

## 11. Câu hỏi còn mở cho chủ dự án

1. **Ai trả tiền** ở bản đầu: studio (GĐ-1), hay bên phải chọn giữa nhiều
   game?
2. **Anh có sẵn** khoảng năm người chơi thử và ba người làm studio để hỏi
   không (GĐ-3)?
3. **Mã nằm ở đâu** (issue #29)? Không chặn bản này, nhưng chặn pha P04.
4. **Mức phí chào** ở đợt thử là bao nhiêu? Agent chưa đề xuất con số vì chưa
   có căn cứ ngoài mốc 69 USD mỗi người chơi [2].
5. **Trả thưởng bằng gì.** Bình luận ở issue #10 nêu USDC và USDT [4]. Bản
   này để ngoài phạm vi (GĐ-6) cho đến khi có người xem pháp lý.
6. **Game mẫu cho đợt thử** lấy ở đâu: bốn game của Starter Kit, game thật
   của ba studio, hay cả hai?
7. **Dữ liệu người chơi thử** giữ bao lâu và ai được xem?
8. **Bên đọc hộ chiếu** có phải là người dùng của bản sau không, và họ có trả
   tiền không?

## 12. Sau cổng này

- Mười user story ở mục 8 đã thành issue #45 đến #54, có nhãn `game9k` và
  `phase:P02`.
- Pha P02 dựng màn hình cho bốn luồng: gửi phiên bản, vào chơi, duyệt báo cáo,
  đọc báo cáo. Theo `../PROCESS.md`, màn hình được duyệt trước rồi mới có hợp
  đồng API. Pha này chưa bắt đầu.
- Nơi chạy của bản đầu chưa được chọn; xem issue #55.
- `ho-chieu-goi-von.md` vẫn là bản nháp. Trang phiên bản (FR-15) là phần của
  nó được đưa vào bản đầu.

## Nguồn

1. `../research/chon-huong-kinh-doanh.md`, mục "Bốn điều rút ra": chi phí
   0,006–0,254 USD mỗi lần chạy lấy từ aibrowsergames.io; ước lượng chi phí
   agent 0,06–13,50 USD dựa trên một giả định chưa đo về số token.
2. Games User Research, "Top remote playtest platforms for unmoderated
   testing", 2026-04-20.
   <https://gamesuserresearch.com/top-remote-playtest-platforms-for-unmoderated-testing/>
3. `../research/du-cong-nghe-chua.md`, bảng "Kiểm kê" và mục "Cần gì cho đợt
   thử đầu". Cột "Mảnh" ở mục 7 dùng số thứ tự của bảng đó.
4. Bình luận của chủ dự án ở issue #10, 2026-11-27. Các con số "Game Portal
   2026" trong bình luận đó chưa có nguồn (issue #27) và không được dùng ở
   đây.
5. `../research/quyen-loi-cac-ben.md`, mục "Chỗ quyền lợi kéo ngược nhau".
6. `../research/chon-huong-kinh-doanh.md`, mục "Thử rẻ trước khi chốt".
7. `ho-chieu-goi-von.md`, bảng "Các con dấu", dấu "Có người chơi thật"; số gốc
   ở `../sources/kien-truc-kvu-kau.md`.
8. Lilach Bullock, "Is PlaytestCloud Legit? How It Pays and What to Check
   (2026)", đọc ngày 2026-11-28; bài dẫn lại trang trợ giúp của PlaytestCloud.
   <https://www.lilachbullock.com/is-playtestcloud-legit/>

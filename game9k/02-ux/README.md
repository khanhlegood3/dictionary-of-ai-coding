# Pha P02: màn hình

Thư mục này chứa màn hình mẫu của Game9K Playtest. Mỗi tệp `.html` là một màn
hình tĩnh với dữ liệu mẫu. Chúng là tài liệu thiết kế để chủ dự án duyệt ở cổng
P02, không phải mã của ứng dụng
([ADR 0014](../../internal/adr/0014-game9k-screens-of-phase-p02-are-static-pages-in-the-hum-theme.md)).

## Bốn luồng

| Luồng trong bản yêu cầu | User story | Màn hình | Trạng thái |
| --- | --- | --- | --- |
| Gửi phiên bản | US-01 (#45) | `nop-phien-ban.html` | Đã dựng, chờ duyệt ở cổng |
| Vào chơi | US-02 (#46), US-03 (#47), US-04 (#48) | `choi-thu.html` | Đã dựng, chờ duyệt ở cổng |
| Người vận hành duyệt báo cáo | US-05 (#49) | `duyet-bao-cao.html` | Đã dựng, chờ duyệt ở cổng |
| Studio đọc báo cáo | US-06 (#50) | `bao-cao.html` | Đã dựng, chờ duyệt ở cổng |

Bốn luồng này là phạm vi bản yêu cầu đặt cho pha P02 (mục 12 của
`../01-requirements/PRD.md`). Bốn user story còn lại **chưa có màn hình**:
US-07 (#51, phí không đổi theo kết quả) và US-10 (#54, mở và theo dõi một lượt
chơi thử) thuộc nhóm "phải có"; US-08 (#52) và US-09 (#53) thuộc nhóm "nên có".

Bảng ở bản trước của tệp này ghi US-02 vào luồng gửi phiên bản. Điều đó sai:
theo bản yêu cầu, US-02 là "người chơi thử vào chơi".

Màn hình đọc báo cáo được dựng trước vì nó là thứ studio trả tiền để nhận, và
các màn hình khác phải sinh ra đúng dữ liệu mà nó hiển thị.

## Xem ở đâu

- Trên bản xem thử của pull request: `/game9k/02-ux/nop-phien-ban`,
  `/game9k/02-ux/choi-thu`, `/game9k/02-ux/duyet-bao-cao` và
  `/game9k/02-ux/bao-cao`.
- Trên máy: `npm run build`, rồi `npm run preview`, rồi mở
  <http://localhost:3000/game9k/02-ux/bao-cao>.

Mỗi trạng thái có địa chỉ riêng. Dải trên cùng của trang chuyển giữa chúng; dải
đó là công cụ của bản xem thử, không thuộc sản phẩm.

### Studio đọc báo cáo (`bao-cao`)

| Địa chỉ          | Trạng thái                                                            |
| ---------------- | --------------------------------------------------------------------- |
| `?state=full`    | Báo cáo đã duyệt (mặc định)                                           |
| `?state=draft`   | Báo cáo đang soạn. Đây là trạng thái trống: studio chưa thấy nội dung |
| `?state=loading` | Đang tải                                                              |
| `?state=error`   | Không tải được                                                        |

### Người vận hành duyệt báo cáo (`duyet-bao-cao`)

| Địa chỉ           | Trạng thái                                                                |
| ----------------- | ------------------------------------------------------------------------- |
| `?state=draft`    | Bản nháp có bốn phát hiện; phát hiện 4 chưa có bằng chứng (mặc định)      |
| `?state=refused`  | Sau khi bấm duyệt: hệ thống từ chối và chỉ ra phát hiện thiếu bằng chứng |
| `?state=approved` | Đã duyệt: ghi ai duyệt, lúc nào, và dẫn tới báo cáo của studio            |
| `?state=empty`    | Chưa có bản nháp vì chưa có phiên chơi nào xong                           |
| `?state=loading`  | Đang tải                                                                  |
| `?state=error`    | Không tải được                                                            |

Màn hình này bấm được. Ba kịch bản của US-05 thử như sau:

1. Bấm "Duyệt và gửi studio" khi phát hiện 4 chưa có bằng chứng: trang từ chối
   và chỉ ra phát hiện 4.
2. Chọn một phiên chơi cho phát hiện 4, hoặc bấm "Bỏ phát hiện 4" (có "Hoàn
   tác"): lời từ chối biến mất.
3. Bấm duyệt lần nữa: trang chuyển sang "Đã duyệt". Trang của studio lúc trước
   ghi "đang soạn", nay là báo cáo.

`duyet.js` đóng vai máy chủ cho ba bước đó. Không có gì được lưu; tải lại trang
là về dữ liệu mẫu.

Những thứ màn hình này **chưa vẽ**, vì bản yêu cầu chưa nói:

- thêm một phát hiện mới bằng tay;
- sửa hoặc rút lại một báo cáo đã duyệt;
- trạng thái "lưu thay đổi thất bại" (màn hình ghi "thay đổi được lưu ngay");
- sửa phần "Số đo chính". Phần đó do hệ thống tính từ số đo và người vận hành
  xem qua nút "Xem trước báo cáo".

### Người chơi thử vào chơi (`choi-thu`)

| Địa chỉ | Trạng thái |
| --- | --- |
| `?state=invite` | Lời mời: việc cần làm, hai điều khoản, ô đồng ý (mặc định) |
| `?state=playing` | Game chạy trong trang, có đồng hồ và nút kết thúc |
| `?state=questions` | Ba câu hỏi sau phiên, kèm ba số của phiên chơi |
| `?state=done` | Đã gửi câu trả lời |
| `?state=failed` | Game không khởi động được |
| `?state=closed` | Lượt chơi thử đã đóng, hoặc đường dẫn mời không còn dùng được |
| `?state=loading` | Đang tải |
| `?state=error` | Không tải được |

Màn hình này bấm được. Các kịch bản của US-02, US-03 và US-04 thử như sau:

1. Bấm "Đồng ý và vào chơi" khi chưa đánh dấu ô đồng ý: trang báo lỗi và không
   nạp game. Khung game chỉ được nạp sau khi đồng ý.
2. Đánh dấu rồi bấm: game mẫu chạy trong trang. Đồng hồ dừng khi chuyển sang thẻ
   khác và chạy tiếp khi quay lại.
3. Bấm "Gây lỗi thử" (công cụ của bản xem thử): game mẫu ném một lỗi, và phiên
   chơi ghi thêm một lỗi.
4. Bấm "Kết thúc phiên chơi": trang hỏi lại một lần, rồi hiện ba câu hỏi cùng
   thời lượng, mốc xa nhất và số lỗi của chính phiên vừa chơi.
5. Gửi khi câu đầu còn trống: trang báo lỗi ở câu đó. Trả lời rồi gửi: trang
   cảm ơn.

Game chạy trong một `iframe` có `sandbox="allow-scripts"`, không có
`allow-same-origin`. Vì vậy game ở một nguồn riêng và không đọc được cookie, bộ
nhớ hay trang của cổng (FR-02, kịch bản thứ ba của US-01). Game báo mốc và lỗi
cho trang bằng `postMessage`.

`choi-thu.js` đóng vai máy chủ và chứa game mẫu. Game mẫu ba màn do agent viết
để có thứ chạy trong khung; nó không phải game của studio nào.

Những thứ màn hình này **chưa vẽ** hoặc tự đặt ra, vì bản yêu cầu chưa nói:

- lời văn của hai điều khoản. Đây là chữ mẫu của agent, chưa ai có chuyên môn
  pháp lý đọc. Câu "từ 18 tuổi trở lên" lấy từ GĐ-7;
- ba câu hỏi sau phiên. FR-03 nói người vận hành đặt danh sách câu hỏi; màn
  hình vẽ ba câu mẫu và tự chọn câu đầu là bắt buộc;
- giới hạn 8 giây trước khi coi game là "không khởi động được";
- việc người chơi đóng thẻ giữa phiên, quay lại một đường dẫn đã dùng, hay
  chơi lần thứ hai;
- quay màn hình. Bản yêu cầu để việc đó ngoài hệ thống.

### Người vận hành gửi phiên bản (`nop-phien-ban`)

| Địa chỉ | Trạng thái |
| --- | --- |
| `?state=form` | Biểu mẫu trống và bảng hai phiên bản đã có (mặc định) |
| `?state=sending` | Đang đọc gói và tính mã băm |
| `?state=created` | Đã tạo phiên bản: hiện đủ mã băm, gói, game và studio |
| `?state=same` | Gói trùng với một phiên bản đã có: không tạo phiên bản mới |
| `?state=refused` | Gói bị từ chối, kèm lý do |
| `?state=empty` | Chưa có phiên bản nào |
| `?state=loading` | Đang tải |
| `?state=error` | Không tải được |

Màn hình này chạy thật với tệp trên máy người xem. Ba kịch bản của US-01 thử
như sau:

1. Chọn một tệp `.zip` có `index.html` ở gốc, ghi tên studio và tên game, bấm
   "Gửi gói": trang hiện mã băm SHA-256 của tệp và thêm một dòng vào bảng.
2. Gửi lại đúng tệp đó: trang báo gói đã là một phiên bản, hiện cùng mã băm, và
   không thêm dòng nào.
3. Gửi một tệp `.zip` không có `index.html` ở gốc, hoặc một tệp không phải
   `.zip`: trang từ chối và nói lý do.

`nop.js` đóng vai máy chủ. Nó tính mã băm bằng Web Crypto và đọc mục lục của tệp
`.zip` ngay trong trình duyệt. Tệp không được gửi đi đâu; tải lại trang là về
dữ liệu mẫu. Ba mã băm mẫu trong trang là chuỗi đặt ra, không phải mã băm của
gói nào.

Những thứ màn hình này **chưa vẽ** hoặc tự đặt ra, vì bản yêu cầu chưa nói:

- studio tự gửi gói. FR-01 cho phép cả studio lẫn người vận hành gửi; kịch bản
  của US-01 chỉ tả người vận hành, và màn hình theo kịch bản;
- giới hạn cỡ gói, và việc kiểm gì bên trong gói ngoài `index.html`;
- gói trùng thì không tạo phiên bản mới. Bản yêu cầu chỉ nói "cho ra cùng mã
  băm";
- thanh tiến độ khi tải một gói lớn lên máy chủ, và lỗi mạng giữa chừng;
- xoá một phiên bản, và trang riêng của từng phiên bản (US-09);
- bước tiếp theo "mở lượt chơi thử cho phiên bản này" (US-10).

## Tệp

| Tệp                      | Nội dung                                                                |
| ------------------------ | ----------------------------------------------------------------------- |
| `tokens.css`, `base.css` | Do lệnh `theme.mjs scaffold hum --scope app` của Hallmark sinh ra. Chỉ sửa tay các dòng về kiểu chữ trong `tokens.css` |
| `app.css`                | Phần dùng chung của các màn hình. Đầu tệp có dòng ghi của Hallmark      |
| `bao-cao.html`           | Màn hình studio đọc báo cáo                                             |
| `duyet-bao-cao.html` | Màn hình người vận hành duyệt báo cáo |
| `duyet.js` | Hành vi của màn hình duyệt trong bản xem thử: đếm bằng chứng, từ chối, bỏ và hoàn tác |
| `choi-thu.html` | Màn hình người chơi thử vào chơi |
| `choi-thu.js` | Hành vi của màn hình vào chơi: đồng ý, khung game, đồng hồ, lỗi, câu hỏi. Chứa game mẫu |
| `nop-phien-ban.html` | Màn hình người vận hành gửi phiên bản |
| `nop.js` | Hành vi của màn hình gửi phiên bản: mã băm, đọc mục lục `.zip`, gói trùng, từ chối |
| `preview.js` | Đổi trạng thái theo địa chỉ; ghi phát hiện đang mở vào địa chỉ; cho các tệp trên biết trạng thái đang hiện |

## Kiểu chữ

Theme Hum dùng kiểu chữ Chillax. Trên bản xem thử, Chillax hiện sai nhiều chữ
tiếng Việt có dấu (ảnh chụp của chủ dự án; agent chưa đọc tệp phông Chillax).
Ngày 2026-11-29 chủ dự án yêu cầu đổi sang "chuẩn font của Claude design".
Agent hiểu đó là bản hướng dẫn thương hiệu Anthropic đã công bố
(`anthropics/skills`, thư mục `skills/brand-guidelines`, commit `b9e19e6`):
tiêu đề dùng Poppins, phần chữ đọc dùng Lora.

| Vai                           | Hướng dẫn ghi | Màn hình dùng  | Lý do                                             |
| ----------------------------- | ------------- | -------------- | ------------------------------------------------- |
| Phần chữ đọc, ô của bảng      | Lora          | Lora           | Đúng hướng dẫn. Lora có đủ chữ tiếng Việt          |
| Tiêu đề, nhãn, nút, thanh trên | Poppins       | Be Vietnam Pro | Poppins thiếu 90 trên 134 chữ tiếng Việt có dấu |

Cách kiểm: đọc bảng mã của từng tệp phông bằng `fontTools`, rồi so với mọi ký
tự trên màn hình và 134 chữ tiếng Việt có dấu, cả hoa lẫn thường. Lora và Be
Vietnam Pro không thiếu chữ nào.

Hai phông đều theo giấy phép SIL Open Font License 1.1. Từ
[ADR 0015](../../internal/adr/0015-the-whole-project-is-set-in-lora-and-be-vietnam-pro.md),
cả dự án dùng chung hai phông này. Bản dựng lấy tệp phông từ hai gói npm
`@fontsource-variable/lora` và `@fontsource/be-vietnam-pro` rồi đặt ở
`/assets/fonts/`; `app.css` nạp chúng qua `/assets/fonts.css`. Màn hình không
tải phông từ nơi nào khác. Vì vậy mở thẳng tệp `.html` trong thư mục, không
qua bản dựng, sẽ chỉ thấy phông dự phòng.

## Dữ liệu mẫu

Game "Ếch Vượt Ao", năm người chơi, các ngày, số đo và nhận xét đều do agent
đặt ra để vẽ màn hình. Chúng không đến từ lượt chơi thử nào. Trang ghi rõ điều
đó ở dải trên cùng. Các con số trên trang khớp với nhau: số đo chính và từng
phát hiện đều tính lại được từ bảng năm phiên chơi.

## Kiểm bằng sloplint

Chạy với Hallmark ở commit `04977e1`, cách chạy nằm ở `../research/hallmark.md`.

| Ngày       | Kiểm                                   | Kết quả                                             |
| ---------- | -------------------------------------- | --------------------------------------------------- |
| 2026-11-28 | Tĩnh, `--scope app`, cả thư mục        | 0 FAIL, 0 REFLEX, 0 WARN, 1 ANSWERED (F4)           |
| 2026-11-28 | Dựng hình, `--scope app`, bốn trạng thái | 0 FAIL, 0 REFLEX, 1 WARN mỗi trạng thái (phông chữ) |
| 2026-11-29 | Tĩnh, sau khi đổi phông | 0 FAIL, 0 REFLEX, 0 WARN, 1 ANSWERED (F4) |
| 2026-11-29 | Dựng hình, sau khi đổi phông, bốn trạng thái | 0 FAIL, 0 REFLEX, 0 WARN |
| 2026-11-29 | Tĩnh, sau khi thêm màn hình duyệt | 0 FAIL, 0 REFLEX, 0 WARN, 1 ANSWERED (F4) |
| 2026-11-29 | Dựng hình, màn hình duyệt, sáu trạng thái | 0 FAIL, 0 REFLEX, 0 WARN |
| 2026-11-29 | Dựng hình lại, màn hình báo cáo, bốn trạng thái | 0 FAIL, 0 REFLEX, 0 WARN |
| 2026-11-29 | Tĩnh, đủ bốn màn hình | 0 FAIL, 0 REFLEX, 0 WARN, 1 ANSWERED (F4) |
| 2026-11-29 | Dựng hình, màn hình vào chơi, tám trạng thái | 0 FAIL, 0 REFLEX, 0 WARN |
| 2026-11-29 | Dựng hình, màn hình gửi phiên bản, tám trạng thái | 0 FAIL, 0 REFLEX, 0 WARN |
| 2026-11-29 | Dựng hình lại, màn hình báo cáo (bốn) và màn hình duyệt (sáu) | 0 FAIL, 0 REFLEX, 0 WARN |

- **F4** báo có hai kiểu nút được tô nền. Nút phụ là "giấy bìa" của Hum trên
  màu thẻ; chỉ nút chính có màu vàng. Lý do được ghi ở đầu `app.css`.
- **WARN về phông chữ (lần chạy 2026-11-28):** máy làm việc không tải được
  Chillax từ `api.fontshare.com`, nên lần đó dựng hình bằng phông dự phòng.
  Sau khi đổi phông và đặt tệp phông trong kho, cảnh báo này hết.
- Lần dựng hình đầu của màn hình duyệt báo một REFLEX (một liên kết xuống dòng
  ở 320 px). Đã sửa bằng cách rút ngắn nhãn, không ghi miễn.
- Lần dựng hình đầu của màn hình báo cáo báo hai REFLEX (một liên kết xuống dòng ở 1024 px; chữ của
  phát hiện đang đóng bị tính là sát mép). Cả hai đã được sửa, không ghi miễn.
- Lần dựng hình đầu của màn hình vào chơi báo một FAIL: khung game không hiện
  vòng tiêu điểm khi bàn phím đi vào. Đã sửa: `choi-thu.js` đánh dấu khung đang
  giữ tiêu điểm và `app.css` vẽ vòng cho nó. Lần chạy tĩnh đầu báo một WARN về
  nhãn nút dài; đã rút ngắn nhãn.

Ngày ghi trong bảng là ngày theo giờ Việt Nam.

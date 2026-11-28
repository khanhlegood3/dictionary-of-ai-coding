# Pha P02: màn hình

Thư mục này chứa màn hình mẫu của Game9K Playtest. Mỗi tệp `.html` là một màn
hình tĩnh với dữ liệu mẫu. Chúng là tài liệu thiết kế để chủ dự án duyệt ở cổng
P02, không phải mã của ứng dụng
([ADR 0014](../../internal/adr/0014-game9k-screens-of-phase-p02-are-static-pages-in-the-hum-theme.md)).

## Bốn luồng

| Luồng trong bản yêu cầu | User story               | Màn hình             | Trạng thái            |
| ----------------------- | ------------------------ | -------------------- | --------------------- |
| Studio đọc báo cáo      | US-06 (#50)              | `bao-cao.html`       | Đã dựng, chờ nhận xét |
| Người vận hành duyệt    | US-05 (#49)              | `duyet-bao-cao.html` | Đã dựng, chờ nhận xét |
| Vào và chơi             | US-03 (#47), US-04 (#48) | Chưa có              | Chưa dựng             |
| Nộp phiên bản           | US-01 (#45), US-02 (#46) | Chưa có              | Chưa dựng             |

Màn hình đọc báo cáo được dựng trước vì nó là thứ studio trả tiền để nhận, và
các màn hình khác phải sinh ra đúng dữ liệu mà nó hiển thị.

## Xem ở đâu

- Trên bản xem thử của pull request: `/game9k/02-ux/bao-cao` và
  `/game9k/02-ux/duyet-bao-cao`.
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

## Tệp

| Tệp                      | Nội dung                                                                |
| ------------------------ | ----------------------------------------------------------------------- |
| `tokens.css`, `base.css` | Do lệnh `theme.mjs scaffold hum --scope app` của Hallmark sinh ra. Chỉ sửa tay các dòng về kiểu chữ trong `tokens.css` |
| `app.css`                | Phần dùng chung của các màn hình. Đầu tệp có dòng ghi của Hallmark      |
| `bao-cao.html`           | Màn hình studio đọc báo cáo                                             |
| `duyet-bao-cao.html` | Màn hình người vận hành duyệt báo cáo |
| `duyet.js` | Hành vi của màn hình duyệt trong bản xem thử: đếm bằng chứng, từ chối, bỏ và hoàn tác |
| `preview.js`             | Đổi trạng thái theo địa chỉ; ghi phát hiện đang mở vào địa chỉ          |

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

- **F4** báo có hai kiểu nút được tô nền. Nút phụ là "giấy bìa" của Hum trên
  màu thẻ; chỉ nút chính có màu vàng. Lý do được ghi ở đầu `app.css`.
- **WARN về phông chữ (lần chạy 2026-11-28):** máy làm việc không tải được
  Chillax từ `api.fontshare.com`, nên lần đó dựng hình bằng phông dự phòng.
  Sau khi đổi phông và đặt tệp phông trong kho, cảnh báo này hết.
- Lần dựng hình đầu của màn hình duyệt báo một REFLEX (một liên kết xuống dòng
  ở 320 px). Đã sửa bằng cách rút ngắn nhãn, không ghi miễn.
- Lần dựng hình đầu của màn hình báo cáo báo hai REFLEX (một liên kết xuống dòng ở 1024 px; chữ của
  phát hiện đang đóng bị tính là sát mép). Cả hai đã được sửa, không ghi miễn.

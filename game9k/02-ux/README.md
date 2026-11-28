# Pha P02: màn hình

Thư mục này chứa màn hình mẫu của Game9K Playtest. Mỗi tệp `.html` là một màn
hình tĩnh với dữ liệu mẫu. Chúng là tài liệu thiết kế để chủ dự án duyệt ở cổng
P02, không phải mã của ứng dụng
([ADR 0014](../../internal/adr/0014-game9k-screens-of-phase-p02-are-static-pages-in-the-hum-theme.md)).

## Bốn luồng

| Luồng trong bản yêu cầu | User story              | Màn hình       | Trạng thái           |
| ----------------------- | ----------------------- | -------------- | -------------------- |
| Studio đọc báo cáo      | US-06 (#50)             | `bao-cao.html` | Đã dựng, chờ nhận xét |
| Người vận hành duyệt    | US-05 (#49)             | Chưa có        | Chưa dựng            |
| Vào và chơi             | US-03 (#47), US-04 (#48) | Chưa có        | Chưa dựng            |
| Nộp phiên bản           | US-01 (#45), US-02 (#46) | Chưa có        | Chưa dựng            |

Màn hình đọc báo cáo được dựng trước vì nó là thứ studio trả tiền để nhận, và
các màn hình khác phải sinh ra đúng dữ liệu mà nó hiển thị.

## Xem ở đâu

- Trên bản xem thử của pull request: `/game9k/02-ux/bao-cao`.
- Trên máy: `npm run build`, rồi `npm run preview`, rồi mở
  <http://localhost:3000/game9k/02-ux/bao-cao>.

Mỗi trạng thái có địa chỉ riêng:

| Địa chỉ          | Trạng thái                                                       |
| ---------------- | ---------------------------------------------------------------- |
| `?state=full`    | Báo cáo đã duyệt (mặc định)                                      |
| `?state=draft`   | Báo cáo đang soạn. Đây là trạng thái trống: studio chưa thấy nội dung |
| `?state=loading` | Đang tải                                                         |
| `?state=error`   | Không tải được                                                   |

Dải trên cùng của trang là công cụ của bản xem thử, không thuộc sản phẩm.
`preview.js` cũng vậy: nó chỉ đổi trạng thái theo địa chỉ.

## Tệp

| Tệp                      | Nội dung                                                                |
| ------------------------ | ----------------------------------------------------------------------- |
| `tokens.css`, `base.css` | Do lệnh `theme.mjs scaffold hum --scope app` của Hallmark sinh ra. Không sửa tay |
| `app.css`                | Phần dùng chung của các màn hình. Đầu tệp có dòng ghi của Hallmark      |
| `bao-cao.html`           | Màn hình studio đọc báo cáo                                             |
| `preview.js`             | Đổi trạng thái theo địa chỉ; ghi phát hiện đang mở vào địa chỉ          |

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

- **F4** báo có hai kiểu nút được tô nền. Nút phụ là "giấy bìa" của Hum trên
  màu thẻ; chỉ nút chính có màu vàng. Lý do được ghi ở đầu `app.css`.
- **WARN về phông chữ:** máy làm việc không truy cập được `api.fontshare.com`,
  nên mọi lần dựng hình dùng phông dự phòng. Hallmark yêu cầu không duyệt một
  màn hình ở phông dự phòng. Phần này chờ chủ dự án xem trên bản xem thử.
- Lần dựng hình đầu báo hai REFLEX (một liên kết xuống dòng ở 1024 px; chữ của
  phát hiện đang đóng bị tính là sát mép). Cả hai đã được sửa, không ghi miễn.

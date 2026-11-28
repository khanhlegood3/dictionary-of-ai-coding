# Hallmark: áp dụng vào Game9K

Do agent viết ngày 2026-11-28, theo yêu cầu "áp dụng vào dự án" của chủ dự án.
Phần quyết định nằm ở
[ADR 0013](../../internal/adr/0013-game9k-screens-are-built-with-hallmark-and-checked-by-sloplint.md).
Ghi chú này là phần phân tích và kết quả chạy thử.

| Kho                | Commit đã đọc          | Giấy phép | Agent đã làm gì                                                                                                                                      |
| ------------------ | ---------------------- | --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Nutlope/hallmark` | `04977e1` (2026-11-11) | MIT       | Đọc `README.md`, `SKILL.md`, một phần `references/flow.md`, `redesign.md`, `gates.md`, `eval/README.md`; **chạy** `sloplint` và `theme.mjs deal` [1] |

## Hallmark là gì

Một "skill" thiết kế cho agent lập trình (Claude Code, Codex, Cursor,
OpenCode), do Together AI làm. Nó gồm ba thứ:

- **Một bộ luật viết bằng chữ** mà agent đọc trước khi dựng trang. Mục tiêu là
  trang không mang các dấu hiệu "do máy làm".
- **Năm mươi theme.** Mỗi theme là một chất liệu (màu, chữ, bề mặt), không quy
  định trang có gì.
- **Một công cụ kiểm tên `sloplint`.** Nó đọc HTML và CSS; khi có trình duyệt,
  nó dựng trang ở nhiều bề rộng và đo.

Luật chia ba bậc. **Floor** không được vi phạm: tương phản, vòng focus, tôn
trọng cài đặt giảm chuyển động, không bịa số liệu. **Reflex** là thói quen của
mô hình; muốn giữ thì phải ghi lý do. **Finish** là chi tiết tay nghề, không
chặn.

## Vì sao nó hợp với pha P02

Pha P02 dựng màn hình cho bốn luồng của bản yêu cầu. Hallmark có một phần riêng
cho "màn hình để làm việc" (bảng điều khiển, công cụ, trang cài đặt), tách khỏi
luật của trang quảng bá. Các luật của phần đó trùng với thứ Game9K cần:

| Luật của Hallmark cho màn hình làm việc                              | Game9K cần vì                                                                        |
| -------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| Mỗi vùng tải dữ liệu vẽ đủ bốn trạng thái: đang tải, trống, lỗi, đầy | Người vận hành mở một lượt chơi thử chưa có phiên nào sẽ thấy trạng thái trống trước |
| Số liệu là của sản phẩm; không bịa số, lời khen, logo                | Quy tắc của kho: mọi con số phải có nguồn                                            |
| Bảng trước, thẻ sau; mật độ là thiết kế                              | Danh sách phiên chơi, sổ thu chi, danh sách phát hiện đều là bảng                    |
| Trạng thái nằm trong địa chỉ trang (bộ lọc, thẻ, phân trang)         | Studio nhận một đường dẫn tới báo cáo (FR-11)                                        |
| Màn hình có một vật chính để nhớ, không phải lời chào trên bốn ô số  | Với Game9K, vật đó là báo cáo có bằng chứng, hoặc dòng thời gian của một phiên chơi  |

Đầu ra của Hallmark là HTML và CSS thuần. Vậy màn hình P02 dựng được mà không
phải chờ quyết định về khung của ứng dụng thật (#29).

## Kết quả chạy thử

Chưa có màn hình Game9K nào để kiểm, nên agent chạy `sloplint` trên trang đang
có của kho (trang từ điển, `/tasks`, `/agents`) để xem công cụ có chạy được ở
đây không và nó báo gì. Agent không sửa tệp nào của trang.

**Kiểm tĩnh** (bốn trang và bốn tệp CSS, không cần trình duyệt): 196 FAIL, 189
REFLEX, 7 WARN.

| Số lượng | Luật                                                 | Nhận xét của agent                                                               |
| -------- | ---------------------------------------------------- | -------------------------------------------------------------------------------- |
| 180      | Khoảng cách không theo bậc 4px                       | Quy ước riêng của Hallmark                                                       |
| 163      | Mã màu viết thẳng, ngoài khối khai báo ở `:root`     | Quy ước riêng; một phần là màu được khai báo ở chỗ khác `:root`                  |
| 11       | Nhãn viết hoa giãn chữ                               | Quy ước riêng                                                                    |
| 4        | "Không có kiểu `:focus-visible`"                     | **Sai.** Trang có, ở `styles.css` dòng 89. Lỗi do cách agent chép tệp ra để chạy |
| 3        | Nút bị vô hiệu chỉ khác ở độ mờ                      | Đáng xem                                                                         |
| 1        | Thanh bên của trang học bị ẩn và cần script mới hiện | Đáng xem                                                                         |

Phần còn lại là các mục lẻ.

**Kiểm bằng trình duyệt** (bốn địa chỉ trên bản chạy trong máy làm việc):

| Trang               | FAIL | REFLEX | Phát hiện chính                                                       |
| ------------------- | ---- | ------ | --------------------------------------------------------------------- |
| Trang chủ           | 2    | 0      | Viền ô tìm kiếm tương phản 1,26:1; chữ sát mép ở bề rộng 1920         |
| `/tasks`            | 1    | 7      | Viền ô tìm kiếm; tiêu đề việc xuống hai, ba dòng ở bề rộng 320 và 375 |
| `/agents`           | 1    | 0      | Viền ô tìm kiếm                                                       |
| Một trang thuật ngữ | 2    | 3      | Viền ô tìm kiếm; 276 chữ trên một màn hình (luật của trang quảng bá)  |

Hai điều rút ra:

- **Một phát hiện lặp ở cả bốn trang và đo được:** viền ô tìm kiếm tương phản
  1,26:1 với nền, dưới mức 3:1 mà Hallmark đòi cho mép của một ô nhập. Agent đã
  mở issue #58 cho việc này, không sửa.
- **Phần lớn số còn lại là quy ước riêng của Hallmark**, không phải lỗi. Một
  trang không dựng theo Hallmark sẽ luôn bị báo nhiều. Vì vậy ADR 0013 chỉ áp
  cho màn hình mới của Game9K và không đụng tới trang từ điển.

## Ba theme được chia cho Game9K

Hallmark chia ba theme theo lời mô tả, rồi người chọn theo hình. Với mô tả "công
cụ chơi thử B2B cho studio game web", lệnh `theme.mjs deal` trả về:

| Theme  | Mô tả của Hallmark (tóm tắt)                                                | Xem hình                                     |
| ------ | --------------------------------------------------------------------------- | -------------------------------------------- |
| Arcade | Nền tối kiểu màn hình CRT, chữ pixel, bóng đổ cứng; ghi hợp với game        | <https://www.usehallmark.com/themes/arcade/> |
| Coral  | Giấy xám ấm, chữ không chân, một màu san hô cho trạng thái; ghi hợp với B2B | <https://www.usehallmark.com/themes/coral/>  |
| Hum    | Giấy kem ngả vàng, chữ tròn, ba màu nhấn; ghi hợp với game và việc đọc      | <https://www.usehallmark.com/themes/hum/>    |

Với màn hình làm việc, theme chỉ cho màu, chữ, bo góc và bề mặt; bố cục là của
màn hình. Agent chưa xem hình của ba theme này. Chọn theme là việc của chủ dự
án.

## Ba cách làm đáng chép cho sản phẩm

Ngoài việc dựng màn hình, cách Hallmark kiểm một trang giống việc Game9K
Playtest phải làm với một game:

1. **Máy đo trước, người (hoặc agent) xét sau, và bên xét không biết gì về quá
   trình làm.** `sloplint` đo ở nhiều bề rộng; sau đó một agent khác, chưa thấy
   quá trình dựng, xem ảnh chụp. Áp cho agent chơi thử (FR-13): số đo và lỗi do
   hệ thống ghi trước; phần nhận xét do một bước riêng viết từ bản ghi.
2. **Ba bậc cho phát hiện.** Floor, Reflex, Finish tương ứng với: chặn phát
   hành, nên sửa hoặc giải thích, chi tiết. Báo cáo chơi thử có thể xếp phát
   hiện theo ba bậc như vậy, và giữ hai con số tách nhau để câu "không có lỗi
   chặn" luôn đúng nghĩa.
3. **Ghi lại trước, so lại sau.** Khi thiết kế lại một trang, `sloplint --before` ghi mọi liên kết, ô nhập và tiêu đề; `--kept` báo hỏng nếu thiếu
   một thứ. Áp cho việc so hai phiên bản game (FR-17): ghi những gì người chơi
   làm được ở phiên bản trước và kiểm chúng còn ở phiên bản sau.

## Đã chạy thế nào

- Lấy Hallmark ở commit `04977e1` về một thư mục ngoài kho.
- Kiểm tĩnh: `node skills/hallmark/scripts/sloplint.mjs <tệp> --scope app --json`.
- Kiểm bằng trình duyệt:
  `node skills/hallmark/scripts/sloplint.mjs --url http://localhost:3000/tasks --scope app --json`.
  Máy làm việc không có Chrome. Agent cài `puppeteer-core` và
  `@sparticuz/chromium` từ npm vào một thư mục ngoài kho, rồi trỏ `CHROME_PATH`
  và `HALLMARK_PUPPETEER` tới đó.
- Trang chủ và trang thuật ngữ chạy với `--scope page`; `/tasks` và `/agents`
  với `--scope app`.

## Chưa kiểm

- Chưa có màn hình Game9K nào được dựng bằng Hallmark. Chưa biết kết quả có
  hợp ý chủ dự án không.
- Hallmark chưa được chạy qua một công cụ có nạp skill (Claude Code, Codex).
  Agent chỉ đọc luật và chạy hai script.
- Ngoài phát hiện về `:focus-visible`, agent chưa kiểm tay từng phát hiện của
  `sloplint`.
- Bản nháp <https://game9k.vercel.app> chưa được kiểm: máy làm việc không truy
  cập được địa chỉ đó.
- Hình của ba theme.

## Nguồn

1. `Nutlope/hallmark`, commit `04977e1`, skill phiên bản 2.0.0.
   <https://github.com/Nutlope/hallmark>

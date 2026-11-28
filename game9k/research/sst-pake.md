# SST và Pake: dùng gì cho Game9K

Phân tích do agent viết ngày 2026-11-28, theo câu hỏi của chủ dự án. Đây là đề
xuất, chưa phải quyết định.

| Kho             | Commit đã đọc          | Giấy phép                                | Agent đã đọc                                                                                                            |
| --------------- | ---------------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `anomalyco/sst` | `6bb81a1` (2026-11-10) | MIT                                      | `README.md`, `AGENTS.md`, danh sách thành phần cho AWS và Cloudflare, một ví dụ `sst.config.ts`, hai trang tài liệu [1] |
| `tw93/Pake`     | `fbba237` (2026-11-25) | GPL-3.0 kèm một ngoại lệ cho sản phẩm ra | `README.md`, `llms.txt`, `LICENSE-EXCEPTION`, `action.yml`, các mục chính của `docs/cli-usage.md` và `docs/faq.md` [2]  |

Agent không chạy công cụ nào trong hai công cụ này.

## Trả lời ngắn

- **SST** trả lời câu "Game9K Playtest chạy ở đâu". Bản đầu chưa cần nó. Nhưng
  khi đọc để so sánh, agent thấy một điều phải xử lý trước khi nhận bản game
  hay thu tiền của studio nào: gói Hobby của Vercel, nơi từ điển đang chạy,
  không dùng được cho việc đó.
- **Pake** đi ngược hướng của bản đầu. Bản đầu là "không cần cài gì"; Pake biến
  một trang web thành ứng dụng phải cài. Nó có chỗ dùng ở giai đoạn sau, và có
  một cách làm đáng chép ngay cho công cụ dòng lệnh.

## Điều tìm thấy về nơi chạy

Từ điển của kho này chạy trên gói Hobby của Vercel. Điều khoản dịch vụ của
Vercel, bản cập nhật 2026-10-19 [3]:

- Mục 4: gói Hobby chỉ dành cho việc dùng cá nhân hoặc phi thương mại.
- Mục 3: với gói Hobby, Vercel được dùng nội dung người dùng đưa lên để huấn
  luyện mô hình AI và chia sẻ cho bên thứ ba vì mục đích đó. Người dùng tắt
  được trong phần cài đặt.

Trang so sánh gói ghi thêm: một hàm trên gói Hobby chạy tối đa 300 giây [4].

Áp vào bản yêu cầu đã duyệt (`../01-requirements/PRD.md`):

| Yêu cầu                                 | Vướng gì trên gói Hobby                                              |
| --------------------------------------- | -------------------------------------------------------------------- |
| Thu phí của studio (GĐ-2)               | Là việc thương mại, trái mục 4                                       |
| Giữ kín bản game chưa phát hành (mục 9) | Bản game là nội dung đưa lên, rơi vào mục 3 nếu không tắt            |
| Agent chơi thử một phiên (FR-13)        | Một phiên chơi dễ dài hơn 300 giây, nên không chạy gọn trong một hàm |

Từ điển là việc phi thương mại nên không vướng. Điều này chỉ chạm tới Game9K
Playtest, và chỉ khi nó được đặt trên cùng tài khoản đó. Agent không phải luật
sư; chủ dự án nên tự đọc hai mục trên.

## SST

Một bộ khung để khai báo toàn bộ hạ tầng của một ứng dụng bằng mã, trong một
tệp `sst.config.ts`, rồi dựng nó trên tài khoản đám mây của chính mình. Tài
liệu ghi nó hỗ trợ hơn 150 nhà cung cấp; kho có sẵn thành phần cho AWS và
Cloudflare. Cùng tổ chức làm ra OpenCode và Rune đã phân tích ở hai ghi chú
trước.

### Nó khớp với bản yêu cầu ở đâu

| Bản yêu cầu cần                                | Thành phần SST có sẵn (tên tệp trong kho)                               |
| ---------------------------------------------- | ----------------------------------------------------------------------- |
| Lưu gói game của studio (FR-01)                | `bucket` (AWS S3 hoặc Cloudflare R2)                                    |
| Chạy game ở một nguồn tách khỏi cổng (FR-02)   | `static-site`, `router`, `cdn` với tên miền riêng                       |
| Lưu số đo bền (FR-08)                          | `postgres`, `dynamo`; phía Cloudflare có `d1`                           |
| Việc chạy lâu như agent chơi thử (FR-13)       | `task` và `cluster` (chạy container), `queue`, `workflow`               |
| Giới hạn lượt cho cửa tốn tiền mô hình (mục 9) | Phía Cloudflare có `rate-limit`                                         |
| Khoá mô hình và các bí mật khác                | `secret`, cùng cơ chế "linking" để mã đọc tài nguyên mà không chép khoá |

### Ba cách làm đáng lấy, dù có dùng SST hay không

- **Hạ tầng là mã, nằm trong kho.** Đổi hạ tầng là một pull request, đọc và
  duyệt được. Khớp với nguyên tắc "GitHub là nguồn duy nhất" trong
  `../PROCESS.md`, và hợp khi agent là bên viết.
- **Mỗi môi trường là một "stage".** `sst deploy --stage <tên>` dựng một bản
  riêng của cả ứng dụng. Một bản cho mỗi pull request, một bản thật.
- **Bản thử thì xoá được, bản thật thì giữ.** Ví dụ trong kho đặt
  `removal: input?.stage === "production" ? "retain" : "remove"`.

### Vì sao chưa dùng ở bản đầu

- Nó kéo theo một tài khoản AWS hoặc Cloudflare, hoá đơn và việc vận hành, cho
  một dự án hiện có một người.
- Đợt thử có khoảng năm người chơi. Phần agent chơi thử có thể chạy trên máy
  của người vận hành hoặc trong GitHub Actions.
- Kho đã dùng Supabase cho cơ sở dữ liệu và đăng nhập.

Hai đường đi cho bản đầu, cần chủ dự án chọn:

| Đường                                      | Được gì                                                           | Mất gì                                              |
| ------------------------------------------ | ----------------------------------------------------------------- | --------------------------------------------------- |
| Nâng lên gói trả tiền của Vercel           | Không đổi cách làm. Trang gói ghi 20 USD mỗi người mỗi tháng [4]  | Vẫn cần chỗ khác cho việc chạy lâu                  |
| Dựng trên tài khoản đám mây riêng bằng SST | Bản game của studio nằm trên hạ tầng của mình; chạy được việc lâu | Thêm một tài khoản, một hoá đơn và một thứ phải học |

Agent nghiêng về đường thứ nhất cho đợt thử, và xét lại SST ở pha P05 khi agent
chơi thử cần nơi chạy riêng. Chọn đường nào là một quyết định cần ghi thành
ADR.

## Pake

Một lệnh biến một địa chỉ web, hoặc một thư mục web tĩnh có `index.html` ở
gốc, thành bộ cài cho macOS, Windows và Linux. Nó dùng Tauri và trình xem web
có sẵn của hệ điều hành, nên bộ cài thường dưới 10 MB theo README.

### Chỗ khớp với Game9K

- **Định dạng đầu vào trùng với gói game của bản yêu cầu.** FR-01 nhận một gói
  web có `index.html` ở gốc; Pake đóng gói đúng loại thư mục đó. Vậy một
  phiên bản đã qua chơi thử có thể ra thêm bản cài cho máy tính mà studio
  không phải viết lại gì.
- **Giấy phép cho phép.** Pake là GPL-3.0, nhưng tệp `LICENSE-EXCEPTION` ghi
  ứng dụng do Pake tạo ra không vì thế mà thành GPL, và được phát hành theo
  điều khoản tuỳ chọn. Sửa mã của chính Pake thì vẫn theo GPL.
- **Có sẵn GitHub Action** nhận địa chỉ và tên ứng dụng, trả về bộ cài.

Đây là việc của giai đoạn hai trong bình luận ở issue #10 (phát hành game đã
qua chơi thử). Bản yêu cầu đã duyệt để phần đó ngoài phạm vi.

### Ba điều cần biết nếu sau này dùng

- **Bản cài không chạy trên Chrome.** Nó dùng trình xem web của từng hệ điều
  hành; tài liệu của Pake nhắc tới WebView2 trên Windows và WebKitGTK trên
  Linux. Số đo chơi thử trên trình duyệt không tự động đúng cho bản cài. Bản
  cài cần lượt chơi thử riêng.
- **Đăng nhập qua bên thứ ba có thể bị chặn.** `llms.txt` của Pake ghi Google
  và các bên tương tự có thể từ chối đăng nhập trong trình xem web nhúng.
- **Ký ứng dụng.** Agent không thấy tài liệu đã đọc nói về việc ký và công
  chứng bộ cài; chưa rõ người dùng sẽ gặp cảnh báo gì khi cài.

### Một cách làm chép được ngay

Pake có một "hợp đồng cho agent": thêm `--json` thì lệnh in đúng một đối tượng
JSON ra đầu ra chuẩn, mọi nhật ký đi sang đầu ra lỗi, không hỏi tương tác, mã
thoát có nghĩa cố định (0 xong, 2 sai đầu vào, 3 dựng hỏng, 4 thiếu môi
trường), và mỗi lỗi kèm một gợi ý sửa.

Công cụ `g9k` của Starter Kit và lệnh `g9k playtest` đã đề xuất trong
`du-cong-nghe-chua.md` nên theo đúng dạng này, vì người gọi chúng phần lớn là
agent.

## Đề xuất

1. Trước khi nhận bản game hay thu tiền của studio nào, chọn nơi chạy không
   phải gói Hobby. Agent đã mở một issue cho việc này.
2. Chưa dùng SST ở bản đầu. Xét lại ở pha P05.
3. Chưa dùng Pake. Ghi nó là một lựa chọn cho giai đoạn phát hành.
4. Khi viết công cụ dòng lệnh của Game9K, theo "hợp đồng cho agent" của Pake.

## Chưa kiểm

- Không công cụ nào được chạy. Agent chưa dựng thứ gì bằng SST và chưa đóng
  gói game nào bằng Pake.
- Giá của AWS, Cloudflare và gói trả tiền của Vercel cho cỡ của đợt thử.
- Cài đặt tắt việc dùng nội dung để huấn luyện mô hình trên tài khoản Vercel
  của dự án đang bật hay tắt.
- Một game web dùng âm thanh, toàn màn hình và lưu trữ cục bộ có chạy đúng
  trong bản cài của Pake không.
- Điều khoản được đọc bởi agent, không phải luật sư.

## Nguồn

1. `anomalyco/sst`, commit `6bb81a1`. <https://github.com/anomalyco/sst>
2. `tw93/Pake`, commit `fbba237`. <https://github.com/tw93/Pake>
3. Vercel, "Terms of Service", cập nhật 2026-10-19, mục 3 "Your Content" và
   mục 4 "Hobby Plan", đọc ngày 2026-11-28. <https://vercel.com/legal/terms>
4. Vercel, "Vercel Hobby Plan", cập nhật 2026-11-12, đọc ngày 2026-11-28.
   <https://vercel.com/docs/plans/hobby>

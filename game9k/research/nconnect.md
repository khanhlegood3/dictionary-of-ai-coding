# NConnect: dùng gì cho Game9K

Phân tích do agent viết ngày 2026-11-28, theo đường dẫn chủ dự án gửi. Đây là
đề xuất, chưa phải quyết định.

`Studio1-OSS/nconnect` là kho gốc (không phải bản sao), giấy phép MIT, viết bằng
TypeScript, 416 tệp, tạo ngày 2026-07-25. Agent đọc ở commit `30d3c49`
(2026-11-19): `README.md`, `CONTEXT.md`, `TESTING.md`, `CHANGELOG.md`, hai tệp
workflow, bản ghi phép đo định tuyến, và phần đầu của `cost.ts`,
`telemetry.ts`, `image-command.ts` [1].

**Agent chưa chạy công cụ này.** Bộ cài lấy từ `nconnect.sh`, máy làm việc của
agent không ra được địa chỉ đó, và không có khoá Nebius.

## Nó là gì

Một công cụ dòng lệnh cho phép các agent lập trình sẵn có (Claude Code, Codex,
OpenCode, Pi, Hermes và vài cái khác) chạy bằng mô hình mở do Nebius Token
Factory phục vụ, thay cho mô hình của hãng làm ra agent đó.

Claude Code và Codex nói giao thức riêng của Anthropic và OpenAI; Nebius không
nói hai giao thức đó. NConnect chạy một tiến trình nhỏ trên máy để dịch qua
lại. README ghi nó không sửa cấu hình của agent và khoá nằm trong `~/.nconnect/`
trên máy người dùng.

Ngoài việc dịch, nó tính tiền từng lượt gọi, thử lại khi lỗi, chuyển sang mô
hình dự phòng, và có lệnh hỏi mô hình về một tấm ảnh.

## Trả lời ngắn

Đây không phải một mảnh của lõi Playtest B2B. Nó có hai chỗ dùng:

- **Làm công cụ:** hạ chi phí cho các agent viết mã. Đáng thử với một ngân sách
  nhỏ, chưa nên để quy trình phụ thuộc vào.
- **Làm mẫu:** trong các kho đã xem, đây là kho gần nhất với câu hỏi "một lượt
  agent chơi thử tốn bao nhiêu". Nó có sẵn cách đo tiền từng lượt gọi và một
  lệnh đọc ảnh chụp màn hình.

## Làm công cụ

```sh
curl -fsSL https://nconnect.sh/install.sh | sh
nconnect configure          # nhập khoá Nebius
nconnect claude             # hoặc: nconnect codex, nconnect opencode
nconnect usage --last 7d    # tiền đã tiêu, theo mô hình
```

Các lệnh trên lấy từ README; agent chưa thử.

Chỗ áp được trong kho này:

- **Chủ dự án chạy agent lập trình trên máy mình với giá thấp hơn.** Mô hình
  mặc định là GLM 5.3 Flash, README ghi giá 0,15 USD mỗi triệu token vào và
  0,50 USD mỗi triệu token ra.
- **Agent thứ hai duyệt pull request (issue #30).** Kho đó có một workflow chạy
  bốn agent thật trong GitHub Actions, chỉ cần một bí mật `NEBIUS_API_KEY`.
  Vậy một agent duyệt chạy bằng mô hình khác họ với agent viết là làm được về
  mặt kỹ thuật. Agent chưa dựng thử.

Năm điều cần biết trước khi dùng:

- **Chỉ có một nhà cung cấp.** Công cụ gắn với Nebius. `CHANGELOG.md` ghi ngày
  2026-11-16 Nebius ngừng phục vụ sáu mô hình; chế độ tự chọn mô hình và mô
  hình dự phòng bị lỗi cho đến bản 0.27.0.
- **Chưa có số đo so với mô hình gốc.** Các phép đo agent đọc được trong kho
  chỉ so các mô hình mở với nhau. Không phép đo nào so chúng với mô hình của
  chính hãng làm ra Claude Code hay Codex, nên chưa biết chất lượng giảm bao
  nhiêu khi đổi.
- **Cài bằng `curl | sh` và tự cập nhật mỗi giờ.** Trong GitHub Actions nên tắt
  bằng `NCONNECT_DISABLE_AUTOUPDATE=1` và ghim phiên bản.
- **Đừng chạy `npm install nconnect`.** Gói tên đó trên npm là một thư viện vẽ
  đồ thị không liên quan, sửa lần cuối năm 2022.
- **Điều khoản.** README tự nhắc người dùng kiểm xem việc cho ứng dụng Claude
  Desktop chạy mô hình ngoài Anthropic có hợp điều khoản không. Agent chưa đọc
  điều khoản nào.

Nó không thay được workflow `@claude` đang có trong kho. Workflow đó vẫn cần
ứng dụng Claude trên GitHub và một bí mật của Anthropic.

## Làm mẫu: năm cách làm cho agent chơi thử

| NConnect làm gì                                                                                                                                                                                              | Áp cho Game9K                                                                                                                                                                              |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Tính tiền ở nơi gọi mô hình.** Mỗi lượt gọi được ghi số token thật và giá; `nconnect usage` cộng lại theo mô hình. Khi không biết giá token đệm, mã tính theo giá cao để ra trần, không coi là miễn phí    | Ghi tiền của từng phiên agent chơi thử ngay từ phiên đầu. Đây là cách có số thật cho `C` trong `chon-huong-kinh-doanh.md`, hiện mới là ước lượng 0,06–13,50 USD. Số chưa chắc thì ghi trần |
| **Hỏi mô hình về một tấm ảnh.** `nconnect image describe error.png "What is the error message?" --json` trả câu trả lời kèm số token và chi phí                                                              | Đúng thao tác một agent chơi thử cần: chụp màn hình, hỏi "đang ở màn nào, có lỗi không". Thuộc mảnh 4 và 5 trong `du-cong-nghe-chua.md`, cả hai chưa có                                    |
| **Bắt đầu bằng mô hình rẻ, đo rồi mới nâng.** Phép đo của chính họ trên 12 bài nhỏ: mô hình rẻ qua 11 bài với 0,24 USD; mô hình mạnh qua 10 bài với 3,81 USD; định tuyến tự động qua 11 bài với 3,74 USD [3] | Đừng xây phần chọn mô hình trước. Chạy mô hình rẻ nhất, đo số báo cáo dùng được, chỉ nâng khi số đo đòi                                                                                    |
| **Bản ghi phép đo nói rõ nó không chứng minh gì.** Kiểm thử ẩn, chi phí từng ô, "một lần chạy mỗi ô", một bài có đề không công bằng, và cờ `--budget 20` dừng khi tiêu quá 20 USD                            | Mẫu cho phép thử mù đo `Y` và cho mọi so sánh agent với người: ghi số lần chạy, ghi điều chưa chứng minh, đặt trần tiền trước khi chạy                                                     |
| **Hai làn kiểm.** Mỗi lần đẩy mã: kiểm không cần mạng, miễn phí. Chạy agent thật: bấm tay, tốn tiền, cần bí mật                                                                                              | Kiểm agent chơi thử bằng phiên đã ghi sẵn ở mỗi lần đẩy mã; chạy agent thật trên game thật thì bấm tay. Kho này đã làm vậy với `site.yml` và `mcp-live.yml`                                |

Về việc viết báo cáo: tác giả đo riêng 30 bài trích xuất, phân loại và tra
cứu; so với dùng mô hình mạnh nhất cho mọi việc, định tuyến tự động rẻ hơn 93%
và qua 29 bài so với 24 [2]. Viết báo cáo từ
nhật ký phiên chơi gần với loại việc này hơn là với lập trình. Đây là suy luận
của agent, chưa đo.

Hai thói quen nhỏ hơn cũng đáng giữ:

- `TESTING.md` yêu cầu dựng một kiểm thử tái hiện đúng lỗi người dùng báo, thấy
  nó hỏng, rồi mới sửa.
- Trong một lần đo, agent tự chạy lệnh cài gói và làm hỏng thư mục làm việc của
  người đo. Từ đó agent bị cấm chạy trình quản lý gói. Agent chơi thử của
  Game9K chạy mã của studio, nên phải ở trong hộp cát ngay từ đầu.

## Nebius là ứng viên thứ ba

Câu hỏi còn mở là dùng Gemini hay Together AI cho agent chơi thử. Nebius thêm
một lựa chọn với giá cùng cỡ. Cách chọn vẫn như đã đề xuất ở
`aicommits-roomgpt.md`: một bộ phiên chơi ghi sẵn, đếm số báo cáo dùng được.

Agent chưa tra Nebius có tín dụng dùng thử hay không; README không nói.

## Đề xuất

1. Nếu chủ dự án muốn thử: cài trên máy mình, nạp một khoản nhỏ vào Nebius,
   chạy `nconnect claude` trên một việc nhỏ của kho này, rồi xem
   `nconnect usage`. Kho không đổi gì.
2. Khi viết bản yêu cầu (issue #28), ghi "mỗi phiên agent có số tiền kèm theo"
   thành một yêu cầu của phần đo.
3. Ghi phương án "agent duyệt chạy bằng mô hình mở" vào issue #30 để cân nhắc.

## Chưa kiểm

- Mọi lệnh và mọi tính năng: agent chỉ đọc mã và tài liệu.
- Giá mô hình là số README ghi; agent chưa đối chiếu với trang giá của Nebius.
- Các số đo là của tác giả công cụ. Số 24% và 93% đo trên bộ mô hình đã bị
  ngừng; README tự ghi bộ hiện tại chưa được đo.
- "Unreal Agent" trong danh sách agent được hỗ trợ: agent chưa đọc kho đó và
  không biết nó có liên quan tới Unreal Engine hay không.
- README ghi số phiên bản 0.16.1 ở huy hiệu, còn `package.json` và
  `CHANGELOG.md` ghi 0.27.0.

## Nguồn

1. `Studio1-OSS/nconnect`, commit `30d3c49`.
   <https://github.com/Studio1-OSS/nconnect>
2. `README.md` trong [1], mục "Auto: a model per task": 50 bài lập trình có
   kiểm thử ẩn (40 qua, so với 42) và 30 bài trích xuất, phân loại, tra cứu (29
   qua, so với 24).
3. `packages/tests/benchmarks/auto-routing/README.md` trong [1], kết quả ngày
   2026-10-09, một lần chạy mỗi ô.

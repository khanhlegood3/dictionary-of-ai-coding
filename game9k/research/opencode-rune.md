# OpenCode (Rune): dùng gì cho Game9K

Phân tích do agent viết ngày 2026-11-28. `khanhle5/opencode-rune` giống hệt kho
gốc `anomalyco/opencode-rune` ở commit `b52b49f` (2026-11-28). Agent đọc
`README.md`, `AGENTS.md` và danh sách tệp, không dựng và không chạy ứng dụng.
Đây là đề xuất, chưa phải quyết định.

## Nó là gì

Ứng dụng máy tính của OpenCode, một agent lập trình mã nguồn mở, viết lại từ
đầu bằng Rust trên Rune. README ghi nó chạy trên macOS, Windows, Linux và
trong trình duyệt. Giấy phép MIT. Bản tải về hiện là bản `dev`.

Nó là nơi một người ngồi giám sát agent lập trình: phiên làm việc, xem khác
biệt mã hai cột, cửa sổ dòng lệnh, agent con, kết nối máy chủ MCP.

## Hai cách dùng

### 1. Làm công cụ: thử được, đừng xây lên nó

Nó có thể là bàn làm việc để anh giám sát agent viết mã Game9K, cạnh Vibe
Kanban đã đề xuất trước. Vì là bản `dev`, hợp để thử, chưa hợp để cả quy trình
phụ thuộc vào.

Việc làm được ngay: nối từ điển của kho này vào OpenCode. Theo tài liệu
OpenCode [1]:

```sh
opencode mcp add ai-coding-dictionary --url https://ai9k.vercel.app/api/mcp
opencode mcp list
```

Agent chưa thử lệnh này. Tài liệu ghi máy chủ từ xa mặc định dùng OAuth; máy
chủ của từ điển không yêu cầu đăng nhập. Nếu danh sách báo "needs
authentication" thì cấu hình tay với `"oauth": false`.

### 2. Làm mẫu: bốn quy tắc đáng chép

Giá trị lớn hơn nằm ở cách kho đó được tổ chức để nhiều agent cùng viết.

| Quy tắc của kho đó                                                                                                                | Áp cho Game9K                                                                                                  |
| --------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Bốn tầng.** Bắt đầu ở tầng trên cùng (plugin viết bằng script, nạp lại không cần biên dịch), chỉ xuống tầng dưới khi buộc phải  | Game là tầng trên cùng: một thư mục cùng `game9k.manifest.json`. Agent làm game không được sửa cổng hay SDK    |
| **Tính năng không phụ thuộc lẫn nhau**, có script kiểm (`arch-check.sh`)                                                          | Starter Kit dồn nhiều phân hệ vào một tệp SDK 4.109 dòng. Tách ra thì hai agent mới làm song song được         |
| **Luật là script, không phải lời dặn.** Kích thước tệp, hình dạng thư mục, tầng phụ thuộc đều có lệnh kiểm, chạy trước khi đẩy mã | Mỗi quy tắc trong `AGENTS.md` của Game9K nên có một lệnh kiểm. GameFun đã có sẵn nhiều `scripts/check_*`       |
| **Máy trạng thái tường minh.** Một `enum State`, một hàm `step(state, event)` trả về hiệu ứng; hẹn giờ là sự kiện                 | Đây đúng là ba điều `g9k playtest` đòi ở mỗi game: bước thời gian do bên ngoài điều khiển, chạy lại được y hệt |

Kho đó còn một quy tắc về bản viết lại: ứng dụng chính thức là chuẩn; chỗ nào
khác thì đọc mã chính thức, làm cho khớp và ghi tên tệp tham chiếu. Điều này
áp được cho issue #26. Nếu kho MetaPump không lấy lại được, bản đang chạy ở
`game9k.vercel.app` và kho GameFun là chuẩn để dựng lại.

## Một quy tắc không nên chép nguyên

Kho đó cấm mọi kiểm thử tự động: "Application code is truth, tests are a poor
replica". Thay vào đó, agent chạy ứng dụng thật không cần cửa sổ, chụp ảnh,
xuất cây phần tử và phát lại kịch bản.

- **Nửa nên lấy:** kiểm bằng cách chạy thứ thật, không dùng đồ giả. Trong
  Starter Kit, ít nhất hai dịch vụ (OpenRouter và Xsolla) tự chuyển sang chế độ
  mô phỏng khi thiếu khoá API, và trang `game9k.vercel.app` ghi "dữ liệu mô
  phỏng" ở chân trang. Bộ số "Game Portal 2026" (issue #27) là một ví dụ về số
  mẫu bị dùng như số thật.
- **Nửa không nên lấy:** bỏ hết kiểm thử. Game9K định bán phép đo, nên chính
  phép đo phải chạy lại được và so được. Starter Kit đang có 21 tệp kiểm thử;
  nên giữ.

Đây là nhận định của agent.

## Nguồn

1. OpenCode, "MCP servers". <https://opencode.ai/docs/mcp-servers/> (đọc
   2026-11-28)
2. `anomalyco/opencode-rune`, commit `b52b49f`: `README.md`, `AGENTS.md`.
   <https://github.com/anomalyco/opencode-rune>
3. `khanhlegood1/Game9K-Starter-Kit`, commit `b4af2a1`.

# aicommits và roomGPT: dùng gì cho Game9K

Phân tích do agent viết ngày 2026-11-28, theo câu hỏi của chủ dự án. Đây là đề
xuất, chưa phải quyết định.

Cả hai kho của `khanhlegood3` giống hệt kho gốc của Nutlope, không có commit
riêng:

| Kho         | Commit đã đọc          | Giấy phép | Agent đã đọc                                                                                                                          |
| ----------- | ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| `aicommits` | `98e9c4e` (2026-10-27) | MIT       | `README.md`, `AGENTS.md`, `BENCHMARK.md`, `package.json`, `src/commands/pr.ts`, một phần `src/feature/generate-commit-message.ts` [1] |
| `roomGPT`   | `611398c` (2023-09-20) | MIT       | `README.md`, `package.json`, `app/generate/route.ts`, `utils/redis.ts`, `utils/dropdownTypes.ts` [2]                                  |

Agent đã chạy `npx aicommits --version` (ra 5.0.1) và `npx aicommits pr` ở chế
độ không có người gõ phím. Agent chưa sinh được thông điệp nào vì không có khoá
của nhà cung cấp mô hình. roomGPT chưa được chạy.

## Trả lời ngắn

Không kho nào là một mảnh của lõi Playtest B2B.

- **aicommits** là công cụ cho người tự tay commit. Giá trị lớn hơn với Game9K
  là ba cách làm bên trong nó, chép được cho phần viết báo cáo chơi thử.
- **roomGPT** là bản mẫu năm 2023. Nó cho một hình dạng sản phẩm đáng nghĩ tới
  và một lỗi thiết kế cần tránh.

## aicommits

Công cụ dòng lệnh đọc phần thay đổi đã `git add` rồi đề xuất thông điệp commit.
Nó chạy được với nhiều nhà cung cấp: Together AI, OpenAI, Anthropic, Groq, xAI,
OpenRouter, mô hình chạy trên máy (Ollama, LM Studio), và gói thuê bao Claude,
ChatGPT hay OpenCode Go mà người dùng đã đăng nhập sẵn.

### Làm công cụ

Chủ dự án cài được trên máy mình, không cần đổi gì trong kho này:

```sh
npm install -g aicommits            # cần Node 22 trở lên
aicommits setup                     # chọn nhà cung cấp
aicommits config set type=subject+body
aicommits hook install              # chạy trong thư mục kho
```

Agent mới kiểm được lệnh cài qua `npx`; ba lệnh sau lấy từ README.

Ba giới hạn khi dùng ở kho này:

- **Phần lớn commit ở đây do agent viết**, và agent đã tự viết thông điệp. Công
  cụ này chỉ có ích khi một người commit bằng tay.
- **`aicommits pr` không thay được mẫu pull request của kho.** Lệnh đang ở bản
  thử, viết tiêu đề và mô tả chỉ từ phần khác biệt mã, cắt ở 30.000 ký tự. Mẫu
  của kho đòi hai mục "Assumptions" và "Not verified"; hai mục đó không nằm
  trong phần khác biệt mã nên công cụ không thể điền.
- **`aicommits pr` cần người ngồi trước màn hình.** Chạy không có người gõ
  phím, nó dừng với "Interactive terminal required for PR creation". Agent
  chạy trong GitHub Actions không dùng được.

Thông điệp sinh từ phần khác biệt mã nói được _đã đổi gì_. _Vì sao đổi_ vẫn
phải do người hoặc agent làm việc đó viết, và quyết định lớn vẫn ghi ở
`internal/adr/`.

### Làm mẫu: ba cách làm cho phần viết báo cáo

Phần viết báo cáo là mảnh số 8 trong `du-cong-nghe-chua.md`, hiện chưa có.

| aicommits làm gì                                                                                                                                                                 | Áp cho Game9K                                                                                                                                                                                |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Mô hình tự hỏi thứ nó cần.** Nó nhận danh sách tệp, rồi xin đọc phần khác biệt của những tệp nó chọn. Số bước và số lần gọi mô hình bị chặn cứng trong mã (4 bước, 42 lần gọi) | Mô hình viết báo cáo nhận danh sách phiên chơi và số tổng, rồi xin đọc những phiên nó cần. Chặn cứng số lần gọi thì chi phí mỗi lượt chơi thử (`C` trong `chon-huong-kinh-doanh.md`) có trần |
| **Kết quả nộp qua một khuôn có kiểm.** Mô hình phải gọi `submitCommitMessage` với tiêu đề không rỗng, không kết thúc bằng dấu ba chấm; trả lời bằng văn xuôi bị từ chối          | Mỗi phát hiện trong báo cáo là một bản ghi có mã phiên, thời điểm và bằng chứng, được kiểm trước khi lưu. Khớp với quy tắc "số liệu phải có nguồn" trong `PROCESS.md`                        |
| **Chọn mô hình bằng phép thử cố định.** `BENCHMARK.md` chạy cùng sáu pull request thật qua bản cũ và bản mới, đếm số câu trả lời dùng được: 41/42 so với 27/42 [3]               | Chọn giữa Gemini và Together AI bằng một bộ phiên chơi đã ghi sẵn, đếm số báo cáo dùng được. Cùng dạng với phép thử mù đo `Y` đã đề xuất                                                     |

Hai điểm nhỏ hơn cũng đáng giữ:

- Công cụ chỉ đọc được bản đã `git add`; xin đọc tệp ngoài danh sách thì báo
  lỗi "Only staged files may be read". Agent viết báo cáo cũng chỉ nên đọc
  được dữ liệu của đúng lượt chơi thử đó.
- Nhà cung cấp mô hình nằm sau một giao diện chung, đổi bằng một dòng cấu hình.

### Về "dùng gói thuê bao sẵn có"

Với commit của chính chủ dự án thì dùng được, không cần khoá API. Với một dịch
vụ bán cho studio, agent chưa đọc điều khoản của các gói đó và giả định là cần
khoá API. Câu hỏi "Gemini hay Together AI, và khoá hay tín dụng" vẫn còn mở.

## roomGPT

Ứng dụng web: tải ảnh một căn phòng lên, chọn kiểu, nhận lại ảnh căn phòng được
thiết kế lại. Viết bằng Next.js 13, gọi mô hình ControlNet qua Replicate. README
ghi đây là bản đầu tiên của roomGPT.io, không có đăng nhập và thanh toán; bản
đang bán là sản phẩm trả tiền.

Commit cuối là tháng 9 năm 2023. Mã gọi một phiên bản mô hình ghi cứng; agent
chưa kiểm phiên bản đó còn chạy không.

### Một hình dạng đáng nghĩ tới

Một ô nhập, một kết quả, dùng thử miễn phí có giới hạn (5 lượt mỗi 24 giờ theo
địa chỉ IP), còn bản đầy đủ thì trả tiền.

Áp cho Game9K, đây là gợi ý của agent: studio dán địa chỉ game, nhận một phiên
agent chơi thử và một báo cáo ngắn, mỗi ngày vài lượt; lượt chơi thử đầy đủ thì
tính phí. Việc này cần các mảnh 1, 3, 4, 5 và 8, trong đó 4, 5 và 8 chưa có. Nó
đến sau đợt thử có trả tiền ở ADR 0012, không thay cho đợt đó.

### Ba thứ không nên chép

- **Giữ một yêu cầu mở cho đến khi xong việc.** `app/generate/route.ts` hỏi
  Replicate mỗi giây và chỉ thoát khi trạng thái là `succeeded` hoặc `failed`;
  mã không có giới hạn thời gian. Tạo ảnh mất vài giây nên còn chạy được. Một
  lượt chơi thử mất nhiều phút: phải ghi nó thành một việc có trạng thái, và
  trang web hỏi lại trạng thái đó.
- **Giới hạn lượt theo tiêu đề `x-real-ip`.** Khi tiêu đề trống, mọi người
  dùng chung một ô đếm.
- **Không đăng nhập, không lưu gì.** Game9K cần cả hai (mảnh số 7).

Tạo ảnh bằng ControlNet thuộc về agent A (làm game) trong
`ai-agent-nganh-game.md`, không thuộc lõi.

## Đề xuất

1. Chủ dự án cài aicommits cho commit tay của mình nếu muốn. Kho không đổi gì.
2. Khi viết bản yêu cầu (issue #28), đưa ba cách làm ở bảng trên vào phần viết
   báo cáo.
3. Không lấy mã từ roomGPT.

## Chưa kiểm

- Chất lượng thông điệp aicommits sinh ra cho kho này, nhất là bằng tiếng
  Việt.
- Số liệu trong `BENCHMARK.md` là của tác giả công cụ; agent không chạy lại.
- roomGPT có còn dựng và chạy được không.
- Điều khoản dùng gói thuê bao Claude, ChatGPT, OpenCode Go cho dịch vụ thương
  mại.

## Nguồn

1. `khanhlegood3/aicommits` (bản sao của `Nutlope/aicommits`), commit `98e9c4e`.
   <https://github.com/khanhlegood3/aicommits>
2. `khanhlegood3/roomGPT` (bản sao của `Nutlope/roomGPT`), commit `611398c`.
   <https://github.com/khanhlegood3/roomGPT>
3. `BENCHMARK.md` trong [1], ghi ngày đo 2026-07-23: trên các mô hình gọi được
   công cụ, bản mới trả 41/42 thông điệp dùng được, bản cũ 27/42.

# Paperclip: dùng gì cho Game9K

Phân tích do agent viết ngày 2026-11-28, theo câu hỏi của chủ dự án. Đây là đề
xuất, chưa phải quyết định.

| Kho                      | Commit đã đọc          | Giấy phép | Agent đã đọc                                                                                                                                            |
| ------------------------ | ---------------------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `khanhlegood1/paperclip` | `c574714` (2026-11-28) | MIT       | `README.md`, `ROADMAP.md`, danh sách tệp, và bốn trang tài liệu: rà soát pull request, chính sách thực thi, chi phí và ngân sách, chế độ triển khai [1] |

Kho này là bản fork của `paperclipai/paperclip` và giống hệt bản gốc ở thời
điểm đọc (không hơn, không kém commit nào). Bản gốc có 117.730 sao và 16.865
tệp [1]. Agent không chạy Paperclip và không đọc mã của nó.

## Trả lời ngắn

- Paperclip là **phần mềm quản lý một đội agent**: giao việc, sơ đồ tổ chức,
  ngân sách, các bước duyệt. Nó khớp với ý định của chủ dự án về nhiều agent
  cùng lập trình. Nó không phải một mảnh của sản phẩm Game9K Playtest.
- **Chưa nên dùng nó làm nơi quản lý việc.** Nó có hệ thống việc riêng, trong
  khi quy trình của kho này ghi GitHub là nguồn duy nhất. Dự án cũng chưa có
  agent thứ hai để mà điều phối.
- **Có một phần đáng thử sớm:** tính năng agent rà soát pull request của nó làm
  gần đúng điều issue #30 mô tả.
- Có ba cách làm đáng chép dù không dùng Paperclip.

## Nó là gì

Một máy chủ Node.js và một giao diện web, tự cài trên máy của mình. README mô
tả: mang agent của mình tới, giao mục tiêu, theo dõi việc và chi phí từ một
bảng. Nó không dạy cách viết agent; nó quản lý tổ chức mà các agent làm việc
trong đó.

Các phần chính, theo README:

| Phần          | Làm gì                                                                                      |
| ------------- | ------------------------------------------------------------------------------------------- |
| Việc          | Mỗi việc là một phiếu, có người nhận duy nhất và khoá để hai agent không cùng nhận một việc |
| Sơ đồ tổ chức | Agent có vai, cấp trên, quyền và ngân sách                                                  |
| Đánh thức     | Agent được gọi dậy khi có việc, có tin nhắn, hoặc theo lịch                                 |
| Duyệt         | Bước rà soát và bước phê duyệt do hệ thống ép, không dựa vào việc agent nhớ                 |
| Ngân sách     | Ghi chi phí theo agent, dự án, mô hình; dừng việc khi chạm trần                             |
| Nhật ký       | Mọi thay đổi, lượt duyệt và khoản chi được ghi lại                                          |

Nó nối được với Claude Code, Codex, Cursor, Gemini CLI, OpenCode và vài agent
khác. Yêu cầu: Node.js 24.11 trở lên; cơ sở dữ liệu Postgres được tạo sẵn khi
chạy trên máy cá nhân.

## Áp vào việc quản lý dự án Game9K

### Chỗ khớp

| Quy trình của kho này cần                                             | Paperclip có                                                                                                                   |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Agent thứ hai rà soát pull request, không sửa mã, không approve (#30) | "GitHub Code Review Bot": một agent đọc pull request, chấm điểm 0–5, viết nhận xét. Mặc định không chặn merge và không approve |
| Agent rà soát dùng mô hình khác agent viết mã (#30)                   | Chọn agent và mô hình tuỳ ý cho bot; đổi sau cũng được                                                                         |
| "AI tạo, người duyệt" (`../PROCESS.md`)                               | Bước phê duyệt gắn vào từng việc, người duyệt có thể là người                                                                  |
| Tính tiền mỗi lần gọi mô hình (`nconnect.md`)                         | Ghi chi phí từng lượt chạy; ngân sách theo agent và dự án, có trần cứng                                                        |

### Chỗ vướng

- **Hai nguồn sự thật.** Paperclip giữ việc trong hệ thống của nó. README ghi
  việc dùng hệ thống phiếu có sẵn của người dùng còn nằm trên lộ trình.
  `../PROCESS.md` ghi GitHub là nguồn duy nhất, và trang `/tasks` đọc từ
  GitHub. Dùng Paperclip để giao việc nghĩa là sửa nguyên tắc đó bằng một ADR,
  hoặc chép việc qua lại bằng tay.
- **Cần một máy chạy liên tục.** Dự án chưa có nơi chạy (#55). Chạy trên máy
  của chủ dự án thì được, nhưng tắt máy là đội agent dừng.
- **Chưa có đội để quản lý.** Hiện mỗi lúc có một agent làm việc. Workflow
  `@claude` chưa chạy lần nào. Phần mềm điều phối nhiều agent chưa có gì để
  điều phối.
- **Trần ngân sách không thấy gói thuê bao.** Tài liệu ghi lượt dùng qua gói
  thuê bao của Claude hay ChatGPT được ghi là 0 USD, nên không bao giờ đẩy
  ngân sách tới trần. Trần chỉ có nghĩa khi agent chạy bằng khoá API tính tiền
  theo lượt.
- **Nó lớn và đổi nhanh.** 16.865 tệp, và README ghi hơn 2.700 pull request đã
  merge. Vận hành nó là một việc riêng đối với một dự án một người.

### Riêng phần rà soát pull request

Đây là phần gần với nhu cầu hiện tại nhất, nên agent đọc kỹ hơn.

Cách nó chạy: cài một GitHub App riêng cho bot; không cần thêm tệp workflow
nào vào kho. Mỗi lượt rà soát ghi điểm, mã commit được rà, các phát hiện, và
dẫn về lượt chạy cùng chi phí của nó.

Ba điều cần biết trước khi thử:

- Nếu Paperclip chạy trên máy cá nhân, tin báo từ GitHub đi qua dịch vụ
  Paperclip Cloud rồi mới về máy. Tài liệu ghi các tin đó được niêm phong và
  chữ ký được kiểm ở máy mình. Agent chưa đọc điều khoản của dịch vụ này.
- Nội dung pull request là đầu vào không đáng tin và có thể chứa lệnh cài cắm.
  Tài liệu khuyên chạy bot ở chế độ "tin cậy thấp", và ghi rõ: trên bản tự
  cài, chế độ này **không** tự dựng hộp cát; phải tự cấu hình trước khi rà
  soát pull request của người lạ. Kho này công khai nên điều này áp dụng.
- Chọn Claude Code hay OpenCode làm agent rà soát trên bản tự cài cần thêm một
  bước cấu hình; Codex thì không, theo tài liệu.

## Áp vào sản phẩm Game9K Playtest

Không dùng trực tiếp. Bản đầu có nhiều nhất một agent chơi thử và một bước
viết báo cáo; không có đội agent nào để quản lý.

## Ba cách làm đáng chép

1. **Tách ba quyết định: cài, khi nào chạy, có chặn merge không.** Paperclip để
   bot chấm điểm và nhận xét trước, không chặn gì, để người dùng xem chất lượng
   rồi mới cho việc merge phụ thuộc vào nó. Issue #30 nên đi đúng thứ tự đó.
2. **Đánh giá chưa đủ thì không được tính là đạt.** Nếu bot không đọc được tệp
   cần đọc, hoặc một công cụ hỏng, lượt đó không thể đạt ngưỡng. Áp cho báo cáo
   chơi thử: một phát hiện thiếu bằng chứng thì không vào báo cáo (đã có ở
   FR-09), và một phiên chơi ghi thiếu số đo thì không được đếm là phiên dùng
   được.
3. **Mỗi khoản chi ghi rõ là số thật hay số ước tính.** Paperclip ghi cho mỗi
   lượt: nhà cung cấp, mô hình, số token, số tiền, và trạng thái "được báo",
   "ước tính" hay "chưa có giá". Áp cho FR-14 (chi phí mô hình của một phiên
   agent chơi thử): ghi thêm trạng thái đó, vì quy tắc của kho này là mọi con
   số phải có nguồn.

## Đề xuất

1. Chưa dùng Paperclip làm nơi giao việc. GitHub vẫn là nguồn duy nhất.
2. Giữ thứ tự của issue #30: chạy `@claude` thành công một lần trước.
3. Khi tới bước chọn agent rà soát ở #30, thử bot rà soát của Paperclip như một
   ứng viên, ở chế độ chỉ báo cáo, bên cạnh cách viết một workflow GitHub
   Actions. So hai cách trên cùng vài pull request thật.
4. Xét lại việc dùng cả Paperclip khi có từ hai agent chạy đều và có nơi chạy
   (#55).
5. Không cần giữ bản fork nếu chỉ dùng: Paperclip cài từ npm, và lộ trình của
   nó khuyên mở rộng bằng plugin thay vì fork.

## Chưa kiểm

- Paperclip chưa được chạy. Máy làm việc của agent có Node 22, thấp hơn mức
  Paperclip yêu cầu, và không có khoá mô hình nào.
- Agent chỉ đọc tài liệu, không đọc mã. Mọi mô tả ở trên là lời của tài liệu.
- Điều khoản và giá của Paperclip Cloud.
- Bot rà soát có chạy được trên một kho là bản fork công khai của một tài
  khoản cá nhân không.
- Chất lượng nhận xét của bot trên pull request của kho này.

## Nguồn

1. `khanhlegood1/paperclip`, commit `c574714`, giống hệt
   `paperclipai/paperclip` ở thời điểm đọc. Số sao và số tệp lấy từ GitHub API
   ngày 2026-11-28. <https://github.com/khanhlegood1/paperclip>

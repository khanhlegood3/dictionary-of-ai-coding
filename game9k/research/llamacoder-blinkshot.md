# LlamaCoder và BlinkShot: dùng gì cho Game9K

Phân tích do agent viết ngày 2026-11-28, theo câu hỏi của chủ dự án. Đây là đề
xuất, chưa phải quyết định.

| Kho                  | Commit đã đọc          | Giấy phép                  | Agent đã đọc                                                                                                                                                    |
| -------------------- | ---------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Nutlope/llamacoder` | `5d57b70` (2026-10-22) | MIT                        | `README.md`, `architecture.md`, phần đầu `URGENT.md`, `lib/rate-limit-config.ts`, phần đầu `lib/chat-auto-fix.ts`, các dòng chính của `lib/preview/html.ts` [1] |
| `Nutlope/blinkshot`  | `781c8f2` (2026-10-26) | **Không có tệp giấy phép** | `README.md`, `package.json`, 150 dòng đầu của `app/api/generateImages/route.ts` [2]                                                                             |

Agent đã mở trang `llamacoder.together.ai` và chỉ thấy ô nhập với sáu gợi ý
mẫu; agent chưa tạo ứng dụng nào trên đó. Không kho nào được dựng hay chạy.

## Trả lời ngắn

- **LlamaCoder** là kho đáng chép nhất cho hai mảnh còn thiếu của lõi: chạy mã
  lạ trong trình duyệt một cách cô lập, và bắt lỗi của nó. Cách nó làm khớp
  gần như nguyên với việc chạy game của studio.
- **BlinkShot** tạo ảnh, không thuộc lõi. Nó cho hai cách làm về chặn lạm dụng.
  Vì không có giấy phép, chỉ lấy ý, không chép mã.

## LlamaCoder

Ứng dụng web: gõ một câu mô tả, nhận về một ứng dụng nhỏ chạy ngay trong trang.
Trang chủ ghi "Powered by Together AI. Used by 1.1M+ users"; đây là số tự công
bố.

### Ba cách làm chép được

| LlamaCoder làm gì                                                                                                                                                                                                             | Áp cho Game9K                                                                                                                                     |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Chạy mã lạ trong khung cô lập.** Ứng dụng sinh ra chạy trong một iframe với `sandbox="allow-scripts allow-forms"`, tức không được coi là cùng nguồn với trang chính                                                         | Game của studio là mã lạ. Chạy nó cùng cách: khung cô lập, không đọc được cookie hay dữ liệu của cổng. Đây là mảnh 1 trong `du-cong-nghe-chua.md` |
| **Một "cây cầu" báo lỗi về trang chính.** Đoạn mã chèn vào khung nghe ba thứ: lỗi không bắt (`error`), lời hứa bị từ chối (`unhandledrejection`) và `console.error`, rồi gửi về trang chính bằng `postMessage`, kèm thời điểm | Đúng là mảnh 4, bắt lỗi sập, hiện chưa có. SDK của Starter Kit đã ghi thời lượng chơi; thêm ba bộ nghe này là có số "crash" của mỗi phiên         |
| **Chặn tiền trước khi gọi mô hình.** Mỗi cửa vào công khai có giới hạn theo phút và theo ngày. Cửa nào tốn tiền mô hình thì từ chối khi bộ đếm hỏng ("fail closed"); cửa không tốn tiền thì cho qua                           | Mọi cửa của Game9K làm phát sinh tiền mô hình (agent chơi thử, viết báo cáo) phải có giới hạn và phải từ chối khi không đếm được                  |

`architecture.md` còn ghi cây cầu đó trả về số đo thời gian (thời gian dựng,
thời gian đến lúc sẵn sàng), và lỗi bắt được được gửi lại cho mô hình để tự
sửa. Với Game9K, lỗi bắt được đi vào báo cáo cho studio.

### Một bài học về đo thời lượng

`URGENT.md` ghi lại một lỗi họ mất công tìm: trình duyệt không vẽ khung hình
nào cho thẻ đang ẩn hoặc bị che, và các bộ hẹn giờ theo khung hình cũng dừng.

Với Game9K điều này chạm thẳng vào số đo "thời lượng chơi". Người chơi thử mở
game rồi chuyển sang thẻ khác thì game đứng, nhưng đồng hồ tính bằng giờ bắt
đầu và giờ kết thúc vẫn chạy. Thời lượng phải chỉ tính lúc thẻ đang hiện. Điều
này đã được đưa vào bản yêu cầu (`../01-requirements/PRD.md`, US-04).

### Dùng nó làm công cụ

LlamaCoder sinh ứng dụng web nhỏ từ một câu. Nó có thể sinh game đơn giản để
làm bài thử cho hệ thống đo, khi chưa có game của studio. Agent chưa thử. Việc
này thuộc agent A (làm game) trong `ai-agent-nganh-game.md`, không thuộc lõi.

Chạy bản riêng cần khoá Together AI, một cơ sở dữ liệu Postgres và một kho S3
cho ảnh tải lên.

## BlinkShot

Ứng dụng web: gõ mô tả, ảnh hiện ra gần như theo từng phím gõ. Dùng một mô hình
tạo ảnh qua Together AI.

**Kho không có tệp giấy phép.** Mặc định khi đó là tác giả giữ mọi quyền, nên
đừng chép mã. Chỉ lấy ý.

Hai ý đáng lấy:

- **Dùng thử miễn phí rồi tự mang khoá.** Mỗi địa chỉ được 5 lượt một ngày;
  quá số đó người dùng nhập khoá Together AI của chính mình, và lượt gọi tính
  vào tài khoản của họ. Với Game9K: một studio muốn chạy nhiều lượt agent chơi
  thử có thể mang khoá mô hình của mình, Game9K không gánh tiền mô hình.
- **Kiểm đầu vào trước khi tốn tiền.** Câu mô tả bị kiểm độ dài, từ cấm và
  nguồn gọi trước khi chạm tới mô hình. Nhật ký lưu dấu vết nhưng không lưu
  nội dung câu mô tả.

Tạo ảnh không nằm trong lõi. Nếu sau này cần ảnh bìa cho trang phiên bản của
một game thì đây là một cách làm, chưa phải việc bây giờ.

## Cả hai cùng cho thấy một điều

Commit mới nhất của cả hai kho đều là "Harden": thêm giới hạn lượt, danh sách
mô hình được phép và giới hạn đầu vào. Hai ứng dụng công khai gọi mô hình đều
phải quay lại vá chỗ này. Game9K nên có nó từ bản đầu, trước khi mở cửa nào
tốn tiền mô hình ra công khai.

## Đề xuất

1. Khi tới pha xây dựng, viết phần chạy game và bắt lỗi theo cách của
   LlamaCoder: khung cô lập và cây cầu `postMessage`.
2. Ba yêu cầu rút từ hai kho này đã nằm trong bản yêu cầu: chạy cô lập, bắt ba
   loại lỗi, và thời lượng chỉ tính lúc thẻ đang hiện.
3. Không lấy mã từ BlinkShot.

## Chưa kiểm

- Không kho nào được dựng hay chạy. Agent chưa tạo ứng dụng nào trên trang
  LlamaCoder.
- `lib/preview/html.ts` dài 628 dòng; agent chỉ đọc các dòng có bộ nghe lỗi và
  `postMessage`.
- Khung cô lập của LlamaCoder đủ cho ứng dụng nhỏ; nó có đủ cho một game dùng
  âm thanh, toàn màn hình và lưu trữ cục bộ hay không thì chưa thử.
- Con số "1.1M+ users" là của trang đó.

## Nguồn

1. `Nutlope/llamacoder`, commit `5d57b70`.
   <https://github.com/Nutlope/llamacoder>; trang chạy thật
   <https://llamacoder.together.ai/>, đọc ngày 2026-11-28.
2. `Nutlope/blinkshot`, commit `781c8f2`.
   <https://github.com/Nutlope/blinkshot>

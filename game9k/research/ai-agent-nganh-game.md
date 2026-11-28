# AI agent cho ngành game: học gì từ Frostbite

Phân tích do agent viết ngày 2026-11-28, sau khi chủ dự án nêu ý muốn tạo AI
agent cho ngành game và dẫn chip Frostbite làm ví dụ. Đây là đề xuất, chưa phải
quyết định. Chưa có gì được xây hay chạy thử.

## Frostbite cho thấy điều gì

Architect Labs (Palo Alto) công bố ngày 2026-11-18 rằng các AI agent của họ đã
thiết kế và kiểm chứng Frostbite, một CPU có tập lệnh mới dựa trên mô hình
Interaction Nets. Mọi con số dưới đây là của chính công ty, đọc qua ba bài
tường thuật [1][2][3]. Agent chưa đọc bài gốc của công ty.

| Điều công ty nói                                                                      | Bài học cho Game9K                                                |
| ------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Agent thử 58 ý tưởng, giữ 37 [3]                                                      | Agent là một vòng thử và loại, không phải một lần sinh ra kết quả |
| Đặc tả viết bằng ngôn ngữ kiểm được bằng máy; hơn 800.000 dòng Lean để kiểm chứng [3] | Phần lớn công sức nằm ở bộ kiểm chứng, không nằm ở agent          |
| 25 bài đo, trong đó 15 bài giấu đến lần đánh giá cuối [1]                             | Phải có phép đo mà agent không được tối ưu theo                   |
| 4,59 lần hiệu năng trên watt ở cả 25 bài; 3,83 lần ở 15 bài giấu [2][3]               | Số đo trên bài đã tối ưu luôn đẹp hơn số thật                     |
| Chưa có chip thật; số liệu lấy từ bản thiết kế ở tiến trình 7 nm [1][2]               | Số đo trong mô phỏng chưa phải số đo ngoài đời                    |

Tóm lại: AI làm được gần hết quá trình vì mọi thay đổi nó đề xuất đều được
một bộ kiểm chứng chấm điểm ngay. Không có bộ kiểm chứng thì không có vòng lặp.

## Áp sang game

| Ở chip                    | Ở game                                                      |
| ------------------------- | ----------------------------------------------------------- |
| Đặc tả kiểm được bằng máy | Ngưỡng của các con dấu trong hộ chiếu gọi vốn               |
| Mô hình mô phỏng chip     | Chạy bản game không cần người: máy tự chơi và ghi số đo     |
| Bài đo đã dùng để tối ưu  | Số đo do máy tự chơi                                        |
| Bài đo giấu               | Người chơi thật                                             |
| Thử 58, giữ 37            | Mỗi thay đổi là một pull request; số đo tụt thì không merge |
| Chưa có chip thật         | Chưa có người chơi thật                                     |

## "AI agent cho ngành game" có thể là bốn thứ khác nhau

| Loại                 | Nó làm gì                                                              | Ai trả tiền                     |
| -------------------- | ---------------------------------------------------------------------- | ------------------------------- |
| A. Agent làm game    | Viết và sửa mã game theo yêu cầu                                       | Studio                          |
| B. Agent chơi thử    | Chạy một bản game, tự chơi, báo lỗi sập, tốc độ khung hình, thời lượng | Studio; bên cấp vốn đọc kết quả |
| C. Agent đọc số liệu | Đọc kết quả chơi thử, đề xuất thay đổi cho bản sau                     | Studio                          |
| D. Agent trong game  | Nhân vật hay đối thủ do AI điều khiển                                  | Người chơi                      |

A, B và C ghép lại thành đúng vòng lặp của Frostbite: C đề xuất, A sửa, B chấm.

## Đề xuất: làm B trước

- **B là bộ kiểm chứng.** Không có B thì không biết thay đổi của A tốt hay xấu.
- **B là nơi cấp dấu** của hộ chiếu gọi vốn
  (`../01-requirements/ho-chieu-goi-von.md`).
- **B bán được riêng** cho studio, kể cả studio không dùng A. Điều này khớp
  hướng chơi thử trả phí trong issue #10.
- **A đã có sẵn trên thị trường.** Claude Code và các công cụ tương tự viết được
  mã game. Thứ chưa ai làm sẵn cho Game9K là phép đo.

### Giới hạn của B

Máy tự chơi không thay được người. Theo cách agent đọc bảng dấu của hộ chiếu:

| Dấu                | Máy tự chơi cấp được không                                       |
| ------------------ | ---------------------------------------------------------------- |
| Bản mới thật       | Được: đây là phép tính trên gói game                             |
| Ổn định            | Một phần: máy tìm được lỗi sập, không chứng minh được là hết lỗi |
| Có người chơi thật | Không                                                            |
| Tốt hơn bản trước  | Không: dấu này cần người chấm mù                                 |
| Giữ chân           | Không                                                            |

Vì vậy B lọc bản hỏng trước khi tốn tiền chơi thử bằng người. Nó không thay
cho bước đó.

## Điểm xuất phát đã có

Đọc `khanhlegood1/Game9K-Starter-Kit` ở commit `b4af2a1` (2026-11-25), chỉ đọc
mã, không chạy:

- Bốn game trong `public/games/`, mỗi game có `game9k.manifest.json` ghi phiên
  bản, ngân sách (`max_gzip_kb`, `target_fps`) và danh sách sự kiện phát ra
  (`game_ready`, `race_started`, `race_finished`).
- `cli/g9k.js` có lệnh `build` và `verify`, tính SHA-256 cho từng tệp và cho cả
  gói. Đây là một nửa của "trang phiên bản".
- Phần luật chơi tách khỏi phần vẽ (`race-engine.js` và `renderer.js`).
  `race-engine.js` không gọi `document` hay `window`.
- **Chưa có** lệnh nào chạy game và đo. `race-engine.js` gọi `Math.random()`
  không có hạt giống, nên hai lần chạy cho hai kết quả khác nhau.

## Bước nhỏ nhất

Thêm lệnh `g9k playtest <game>` vào Starter Kit:

1. Mở bản game trong trình duyệt không màn hình.
2. Gửi sự kiện giả lập trong một khoảng thời gian cố định.
3. Ghi một tệp báo cáo: mã băm của gói, lỗi trong console, có sập không, tốc
   độ khung hình so với `target_fps`, có tới được `race_finished` không.

Chưa cần AI ở bước này. AI vào ở bước sau: agent đọc báo cáo, đề xuất sửa, mở
pull request, và `g9k playtest` chạy lại trên pull request đó.

Việc này bị chặn bởi issue #29 (mã Game9K nằm ở đâu): tài khoản agent đang dùng
chỉ đọc được Starter Kit, không đẩy mã lên được.

## Chưa biết

- Bốn game đều là game người xem tương tác qua livestream. Chưa rõ "tự chơi"
  cho loại game này nên giả lập người xem hay người dẫn.
- Chi phí chạy mỗi lượt chơi thử.
- Có studio nào trả tiền cho B không. Chưa hỏi ai.

## Nguồn

1. MLQ.ai, "Architect Labs says its AI agents designed Frostbite", 2026-11-22.
   <https://mlq.ai/news/architect-labs-says-its-ai-agents-designed-frostbite-a-new-cpu-it-claims-has-459x-the-performance-per-watt/>
2. ExplainX, "Frostbite AI-Designed CPU: 4.59x Perf per Watt, Checked",
   2026-11-19.
   <https://explainx.ai/blog/architect-labs-frostbite-ai-designed-cpu-interaction-nets-4-59x-perf-per-watt-claimed-vs-verified-2026>
3. Inoryva, "Architect Labs Frostbite CPU: 3.83x on Held-Out Tests, Pre-Silicon
   Only", 2026-11-24.
   <https://inoryva.blogspot.com/2026/11/architect-labs-frostbite-cpu-383x-on.html>

# Playtest B2B: đã đủ công nghệ chưa

Phân tích do agent viết ngày 2026-11-28, trả lời hai câu hỏi của chủ dự án:
hướng Playtest B2B đã đủ công nghệ chưa, và `khanhle5/rune` áp dụng thế nào.
Đây là đề xuất, chưa phải quyết định. Agent chỉ đọc mã, không chạy gì.

## Trả lời ngắn

**Đủ để chốt hướng và chạy một đợt thử có thu tiền. Chưa đủ để bán như một
sản phẩm.**

Không mảnh nào cần phát minh: mọi công nghệ dưới đây đều có sẵn và phổ biến.
Thứ thiếu là phần đã _xây_. Và hai chỗ hổng lớn nhất không phải công nghệ:
nhóm người chơi thử, và một studio chịu trả tiền.

## Kiểm kê

Cột "Đã có" dựa trên `khanhlegood1/Game9K-Starter-Kit` ở commit `b4af2a1`
(2026-11-25). Agent đọc `package.json`, `cli/g9k.js`, `src/server.js`,
`src/services/LiveRoomHub.js`, `public/sdk/game9k-sdk.js` và danh sách tệp.
Kho đó là bản nháp, theo lời chủ dự án.

| #   | Mảnh cần có                                | Đã có                                                                                         | Trạng thái  |
| --- | ------------------------------------------ | --------------------------------------------------------------------------------------------- | ----------- |
| 1   | Chạy bản game của studio trong trình duyệt | Cổng nhúng game qua iframe, tệp `game9k.manifest.json`, bốn game mẫu                          | Có bản nháp |
| 2   | Định danh phiên bản                        | `g9k build` và `g9k verify` tính SHA-256 từng tệp và cả gói                                   | Có bản nháp |
| 3   | Ghi số đo một phiên chơi                   | SDK ghi thời lượng chơi; máy chủ nhận sự kiện nhưng chỉ giữ 200 sự kiện gần nhất trong bộ nhớ | Một phần    |
| 4   | Bắt lỗi sập                                | Không thấy chỗ nào trong SDK bắt lỗi của trang                                                | Chưa có     |
| 5   | Máy tự chơi, chạy lại được y hệt           | Không có lệnh nào; `race-engine.js` dùng `Math.random()` không hạt giống                      | Chưa có     |
| 6   | Quay màn hình và giọng nói người chơi thử  | Không thấy trong mã                                                                           | Chưa có     |
| 7   | Lưu trữ lâu dài và tài khoản               | Bảng xếp hạng, bản lưu và số đo đều nằm trong bộ nhớ, mất khi máy chủ khởi động lại           | Chưa có     |
| 8   | Viết báo cáo từ số đo                      | Chưa có. Cần một khoá API mô hình                                                             | Chưa có     |
| 9   | Trả thưởng cho người chơi thử              | Không thấy trong mã                                                                           | Chưa có     |
| 10  | Nhóm người chơi thử                        | Không phải công nghệ. Chưa có                                                                 | Chưa có     |
| 11  | Một studio chịu trả tiền                   | Không phải công nghệ. Chưa hỏi ai                                                             | Chưa có     |

Ba điều nền cũng chưa xong: chưa quyết mã nằm ở đâu (issue #29), kho MetaPump
chưa khôi phục (issue #26), và agent `@claude` của kho này chưa chạy lần nào
vì chưa cài ứng dụng và khoá.

### Cần gì cho đợt thử đầu

Đợt thử trong `chon-huong-kinh-doanh.md` chỉ cần mảnh 1, 2, 3, 4, 8, và mảnh
10 ở cỡ năm người quen. Mảnh 6, 7 và 9 làm tay được: người chơi tự quay màn
hình, số đo lưu vào một bảng, thưởng chuyển khoản.

Mảnh 5 là thứ làm Game9K khác một dịch vụ chơi thử thường. Nó cũng là mảnh
Rune chỉ cách làm.

### So với hướng Launchpad

Tài liệu nguồn KVU–KAU tự ghi mã hợp đồng "chưa viết xong, chưa kiểm toán và
chưa triển khai", và hướng đó cần thêm pháp nhân cùng giấy phép. Khoảng cách
công nghệ của Launchpad lớn hơn, và theo cách agent đọc thì cổng của nó cũng cần các mảnh 1–5 ở trên.

## Rune áp dụng thế nào

`khanhle5/rune` là bản sao của `anomalyco/rune`, giống hệt kho gốc ở commit
`7e3d266` (2026-11-28). Rune là bộ khung giao diện viết bằng Rust, tự vẽ bằng
GPU, đang ở giai đoạn trước phát hành. Giấy phép MIT.

**Không nên dùng Rune để viết game của Game9K.** Game hiện có là HTML5 canvas
viết bằng JavaScript. Rune là bộ khung giao diện ứng dụng, khác ngôn ngữ, và
chưa phát hành. Đây là nhận định của agent.

**Nên chép cách Rune để agent tự kiểm việc mình làm.** README của Rune viết:
mọi ứng dụng chạy được không cần cửa sổ, để agent vẽ ra PNG, xuất cây phần tử
và điều khiển bằng kịch bản. Mọi ứng dụng Rune nhận cùng một bộ cờ:

| Cờ của Rune               | Nó làm gì                                                           | Bản tương ứng cho game của Game9K                        |
| ------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| `--snap out.png --at 0.4` | Chụp màn hình ở một thời điểm                                       | Chụp khung hình game ở giây thứ N                        |
| `--tree tree.json`        | Xuất cây phần tử: khoá, vai trò, chữ, vị trí                        | Xuất trạng thái game: điểm, vị trí, vòng đua, ai thắng   |
| `--script demo.json`      | Phát lại kịch bản thao tác có mốc thời gian, nhắm phần tử theo khoá | Phát lại kịch bản sự kiện: người xem tặng quà, bình luận |
| Đồng hồ ảo cố định        | Thời gian do kịch bản điều khiển, nên hai lần chạy ra cùng kết quả  | Thời gian và số ngẫu nhiên đều có hạt giống              |
| `--video`, `--trace`      | Xuất video và nhật ký từng khung                                    | Bằng chứng kèm báo cáo                                   |

Đây là bản thiết kế cho lệnh `g9k playtest` (mảnh 5). Nó đòi mỗi game ba điều:

1. Một hàm bước thời gian nhận `dt`, thay vì tự chạy theo đồng hồ thật.
2. Số ngẫu nhiên có hạt giống.
3. Một hàm xuất trạng thái ra JSON.

`dino-race` đã gần điều 1: phần luật chơi tách khỏi phần vẽ. Nó chưa có điều 2.

### Hai thói quen làm việc đáng chép

README của Rune ghi họ không nhận pull request: người dùng để agent của mình mở
issue, và agent của họ xử lý. `AGENTS.md` của nó có hai quy tắc giúp nhiều
agent làm song song không giẫm chân nhau:

- **Tệp nhỏ.** Tệp Rust dưới 800 dòng, trần cứng 1.500, lý do ghi rõ là tránh
  "edit collisions". Để so: `game9k-sdk.js` của Starter Kit dài 4.109 dòng,
  `site/build.ts` của kho này dài khoảng 2.700 dòng.
- **Mỗi thay đổi một tệp nhật ký riêng** trong `changelog/unreleased/`, gộp lại
  sau. Hai agent không bao giờ sửa cùng một dòng nhật ký.

## Một điều cần sửa trong Starter Kit

Mã có khoá bí mật mặc định viết thẳng trong tệp, ví dụ
`"g9k_steamship_hmac_2026"` ở `AgentOpsService.js` và
`"g9k_e2b_volume_jwt_2026"` ở `E2BSandboxService.js`. Kho đó công khai. Nếu
triển khai mà không đặt biến môi trường thì ai cũng biết khoá ký.

## Nguồn

- `khanhlegood1/Game9K-Starter-Kit`, commit `b4af2a1`.
- `anomalyco/rune`, commit `7e3d266`: `README.md`, `AGENTS.md`, và mục "Agent
  tooling" cùng "Testing an app headless" của `crates/rune/README.md`.
  <https://github.com/anomalyco/rune>
- `../sources/kien-truc-kvu-kau.md`, mục 3.

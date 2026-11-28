# Chọn hướng kinh doanh: chín nguồn mới nói gì

Phân tích do agent viết ngày 2026-11-28, theo yêu cầu của chủ dự án: đọc chín
đường dẫn và một ảnh chụp màn hình, rồi áp vào lựa chọn ở issue #10 giữa
"Playtest B2B làm lõi" và "Launchpad KVU–KAU".

Đây là đề xuất. Quyết định là của chủ dự án. Agent không chạy mô hình nào,
không chơi game nào và không hỏi studio nào.

## Đề xuất

**Chọn Playtest B2B làm lõi. Để Launchpad KVU–KAU là bước sau, chỉ mở khi đã
có hộ chiếu do Playtest cấp.**

Lý do nằm ở một câu: cả chín nguồn đều làm rẻ việc _làm_ và _đo_ game, và
không nguồn nào làm rẻ hay làm bớt rủi ro phần _tiền_ của launchpad.

## Bốn điều rút ra

### 1. Làm một game trình duyệt đơn giản giờ tốn vài xu

Tám mô hình AI cùng làm ba game (Snake, Tetris, Breakout). Chi phí mỗi lần làm
từ 0,006 đến 0,254 USD; trung bình rẻ nhất 0,011 USD, đắt nhất 0,193 USD [1].

Một buổi chơi thử bằng người thật trên PlaytestCloud có giá từ 69 USD mỗi người
chơi [2]. Chia ra: tiền thử một game với một người bằng tiền làm khoảng 360
đến 6.300 game như trên (69 ÷ 0,193 và 69 ÷ 0,011).

Khi làm rẻ hơn đo hàng trăm lần thì thứ hiếm là phép đo, không phải game.
Playtest bán thứ hiếm. Launchpad cấp vốn cho thứ đang rẻ đi.

Giới hạn: ba game này là bản sao kinh điển, làm bằng một câu lệnh. Chúng không
chứng minh một game thương mại tốn vài xu. Tranh, thiết kế, vận hành và tiếp
thị vẫn tốn tiền.

### 2. Tự làm agent không còn là lợi thế

Tài liệu của Together AI dạy làm một agent sửa mã trong khoảng 400 dòng [3],
một bản sao Lovable sinh ứng dụng từ một câu lệnh [4], và một đường ống biến
PDF thành trang web bằng đầu ra có cấu trúc [5]. Agent chỉ đọc phần đầu của ba
bài này.

Nghĩa là "agent làm game" ai cũng dựng được trong vài ngày. Thứ không chép
được từ bài hướng dẫn là nhóm người chơi thử thật và một bản ghi đáng tin về
kết quả. Issue #10 đã nói điều này về PlaytestCloud.

Phần dùng lại được: cách ép đầu ra theo một lược đồ [5] hợp để biến số đo chơi
thử thành báo cáo có cấu trúc, tức là trang hộ chiếu.

### 3. Có sẵn công thức tính một agent đáng giá bao nhiêu

`joules_to_gdp` tính giá trị ròng của một việc AI làm [6]:

`giá trị ròng = Y × G − C`

- `G`: giá trị việc đó nếu chuyên gia làm (thời gian × lương).
- `C`: chi phí chạy AI.
- `Y`: 1 nếu kết quả của AI thắng hoặc hoà kết quả của chuyên gia, 0 nếu thua.

Áp cho một lượt chơi thử bằng agent:

| Ký hiệu | Ở Game9K                                                         | Giá trị                                       |
| ------- | ---------------------------------------------------------------- | --------------------------------------------- |
| `G`     | Giá thị trường của một buổi chơi thử bằng người                  | Từ 69 USD [2]                                 |
| `C`     | Tiền mô hình cho một lượt agent chơi thử                         | Chưa đo. Ước lượng ở dưới: 0,06 đến 13,50 USD |
| `Y`     | Tỉ lệ báo cáo của agent mà studio coi là ngang báo cáo của người | **Chưa biết. Đây là con số quyết định**       |

Ước lượng `C` dùng giá trong ảnh chụp màn hình Together AI ngày 2026-11-28 [7]
và một **giả định chưa đo** về số token mỗi lượt:

| Mô hình             | Giá vào / ra (USD mỗi triệu token) [7] | 300 nghìn vào + 30 nghìn ra | Gấp 10 lần |
| ------------------- | -------------------------------------- | --------------------------- | ---------- |
| MiniMax M3.1 Flash  | 0,15 / 0,60                            | 0,063 USD                   | 0,63 USD   |
| DeepSeek V4.1 Flash | 0,30 / 1,20                            | 0,126 USD                   | 1,26 USD   |
| Kimi K3.1 Pro       | 2,00 / 10,00                           | 0,90 USD                    | 9,00 USD   |
| Kimi K3             | 3,00 / 15,00                           | 1,35 USD                    | 13,50 USD  |

Kể cả ở mức đắt nhất, `C` vẫn nhỏ so với `G`. Vậy hướng Playtest sống hay chết
ở `Y`, không ở tiền mô hình.

Lưu ý khi dùng công cụ đo: bảng giá của `intelligence-per-watt` chỉ có OpenAI,
Anthropic và Google, và trả về chi phí 0 cho mô hình nó không biết [8]. Dùng
với mô hình trên Together AI mà không thêm giá thì báo cáo sẽ ghi 0 USD.

### 4. Đo `Y` bằng chính cách của The Blind Test

The Blind Test đưa hai trang web làm từ cùng một câu lệnh, một từ mô hình rẻ
(0,66 USD cho 11 trang) và một từ mô hình đắt (3,01 USD), rồi hỏi người xem
đoán [9]. Trang nói phần đông không phân biệt được; agent không thấy con số
nào đi kèm câu đó.

Làm y vậy cho Game9K: đưa cho người của studio hai báo cáo chơi thử của cùng
một game, một do người viết, một do agent viết, không ghi nguồn. Hỏi họ sẽ trả
tiền cho báo cáo nào và trả bao nhiêu. Đây cũng là dấu "tốt hơn bản trước"
trong hộ chiếu gọi vốn, dùng cho báo cáo thay vì cho game.

## So hai hướng

| Câu hỏi                        | Playtest B2B                                                         | Launchpad KVU–KAU                                                                     |
| ------------------------------ | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Chín nguồn giúp gì             | Hạ chi phí làm agent, chạy agent và viết báo cáo                     | Không giúp phần hợp đồng, pháp lý, người mua                                          |
| Bán thứ gì                     | Phép đo, thứ đang hiếm so với game                                   | Vốn cho từng phiên bản, trong khi làm phiên bản đang rẻ đi                            |
| Phải có trước khi thu đồng đầu | Một báo cáo mà một studio chịu trả tiền                              | Hợp đồng viết xong, kiểm toán, triển khai; pháp nhân; xác minh danh tính [10]         |
| Có giá thị trường để so        | Có: từ 69 USD mỗi người chơi [2]                                     | Chỉ có ví dụ số học trong tài liệu nguồn: 18.847,47 USD mỗi phiên bản [10]            |
| Đối thủ                        | PlaytestCloud đã có nhóm người chơi và đã có AI phân tích video [11] | Tài liệu nguồn tự dẫn: 85% trong 1.232 agent trên Virtuals đã chết hoặc gần chết [10] |
| Cần hướng kia không            | Không                                                                | Có: cổng của nó cần số đo do Playtest tạo ra                                          |

Dòng cuối là lý do về thứ tự. Launchpad không có phép đo thì không lọc được
game. Playtest không có launchpad vẫn bán được.

## Điều chín nguồn không chứng minh

- **Có studio trả tiền.** Không nguồn nào cho thấy điều này. Bộ số "Game
  Portal 2026" trong issue #10 chưa có nguồn (issue #27).
- **Agent chơi thử ngang người.** Xem `ai-agent-nganh-game.md`: máy tự chơi
  tìm được lỗi sập, không biết game có vui không.
- **Ai là người mua.** Một game làm hết vài xu thì người làm nó khó trả 69 USD
  để thử. Giả thuyết của agent: người trả tiền sẽ là bên phải _chọn_ giữa
  nhiều game, tức cổng game, nhà phát hành và bên cấp vốn. Chưa kiểm.

## Về nguồn

- `aibrowsergames.io` và `theblindtest.io` là trang quảng bá của Together AI.
  Chúng được dựng để cho thấy mô hình mở rẻ và đủ tốt.
- `ncm` là mô hình nghiên cứu sinh văn bản song song, thử trên TinyStories,
  XSum và Sudoku [12]. Agent không thấy nó liên quan tới lựa chọn này.
- `khanhlegood3/joules_to_gdp` và `khanhlegood3/ncm` giống hệt kho gốc của
  HazyResearch, chưa có thay đổi nào (so sánh ngày 2026-11-28).
- Ảnh chụp màn hình có dòng "Add credits to build with open-source models":
  tài khoản Together AI đó chưa nạp tiền.

## Thử rẻ trước khi chốt

1. Chạy agent chơi thử trên bốn game của Starter Kit. Ghi `C` thật cho mỗi
   lượt. Bị chặn bởi issue #29.
2. Nhờ năm người thật chơi cùng bốn game đó và viết báo cáo.
3. Đưa hai loại báo cáo, không ghi nguồn, cho ít nhất ba người làm studio. Hỏi
   họ trả tiền cho báo cáo nào và bao nhiêu.

Nếu không ai chịu trả đồng nào thì hướng Playtest cũng chưa được chứng minh,
và phải hỏi lại ai là người mua.

## Điều gì sẽ đổi đề xuất này

- Đã có bên cấp vốn hoặc studio cam kết dùng launchpad.
- Đã có đối tác có giấy phép lo phần phát hành token.
- Kết quả thử ở trên cho thấy không ai trả tiền cho báo cáo chơi thử.

## Nguồn

1. AI Browser Games. <https://www.aibrowsergames.io/> (đọc 2026-11-28)
2. Games User Research, "Top remote playtest platforms for unmoderated
   testing", 2026-04-20.
   <https://gamesuserresearch.com/top-remote-playtest-platforms-for-unmoderated-testing/>
3. Together AI, "Build a coding agent".
   <https://docs.together.ai/docs/how-to-build-coding-agents>
4. Together AI, "Build a Lovable clone with Kimi K3".
   <https://docs.together.ai/docs/how-to-build-a-lovable-clone-with-kimi-k2>
5. Together AI, "Build a resume-to-website app with structured outputs".
   <https://docs.together.ai/docs/pdf-to-website-with-structured-outputs>
6. `HazyResearch/joules_to_gdp`, `analysis/README.md`.
   <https://github.com/HazyResearch/joules_to_gdp>
7. Ảnh chụp màn hình trang Models của Together AI, chủ dự án gửi ngày
   2026-11-28. Không lưu trong kho.
8. Intelligence Per Watt, "Cost Tracking".
   <https://hazyresearch.stanford.edu/intelligence-per-watt/cost/pricing/>
9. The Blind Test. <https://www.theblindtest.io/> (đọc 2026-11-28)
10. `../sources/kien-truc-kvu-kau.md`, mục 1, 3 và 4.
11. PlaytestCloud, bảng giá. <https://www.playtestcloud.com/pricing>
12. `HazyResearch/ncm`. <https://github.com/HazyResearch/ncm>

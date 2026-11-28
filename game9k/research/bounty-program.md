# Bounty program và launchpad: khác gì, có nên dùng cho Game9K

Phân tích do agent viết ngày 2026-11-28, theo câu hỏi của chủ dự án. Đây là đề
xuất, chưa phải quyết định.

## Trả lời ngắn

- Hai thứ này không thay thế nhau. **Launchpad đưa tiền vào dự án. Bounty đưa
  tiền ra khỏi dự án.** Một chương trình bounty không gọi được vốn; nó cần có
  sẵn một quỹ thưởng.
- Nên dùng ở **một chỗ**: thưởng thêm cho người chơi thử khi phát hiện của họ
  được nhận vào báo cáo. Chỗ này nằm trong hướng đã chốt (ADR 0012) và gần như
  không cần thêm phần mềm.
- Chưa nên dùng ở ba chỗ còn lại: bounty mở cho mọi người, bounty viết mã cho
  kho này, và bounty quảng bá trả bằng token.

## Khác nhau ở đâu

|                          | Launchpad                                              | Bounty program                                                 |
| ------------------------ | ------------------------------------------------------ | -------------------------------------------------------------- |
| Câu hỏi nó trả lời       | Lấy tiền ở đâu để làm game                             | Trả cho ai, vì việc gì, khi nào                                |
| Tiền đi từ đâu đến đâu   | Người mua → dự án                                      | Dự án (hoặc studio) → người làm việc                           |
| Trả lúc nào              | Trước khi có sản phẩm                                  | Sau khi kết quả được chấp nhận                                 |
| Bên bỏ tiền nhận được gì | Một token, và kỳ vọng nó lên giá                       | Một kết quả cụ thể: một lỗi tìm ra, một bản sửa, một bài viết  |
| Ai chịu rủi ro           | Người mua: dự án có thể không làm xong                 | Người làm: làm xong mà không được nhận thì không có tiền       |
| Việc khó nhất            | Giữ lời sau khi đã cầm tiền; pháp lý của việc chào bán | Chấm bài: bài trùng, bài rác, tranh cãi về việc nhận hay không |
| Phải có trước            | Hợp đồng, kiểm toán, tư vấn pháp lý                    | Một quỹ thưởng và một bộ luật chấm                             |

Với launchpad, câu trả lời cho "người mua được lợi gì" đã có trong
`quyen-loi-cac-ben.md`: chỉ có bán lại với giá cao hơn. Với bounty, không ai
nắm tài sản gì; đó là tiền công trả theo kết quả.

## Bốn loại bounty

| Loại                 | Trả cho việc gì                                                   | Ví dụ                                                                            |
| -------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| Tìm lỗi              | Một lỗi có thật, tái hiện được                                    | Chương trình của curl: 87 lỗ hổng được xác nhận, hơn 100.000 USD tiền thưởng [1] |
| Viết mã              | Một pull request được merge cho một issue có treo thưởng          | Algora, Gitcoin (agent chưa đọc trang gốc của hai bên này)                       |
| Quảng bá             | Bài đăng, lượt chia sẻ, bản dịch; thường trả bằng token của dự án | Các "bounty campaign" đi kèm đợt bán token [2]                                   |
| Chơi thử và nhận xét | Một phát hiện về game được nhận vào báo cáo                       | Chưa tìm nguồn cho một ví dụ cụ thể                                              |

Loại thứ ba là loại hay đi cùng launchpad, và là lý do hai khái niệm này hay bị
lẫn: nó là phần tiếp thị của một đợt bán token, trả bằng chính token đó.

## Áp vào Game9K

### Nên: thưởng thêm cho phát hiện của người chơi thử

Bản yêu cầu đã duyệt trả cho người chơi thử một khoản cố định cho mỗi phiên
chơi, và để ngỏ câu "trả bao nhiêu thì họ làm cẩn thận" (mục 10). Bounty là một
cách trả lời câu đó.

Không nên thay khoản cố định bằng bounty. Nếu chỉ trả theo số lỗi tìm được,
người chơi thử sẽ đi săn lỗi thay vì chơi như một người chơi, và các số đo của
phiên chơi (thời lượng, chỗ bỏ cuộc) không còn nói gì về người chơi thật. Vậy
nên giữ khoản cố định cho việc chơi, và thêm thưởng cho phát hiện.

Phần lớn những gì cần đã có trong bản yêu cầu:

| Bounty cần                        | Bản yêu cầu đã có                                                          |
| --------------------------------- | -------------------------------------------------------------------------- |
| Bằng chứng cho mỗi phát hiện      | FR-09: mỗi phát hiện trong báo cáo dẫn tới bằng chứng trong một phiên chơi |
| Một người chấm                    | FR-10: người vận hành duyệt báo cáo trước khi studio thấy                  |
| Sổ ghi ai được trả bao nhiêu      | FR-12: sổ ghi thưởng cho từng người chơi thử                               |
| Biết chắc lỗi thuộc phiên bản nào | FR-01: mỗi phiên bản có một mã băm cố định                                 |

Thứ còn thiếu là luật chấm. Bốn điều agent đề xuất:

1. **Quỹ thưởng cố định cho mỗi lượt chơi thử, định trước, và luôn chia hết.**
   Chia theo số phát hiện được nhận; nếu không có phát hiện nào thì chia đều
   cho những người đã chơi đủ phiên. Vì quỹ luôn chia hết, người chấm không
   được lợi gì khi từ chối một phát hiện, và phí của studio vẫn không đổi theo
   kết quả (GĐ-2).
2. **Người vận hành chấm, không phải studio.** Studio là bên trả tiền nên có lý
   do để từ chối.
3. **Phát hiện hợp lệ phải trỏ tới một phiên chơi đã được hệ thống ghi lại.**
   Bằng chứng do hệ thống ghi, không phải do người chơi thử tự nộp, nên một
   phát hiện bịa ra sẽ không có gì để trỏ tới.
4. **Phát hiện trùng thì người ghi trước được tính.**

Giới hạn cần nói thẳng: đợt thử có khoảng năm người chơi. Với cỡ đó, không thể
kết luận bounty có làm nhận xét tốt hơn không. Nó chỉ cho một quan sát.

### Chưa nên: bounty mở cho mọi người

Tức là studio treo thưởng và bất kỳ ai cũng vào tìm lỗi. Đây là một sản phẩm
khác: cần một đội người chơi thử đủ lớn (mảnh số 10 trong
`du-cong-nghe-chua.md`, hiện chưa có) và cần cách chặn bài rác.

Rủi ro bài rác là có thật và đã có số. curl đóng chương trình thưởng tìm lỗi
ngày 2026-01-31 sau gần bảy năm. Người duy trì viết rằng trước đây hơn 15% số
báo cáo là lỗ hổng thật; từ 2025 tỉ lệ đó rơi xuống dưới 5%. Ông nêu ba nguyên
nhân, đứng đầu là báo cáo rác do AI viết ra. Ông cũng viết rằng tiền thưởng kéo
báo cáo thật tới, nhưng khiến việc gửi bài rác gần như không mất gì [1].

Game9K có một lợi thế ở đây (điều 3 ở trên), nhưng lợi thế đó chưa được thử.

### Chưa nên: bounty viết mã cho kho này

Tức là treo thưởng trên các issue #45 đến #54 để người ngoài viết mã.

- Chưa có ngân sách.
- Kho chưa có giấy phép (issue #14), nên quyền đối với mã của người ngoài đóng
  góp chưa rõ.
- Người duyệt hiện là một người. Agent rà soát pull request (#30) chưa có.
- Việc viết mã ở kho này đang do agent làm.

### Không nên: bounty quảng bá trả bằng token

- Nó cần một token, mà ADR 0012 ghi không có việc nào về token được lên kế
  hoạch.
- Một bài viết trong ngành ghi loại này kéo theo bot và tài khoản giả [3].
  Game9K bán số đo đáng tin; trả tiền cho lượt theo dõi là mua số đo giả.

## Đề xuất

1. Không đổi bản yêu cầu của bản đầu. Lượt chơi thử thứ nhất giữ cách trả cố
   định.
2. Ở lượt chơi thử thứ hai của đợt thử, dùng quỹ thưởng theo bốn điều trên, rồi
   ghi lại số phát hiện được nhận ở hai lượt. Tiền vẫn chuyển tay (GĐ-6).
3. Ba loại còn lại ghi là "chưa làm", kèm lý do ở trên.

Điều 2 thêm một việc cho người vận hành và đổi cách trả cho người chơi thử, nên
cần chủ dự án đồng ý trước.

## Chưa kiểm

- Chưa hỏi người chơi thử nào xem họ muốn được trả theo cách nào.
- Thuế và quy định của Việt Nam đối với việc trả thưởng cho cá nhân.
- Trang gốc của Algora và Gitcoin; agent chỉ thấy mô tả của bên thứ ba.
- Nguồn [2] và [3] là bài viết của các trang trong ngành, không phải nghiên
  cứu, và agent chỉ đọc đoạn trích. Agent không dùng con số nào từ hai bài đó.
- Lợi thế ở điều 3 (bằng chứng do hệ thống ghi) chưa được thử với một người cố
  tình gian lận.

## Nguồn

1. Daniel Stenberg, "The end of the curl bug-bounty", 2026-01-26, đọc ngày
   2026-11-28.
   <https://daniel.haxx.se/blog/2026/01/26/the-end-of-the-curl-bug-bounty/>
2. TokenMinds, "Crypto Bounty Campaigns: The Ultimate Guide", 2022-04-04, đoạn
   trích từ kết quả tìm kiếm ngày 2026-11-28.
   <https://tokenminds.co/blog/knowledge-base/crypto-bounty-campaigns>
3. "The Pros and Cons of Crypto Bounty Programs", Medium, 2018-11-18, đoạn
   trích từ kết quả tìm kiếm ngày 2026-11-28.
   <https://medium.com/talkbitcointalk/the-pros-and-cons-of-crypto-bounty-programs-e839fdf08c42>

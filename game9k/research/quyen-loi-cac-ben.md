# Quyền lợi của các bên: Playtest B2B và Launchpad

Phân tích do agent viết ngày 2026-11-28, theo câu hỏi của chủ dự án. Đây không
phải tư vấn pháp lý hay tư vấn đầu tư, và chưa luật sư nào xem.

Hai phần dưới đây khác nhau về độ chắc:

- **Playtest B2B** là lõi đã chốt (ADR 0012), nhưng Game9K chưa có giá, chưa có
  khách. Con số là của thị trường, lấy từ PlaytestCloud.
- **Launchpad KVU–KAU** không được chọn. Quyền lợi là thứ tài liệu nguồn
  _thiết kế trên giấy_; chưa hợp đồng nào được viết xong hay triển khai.

## Playtest B2B

| Bên                                             | Bỏ ra                                   | Nhận về                                                                                            | Rủi ro phải chịu                                 |
| ----------------------------------------------- | --------------------------------------- | -------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| **Studio**                                      | Phí cho mỗi lượt chơi thử; một bản game | Bằng chứng về cách người thật chơi bản đó, trước khi tốn tiền quảng cáo [1]; một trang hộ chiếu    | Báo cáo nói game dở. Bản chưa phát hành bị lộ    |
| **Người chơi thử**                              | Thời gian, nhận xét                     | Tiền thưởng mỗi phiên; được chơi game chưa ra                                                      | Không được trả nếu phiên làm ẩu; việc không đều  |
| **Game9K**                                      | Công đo, nhóm người chơi thử, hạ tầng   | Phần chênh giữa phí studio trả và thưởng trả cho người chơi [1]; kho số đo tích luỹ theo thời gian | Mất uy tín nếu số đo sai hoặc bị làm giả         |
| **Bên đọc hộ chiếu** (cổng game, nhà phát hành) | Chưa rõ: có thể trả phí, có thể không   | Một cách lọc game không phải tự thẩm định từ đầu                                                   | Tin vào số đo do bên được studio trả tiền làm ra |

Mốc thị trường, không phải số của Game9K:

- PlaytestCloud tính từ 69 USD mỗi người chơi [2].
- Người chơi thử của họ nhận 5–9 USD cho một bài 15 phút, chỉ khi làm tốt [3].
- Khi studio tự mang người chơi đến, PlaytestCloud tính 0,5 Video Token cho mỗi
  người mỗi phiên, và chỉ tính người đã bắt đầu chơi [4]. Trang đó không ghi một
  Video Token giá bao nhiêu.

Chênh lệch giữa 69 USD và 5–9 USD là chỗ một dịch vụ chơi thử kiếm tiền, và
cũng là chỗ nó phải trả cho việc tuyển người, chống gian lận và phân tích.

Bình luận của chủ dự án ở issue #10 còn nêu một quyền lợi ở giai đoạn sau: game
qua được bài thử thì được Game9K ký phát hành trên cổng. ADR 0012 chưa quyết
điều này.

## Launchpad KVU–KAU

Mọi dòng dưới đây lấy từ `../sources/kien-truc-kvu-kau.md`, ghi theo mục.

| Bên                                | Bỏ ra                      | Nhận về theo thiết kế                                                                                                                                                             | Rủi ro phải chịu                                                            |
| ---------------------------------- | -------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **Studio**                         | Phí; phải đạt từng mốc     | Tiền đặt trước: 30% ngay, 70% khi giao hàng (§4). Vốn token: 79,1% số huy động được, chia ba mốc 30/40/30 (§2)                                                                    | Không đạt mốc thì không nhận phần còn lại; dự án đứng yên thì người mua rút |
| **Người mua token (KVU)**          | Tiền mua token             | Tiền nằm trong két, studio chỉ nhận theo mốc. Dự án đứng 60–90 ngày thì rút lại phần mình trong số còn lại, không phí phạt (§2). Tổng cung cố định, nền tảng không giữ token (§3) | Giá token. Số rút về có thể ít hơn số bỏ vào                                |
| **Người mua đặt trước (game thủ)** | Tiền cọc theo giá cao nhất | Càng đông mua giá càng hạ, hoàn phần chênh cho cả người mua sớm. 70% doanh thu ròng của studio bị khoá đến khi giao vật phẩm (§4)                                                 | Giao trễ                                                                    |
| **Người giới thiệu (KOL)**         | Công giới thiệu            | Hoa hồng cố định, ví dụ 8%; không được tự giới thiệu mình (§4)                                                                                                                    | Giá hạ theo bậc thì hoa hồng trên đơn cũ giảm theo                          |
| **Người chơi**                     | Giờ chơi thật              | Quỹ thưởng 10–20% tổng cung cộng 50% tiền phạt đầu cơ, mỗi người tối đa 5% quỹ. Quyền mua ưu tiên trong 24 giờ đầu gắn với giờ chơi (§2)                                          | Phần thưởng là token                                                        |
| **Game9K**                         | Hạ tầng, đo đạc, pháp lý   | Phí 2% trên số token huy động được (§2); phí 5% trên doanh thu đặt trước (§4)                                                                                                     | Pháp lý; lỗi hợp đồng                                                       |

Hai điều nên biết trước khi dùng bảng này:

- **Agent không tìm thấy chỗ nào trong tài liệu nguồn ghi người giữ token có
  quyền với doanh thu hay lợi nhuận của game.** Thứ họ nhận về là các bảo vệ
  ở trên và giá bán lại của token. Lợi ích tài liệu nêu cho họ là gián tiếp:
  studio có tiền mặt sớm nên ít bỏ dở (§4).
- **Người chơi ở Việt Nam và Đông Nam Á được mô tả là "đóng góp dữ liệu giờ
  chơi miễn phí"**, còn thanh khoản token đến từ nước ngoài (§1). Tài liệu
  cũng ghi cửa token phải chặn người dùng ở Việt Nam (§4). Vậy quỹ thưởng bằng
  token và quyền mua ưu tiên có tới tay người chơi trong nước hay không là
  câu hỏi tài liệu chưa trả lời.

## Người chỉ mua token của phiên bản 1

Câu hỏi của chủ dự án ngày 2026-11-28. Trả lời theo hồ sơ mặc định của tài liệu
nguồn (VBOND-LV, bảng ở §2). Hiện không có token nào để mua: launchpad không
được chọn (ADR 0012) và tài liệu ghi mã hợp đồng chưa viết xong.

**Trả lời ngắn: lợi ích tài chính duy nhất là bán lại token cho người khác với
giá cao hơn giá mua.** Tài liệu không thiết kế dòng tiền nào đi từ game về
người giữ token.

### Tiền của người mua đi đâu

Một đợt bán hết thu 76,11 SOL (§2):

| Khoản                                            |   SOL |  Phần |
| ------------------------------------------------ | ----: | ----: |
| Trả cho studio theo ba mốc 30% / 40% / 30%       | 60,20 | 79,1% |
| Ghép với 50 triệu token làm thanh khoản trên sàn | 14,39 | 18,9% |
| Phí nền tảng                                     |  1,52 |  2,0% |

Khi studio đạt đủ ba mốc, toàn bộ số tiền đã được tiêu hoặc nằm ở sàn. Không
khoản nào quay về người giữ token.

### Thứ người giữ token có

- **Khả năng lãi do giá.** Tài liệu ghi biên độ giá trên đường cong bán là 5,15 lần (§2); agent hiểu đó là giá token cuối so với token đầu. Vậy người mua sớm có lãi trên giấy nếu đợt bán hết. Muốn
  thành tiền thì phải có người mua lại. Thanh khoản trên sàn chỉ 14,39 SOL so
  với 76,11 SOL đã huy động, và tài liệu tự ghi "Toán học KVU không bảo đảm giá
  token sau khi tốt nghiệp lên DEX" (§3).
- **Các bảo vệ để lỗ ít hơn.** Studio chỉ nhận tiền theo mốc. Dự án đứng 60–90
  ngày thì người giữ rút phần mình trong quỹ còn lại, không phí phạt; tài liệu
  ghi rõ khoản này "không hoàn đủ 100% vốn bỏ vào" (§3). Tổng cung cố định 1 tỷ
  token, nền tảng không giữ token.
- **Lợi gián tiếp.** Studio có tiền đặt trước sớm nên ít bỏ dở (§4).

Ví dụ do agent tính, với giả định "quỹ còn lại" là phần chưa trả cho studio và
chưa ai bán: dự án đứng sau mốc đầu thì còn 42,14 SOL cho những người đã góp
76,11 SOL, khoảng 55%; đứng sau mốc hai thì còn 18,06 SOL, khoảng 24%. Công
thức chia trong tài liệu là một hình agent không đọc được, nên đây chỉ là minh
hoạ.

Mua rồi bán ngay thì lỗ ít nhất 5,95% (§2). Luật này chặn bot, và cũng áp cho
mọi người muốn lướt nhanh.

### Thứ tài liệu không cho

- **Không có khoản trả nào.** Agent tìm các từ lãi, lợi tức, cổ tức, chia doanh
  thu, mua lại, đốt token và không thấy cơ chế nào. Tài liệu gọi token là "trái
  phiếu phiên bản" và dùng chữ "đáo hạn", nhưng không định nghĩa khoản tiền nào
  được trả khi đến hạn.
- **Không có quyền với phiên bản 2.** Mỗi phiên bản có token, đường cong bán và
  két riêng; tài sản của bản trước và bản sau không chạm nhau (§2). Bản sau
  thất bại không kéo bản 1 xuống, và bản sau thành công cũng không chảy về
  người giữ token bản 1. Tài liệu xếp câu "người mua có định giá riêng từng
  phiên bản không" vào nhóm chưa chứng minh (§2).
- **Không có quyền mua ưu tiên.** Quyền đó gắn với giờ chơi thật, không gắn với
  việc giữ token (§2).
- **Chưa có văn bản quyền.** "Token Rights Agreement" là một đầu việc phải làm
  trước khi mở bán (§5).
- **Một phần tổng cung chưa rõ chủ.** Bán 60%, ghép sàn 5%, quỹ thưởng người
  chơi 10–20%. Agent không thấy tài liệu nói 15–25% còn lại thuộc về ai.

### Ai được mua

Theo §4, token chỉ được chào bán cho nhà đầu tư nước ngoài qua tổ chức được cấp
phép, và cửa token phải chặn người dùng ở Việt Nam.

### Điều này có nghĩa gì khi đi gọi vốn

Đây là nhận định của agent.

- Không nên gọi token này là "trái phiếu" hay nói nó có lợi tức trước nhà đầu
  tư. Nó không trả gốc và không trả lãi.
- Muốn người giữ token có lợi ích tài chính thật thì phải thiết kế thêm, ví dụ
  trích một phần doanh thu của phiên bản để mua lại token, hoặc cho quyền đổi
  sang token bản sau. Mỗi cách làm token giống chứng khoán hơn và cần luật sư
  xem trước. Không việc nào trong số này nằm trong kế hoạch (ADR 0012).

## Chỗ quyền lợi kéo ngược nhau

Đây là nhận định của agent.

**Ai trả tiền cho người đo.** Trong Playtest B2B, studio trả tiền cho bên chấm
game của chính mình. Bên đo có động cơ viết báo cáo dễ nghe để giữ khách. Cách
giữ cho phép đo ngay thẳng là thu phí cố định cho mỗi lượt đo, dù kết quả tốt
hay xấu, và để bên đọc hộ chiếu kiểm lại được số đo.

**Bên đo ăn theo kết quả.** Trong Launchpad, Game9K thu 2% số tiền huy động
được và 5% doanh thu đặt trước, và cũng là bên chạy phép đo để mở mốc. Mốc
được mở thì Game9K có thêm tiền. Tài liệu nguồn xử lý bằng hai khoá ký số đo ("Dual-Oracle"), lấy số nhỏ hơn
trong hai, cộng 0,5% mẫu do người kiểm lại (§3). Agent không thấy chỗ nào nói
ai giữ hai khoá đó.

**Người chơi thử được trả theo phiên.** Trả theo số phiên thì có động cơ làm
nhanh và làm ẩu. PlaytestCloud chỉ trả cho bài làm tốt [3].

Điều này củng cố thứ tự ở ADR 0012: làm phần đo trước, thu phí không phụ thuộc
kết quả. Nếu sau này mở launchpad thì phần đo đã có lịch sử riêng, không lẫn
với phần tiền.

## Về `aredotna/arena-passport`

Nó không liên quan tới hộ chiếu gọi vốn. Đây là mô-đun đăng nhập cho trang web của Are.na; "passport" là tên thư viện đăng nhập Passport.js.

- Viết bằng CoffeeScript trên Express 3.4.7; commit cuối là ngày 2017-05-15.
- Nó nhận mã đăng nhập qua tham số `access_token` trên địa chỉ, một cách làm
  nay bị coi là không an toàn.

**Không nên dùng mã này.** Có một ý đáng lấy: một mô-đun đăng nhập dùng chung
cho mọi phần của ứng dụng, đặt "người dùng hiện tại" vào một chỗ duy nhất.

Áp cho Game9K: bốn bên ở bảng Playtest là bốn vai (studio, người chơi thử, bên
đọc hộ chiếu, nhân viên Game9K) của một hệ đăng nhập duy nhất. Kho này đã dùng
Supabase Auth cho từ điển; Game9K nên dùng cùng công nghệ, ở một dự án
Supabase riêng. Đây là mảnh số 7 trong `du-cong-nghe-chua.md`.

## Nguồn

1. Bình luận của chủ dự án ở issue #10, 2026-11-27. Đây là ý định thiết kế.
2. Games User Research, "Top remote playtest platforms for unmoderated
   testing", 2026-04-20.
   <https://gamesuserresearch.com/top-remote-playtest-platforms-for-unmoderated-testing/>
3. Lilach Bullock, "Is PlaytestCloud Legit? How It Pays and What to Check
   (2026)", đọc ngày 2026-11-28; bài dẫn lại trang trợ giúp người chơi thử của
   PlaytestCloud, agent chưa đọc trang gốc.
   <https://www.lilachbullock.com/is-playtestcloud-legit/>
4. PlaytestCloud, "Overview: Bring Your Own Players (BYOP)", 2026-08-12.
   <https://help.playtestcloud.com/en/articles/3803930-overview-bring-your-own-players-byop>
5. `aredotna/arena-passport`, commit `87f8cad`: `README.md`, `index.coffee`,
   `package.json`. <https://github.com/aredotna/arena-passport>

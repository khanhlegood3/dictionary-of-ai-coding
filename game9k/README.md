# Game9K

Thư mục này là nơi quản trị dự án Game9K: yêu cầu, thiết kế, nghiên cứu và
các tài liệu mang sang từ kho đã mất. Lý do nó nằm trong kho từ điển được ghi
ở [ADR 0011](../internal/adr/0011-the-repository-also-holds-the-game9k-project.md).

Game9K là một launchpad cho game web: studio đưa từng phiên bản game lên,
người chơi chơi thử ngay trên trình duyệt, và vốn chỉ được mở theo mốc khi dữ
liệu chơi thật cho thấy bản mới tốt hơn bản cũ. Đây là mô tả theo các tài liệu
của chủ dự án trong `sources/`. Hướng kinh doanh chưa chốt (issue #10).

## Ở đâu có gì

| Đường dẫn                 | Nội dung                                                    |
| ------------------------- | ----------------------------------------------------------- |
| `PROCESS.md`              | Cách dự án chạy: sáu pha, cổng, vai của người và của agent  |
| `sources/`                | Tài liệu mang sang, giữ nguyên văn. Đọc `sources/README.md` |
| `research/`               | Phân tích do agent viết, chưa phải quyết định               |
| `../internal/adr/`        | Quyết định, chung dãy số với từ điển                        |
| Issue có nhãn `game9k`    | Việc cần làm                                                |
| <https://ai9k.vercel.app/tasks> | Bảng việc và quyết định, đọc từ GitHub                |

## Sáu pha

Chưa pha nào qua cổng ở kho này. Cột "Bản nháp có sẵn" liệt kê thứ đã làm ở
nơi khác. Chúng là đầu vào và chưa được thẩm định ở đây.

| Pha | Đầu ra                               | Bản nháp có sẵn                                                                | Trạng thái     |
| --- | ------------------------------------ | ------------------------------------------------------------------------------ | -------------- |
| P01 | Bản yêu cầu sản phẩm, backlog        | `GameFun/docs/PRD.md`, whitepaper, `sources/kien-truc-kvu-kau.md`              | Chưa qua cổng  |
| P02 | Màn hình được duyệt                  | <https://game9k.vercel.app> (ghi "Prototype P02 · dữ liệu mô phỏng")           | Chưa qua cổng  |
| P03 | Hợp đồng API, mô hình dữ liệu        | `GameFun/docs/02-database-schema.md`, `03-api-specification.md`                | Chưa qua cổng  |
| P04 | Mã chạy được, có kiểm thử            | `khanhlegood1/Game9K-Starter-Kit`, <https://game9k-starter-kit-black.vercel.app> | Chưa qua cổng |
| P05 | Yêu cầu phi chức năng, mô hình đe doạ | `GameFun/docs/05-c4-architecture-and-nfr.md`                                   | Chưa qua cổng  |
| P06 | Bản chạy thật, sổ tay vận hành       | Hai site trên Vercel, đều là bản nháp                                          | Chưa qua cổng  |

`GameFun` là `khanhlegood1/GameFun`.

## Việc đang mở

- #10: chọn mô hình kinh doanh.
- #26: khôi phục mã nguồn từ tài khoản GitHub đã mất.
- #27: bộ số "Game Portal 2026" chưa có nguồn.
- #28: viết bản yêu cầu sản phẩm (cổng P01).
- #29: chọn nơi chứa mã nguồn.
- #30: thêm agent rà soát pull request.
- #31: `/tasks` hiển thị pha và cổng.

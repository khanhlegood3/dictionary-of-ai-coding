# Game9K

Thư mục này là nơi quản trị dự án Game9K: yêu cầu, thiết kế, nghiên cứu và
các tài liệu mang sang từ kho đã mất. Lý do nó nằm trong kho từ điển được ghi
ở [ADR 0011](../internal/adr/0011-the-repository-also-holds-the-game9k-project.md).

**Hướng kinh doanh đã chốt ngày 2026-11-28:** lõi của Game9K là dịch vụ chơi
thử trả phí cho studio
([ADR 0012](../internal/adr/0012-game9k-takes-paid-playtesting-for-studios-as-its-core.md)).
Launchpad KVU–KAU không được chọn. Lựa chọn này chưa được kiểm bằng khách hàng
thật; việc đầu tiên là đợt thử có thu tiền trong
`research/chon-huong-kinh-doanh.md`.

## Ở đâu có gì

| Đường dẫn                 | Nội dung                                                    |
| ------------------------- | ----------------------------------------------------------- |
| `PROCESS.md`              | Cách dự án chạy: sáu pha, cổng, vai của người và của agent  |
| `01-requirements/` | Bản nháp của pha P01. Chưa qua cổng |
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
| P01 | Bản yêu cầu sản phẩm, backlog        | `GameFun/docs/PRD.md`, whitepaper, `sources/kien-truc-kvu-kau.md`, `01-requirements/ho-chieu-goi-von.md`              | Chưa qua cổng  |
| P02 | Màn hình được duyệt                  | <https://game9k.vercel.app> (ghi "Prototype P02 · dữ liệu mô phỏng")           | Chưa qua cổng  |
| P03 | Hợp đồng API, mô hình dữ liệu        | `GameFun/docs/02-database-schema.md`, `03-api-specification.md`                | Chưa qua cổng  |
| P04 | Mã chạy được, có kiểm thử            | `khanhlegood1/Game9K-Starter-Kit`, <https://game9k-starter-kit-black.vercel.app> | Chưa qua cổng |
| P05 | Yêu cầu phi chức năng, mô hình đe doạ | `GameFun/docs/05-c4-architecture-and-nfr.md`                                   | Chưa qua cổng  |
| P06 | Bản chạy thật, sổ tay vận hành       | Hai site trên Vercel, đều là bản nháp                                          | Chưa qua cổng  |

`GameFun` là `khanhlegood1/GameFun`.

## Việc đang mở

- #26: khôi phục mã nguồn từ tài khoản GitHub đã mất.
- #27: bộ số "Game Portal 2026" chưa có nguồn.
- #28: bản yêu cầu sản phẩm `01-requirements/PRD.md` đang chờ chủ dự án duyệt ở
  cổng P01.
- #29: chọn nơi chứa mã nguồn.
- #30: thêm agent rà soát pull request.
- #31: `/tasks` hiển thị pha và cổng.

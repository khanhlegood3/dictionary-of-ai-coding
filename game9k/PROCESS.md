# Cách dự án Game9K chạy

Dự án theo "AI-Agile Product Development Framework" (bbv Software Services và
Gotik Consulting, bản hướng dẫn v1.0). Tệp này ghi cách khung đó được áp dụng
ở đây. Bản trình chiếu gốc không nằm trong kho vì nó thuộc về tác giả của nó.

## Bốn nguyên tắc

1. **Màn hình trước, hợp đồng theo sau.** Chốt giao diện rồi mới viết backend.
   Hợp đồng API được suy ra từ màn hình đã duyệt.
2. **AI tạo, người duyệt.** Agent không tự chuyển sang pha sau.
3. **Code là hệ quả.** Yêu cầu → màn hình → API → mô hình dữ liệu → backend.
   Mỗi lớp được suy ra từ lớp trước.
4. **GitHub là nguồn duy nhất.** Mỗi việc là một issue. Mỗi quyết định là một
   ADR. Mỗi cổng là một pull request.

## Sáu pha và cổng của chúng

| Pha | Việc                               | Đầu ra trong kho                              | Người duyệt ở cổng |
| --- | ---------------------------------- | --------------------------------------------- | ------------------ |
| P01 | Làm rõ yêu cầu                     | `01-requirements/PRD.md`, issue có user story | Chủ dự án          |
| P02 | Dựng và duyệt màn hình             | `02-ux/`, liên kết bản xem thử                | Chủ dự án          |
| P03 | Hợp đồng API và mô hình dữ liệu    | `03-contract/openapi.yaml`, sơ đồ dữ liệu     | Chủ dự án          |
| P04 | Xây dựng, kiểm thử trước           | Pull request ở kho mã nguồn (#29)             | Chủ dự án          |
| P05 | Thẩm định phi chức năng và bảo mật | `05-nfr/`, các ADR                            | Chủ dự án          |
| P06 | Triển khai                         | Workflow, sổ tay vận hành                     | Chủ dự án          |

Khung gốc chia vai duyệt cho product owner, kiến trúc sư, trưởng nhóm và
người quản lý phát hành. Dự án hiện có một người, nên mọi cổng do chủ dự án
duyệt. Khi có thêm người, sửa bảng này bằng một ADR.

Từ P03 trở đi, frontend và backend làm song song dựa trên hợp đồng API.

## Một cổng diễn ra thế nào

1. Agent làm đầu ra của pha trên một nhánh và mở pull request có nhãn `gate`
   và nhãn pha, ví dụ `phase:P01`.
2. Phần mô tả ghi rõ điều chưa kiểm và các giả định.
3. Các bước kiểm tra tự động chạy trên pull request.
4. Chủ dự án đọc, yêu cầu sửa hoặc merge. Merge là phê duyệt.

Agent không merge, và không viết "đã qua cổng" ở bất cứ đâu trước khi pull
request được merge.

## Nhãn

| Nhãn                      | Nghĩa                                   |
| ------------------------- | --------------------------------------- |
| `game9k`                  | Việc của Game9K, không phải của từ điển |
| `phase:P01` … `phase:P06` | Việc thuộc pha nào                      |
| `gate`                    | Pull request là cổng của một pha        |

Các nhãn phân loại (`needs-triage`, `ready-for-agent`, …) dùng chung với từ
điển, giải thích ở `internal/triage-labels.md`.

## Agent nào làm gì

| Việc                           | Cách làm hiện có                                        | Tình trạng                |
| ------------------------------ | ------------------------------------------------------- | ------------------------- |
| Làm một issue ngay trên GitHub | Gõ `@claude` trong issue (ADR 0010)                     | Đã cài, chưa chạy lần nào |
| Làm một issue, có máy để chạy  | Claude Code trên web, hoặc Vibe Kanban trên máy cá nhân | Không cần gì trong kho    |
| Rà soát pull request           | Chưa có                                                 | Issue #30                 |
| Tra thuật ngữ AI coding        | MCP server của từ điển, `/api/mcp`                      | Đang chạy                 |

Quy tắc cho mọi agent nằm ở `AGENTS.md` tại gốc kho.

## Số liệu phải có nguồn

Một con số trong tài liệu Game9K ghi nó lấy từ đâu: một tệp, một địa chỉ, hay
một phép đo chạy lại được. Số không có nguồn được ghi "chưa có nguồn" và
không dùng để biện minh cho một quyết định. Xem issue #27.

## Chỉ số của quy trình

Khung gốc đặt mục tiêu: triển khai ít nhất một lần mỗi sprint, thời gian từ
commit đến bản chạy thật dưới 2 ngày, phục hồi dưới 1 giờ, tỉ lệ thay đổi gây
lỗi dưới 5%, cổng được duyệt trong 24 giờ, độ phủ kiểm thử từ 80%. Dự án chưa
đo chỉ số nào trong số này.

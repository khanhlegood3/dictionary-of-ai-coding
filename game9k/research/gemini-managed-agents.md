# Mẫu Gemini Managed Agents: dùng gì cho Game9K

Phân tích do agent viết ngày 2026-11-28, từ việc đọc
`google-gemini/gemini-managed-agents-templates` ở commit `3cbcc8d`
(2026-10-19). Không mẫu nào được chạy: việc đó cần một khoá Gemini API. Đây là
đề xuất, chưa phải quyết định.

## Kho đó là gì

Tám thư mục mẫu, mỗi thư mục định nghĩa một agent chạy trong máy ảo do Google
quản lý. README của kho ghi "This is not an official Google product". Giấy
phép Apache-2.0.

Mỗi agent là một bộ tệp:

| Tệp                     | Chứa gì                                                                       |
| ----------------------- | ----------------------------------------------------------------------------- |
| `agent.yaml`            | Tên, agent nền, công cụ được dùng, tên miền được phép gọi, vài câu lệnh ví dụ |
| `AGENTS.md`             | Chỉ dẫn: quy trình, định dạng báo cáo, điều cấm                               |
| `skills/<tên>/SKILL.md` | Một kỹ năng, kèm script nếu cần                                               |
| `probers.sh`            | Gửi một câu lệnh ví dụ để xem agent còn chạy không                            |

Một workflow chạy mỗi đêm, gửi mọi câu lệnh ví dụ của mọi mẫu.

## Mẫu nào ứng với agent nào của Game9K

Ba loại agent A, B, C lấy từ `ai-agent-nganh-game.md`.

| Mẫu                  | Nó làm gì                                                                      | Ứng với                          |
| -------------------- | ------------------------------------------------------------------------------ | -------------------------------- |
| `seo-auditor`        | Nhận một địa chỉ web, đo tốc độ tải bằng Lighthouse, viết báo cáo có bảng điểm | B. Agent chơi thử                |
| `data-analyst`       | Nhận dữ liệu bảng, phân tích, trả lời câu hỏi kinh doanh                       | C. Agent đọc số liệu             |
| `agy-agent-template` | Agent đa dụng; một ví dụ của nó là làm một game HTML5 trong một tệp            | A. Agent làm game                |
| `repo-maintainer`    | Sao một kho về, đọc issue, sửa, xuất tệp `.patch`. Không đẩy mã, không mở PR   | A, và agent duyệt PR (issue #30) |
| `news-curator`       | Chạy theo lịch, nhớ kết quả giữa các lần chạy                                  | Chơi thử lại mỗi đêm             |

`seo-auditor` gần agent chơi thử nhất: vào là một địa chỉ, ra là một báo cáo
theo mẫu cố định. Khác biệt là nó đo trang tải nhanh hay chậm, không chơi game.

## Ba thứ nên lấy

1. **Agent là một thư mục trong kho.** Mỗi agent của Game9K thành một bộ
   `agent.yaml` + `AGENTS.md` + kỹ năng. Thay đổi agent đi qua pull request như
   mọi thay đổi khác, khớp cách `PROCESS.md` đang chạy.
2. **Danh sách tên miền được phép.** `repo-maintainer` chỉ được gọi
   `github.com` và `api.github.com`. Agent chơi thử của Game9K chỉ nên được gọi
   địa chỉ của game đang thử.
3. **Chạy thử agent mỗi đêm.** Kho này đã làm vậy cho máy chủ MCP
   (`mcp-live.yml`). Làm tương tự cho từng agent để biết khi nào nó hỏng.

`repo-maintainer` cũng xác nhận một quy tắc Game9K đã có: agent xuất bản vá,
người quyết định có nhận hay không.

## Bốn điều cần biết trước khi dùng

- **Phụ thuộc Google.** Agent nền là `antigravity-preview-09-2026`, một bản xem
  trước, chạy trên máy của Google. Bộ tệp `AGENTS.md` và `SKILL.md` mang sang
  nơi khác được; `agent.yaml` và máy ảo thì không.
- **Khoá API nằm trong máy ảo của agent.** `generate_payload.py` chép
  `GEMINI_API_KEY` vào `/credentials/.env` trong môi trường agent chạy. Một
  agent đọc nội dung lạ (issue, trang web của game) có thể bị dụ in khoá ra.
- **`seo-auditor` cho phép gọi mọi tên miền** (`domain: "*"`). Đừng chép dòng
  đó.
- **Tài liệu và mã lệch nhau.** README gốc nói `repo-maintainer` gửi pull
  request; `AGENTS.md` của nó cấm việc đó. `AGENTS.md` của `seo-auditor` nói
  dùng Headless Chrome; script thật gọi PageSpeed Insights API. Phải đọc mã,
  không tin mô tả.

Agent chưa tra giá của Gemini Managed Agents.

## Bước nhỏ nhất

Viết một mẫu `game9k-playtest` theo khuôn `seo-auditor`:

- `agent.yaml`: công cụ `code_execution`; chỉ cho gọi tên miền của game.
- `AGENTS.md`: nhận địa chỉ một game, chạy script đo, viết báo cáo theo bảng
  dấu của hộ chiếu gọi vốn.
- `scripts/run_playtest.py`: phần đo. Đây chính là lệnh `g9k playtest` đã đề
  xuất, và là phần việc thật sự.

Hai điều chặn:

- Issue #29: chưa quyết mã Game9K nằm ở đâu. ADR 0011 ghi thư mục `game9k/`
  chỉ chứa tài liệu.
- Cần một khoá Gemini API do chủ dự án cấp.

Phần đo không phụ thuộc Gemini. Viết nó trước thì dùng được với agent nào
cũng được, kể cả mô hình trên Together AI.

## Nguồn

- `google-gemini/gemini-managed-agents-templates`, commit `3cbcc8d`.
  <https://github.com/google-gemini/gemini-managed-agents-templates>
  Các tệp đã đọc: `README.md`, `generate_payload.py`,
  `.github/workflows/nightly-probe.yml`, và `agent.yaml` cùng `AGENTS.md` của
  `repo-maintainer`, `seo-auditor`, `agy-agent-template`, `news-curator`,
  `data-analyst`.

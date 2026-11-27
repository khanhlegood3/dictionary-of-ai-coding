# Tài liệu mang sang

Các tệp trong thư mục này được giữ nguyên văn: không sửa, không định dạng lại.
Chúng là đầu vào. Chưa tệp nào được thẩm định ở kho này.

| Tệp                           | Là gì                                                                                              | Nhận từ               | Ngày       |
| ----------------------------- | -------------------------------------------------------------------------------------------------- | --------------------- | ---------- |
| `kien-truc-kvu-kau.md`        | "Kiến trúc Vốn Kép KVU–KAU cho Game9K Launchpad": báo cáo về cơ chế vốn, có 43 nguồn trích dẫn     | Chủ dự án, trong chat | 2026-11-27 |
| `metapump-pr172-tasks.patch`  | Bản diff của pull request 172 ở kho `MetaPump` đã mất: trang `/tasks` của <https://game9k.vercel.app>, ADR-0042 đến 0045 của MetaPump, các script kiểm tra | Chủ dự án, trong chat | 2026-11-27 |

## Lưu ý khi dùng

- **`metapump-pr172-tasks.patch` không áp được.** Kho gốc đã mất. Các tệp mà
  patch tạo mới thì đầy đủ; các tệp mà patch sửa thì chỉ có phần thay đổi.
- **Bộ số "Game Portal 2026" trong `kien-truc-kvu-kau.md` chưa có nguồn.**
  Mục 1 của tài liệu dùng nó làm "cơ sở thực chứng" và dẫn nguồn số 6, là
  `unknown_url`. Xem issue #27 trước khi dùng lại bất cứ con số nào trong đó.
- Tài liệu KVU–KAU tự ghi rằng hợp đồng thông minh chưa triển khai và chưa
  được kiểm toán, và nêu các ràng buộc pháp lý ở mục 4. Nó chưa được một luật
  sư xem ở kho này.

## Ở nơi khác, chưa mang sang

| Nơi                                         | Có gì                                                            |
| ------------------------------------------- | ---------------------------------------------------------------- |
| `khanhlegood1/GameFun`                      | 50 tài liệu đánh số, 44 ADR, whitepaper, pitch deck, script kiểm tra, SDK |
| `khanhlegood1/Game9K-Starter-Kit`           | Mã các game mẫu, cổng livestream, bảng việc                      |
| <https://game9k.vercel.app>                 | Bản dựng thử P02 của launchpad, dữ liệu mô phỏng                 |
| <https://game9k-starter-kit-black.vercel.app> | Bản chạy của starter kit                                       |
| `khanhlegood3/ProactiveCoCreator`           | Ứng dụng mẫu, xem `../research/ai-pr-features.md`                |
| `khanhlegood3/PerformanceCheckerPR`         | Ứng dụng mẫu, xem `../research/ai-pr-features.md`                |
| `lexuankhanh1612/MetaPump`                  | Kho chính, đã mất (issue #26)                                    |

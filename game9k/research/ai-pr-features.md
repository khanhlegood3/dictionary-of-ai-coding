# Hai ứng dụng mẫu: nên lấy gì cho quy trình AI tạo pull request

Phân tích do agent viết ngày 2026-11-27, từ việc đọc mã nguồn. Không ứng dụng
nào được chạy thử. Đây là đề xuất, chưa phải quyết định.

## ProactiveCoCreator

`khanhlegood3/ProactiveCoCreator`: ứng dụng React gọi Gemini. Người dùng gõ
một yêu cầu; ứng dụng dựng một "đồ thị niềm tin", hỏi lại, rồi mới tạo kết quả.

| Tính năng                                                                                                                | Nên lấy cho Game9K                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Đồ thị niềm tin: mỗi thực thể và thuộc tính có cờ `presence_in_prompt`, tách điều người dùng đã nói khỏi điều AI tự đoán | Có. Mỗi bản yêu cầu và mỗi pull request có một mục "Giả định": điều agent tự đoán, tách khỏi điều issue đã ghi |
| Thẻ hỏi lại: một câu hỏi kèm vài lựa chọn                                                                                | Có. Khi issue thiếu thông tin, agent hỏi trong issue bằng câu hỏi có lựa chọn, thay vì đoán                    |
| Xem lại prompt cuối trước khi tạo                                                                                        | Đã có dưới dạng cổng: chủ dự án đọc trước khi merge                                                            |
| Bản thiết kế theo lĩnh vực: mỗi ngưỡng có trường `sourceBenchmark`, mỗi rủi ro có `evidence`                             | Có, như một mẫu bảng. Nhưng trường nguồn phải trỏ tới thứ kiểm được                                            |
| Bảng "Game Portal Ops" với 12 đơn hàng gõ sẵn                                                                            | Không. Đây là nơi sinh ra bộ số ở issue #27                                                                    |

## PerformanceCheckerPR ("Fresnel")

`khanhlegood3/PerformanceCheckerPR`: ứng dụng Angular và Node. Nhập địa chỉ
một kho; một agent đọc mã, đề xuất các commit sửa lỗi theo nhóm Lighthouse
(hiệu năng, khả năng truy cập, thực hành tốt, SEO) và một lượt bảo mật nhẹ;
người dùng chọn commit rồi gửi pull request hoặc tải bản patch.

| Tính năng                                                                                                   | Nên lấy cho Game9K                                                          |
| ----------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Commit nguyên tử: mỗi commit một lỗi, có tóm tắt và diff riêng                                              | Có. Ghi vào `AGENTS.md` khi kho mã nguồn được lập (#29)                     |
| Người chọn commit nào vào pull request                                                                      | Có, cho pull request rà soát tự động: chủ dự án bỏ được từng phần           |
| Chỉ đọc, không chạy gì; chỉ theo những chỉ dẫn trong `AGENTS.md` của kho đích có liên quan tới việc rà soát | Có, cho agent rà soát (#30). Đây là cách chống chỉ dẫn cài sẵn trong kho lạ |
| Tải bản patch khi không gửi được pull request                                                               | Có. `AGENTS.md` ở đây đã có đường lui tương tự                              |
| Hợp đồng đầu ra: một khối JSON có cấu trúc cố định                                                          | Có, cho bình luận rà soát, để `/tasks` đọc được sau này                     |
| Không nêu điểm Lighthouse dự đoán vì không chạy Lighthouse                                                  | Có. Cùng tinh thần với quy tắc "số liệu phải có nguồn"                      |

Lưu ý: chế độ thử của Fresnel trả về các commit soạn sẵn cho một kho giả. Tên
mô hình và dự án đám mây trong mã chưa được kiểm chứng là dùng được.

## Đề xuất thứ tự

1. Thêm mục "Giả định" và "Chưa kiểm" vào mẫu pull request. Đã làm trong
   `.github/pull_request_template.md`.
2. Agent rà soát chỉ đọc, viết bình luận có cấu trúc (#30).
3. Commit nguyên tử, khi có kho mã nguồn (#29).

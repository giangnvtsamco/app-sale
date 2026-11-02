# App Sale · VinFast SAMCO Bình Tân

`sale.vinfastsamcobinhtan.com` · GitHub Pages + Apps Script + Google Sheet

| Trang | Ai dùng | Nội dung |
|---|---|---|
| `index.html` | Sale (iPhone) | Đăng nhập PIN · tab Cavet (Bảo hiểm, Lái thử: sắp có) |
| `quanly.html` | Chỉ Giang (máy tính) | Đối chiếu cavet với Admin · báo cáo sáng · Nhập xe từ PDF + tin Zalo · SĐT từ file chị Trâm |
| `apps-script/Code.gs` | — | API, dán vào Apps Script của Google Sheet |
| `config.js` | — | Link `/exec` của Apps Script |

## Google Sheet "APP SALE – DỮ LIỆU"
- `XE`: 1 dòng = 1 xe (từ hóa đơn) + phần cavet
- `LOG_CAVET`: lịch sử sale tick, Admin nhận/chưa nhận (để đếm tick sai)
- `_DanhMuc`: nhân viên (tên viết tắt, PIN, đang làm) + danh sách chọn
- `_CauHinh`: PIN quản lý, hạn cavet 20 ngày, mốc đôn đốc 15 ngày, báo cáo sáng ≤ 5 ngày
- `BC_Cavet_Tmm.yyyy`: báo cáo tháng, tự cập nhật 6h sáng mỗi ngày

## Phiên bản
- v1.0 (01/11/2026): tab Cavet, trang Quản lý (Cavet, Nhập xe). Dữ liệu bắt đầu từ tháng 11/2026.
  - Rà soát: tự thêm dòng khi Sheet quá 1.000 dòng; giữ số 0 đầu ở Số HĐ, Số cavet, SĐT; chống dò PIN theo ngày; báo cáo cập nhật cả tháng trước; đọc tên khách ở dòng dưới nhãn; ảnh cavet chọn được từ thư viện; app tự tải lại khi mở lại.

# App Sale · VinFast SAMCO Bình Tân

`sale.vinfastsamcobinhtan.com` · GitHub Pages + Apps Script + Google Sheet

| Trang | Ai dùng | Nội dung |
|---|---|---|
| `index.html` | Sale (iPhone) | Đăng nhập PIN · tab Cavet · tab Bảo hiểm · tab Lái thử |
| `laithu/index.html` | Bộ phận khác | Link riêng /laithu: chọn tên, không PIN, chỉ xe lái thử |
| `lt.js` | — | Giao diện lái thử dùng chung + in hồ sơ 2 trang A4 |
| `quanly.html` | Chỉ Giang (máy tính) | Đối chiếu cavet · Xử lý bảo hiểm + báo cáo · Lái thử (nhật trình, sửa ODO, sạc pin, lệnh dịch vụ) · Nhập xe |
| `apps-script/Code.gs` | — | API chung + Cavet |
| `apps-script/BaoHiem.gs` | — | API Bảo hiểm + báo cáo BC_BaoHiem |
| `apps-script/LaiThu.gs` | — | API Xe lái thử + báo cáo BC_LaiThu (KSCL C18/C19) |
| `config.js` | — | Link `/exec` của Apps Script |

## Google Sheet "APP SALE – DỮ LIỆU"
- `XE`: 1 dòng = 1 xe (từ hóa đơn) + phần cavet
- `LOG_CAVET`: lịch sử sale tick, Admin nhận/chưa nhận (để đếm tick sai)
- `_DanhMuc`: nhân viên (tên viết tắt, PIN, đang làm) + danh sách chọn
- `_CauHinh`: PIN quản lý, hạn cavet 20 ngày, mốc đôn đốc 15 ngày, báo cáo sáng ≤ 5 ngày
- `BAO_HIEM`: 1 dòng = 1 lần kích hoạt, nối với XE qua số khung
- `XE_DEMO`: 10 xe lái thử (ODO, pin gần nhất, Trạng thái = Ngưng dùng nếu tạm khóa)
- `LAI_THU`: 1 dòng = 1 lượt mượn xe (cả sạc pin, dịch vụ); cột Nguồn / Lý do sửa / Giá trị cũ lưu lịch sử sửa
- `LENH_DV`: lệnh đề nghị dịch vụ sửa chữa nội bộ
- `BC_Cavet_Tmm.yyyy`, `BC_BaoHiem_Tmm.yyyy`, `BC_LaiThu_Tmm.yyyy`: báo cáo tháng, tự cập nhật 6h sáng mỗi ngày

## Phiên bản
- v1.0 (01/11/2026): tab Cavet, trang Quản lý (Cavet, Nhập xe). Dữ liệu bắt đầu từ tháng 11/2026.
  - Rà soát: tự thêm dòng khi Sheet quá 1.000 dòng; giữ số 0 đầu ở Số HĐ, Số cavet, SĐT; chống dò PIN theo ngày; báo cáo cập nhật cả tháng trước; đọc tên khách ở dòng dưới nhãn; ảnh cavet chọn được từ thư viện; app tự tải lại khi mở lại.
- v1.1 (02/11/2026): tab Bảo hiểm cho sale (tìm xe theo tên/số khung, cờ Gấp theo ngày làm việc, đề xuất ảnh/PDF, sửa và gửi lại khi bị trả về); màn Xử lý bảo hiểm (đơn vị, phân loại, 6 bước, việc cần làm, email soạn sẵn, đã thu); tin chị Nga / anh Tâm; sheet BC_BaoHiem theo tháng Giang xử lý.
- v1.2 (02/11/2026): tab Xe lái thử (phiếu 2 bước, in Lệnh điều xe + Phiếu yêu cầu + Giấy cam kết, nhật trình phát hiện ODO lệch), link /laithu cho bộ phận khác, Quản lý lái thử (sửa ODO có lý do, chèn lượt, ghi sạc pin, lệnh dịch vụ in theo mẫu), báo cáo BC_LaiThu đối chiếu KSCL; báo cáo BC_Cavet 7 cột.

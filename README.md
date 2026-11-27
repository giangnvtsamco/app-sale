# Phòng Kinh Doanh · VinFast SAMCO Bình Tân (trước đây: App Sale)

https://kinhdoanh.vinfastsamcobinhtan.com · bản **v1.10** (link cũ sale.vinfastsamcobinhtan.com tự chuyển sang)

## Kiến trúc
Giao diện (GitHub Pages) → Apps Script (link `/exec` trong `config.js`) → Google Sheet + Drive.
Code Apps Script (`.gs`) **không** để ở repo này; bản lưu nằm ở repo riêng tư `samco-apps-script`.
Dùng bộ chung `samco-core/v1`.

## Đường dẫn
| Link | Ai dùng | Nội dung |
|---|---|---|
| `/` | Sale (điện thoại) | Đăng nhập PIN 4 số · Bảo hiểm · Cavet |
| `/quanly` | Giang (máy tính) | Xử lý bảo hiểm 5 bước · Đối chiếu cavet · Nhập xe từ hóa đơn · Tờ trình |
| `/laithu` | link cũ | Tự chuyển sang Xe Demo |

## File
| File | Vai trò |
|---|---|
| `index.html`, `quanly.html` | Giao diện |
| `totrinh.js` | Tab Tờ trình của trang Quản lý |
| `config.js` | Link `/exec` của Apps Script |
| `version.json` | Số phiên bản hiện tại (app so sánh để báo "Đã có bản mới") |
| `icon.svg`, `icon-180.png` | Biểu tượng (trình duyệt, màn hình iPhone) |
| `laithu/index.html` | Trang chuyển hướng |
| `CNAME` | Tên miền |

## Google Sheet "APP SALE – DỮ LIỆU" (không chia sẻ: có PIN, SĐT)
`XE` · `LOG_CAVET` · `BAO_HIEM` · `_BangPhiBH` · `_DanhMuc` (nhân viên, PIN, SĐT cột G) · `_CauHinh` · báo cáo tháng `BC_Cavet_…`, `BC_BaoHiem_…`

## Cập nhật
1. Sửa Apps Script → Lưu → Triển khai → Quản lý các bản triển khai → bút chì → **Phiên bản mới** → Triển khai. Link `/exec` giữ nguyên.
2. Tải file giao diện lên repo này (nhánh `main`). GitHub Pages cập nhật sau 1–2 phút.
3. Đổi link Apps Script: chỉ sửa `config.js`.

## Phiên bản
- v1.6 (17/11/2026): trang Quản lý thêm tab Tờ trình (`totrinh.js`): soạn 5 loại tờ trình và giấy đề nghị xuất kho, xem trước khổ A4, sổ tờ trình, tạo file Word. Sửa nút "Đăng ký thay sale" không mở được.
- v1.5 (17/11/2026): đăng nhập bàn phím số 4 số tự vào; tab Bảo hiểm lên đầu; mở nhanh hơn; báo cáo bảo hiểm thêm cột Nhân viên bán hàng; bỏ phần lái thử cũ (LaiThu.gs, tab cũ); mã quản lý 4 số; sao lưu hằng tuần, sheet _Log.
- v1.4.1: đọc giá hóa đơn chắc hơn; gửi lại hóa đơn tự điền giá cho xe chưa có giá.
- v1.4: bảo hiểm 5 bước (Sale gửi → Xác nhận → Thu tiền → Thanh toán → Hoàn tất), tin đăng ký mới, đối chiếu bảng phí `_BangPhiBH`.
- v1.3: chuyển phần lái thử sang app Xe Demo.
- v1.0–v1.2 (11/2026): Cavet, Nhập xe, Bảo hiểm.

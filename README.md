# App Sale · VinFast SAMCO Bình Tân

https://sale.vinfastsamcobinhtan.com · bản **v1.4.1**

## Kiến trúc
Giao diện (GitHub Pages) → Apps Script (link `/exec` trong `config.js`) → Google Sheet + Drive.
Code Apps Script (`.gs`) **không** để ở repo này; bản lưu nằm ở repo riêng tư `samco-apps-script`.
Dùng bộ chung `samco-core/v1`.

## Đường dẫn
| Link | Ai dùng | Nội dung |
|---|---|---|
| `/` | Sale (điện thoại) | Đăng nhập PIN · Cavet · Bảo hiểm |
| `/quanly` | Giang (máy tính) | Đối chiếu cavet · Xử lý bảo hiểm 5 bước · Nhập xe từ hóa đơn |
| `/laithu` | link cũ | Tự chuyển sang Xe Demo |

## File
| File | Vai trò |
|---|---|
| `index.html`, `quanly.html` | Giao diện |
| `config.js` | Link `/exec` của Apps Script |
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
- v1.4.1: đọc giá hóa đơn chắc hơn; gửi lại hóa đơn tự điền giá cho xe chưa có giá.
- v1.4: bảo hiểm 5 bước (Sale gửi → Xác nhận → Thu tiền → Thanh toán → Hoàn tất), tin đăng ký mới, đối chiếu bảng phí `_BangPhiBH`.
- v1.3: chuyển phần lái thử sang app Xe Demo.
- v1.0–v1.2 (11/2026): Cavet, Nhập xe, Bảo hiểm.

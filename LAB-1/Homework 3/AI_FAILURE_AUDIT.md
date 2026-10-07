# AI Failure Audit Report (HW3)

## Defect 1: Time Drift in Polling / Countdown Engine
- **Description:** 
  Mô hình AI ban đầu sinh hàm đếm ngược bằng biến số nguyên cục bộ giảm dần mỗi giây (`remainingSeconds--`) thông qua `setInterval(fn, 1000)`. Khi tab trình duyệt bị thu nhỏ hoặc chuyển sang chế độ nền, trình duyệt tự động hạn chế luồng CPU (background tab throttling), dẫn đến việc bộ đếm bị trôi nhịp (clock drift) và chậm hơn hàng phút so với thời gian thực. Ngoài ra, AI sử dụng chuỗi thời gian không có định dạng múi giờ, gây lệch giờ khi người dùng ở các khu vực địa lý khác nhau.
- **Diagnostic Method:** 
  Kiểm thử hiệu năng trình duyệt kết hợp DevTools console: Thu nhỏ tab trình duyệt trong 5 phút rồi mở lại, so sánh giá trị biến đếm của `setInterval` với `Date.now()`. Kết quả cho thấy bộ đếm của AI bị lệch hơn 15 giây so với đồng hồ hệ thống.
- **Refactored Solution:** 
  Tách riêng lớp `CountdownEngine`. Cấu hình mốc thời gian bằng chuẩn UTC ISO 8601 (`2026-12-31T23:59:59Z`). Tại mỗi chu kỳ `tick()`, tính toán hiệu số trực tiếp: `distance = targetTime - Date.now()`, giúp triệt tiêu hoàn toàn hiện tượng lệch thời gian.

---

## Defect 2: Form Submission Race Condition & Double-Submit
- **Description:** 
  Đoạn mã form do AI tạo chỉ gắn cờ boolean đơn giản `let isSubmitting = false` và không khóa các nút bấm hoặc ô nhập liệu trong DOM. Khi người dùng click chuột liên tiếp trên mạng có độ trễ cao, các sự kiện `submit` bị gửi đúp, gây xung đột trạng thái dữ liệu (race condition).
- **Diagnostic Method:** 
  Kiểm tra DevTools Network tab: Bật chế độ giả lập mạng chậm (Slow 3G) và click nhanh liên tục vào nút nộp form. Trình duyệt gửi cùng lúc 3 yêu cầu mạng song song do cờ boolean không kịp chặn trước khi Promise được giải quyết.
- **Refactored Solution:** 
  Xây dựng máy trạng thái hữu hạn `FormStateMachine` với các bước chuyển trạng thái độc lập (`IDLE` -> `SUBMITTING` -> `SUCCESS`/`ERROR`). Vô hiệu hóa ngay lập tức toàn bộ `input` và `button` trong trạng thái `SUBMITTING`, đồng thời tích hợp `AbortController` để hủy bỏ yêu cầu đang chờ nếu có tín hiệu mới.

---

## Defect 3: Reflected XSS qua `innerHTML` Dynamic Templating
- **Description:** 
  Để hiển thị thông báo thành công, mã nguồn AI dùng phép nối chuỗi trực tiếp vào `innerHTML`: `feedbackEl.innerHTML = 'Registered: ' + attendeeName`. Khi người dùng nhập tên chứa payload mã độc HTML/SVG (ví dụ: `<img src=x onerror=alert(1)>`), script độc hại sẽ được thực thi trên trình duyệt.
- **Diagnostic Method:** 
  Kiểm tra hộp thoại DevTools Elements sau khi nhập chuỗi kiểm thử XSS vào trường Full Name. Thẻ `<img>` độc hại được render trực tiếp vào DOM và kích hoạt sự kiện `onerror`.
- **Refactored Solution:** 
  Xóa bỏ hoàn toàn việc sử dụng `innerHTML`. Thay thế bằng phương thức `feedbackEl.replaceChildren()`, tạo thẻ bằng `document.createElement('strong')` và gán nội dung người dùng hoàn toàn qua `document.createTextNode()` / `textContent` để vô hiệu hóa mã độc.
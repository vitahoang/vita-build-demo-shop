---
id: kettle-cart-checkout
title: "Kế hoạch kiểm thử Kettle & Co.: giỏ hàng và thanh toán"
cases: [TC-101, TC-102, TC-103, TC-104]
---
## Phạm vi
Cửa hàng demo Kettle & Co. trên môi trường production: danh sách sản phẩm, giỏ hàng và thanh toán giả (không thu tiền thật).

## Cách chạy
Chạy từng test case bằng Playwright trên trình duyệt thật. Với mỗi case, chụp ảnh màn hình làm bằng chứng. Ghi lại kết quả thực tế so với kết quả mong đợi.

## Tiêu chí đạt
Mọi case phải khớp kết quả mong đợi. Một case lệch thì đánh dấu Failed và nêu rõ con số thấy được so với con số mong đợi.

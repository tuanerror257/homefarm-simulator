# Homefarm Shop Simulator Log

Single source of truth for the project snapshot, feature map, and version history.

## Current Snapshot

- Current version: `v9.1.10`
- Current commit: TBD
- Current rollback tag: `v9.1.10-manual-leaderboard-save`
- Main route: `/homefarm-shop-simulator`
- Rollback rule: use the tag that matches the version you want to restore

## Project Structure

```txt
CHANGELOG.md
README.md
package.json
package-lock.json
next.config.ts
tsconfig.json
eslint.config.mjs
postcss.config.mjs
next-env.d.ts

src/
  app/
    globals.css
    layout.tsx
    page.tsx
    homefarm-shop-simulator/page.tsx
  components/
    homefarm-shop/
      HomefarmShopGame.tsx
      EndDaySummary.tsx
      homefarm-shop.css
  config/
    version.ts
  lib/
    supabaseClient.ts
    homefarm-shop/
      data.ts
      gameUtils.ts
      leaderboard.ts
      customerTypes.extra.ts
  types/
    homefarm-shop.ts

public/homefarm-shop/
  ASSETS_NOTE.txt
  header-brand.png
  homefarm-shop-simulator-logo.png
  mascot/*.webp

scripts/
  optimize-mascot.js

supabase/
  homefarm_shop_leaderboard.sql
```

## Core Features

- Standalone game route rendered from the root app shell.
- Day-based shop loop with customer queue, order selection, delivery, and next-day progression.
- Dynamic product unlocks as days advance.
- Import stock modal with cost checks.
- Fillet flow for whole salmon into fillet and head-bone stock.
- Order states, patience, mood, combo, tip, and profit tracking.
- VIP customers with larger orders and higher tip potential.
- App orders with shipping fee deduction.
- Rainy-day behavior that increases app-order frequency.
- Special events starting from Day 12.
- Product catalog expansion unlock at Day 6.
- Shop upgrade system unlock at Day 8.
- End-of-day summary modal.
- Overnight stock spoilage with freezer mitigation.
- Leaderboard support with local/Supabase mode.
- Version badge visible in the game UI.

## Version History

### v9.1.10 - Chỉ lưu điểm khi bấm nút, không lưu khi mở BXH

- Bỏ dòng nhắc "Tên đã khóa từ lúc bắt đầu run." khỏi panel leaderboard.
- Bỏ khối "Telemetry gần nhất" và trạng thái "Chưa có telemetry nào được ghi." khỏi panel leaderboard.
- Sửa luồng leaderboard để bấm `🏆 BXH` hoặc `🏆 Leaderboard` chỉ mở bảng, không tự lưu điểm nữa.
- Điểm chỉ được ghi khi người chơi bấm nút `Lưu điểm`.
- Tag: `v9.1.10-manual-leaderboard-save`

### v9.1.9 - Trả unlock thường về màu sáng, giữ teaser God Mode màu tối

- Các modal unlock thường như mở khóa nâng cấp, danh mục, event và quảng cáo quay lại palette sáng như ban đầu.
- Chỉ riêng teaser God Mode ngày 18 giữ tone đen đỏ riêng bằng modifier CSS tách biệt.
- Tag: `v9.1.9-bright-unlocks-dark-godmode-teaser`

### v9.1.8 - Khóa tên lưu điểm theo tên nhập từ đầu run

- Leaderboard giờ dùng tên đã nhập từ đầu run để lưu điểm, không cho đổi tên ở cuối màn hình leaderboard nữa.
- Ô tên trong leaderboard chuyển sang chỉ đọc, kèm note rõ là tên đã khóa từ lúc bắt đầu.
- Bot `tadadev` vẫn không được lưu điểm.
- Tag: `v9.1.8-lock-leaderboard-name`

### v9.1.7 - Thêm healthcheck tool cho toàn bộ game

- Thêm `npm run healthcheck` để chạy build, lint và simulator cho full-time/part-time trong một lệnh.
- Healthcheck ghi report JSON vào `.claude/game-healthcheck-latest.json` để lưu kết quả và lỗi phát hiện được.
- Build trong healthcheck dùng `next build --webpack` để tránh lỗi Turbopack spawn trong child process, còn build chính của project vẫn giữ nguyên.
- Tag: `v9.1.7-healthcheck-tool`

### v9.1.6 - Khôi phục nội dung đầy đủ cho màn God Mode bắt đầu

- Màn day 24 được đổi lại sang layout cảnh báo God Mode lớn như bản trước.
- Giữ teaser day 18 ở dạng popup unlock, còn day 24 là alert đầy đủ với crisis list, warning và footnote.
- Tag: `v9.1.6-godmode-start-screen-restored`

### v9.1.5 - Khôi phục màn God Mode bắt đầu ở ngày 24

- Tách riêng teaser ngày 18 và màn bắt đầu God Mode ngày 24 để không bị ghi đè nhau nữa.
- Day 24 giờ có modal riêng báo God Mode đã chính thức kích hoạt.
- Tag: `v9.1.5-godmode-start-screen-restored`

### v9.1.4 - Làm modal teaser God Mode tối hơn

- Đổi palette của modal God Mode sang đen đỏ nặng hơn để hợp với tone cảnh báo.
- Làm nền, viền, nút và danh sách khủng hoảng tối hơn để thông báo nổi bật nhưng vẫn giữ layout cũ.
- Tag: `v9.1.4-godmode-teaser-darker`

### v9.1.3 - Sửa teaser God Mode về đúng ngày 18

- Teaser God Mode trước đó đang bị gắn nhầm vào `godModeStartDay`.
- Sửa lại để modal God Mode hiện ở `godModeTeaserDay`, nên Day 18 của Ca Part-time sẽ bật thông báo đúng lúc.
- Tag: `v9.1.3-godmode-teaser-day-18-fix`

### v9.1.2 - Đổi teaser God Mode sang modal unlock kiểu day 6

- Chuyển thông báo God Mode ngày 18 sang cùng phong cách modal unlock như thông báo nâng cấp cửa hàng ở ngày 6.
- Dùng lại layout `unlock-panel` để thông báo rõ hơn, dễ đọc hơn và ít bị lướt qua.
- Tag: `v9.1.2-godmode-teaser-unlock-modal`

### v9.1.1 - Đặt lớp phủ tối đúng trên màn hình God Mode

- Đổi lớp phủ đen sang overlay thật nằm trên toàn bộ nội dung game trong God Mode.
- Giữ viền lửa ở lớp trên để vẫn còn thấy hiệu ứng cháy ở mép màn hình.
- Tag: `v9.1.1-godmode-dark-overlay-on-top`

### v9.1.0 - Tăng lực God Mode và phủ tối màn hình

- Làm viền lửa God Mode mạnh, sáng và dày hơn để hiệu ứng bật lên rõ hơn.
- Thêm một lớp phủ tối toàn màn hình khi God Mode active để phần còn lại của game chìm xuống.
- Giữ các hiệu ứng cũ nhưng nâng cảm giác “đi vào địa ngục” cho phase này.
- Tag: `v9.1.0-godmode-fire-dark-overlay`

### v9.0.9 - Đẩy hiệu ứng God Mode lên lớp trên cùng

- Nâng z-index của lớp God Mode FX lên trên toàn bộ layer game để viền lửa và overlay không bị content che mất.
- Giữ nguyên hiệu ứng lửa, scanline, static và vignette; chỉ thay thứ tự chồng lớp.
- Tag: `v9.0.9-godmode-fire-border-topmost`

### v9.0.8 - Thêm viền lửa phập phù cho God Mode

- Khi God Mode active, toàn bộ viền màn hình giờ có hiệu ứng đỏ phập phù như lửa cháy.
- Giữ nguyên overlay scanline/static/vignette cũ, chỉ thêm một lớp border riêng để cảm giác phase này nặng hơn.
- Tag: `v9.0.8-godmode-fire-border`

### v9.0.7 - Chuyển sang nhạc God Mode riêng

- Khi vào God Mode, game sẽ pause BGM nền và chuyển sang track `godmode.mp3` mới.
- Giữ BGM bình thường cho gameplay ngoài God Mode.
- Loại bỏ lớp ambience nhiễu cũ để âm thanh chuyển phase rõ ràng hơn.
- Tag: `v9.0.7-godmode-music-switch`

### v9.0.6 - Nâng God Mode unlock thành event alert

- Biến màn hình `GOD MODE is coming` thành một modal sự kiện tối và lớn hơn, khó bị lướt qua.
- Người chơi phải bấm `Đã hiểu` thì mới tiếp tục vào gameplay.
- Tăng trọng lượng thị giác cho phần cảnh báo, giữ nguyên logic game phía sau.
- Tag: `v9.0.6-godmode-event-alert-ui`

### v9.0.5 - Giữ nhạc nền khi vào run

- Sửa luồng `startRun()` để không làm pause BGM khi vào game từ tutorial/bot test.
- Reset về start screen vẫn dừng nhạc như trước.
- Tag: `v9.0.5-keep-bgm-on-start-run`

### v9.0.4 - Giảm rè God Mode và thêm rung nhẹ toàn màn hình

- God Mode giờ chỉ thêm lớp hiss/crackle rất nhẹ, giữ nhạc nền thoáng hơn và bớt rè.
- Thêm rung nhẹ toàn bộ phone/UI trong phase God Mode để tạo cảm giác bất ổn mà không phá readability.
- Tag: `v9.0.4-godmode-audio-shake-tune`

### v9.0.3 - Thêm banner đầu run cho bot test

- Khi bot `tadadevNN` bắt đầu ở day bất kỳ > 1, game sẽ hiện banner đầu run để không bị trôi toast khi bot tự chạy.
- Banner dùng chung với toast ngày đầu, giúp test nhiều event/unlock ở các mốc khác nhau dễ nhìn hơn.
- Tag: `v9.0.3-run-intro-banner`

### v9.0.2 - Đồng bộ toast ngày bắt đầu cho bot test

- Bot `tadadevNN` giờ sẽ nhận đúng toast của ngày đang bắt đầu, gồm unlock, event, teaser God Mode và crisis nếu có.
- Helper toast dùng chung giữa `startRun()` và chuyển ngày để mọi mốc test hiển thị nhất quán.
- Tag: `v9.0.2-bot-start-toast-helper`

### v9.0.1 - Hiện teaser God Mode khi bot bắt đầu đúng ngày teaser

- Khi bot `tadadevNN` bắt đầu đúng tại ngày teaser, toast `GOD MODE is coming` sẽ hiện ngay trong màn hình khởi tạo run.
- Giữ nguyên logic cũ cho bot `tadadev` và các bot ngày khác.
- Tag: `v9.0.1-bot-start-day-teaser-fix`

### v9.0.0 - Thêm bot test bắt đầu từ ngày tùy chọn

- Cho phép tên bot dạng `tadadevNN` để bot khởi động trực tiếp ở day `NN`.
- `tadadev` vẫn giữ hành vi cũ, bắt đầu từ ngày 1 như hiện tại.
- Các unlock, event và trạng thái của ngày bắt đầu được dựng theo day đó thay vì luôn khởi đầu ở day 1.
- Bot test vẫn bị loại khỏi leaderboard bằng rule tên bot.
- Tag: `v9.0.0-bot-start-day`

### v8.5.2 - Thêm hiệu ứng màn hình khi vào God Mode

- Khi day đạt mốc God Mode, màn hình chuyển sang trạng thái `godmode-active` với scanline, static và viền đỏ nhấp nháy.
- Thêm hiệu ứng âm thanh `xẹt xẹt` + nhiễu điện ngắn để báo rõ khoảnh khắc bắt đầu God Mode.
- Giữ ambience God Mode bám theo trạng thái thực, không còn phụ thuộc vào popup nhắc mốc.
- Tag: `v8.5.2-godmode-screen-fx`

### v8.5.1 - Dời teaser God Mode của Ca Part-time sang ngày 18

- Dời thông báo `GOD MODE is coming` của Ca Part-time từ ngày 14 sang ngày 18.
- Giữ nguyên day God Mode của Part-time ở ngày 24, chỉ thay mốc nhắc người chơi chuẩn bị sớm hơn trong run.
- Đồng bộ mốc teaser này sang simulator để báo cáo và game UI luôn khớp nhau.
- Tag: `v8.5.1-part-time-godmode-teaser-day-18`

### v8.5.0 - Thêm telemetry session gần nhất

- Ghi lại session gần nhất khi người chơi game over hoặc restart giữa chừng.
- Hiển thị thời lượng run, kết quả, mốc ngày và số session đã ghi trong modal leaderboard.
- Giữ telemetry cục bộ trong localStorage để đo nhanh hành vi chơi thật trước khi nối server analytics.
- Tag: `v8.5.0-session-telemetry`

### v8.4.0 - Polished mode info on leaderboard

- Lưu `game_mode` vào leaderboard entry để phân biệt run Part-time và Full-time.
- Hiển thị badge mode trong gameover và từng dòng leaderboard.
- Đồng bộ schema Supabase bằng cột `game_mode`.
- Tag: `v8.4.0-leaderboard-mode-polish`

### v8.3.0 - Tuning nhanh cho Ca Part-time

- Rút nhịp Part-time ngắn hơn nữa: teaser sớm hơn, God Mode sớm hơn và mở khóa hệ thống sớm hơn.
- Giảm nhịp khách và tăng tốc progression Part-time để run gọn, phù hợp chế độ tàu nhanh.
- Simulator cho thấy Part-time vẫn vào God Mode 100% nhưng đạt mốc sớm hơn đáng kể.
- Tag: `v8.3.0-part-time-speed-tune`

### v8.2.5 - Đổi màu badge Ca Full-time

- Badge `Ca Full-time` trên màn hình chính chuyển sang màu đỏ.
- Giữ badge `Ca Part-time` màu xanh như hiện tại.
- Tag: `v8.2.5-full-time-badge-red`

### v8.2.4 - Thu nhỏ cụm tag góc trái

- Giảm kích thước tag chế độ chơi, phiên bản và bot khoảng 15%.
- Căn lại vị trí xếp chồng để cụm tag gọn hơn và ít che logo hơn.
- Tag: `v8.2.4-smaller-corner-tags`

### v8.2.3 - Đổi thứ tự badge góc trái

- Đưa badge chế độ chơi lên trên cùng.
- Chuyển badge phiên bản xuống dưới badge chế độ.
- Giữ badge bot ở dưới cùng để tránh đè logo và HUD.
- Tag: `v8.2.3-badge-stack-order`

### v8.2.2 - Chuyển badge chế độ ra khỏi HUD

- Đưa badge `Ca Part-time` / `Ca Full-time` xuống ngay dưới badge phiên bản game.
- Khôi phục khu vực HUD chính về bố cục cũ, không còn bị badge chế độ chen vào.
- Dời badge bot thấp hơn để không chồng với badge chế độ.
- Tag: `v8.2.2-mode-badge-placement`

### v8.2.1 - Chỉnh nút chọn ca ở tutorial

- Đổi hai nút `Ca Part-time` và `Ca Full-time` sang bố cục nằm cạnh nhau.
- Nút Part-time dùng màu xanh, nút Full-time dùng màu đỏ.
- Chuyển mô tả Part-time thành một dòng nhỏ bên dưới hai nút.
- Tag: `v8.2.1-tutorial-mode-buttons`

### v8.2.0 - Thêm simulator đa mode

- Thêm tham số `--mode full-time|part-time` cho `npm run sim`.
- Simulator nay mirror config Full-time và Part-time, gồm God Mode day, event unlock, ads unlock, upgrade gate, product unlock speed, customer pace và operating cost.
- Báo cáo thêm tỷ lệ tới God Mode, chết trước God Mode, chết sau God Mode và ước lượng thời gian chơi.
- Chạy kiểm chứng 100 lượt cho cả hai mode: Full-time tới God Mode 100%, Part-time tới God Mode 100%.
- Tag: `v8.2.0-simulator-multi-mode`

### v8.1.0 - Thêm balance config cho Ca Part-time

- Tách thông số mode vào `GAME_MODE_CONFIGS` để Full-time và Part-time có thể balance riêng.
- Ca Full-time giữ nguyên nhịp hiện tại: teaser ngày 22 và God Mode ngày 36.
- Ca Part-time dùng nhịp nhanh hơn: teaser ngày 16, God Mode ngày 26, unlock/event/ads/upgrade đến sớm hơn.
- Ca Part-time mở danh mục sản phẩm nhanh hơn và giảm nhẹ operating cost để phù hợp run ngắn.
- Tag: `v8.1.0-part-time-balance-config`

### v8.0.0 - Thêm nền chọn ca chơi

- Đổi tutorial từ một nút vào game thành hai lựa chọn `Ca Part-time` và `Ca Full-time`.
- Thêm state mode nền tảng để chuẩn bị balance riêng cho chế độ tàu nhanh ở các bản 8.x tiếp theo.
- Hiển thị badge mode trong HUD khi vào ca bán.
- Giữ `Ca Full-time` và `Ca Part-time` cùng balance hiện tại ở bản nền này để tránh trộn thay đổi economy.
- Tag: `v8.0.0-game-mode-foundation`

### v7.5.13 - Giảm nhịp khách trước God Mode

- Giữ nguyên lượng khách ngày 1-5 để không đổi onboarding.
- Giảm khoảng 15% lượng khách ngày 6-15 và khoảng 25% từ ngày 16 trở đi.
- Đồng bộ công thức khách giữa game thật, bot auto-restock và balance simulator.
- Tag: `v7.5.13-reduce-pre-godmode-customers`

### v7.5.12 - Thêm teaser God Mode ngày 22

- Thêm cảnh báo ở toast ngày 22 rằng GOD MODE sắp tới.
- Nhắc người chơi chuẩn bị tiền mặt và stock hàng trước chế độ hủy diệt.
- Tag: `v7.5.12-godmode-teaser-day-22`

### v7.5.11 - Thêm dev balance simulator

- Thêm `npm run sim` để chạy mô phỏng balance nhiều seed từ terminal.
- Simulator report tỷ lệ sống sót, ngày kết thúc, cash snapshot, doanh thu/lãi, chi nhập hàng, spoilage, upgrade timing, event/crisis counts.
- Hỗ trợ `--runs`, `--days`, `--seed`, `--json` để dùng cho kiểm tra thủ công hoặc automation sau này.
- Cập nhật ESLint ignore để không quét `.claude/worktrees` và build cache local.
- Tag: `v7.5.11-balance-simulator`

### v7.5.10 - Ghi nhận chuyển Supabase env sang publishable key

- Cập nhật local `.env.local` sang Supabase publishable key cho project `tadavibes`.
- Không commit `.env.local` để tránh đưa key/config local vào git.
- Giữ nguyên tên biến public hiện tại để không cần đổi code client.
- Tag: `v7.5.10-supabase-publishable-env`

### v7.5.9 - Tăng ROI level cao của Dao fillet

- Dao fillet chuyển từ bonus tuyến tính sang bảng yield theo level.
- Lv3-Lv5 được tăng nhẹ sản lượng để các level đắt hoàn vốn hợp lý hơn khi chơi dài.
- Cập nhật mô tả nâng cấp hiển thị giá trị Lv5 rõ ràng.
- Tag: `v7.5.9-knife-late-level-roi`

### v7.5.8 - Tăng giá trị nâng cấp Nhân viên

- Nhân viên phụ nay ngoài tăng patience còn giảm tốc độ tụt mood khi khách chờ.
- Mỗi level Staff giảm 6% mood decay, tối đa giảm 30% ở Lv5.
- Cập nhật mô tả nâng cấp để người chơi thấy lợi ích rõ hơn.
- Tag: `v7.5.8-staff-mood-value`

### v7.5.7 - Rebalance Bảng hiệu VIP

- Bảng hiệu VIP nay tăng cả xác suất VIP cơ bản và trần xác suất VIP.
- Trần VIP tăng từ 32% lên tối đa 50% theo level Sign để nâng cấp muộn vẫn có tác dụng.
- Cập nhật mô tả nâng cấp để phản ánh cơ chế mới.
- Tag: `v7.5.7-sign-vip-scaling`

### v7.5.6 - Fix giá trị nâng cấp Tủ lạnh Lv4-Lv5

- Thay công thức giảm hao hụt của Tủ lạnh từ cap 75% sang bảng theo level.
- Lv4 nay giảm 85% hao hụt, Lv5 giảm 95% hao hụt thay vì không tăng tác dụng.
- Cập nhật mô tả nâng cấp để nói rõ áp dụng cho event xấu và hư hỏng qua đêm.
- Tag: `v7.5.6-freezer-late-level-value`

### v7.5.5 - Thêm achievement liên quan tới tip

- Thêm 3 achievement mới: "Bo nhẹ lấy vía", "Khách thương quá trời", "Vua săn tip".
- Unlock theo tip đầu tiên, tip một đơn đạt 200k và tổng tip tích lũy đạt 2.000k.
- Thêm bonus điểm cho cả 3 achievement vào điểm tổng kết.
- Tag: `v7.5.5-tip-achievements`

### v7.5.4 - Thêm achievement theo giá trị đơn hàng

- Thêm 3 achievement mới cho đơn hàng đạt 2.000k, 5.000k và 10.000k.
- Achievement mới: "Đơn khủng!!!", "Khách sộp ghé thăm", "Thần tài tới, thần tài tới".
- Unlock theo `bill` của từng đơn sau khi giao thành công.
- Đưa cả 3 vào nhóm bonus điểm đơn giản để cộng vào điểm tổng kết.
- Tag: `v7.5.4-order-value-achievements`

### v7.5.3 - Fix warning lint liên quan achievement

- Đổi bộ đếm tiết kiệm nhập sỉ và tổng bán theo sản phẩm từ state write-only sang ref.
- Giữ nguyên logic unlock achievement theo milestone nhưng tránh render thừa và warning unused state.
- Bổ sung dependency còn thiếu cho effect timer khách hàng.
- Tag: `v7.5.3-fix-achievement-lint-warnings`

### v7.5.2 - Thêm nhạc nền rùng rợn cho popup God Mode

- Thêm ambient loop bằng Web Audio cho màn thông báo God Mode ngày 36.
- Âm nền tự bật khi popup God Mode xuất hiện và tự tắt khi đóng popup.
- Tôn trọng trạng thái mute hiện có, bật mute sẽ dừng ambience ngay.
- Tag: `v7.5.2-godmode-spooky-ambience`

### v7.5.1 - Fix tỷ lệ popup God Mode ngày 36

- Fix popup God Mode bị lệch do kế thừa layout căn đáy từ modal chung.
- Căn giữa `.hfs-godmode-backdrop` theo cả ngang và dọc trong khung game.
- Giới hạn chiều cao panel theo container thay vì viewport ngoài để đúng tỷ lệ trên màn phone.
- Thêm breakpoint compact cho màn thấp dưới 720px.
- Tag: `v7.5.1-fix-godmode-popup-ratio`

### v5.2 - Thay sản phẩm Day 8 & Day 16

- Day 8: Gà sạch → Set sashimi (🍣, 299k/set, cost 195k, stock 5 set, category seafood)
- Day 16: Cừu → Bò Canada (🥩, 589k/kg, cost 385k, stock 4kg, category meat)
- Day 16: Vịt → Pizza (🍕, 249k/cái, cost 160k, stock 5 cái, category addon)
- Cập nhật prefer arrays trong CUSTOMER_TYPES: Mẹ đảm/Gym Bro: chicken→sashimi; Gia đình: chicken→pizza
- Cập nhật gameUtils.ts: bỏ chicken/duck khỏi fractional qty list, thêm boCanada
- Layout 4 trang: kiểm tra OK trên 430px (349px tổng < 412px usable), không cần chỉnh CSS
- Tag: `v5.2-product-swap-sashimi-bocanada-pizza`

### v5.1 - Fix text tràn ra ngoài nút trên iPhone

- Root cause: `white-space: nowrap` bị thiếu → text wrap sang dòng 2 → tràn ra ngoài button height cố định.
- Thêm `white-space: nowrap; overflow: hidden` vào `.hfs-action` và `.hfs-board-pill`.
- Phone context: giảm `.hfs-action` font từ 12px → 11px, gap footer từ 6→5px, padding 8→6px.
- Phone context: giảm `.hfs-board-pill` từ 26px/11px/10px → 24px/10px/7px padding.
- Tag: `v5.1-fix-button-overflow-mobile`

### v5.0 - Bot nâng cấp từ từ theo mốc ngày

- Day gate per level: Lv1 từ day 8, Lv2 từ day 14, Lv3 từ day 22 (`BOT_UPGRADE_DAY_GATE`).
- Max 1 upgrade mỗi ngày: `botUpgradedToday` state, reset mỗi khi sang ngày mới.
- Sau khi mua: đóng modal ngay, không vòng lại mua thêm trong cùng tick cycle.
- Cash buffer thực tế hơn: chỉ mua khi cash ≥ cost × 2 (thay vì cost + 1,500k).
- Tag: `v5.0-bot-upgrade-pacing`

### v4.9 - Bot nhập hàng dựa theo demand thực tế

- Bỏ flat TARGET=15, thay bằng công thức: `ceil(số_khách_ngày_mai × xác_suất_order × avg_qty × 1.3)`
- `xác_suất_order` = avgItemsPerOrder / số_sản_phẩm (điều chỉnh theo số catalog đã mở)
- `avg_qty` theo category: hải sản/thịt 0.9kg, đồ đóng gói 2, trái cây 1.0–1.5
- Skip `wholeSalmon` trong broad refill (xử lý riêng bằng fillet + spot import)
- Giữ buffer 2,000k tiền mặt, không nhập nếu sau khi nhập sẽ < 2,000k
- Ví dụ ngày 20: Wagyu target=5kg (cũ: 15kg), tiết kiệm 9,200k chỉ riêng 1 sản phẩm
- Tag: `v4.9-bot-demand-based-import`

### v4.8 - Bot pause đúng chỗ để đọc thông báo

- Màn hình tổng kết cuối ngày: giảm từ 4s → 2s.
- Màn hình unlock notification (catalog, upgrade, event, ad): dừng 3.5s để đọc nội dung.
- Tag: `v4.8-bot-pause-unlocks`

### v4.7 - Bot dừng 4 giây ở màn hình tổng kết cuối ngày

- Bot delay 4000ms khi `daySummary` đang hiển thị, đủ thời gian đọc toàn bộ nội dung.
- Tag: `v4.7-bot-slow-summary`

### v4.6 - Rebalance tips + fix bot freeze sau scroll

**Tips rebalance:**
- `calcTipRate`: giảm tất cả rate xuống ~50%: fast→+3%, medium→+1.5%, mood→+1.5%, combo→max 2%, repeat→+1%, VIP→+3%.
- Cap mới: 8% regular, 12% VIP (cũ: 20%/28%).
- Bỏ nhân `comboMultiplier` vào tip (tip = baseTip, không x2 hay x1.5 nữa).
- `comboBonus` giảm factor từ 0.12 → 0.04 (combo 10 chỉ thêm tối đa 4% bill).

**Fix bot freeze:**
- `botImportScrolledRef` (useRef) không trigger re-render → bot treo sau scroll.
- Đổi thành `botImportScrolled` useState → `setBotImportScrolled(true)` trigger re-render đúng.
- Thêm `botImportScrolled` vào dependency array của bot useEffect.
- Tag: `v4.6-tips-rebalance-bot-scroll-fix`

### v4.5 - Bot scroll modal nhập hàng như người thật

- Mỗi khi tăng qty +1, bot scroll đến hàng sản phẩm đó trong modal (`scrollIntoView smooth`).
- Sau khi điền đủ hết: bot scroll xuống nút "Nhập hàng" (1s pause), rồi mới click confirm.
- Thêm `data-import-id` attribute trên mỗi hàng sản phẩm để bot định vị DOM.
- Thêm `ref` trên nút Nhập để bot scroll đúng vị trí.
- `botImportScrolledRef` đảm bảo chỉ confirm sau khi đã scroll xuống.
- Reset scroll ref mỗi khi mở modal mới.
- Tag: `v4.5-bot-import-scroll`

### v4.4 - Bot nhấn +1 từng lần như người thật khi nhập hàng

- Bot mở modal nhập hàng (qty = 0), pause 1.5s để xem form trống.
- Mỗi tick tăng qty +1 cho sản phẩm đang điền (delay 150ms/lần — nhìn thấy số đếm lên).
- Khi xong tất cả: pause 1s để thấy kết quả rồi mới confirmImport().
- Delay thông minh theo trạng thái: chưa fill=1500ms, đang fill=150ms, xong=1000ms.
- Tag: `v4.4-bot-import-plus1`

### v4.3 - Bot điền nhập hàng từng sản phẩm một

- Bot mở modal nhập hàng với qty = 0, rồi mỗi tick điền qty cho 1 sản phẩm (giống người bấm +).
- `botImportTargetRef` lưu target qty, `botImportQtyRef` đọc importQty mới nhất trong setTimeout.
- Thêm `importQty` vào dependency array để effect re-fire sau mỗi lần điền qty.
- Áp dụng cả khi nhập cuối ngày (broad refill) lẫn khi thiếu hàng phục vụ khách.
- Tag: `v4.3-bot-import-stepwise`

### v4.2 - Bot giảm tốc khi mở modal

- Bot dùng delay 1800ms (thay vì 650ms) khi modal Nâng cấp / Nhập hàng / Quảng cáo đang mở.
- Người dùng kịp nhìn thấy bot đang làm gì trước khi xác nhận.
- Tag: `v4.2-bot-slow-modal`

### v4.1 - Bot chơi như người thật (UI navigation)

- Bot điều hướng đúng trang sản phẩm (trang 2, 3...) trước khi bấm chọn món.
- Import: bot stage `importQty` rồi mở modal → tick sau confirmImport() — giống thao tác người thật.
- Upgrade: bot mở modal nâng cấp → tick sau chọn và buy — không gọi thẳng function.
- Ads: bot mở modal quảng cáo → tick sau runAd() — đúng flow UI.
- Thêm `productPage` vào dependency array của bot useEffect.
- Tag: `v4.1-bot-ui-navigation`

### v4.0 - Fix bot fillet bug + version milestone

- Fix: thêm `products` vào dependency array của bot useEffect — sau khi `fillet()` gọi `setProducts`, effect nay re-fire đúng cách thay vì bị stuck.
- Root cause: bot gọi `fillet()` xong nhưng `products` không trong deps → effect không chạy lại → bot treo.
- Bump lên v4.0.
- Tag: `v4.0-bot-fillet-fix`

### v3.21 - Bot thông minh hơn

- Bot tự nhập hàng ngay khi khách cần món mà thiếu stock (thay vì bỏ qua).
- Bot tự fillet cá nguyên nếu thiếu salmon/headBone.
- Bot auto-upgrade cuối ngày (ưu tiên staff > freezer > sign > knife) khi đủ tiền.
- Bot auto-chạy ads tờ rơi mỗi ngày từ Day 15.
- Cuối ngày: broad refill tất cả sản phẩm lên 15 units trước khi qua ngày.
- Sử dụng ref để đọc state mới nhất trong setTimeout, tránh stale closure.
- Tag: `v3.21-bot-smarter`

### v3.20 - Bot không lưu leaderboard

- Tên Tadadev bị chặn hoàn toàn khỏi `saveScore()` — không ghi điểm vào leaderboard dù thủ công hay auto.
- Tag: `v3.20-bot-no-save`

### v3.19 - Bot tự chơi (Tadadev mode)

- Nhập tên **Tadadev** ở màn tutorial để kích hoạt bot tự chơi.
- Bot tự động: chọn món → giao hàng → bỏ qua khách thiếu hàng → hết hàng thì auto nhập → qua ngày → dismiss mọi modal.
- Game over: bot tự restart sau 3 giây.
- Badge 🤖 BOT hiện ở góc trên trái khi bot đang chạy.
- Bot chạy vô tận để test toàn bộ flow, events, unlock theo ngày.
- Tag: `v3.19-bot`

### v3.18 - Ad unlock modal chi tiết

- Cải thiện modal thông báo mở khóa quảng cáo ở ngày 15: hiển thị bảng chi phí và số khách tăng cho từng loại.
- Thêm hướng dẫn "Nhấn nút 📣 Ads trên kệ hàng để chạy".
- Nút "Chạy ngay thôi!" mở thẳng vào modal quảng cáo.
- Tag: `v3.18-ad-unlock-modal`

### v3.17 - Hệ thống quảng cáo

- Mở khóa từ Day 15 với modal thông báo riêng.
- Hai loại quảng cáo: Phát tờ rơi (150k–500k, +3–5 khách) và Facebook Ads (350k–800k, +4–6 khách).
- Chi phí random trong khoảng, số khách thêm random và được áp dụng vào ngày hôm sau.
- Mỗi ngày chỉ chạy được 1 loại. Nút 📣 Ads trên shelf, đổi màu xanh khi đã chạy.
- Timer dừng khi mở modal ads.
- Tag: `v3.17-advertising`

### v3.16 - Start button nudge right +5%

- Thêm `translateX(5%)` để bù trừ padding trong suốt không đều trong file start-btn.png.
- Tag: `v3.16-start-btn-nudge`

### v3.15 - Fix start button centering (flex approach)

- Đổi `.hfs-start-screen` thành flex container (`align-items: center; justify-content: flex-end`) để căn nút Start Game chính giữa một cách đáng tin cậy.
- Bỏ `position: absolute` khỏi nút, dùng flex layout thay thế.
- Tag: `v3.15-start-btn-flex`

### v3.14 - Fix start button centering

- Đổi căn giữa nút Start Game từ `left:50%+translateX(-50%)` sang `left:0;right:0;margin:auto` cho chắc chắn hơn trên mọi device.
- Tag: `v3.14-start-btn-center`

### v3.13 - Mood pressure +50%

- Tăng tốc độ giảm mood thêm ×1.5 (từ ×1.69 lên ×2.535 so với gốc).
- Tag: `v3.13-mood-pressure2`

### v3.12 - Mood pressure +30%

- Tăng tốc độ giảm mood thêm ×1.3 (từ ×1.3 lên ×1.69 so với gốc).
- Tag: `v3.12-mood-pressure`

### v3.11 - SFX polish + tutorial UI

- Thêm âm thanh cho nút "Sang ngày X" trong màn tổng kết.
- Thêm âm thanh cho nút Fillet (knife "xẹt xẹt"), mở Nhập hàng, Qua ngày, stepper +/−.
- Tăng volume toàn bộ SFX lên ~2x so với v3.10.
- Tutorial: thêm dòng gợi ý âm thanh (khung amber).
- Tutorial: căn giữa toàn bộ header (title, desc).
- Tutorial: thêm icon 🏪 bên phải để cân layout.
- Tag: `v3.11-sfx-polish`

### v3.10 - Sound effects (Web Audio API)

- Added synthesized SFX via Web Audio API — zero new asset files.
- `sfx.tap()`: pop ngắn khi chọn đúng món.
- `sfx.wrong()`: buzz thấp khi tap sai, thiếu hàng.
- `sfx.deliver()`: ka-ching 3 nốt khi giao hàng thành công.
- `sfx.combo(level)`: fanfare tăng dần (3→5 nốt) khi combo 3+.
- `sfx.fail()`: tone buồn đi xuống khi khách bỏ đi.
- `sfx.cash()`: 2 nốt triangle khi nhập hàng / nâng cấp thành công.
- `sfx.gameOver()`: 4 nốt sawtooth đi xuống khi game over.
- SFX tự động tắt theo nút mute 🔇.
- Tag: `v3.10-sfx`

### v3.9 - Game over overhaul + mood pressure

- Added 2 new game over conditions:
  - **Bị trộm phá sản**: nếu sau khi trả vận hành, event thief đẩy tiền mặt xuống âm → phá sản ngay.
  - **Mất uy tín**: rating dưới 2.0 sao 3 ngày liên tiếp → cửa hàng mất khách, game over với màn riêng (icon 📉).
- Game over panel redesigned: icon, tiêu đề, mô tả lý do cụ thể, stats grid (ngày, DT, lãi, phục vụ, combo, điểm), hai nút 🏆 Leaderboard + 🔄 Chơi lại.
- Nút "Chơi lại" reset toàn bộ trạng thái về start screen (bao gồm BGM).
- Tăng tốc độ giảm mood ×1.3 để tạo áp lực cao hơn.
- Tag: `v3.9-gameover`

### v3.8 - Operating cost breakdown

- Split the daily operating cost into four named line items: Thuê nhà, Nhân viên, Điện nước, and Khác.
- "Khác" is randomised each day within a per-tier range (rounded to 10k): 10-50k for Day 1-5, 30-80k for Day 6-11, 50-150k for Day 12+.
- End-day summary shows each line item, a dashed-line total, and a cash-remaining row.
- Cash-remaining row turns red when negative (bankruptcy warning).
- Updated the visible game version badge to `v3.8`.
- Tag: `v3.8-cost-breakdown`

### v3.7 - Operating costs and game over

- Added tiered daily operating costs (chi phí vận hành): 400k on Day 1-5, 650k on Day 6-11, 950k on Day 12+.
- Deducted automatically when the player advances to the next day.
- End-day summary now shows operating cost and cash remaining after deduction.
- Added a red warning in the summary if the deduction would result in negative cash.
- Added a game over screen (💸 Cửa hàng phá sản!) when cash goes negative after cost deduction.
- Game over screen shows final score and a button to open the leaderboard.
- Updated the visible game version badge to `v3.7`.
- Tag: `v3.7-operating-costs`

### v3.6 - Background music

- Added looping background music via HTML5 Audio API (`/homefarm-shop/bgm.mp3`).
- BGM starts when the player taps START GAME and loops throughout the session.
- Added a mute/unmute button (🔊/🔇) in the top-right corner of the game UI.
- Updated the visible game version badge to `v3.6`.
- Tag: `v3.6-bgm`

### v3.5 - Layout overhaul

- Moved toast bar outside of `<main>` so it sits pinned directly above the footer.
- Made shelf use `flex: 1` to fill all remaining space automatically instead of fixed height.
- Restored toast `border-radius: 12px` and added proper margin for breathing room.
- Updated the visible game version badge to `v3.5`.
- Tag: `v3.5-toast-fix`

### v3.4 - Bigger shelf controls

- Increased page tabs (1/2/3) height from 19px to 26px and font from 9px to 11px for easier tap on mobile.
- Increased BXH and upgrade pills height from 21px to 26px and font from 9px to 11px.
- Increased shelf-head row height to accommodate larger controls.
- Updated the visible game version badge to `v3.4`.
- Tag: `v3.4-ui-layout`

### v3.3 - Leaderboard spam fix

- Removed `setScoreSaved(false)` from the leaderboard open handler — button stays disabled after saving.
- Reset `scoreSaved` only when advancing to a new day, allowing one save per day with a new score.
- Updated the visible game version badge to `v3.3`.
- Tag: `v3.3-leaderboard-spam-fix`

### v3.2 - Leaderboard improvements

- Added medal icons 🥇🥈🥉 for top 1-2-3 in the leaderboard.
- Capped display to top 5 entries, then `· · ·` and the last entry.
- Inserted current player's row at their rank position (highlighted in yellow), even before saving.
- Updated the visible game version badge to `v3.2`.
- Tag: `v3.2-leaderboard`

### v3.1 - Player name input in tutorial

- Added player name input field to the tutorial modal with label "🧑‍🌾 Hãy nhập tên của bạn".
- Button disabled until a name is entered.
- Player name kept in session memory and used when saving to the leaderboard.
- Updated the visible game version badge to `v3.1`.
- Tag: `v3.1-player-name`

### v3.0 - Start screen & tutorial

- Added a start screen filling the phone frame with farm-themed green background, game logo, mascot, and tag labels.
- Added a START GAME button that leads to a tutorial popup before entering gameplay.
- Added a tutorial popup with 4 feature bullets: order management, customer service, revenue optimization, and shop upgrades.
- Credits on start screen: ý tưởng Tada, vibe code với Codex và Claude Code.
- Game timers no longer run during start/tutorial phase.
- Updated the visible game version badge to `v3.0`.
- Tag: `v3.0-start-screen`

### v2.6 - Supabase leaderboard

- Connected leaderboard to Supabase for persistent cloud storage across sessions.
- Created `homefarm_shop_leaderboard` table with RLS policies (public read, public insert with validation).
- Fallback to localStorage when Supabase env vars are not set.
- Updated the visible game version badge to `v2.6`.
- Tag: `v2.6-supabase-leaderboard`

### v2.5 - Overnight stock spoilage

- Added overnight stock spoilage when advancing to the next day.
- Applied spoilage before newly unlocked products are added, so new catalog items do not decay immediately.
- Made seafood and meat decay faster than fruit, core, and addon products.
- Made freezer upgrades reduce overnight spoilage by 25% per level, capped at 75%.
- Added a toast note when overnight spoilage affects stocked products.
- Updated the visible game version badge to `v2.5`.
- Tag: `v2.5-overnight-stock-spoilage`

### v2.4.4 - Later special events

- Moved special events to start from Day 12 instead of Day 6.
- Added an operations warning modal when the player advances from Day 11 to Day 12.
- Changed special event chance to start at 18% on Day 12, increase by 2% per day, and cap at 36%.
- Paused the customer timer while the Day 12 warning modal is open.
- Updated the visible game version badge to `v2.4.4`.
- Tag: `v2.4.4-day12-special-events`

### v2.4.3 - Rainy day app orders

- Added app-order tracking with an `APP` badge in the active order card.
- Added a 20k shipping fee deduction from cash and profit for every delivered app order.
- Made rainy-day events actually increase app-order frequency by favoring `Shipper app` customers and converting some normal orders to app orders.
- Updated the visible game version badge to `v2.4.3`.
- Tag: `v2.4.3-rainy-day-app-fees`

### v2.4.2 - Day 6 product expansion unlock

- Added a product catalog expansion modal when the player advances from Day 5 to Day 6.
- Kept existing gameplay controls hidden while the unlock modal is open.
- Added a toast note when Day 6 starts and the product catalog expands.
- Updated the visible game version badge to `v2.4.2`.
- Tag: `v2.4.2-day6-catalog-unlock`

### v2.4.1 - Day 8 upgrade unlock

- Hidden the shop upgrade button before Day 8.
- Added a feature-unlock modal when the player advances from Day 7 to Day 8.
- Paused the customer timer while the unlock modal is open.
- Updated the visible game version badge to `v2.4.1`.
- Tag: `v2.4.1-day8-upgrade-unlock`

### v2.4 - Shop upgrades

- Added a shop upgrade modal with four upgrades: fillet knife, staff helper, VIP sign, and freezer.
- Added upgrade levels and cash costs with a max level of 3 per upgrade.
- Made fillet knife upgrades increase salmon and head-bone yield immediately.
- Made staff helper upgrades increase customer patience from the next day.
- Made VIP sign upgrades increase VIP customer chance from the next day.
- Made freezer upgrades reduce negative stock loss from shop events.
- Updated the visible game version badge to `v2.4`.
- Tag: `v2.4-shop-upgrades`

### v2.3.1 - Remove daily goal overlay

- Removed the daily goal bar from the active order panel so `ORDER`, `TIME`, and `MOOD` remain clearly visible.
- Removed daily goal reward logic from day transitions.
- Kept the end-day summary and VIP customer behavior from `v2.3`.
- Updated the visible game version badge to `v2.3.1`.
- Tag: `v2.3.1-no-daily-goals`

### v2.3 - Daily goals, end-day summary, VIP orders

- Added a real end-day summary modal with revenue, profit, served customers, skipped customers, max combo, rating, and goal result.
- Added rotating daily goals for revenue, served customers, and max combo.
- Added cash rewards for completed daily goals when advancing to the next day.
- Added VIP customers from day 3 onward with larger orders, lower patience, a visible VIP badge, and higher tip potential.
- Added per-day served/skipped/max-combo tracking for fair summary and goal scoring.
- Updated the visible game version badge to `v2.3`.
- Tag: `v2.3-daily-goals-vip`

### v2.2.1 - Production build restore

- Restored the missing game component path needed for production builds.
- Tag: `v2.2.1-build-fix`

### v2.2 - End-day summary groundwork

- Added initial end-day summary and customer type groundwork.
- Added game version configuration.

### v2.1 - Difficulty and events

- Restored scaling difficulty.
- Restored shop event behavior.
- Tag: `v2.1-difficulty-events`

### v2.0 - Clean standalone simulator

- Cleaned the standalone Homefarm Simulator root version.
- Tag: `homefarm-simulator-clean-v2`

## Update Rule

- Append new versions at the top of `Version History`.
- Keep the current snapshot section in sync with the latest commit/tag.
- If a version changes UI/logic, update the relevant feature bullets and tag name here in the same commit.

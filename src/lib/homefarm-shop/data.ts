import type { Achievement, CustomerType, MascotState, Product, ShopEvent } from "@/types/homefarm-shop";

export const ALL_PRODUCTS: Product[] = [
  // Day 1-5: core calm mode, 8 items only
  { id: "salmon", name: "Cá hồi", icon: "🐟", stock: 12.4, unit: "kg", price: 769, cost: 520, unlockDay: 1, category: "seafood" },
  { id: "wholeSalmon", name: "Cá nguyên", icon: "🎣", stock: 3, unit: "con", price: 559 * 6, cost: 430 * 6, unlockDay: 1, category: "seafood" },
  { id: "beef", name: "Bò Mỹ", icon: "🥩", stock: 8.6, unit: "kg", price: 429, cost: 260, unlockDay: 1, category: "meat" },
  { id: "egg", name: "Trứng", icon: "🥚", stock: 18, unit: "hộp", price: 69, cost: 42, unlockDay: 1, category: "core" },
  { id: "sausage", name: "Xúc xích", icon: "🌭", stock: 16, unit: "gói", price: 89, cost: 55, unlockDay: 1, category: "addon" },
  { id: "grape", name: "Nho Mỹ", icon: "🍇", stock: 7.8, unit: "kg", price: 199, cost: 125, unlockDay: 1, category: "fruit" },
  { id: "cherry", name: "Cherry", icon: "🍒", stock: 4.4, unit: "kg", price: 459, cost: 310, unlockDay: 1, category: "fruit" },
  { id: "headBone", name: "Đầu xương", icon: "🍲", stock: 2.2, unit: "kg", price: 89, cost: 0, unlockDay: 1, category: "addon" },

  // From day 6 onward: +2 products every 2 days, max 32 items
  { id: "shrimp", name: "Tôm sú", icon: "🦐", stock: 4.5, unit: "kg", price: 329, cost: 220, unlockDay: 6, category: "seafood" },
  { id: "squid", name: "Mực", icon: "🦑", stock: 4.2, unit: "kg", price: 259, cost: 175, unlockDay: 6, category: "seafood" },

  { id: "pork", name: "Heo Iberico", icon: "🥓", stock: 5.5, unit: "kg", price: 359, cost: 230, unlockDay: 8, category: "meat" },
  { id: "sashimi", name: "Set sashimi", icon: "🍣", stock: 5, unit: "set", price: 299, cost: 195, unlockDay: 8, category: "seafood" },

  { id: "avocado", name: "Bơ", icon: "🥑", stock: 5, unit: "kg", price: 169, cost: 105, unlockDay: 10, category: "fruit" },
  { id: "blueberry", name: "Việt quất", icon: "🫐", stock: 3.5, unit: "hộp", price: 139, cost: 88, unlockDay: 10, category: "fruit" },

  { id: "cheese", name: "Phô mai", icon: "🧀", stock: 8, unit: "gói", price: 119, cost: 72, unlockDay: 12, category: "addon" },
  { id: "milk", name: "Sữa tươi", icon: "🥛", stock: 10, unit: "chai", price: 49, cost: 30, unlockDay: 12, category: "core" },

  { id: "oyster", name: "Hàu", icon: "🦪", stock: 4, unit: "kg", price: 219, cost: 145, unlockDay: 14, category: "seafood" },
  { id: "crab", name: "Cua", icon: "🦀", stock: 3.5, unit: "kg", price: 499, cost: 340, unlockDay: 14, category: "seafood" },

  { id: "boCanada", name: "Bò Canada", icon: "🥩", stock: 4, unit: "kg", price: 589, cost: 385, unlockDay: 16, category: "meat" },
  { id: "pizza", name: "Pizza", icon: "🍕", stock: 5, unit: "cái", price: 249, cost: 160, unlockDay: 16, category: "addon" },

  { id: "strawberry", name: "Dâu tây", icon: "🍓", stock: 4.2, unit: "kg", price: 299, cost: 195, unlockDay: 18, category: "fruit" },
  { id: "kiwi", name: "Kiwi", icon: "🥝", stock: 5, unit: "kg", price: 169, cost: 108, unlockDay: 18, category: "fruit" },

  { id: "butter", name: "Bơ lạt", icon: "🧈", stock: 8, unit: "hộp", price: 99, cost: 62, unlockDay: 20, category: "addon" },
  { id: "yogurt", name: "Sữa chua", icon: "🥣", stock: 10, unit: "hộp", price: 59, cost: 36, unlockDay: 20, category: "core" },

  { id: "scallop", name: "Sò điệp", icon: "🐚", stock: 3.2, unit: "kg", price: 459, cost: 315, unlockDay: 22, category: "seafood" },
  { id: "cod", name: "Cá tuyết", icon: "🐠", stock: 3.8, unit: "kg", price: 399, cost: 270, unlockDay: 22, category: "seafood" },

  { id: "wagyu", name: "Wagyu", icon: "🥩", stock: 2.5, unit: "kg", price: 1299, cost: 920, unlockDay: 24, category: "meat" },
  { id: "bacon", name: "Bacon", icon: "🥓", stock: 7, unit: "gói", price: 129, cost: 78, unlockDay: 24, category: "meat" },

  { id: "mango", name: "Xoài Úc", icon: "🥭", stock: 5, unit: "kg", price: 189, cost: 118, unlockDay: 26, category: "fruit" },
  { id: "orange", name: "Cam", icon: "🍊", stock: 6, unit: "kg", price: 129, cost: 78, unlockDay: 26, category: "fruit" },

  { id: "ham", name: "Jambon", icon: "🍖", stock: 8, unit: "gói", price: 109, cost: 68, unlockDay: 28, category: "addon" },
  { id: "bread", name: "Bánh mì", icon: "🥖", stock: 12, unit: "ổ", price: 39, cost: 22, unlockDay: 28, category: "core" },
];

export const START_PRODUCTS = ALL_PRODUCTS.filter((p) => (p.unlockDay || 1) <= 1);

export const CUSTOMER_TYPES: CustomerType[] = [
  { name: "Mẹ đảm", avatar: "👩‍🍳", mood: "Soi kỹ", patience: 24, size: 4, prefer: ["salmon", "beef", "egg", "sashimi"], quote: "Cá phải tươi, thịt phải đẹp." },
  { name: "Gym Bro", avatar: "💪", mood: "Protein", patience: 26, size: 3, prefer: ["beef", "egg", "salmon", "sashimi", "wagyu"], quote: "Full protein cho anh." },
  { name: "Gen Z", avatar: "🧋", mood: "Ăn clean", patience: 36, size: 3, prefer: ["salmon", "grape", "cherry", "avocado", "blueberry", "yogurt"], quote: "Set healthy xinh xinh nha!" },
  { name: "Khách VIP", avatar: "😎", mood: "Chi mạnh", patience: 22, size: 5, prefer: ["salmon", "beef", "cherry", "shrimp", "wagyu", "crab"], quote: "Lấy đồ ngon nhất." },
  { name: "Khó tính", avatar: "😤", mood: "Gắt", patience: 16, size: 4, prefer: ["salmon", "beef", "wagyu"], quote: "Nhanh lên." },
  { name: "Dễ tính", avatar: "😊", mood: "Chill", patience: 42, size: 2, prefer: ["egg", "sausage", "grape", "milk", "bread"], quote: "Từ từ cũng được." },
  { name: "Gia đình", avatar: "👨‍👩‍👧", mood: "Mua nhiều", patience: 30, size: 5, prefer: ["salmon", "beef", "egg", "sausage", "pizza", "orange"], quote: "Mỗi thứ một ít." },
  { name: "Dân văn phòng", avatar: "💼", mood: "Ăn trưa", patience: 28, size: 3, prefer: ["sausage", "egg", "beef", "milk", "bread"], quote: "Nhanh gọn nhé." },
  { name: "Foodie", avatar: "🤤", mood: "Sành ăn", patience: 25, size: 4, prefer: ["salmon", "beef", "cherry", "cheese", "oyster", "scallop"], quote: "Phải ngon nhé." },
  { name: "Sinh viên", avatar: "🎓", mood: "Tiết kiệm", patience: 35, size: 2, prefer: ["egg", "sausage", "milk", "bread"], quote: "Món rẻ thôi." },
  { name: "Người già", avatar: "👴", mood: "Chậm rãi", patience: 45, size: 2, prefer: ["salmon", "egg", "headBone", "yogurt"], quote: "Cho tôi đồ dễ ăn." },
  { name: "Streamer", avatar: "🎥", mood: "Content", patience: 20, size: 3, prefer: ["salmon", "beef", "sausage", "strawberry"], quote: "Làm nhanh tôi còn lên sóng." },
  { name: "Cặp đôi", avatar: "💑", mood: "Hẹn hò", patience: 30, size: 3, prefer: ["cherry", "grape", "salmon", "cheese", "strawberry"], quote: "Đồ romantic nhé." },
  { name: "Shipper app", avatar: "🛵", mood: "Đơn online", patience: 17, size: 3, prefer: ["salmon", "beef", "egg", "sausage", "milk"], quote: "Đơn app đang chờ, đóng nhanh giúp em." },
  { name: "Team party", avatar: "🎉", mood: "Mua tiệc", patience: 23, size: 5, prefer: ["beef", "salmon", "cherry", "grape", "shrimp", "cheese"], quote: "Tối nay party, lấy nhiều đồ ngon nhé." },
  { name: "Khách Nhật", avatar: "🍣", mood: "Mê cá hồi", patience: 26, size: 3, prefer: ["salmon", "wholeSalmon", "squid", "cod"], quote: "Cá hồi ngon là được." },
  { name: "Nhà hàng", avatar: "🏮", mood: "Lấy sỉ", patience: 20, size: 4, prefer: ["wholeSalmon", "salmon", "beef", "shrimp", "oyster"], quote: "Cho cá nguyên con đẹp nhé." },
  { name: "Khách nấu lẩu", avatar: "🍲", mood: "Mua xương", patience: 32, size: 2, prefer: ["headBone", "beef", "salmon", "pork"], quote: "Có đầu xương nấu lẩu không?" },
  { name: "Khách Hàn", avatar: "🇰🇷", mood: "K-food", patience: 27, size: 3, prefer: ["beef", "pork", "sashimi", "bacon", "egg"], quote: "삼겹살 있어요? Thịt ba chỉ đi nha." },
  { name: "Bà nội trợ VIP", avatar: "👒", mood: "Sành điệu", patience: 22, size: 4, prefer: ["wagyu", "cheese", "scallop", "salmon", "crab"], quote: "Tôi chỉ lấy hàng xịn thôi nhé." },
  { name: "Đầu bếp", avatar: "👨‍🍳", mood: "Chuyên nghiệp", patience: 24, size: 4, prefer: ["wholeSalmon", "oyster", "crab", "cod", "scallop"], quote: "Hàng tươi sống thôi, đừng đông lạnh." },
  { name: "Nhóm sinh nhật", avatar: "🎂", mood: "Ăn tiệc", patience: 28, size: 5, prefer: ["strawberry", "cherry", "grape", "cheese", "salmon"], quote: "Hôm nay sinh nhật bạn tớ, lấy đẹp đẹp nhé!" },
  { name: "Gym girl", avatar: "🏋️‍♀️", mood: "Healthy", patience: 33, size: 3, prefer: ["blueberry", "avocado", "yogurt", "egg", "salmon"], quote: "Đồ ăn clean cho chị nhé, không chất béo." },
  { name: "Ông chủ quán", avatar: "🧔", mood: "Lấy sỉ", patience: 21, size: 4, prefer: ["wholeSalmon", "beef", "pork", "shrimp", "egg"], quote: "Lấy nhiều, tính giá tốt nhé." },
  { name: "Khách du lịch", avatar: "🧳", mood: "Ghé nhanh", patience: 15, size: 2, prefer: ["sausage", "cheese", "bread", "milk", "grape"], quote: "Mua nhanh thôi, tôi còn bắt xe." },
];

export const SHOP_EVENTS: ShopEvent[] = [
  { id: "staff-off", type: "bad", title: "Nhân viên nghỉ đột xuất", description: "😴 Nhân viên gọi báo ốm sáng nay. Khách dễ sốt ruột hơn — mood đầu ngày -10 điểm.", moodDelta: -10 },
  { id: "thief", type: "bad", title: "Bị trộm vặt", description: "🦹 Có kẻ lén lút móc tiền quầy thu ngân. Mất tiền mặt.", cashDelta: -150 },
  { id: "freezer-issue", type: "bad", title: "Tủ đông trục trặc", description: "🌡️ Tủ đông mất điện một lúc. Bò Mỹ và cá hồi bị hao hụt nhẹ.", stockDelta: { salmon: -0.5, beef: -0.5 } },
  { id: "viral-post", type: "good", title: "Bài TikTok viral", description: "📱✨ Video check-in cửa hàng lan truyền mạng xã hội! +100k tiền mặt và mood đầu ngày +8.", cashDelta: 100, moodDelta: 8 },
  { id: "supplier-bonus", type: "good", title: "Nhà cung cấp tặng hàng", description: "📦🎁 Nhà cung cấp gửi quà tri ân, kho thêm một ít hàng.", stockDelta: { egg: 3, sausage: 3 } },
  { id: "loyal-customer", type: "good", title: "Khách quen ghé sớm", description: "🤝 Một nhóm khách quen tới sớm, vui vẻ và chi thoải mái. Mood đầu ngày +12.", moodDelta: 12 },
  { id: "rainy-day", type: "neutral", title: "Trời mưa", description: "🌧️ Trời đổ mưa to, khách ngại ra đường — đơn app tăng vọt nhưng khách vội hơn. Mood đầu ngày -4.", moodDelta: -4 },
];

export const MASCOT_ASSETS: Record<MascotState, string> = {
  idle: "/homefarm-shop/mascot/trust-me.webp",
  happy: "/homefarm-shop/mascot/sieu-vui.webp",
  combo: "/homefarm-shop/mascot/dab.webp",
  wrong: "/homefarm-shop/mascot/ngac-nhien.webp",
  hurry: "/homefarm-shop/mascot/thong-bao.webp",
  fail: "/homefarm-shop/mascot/buon-va-bat-luc.webp",
  idea: "/homefarm-shop/mascot/y-tuong.webp",
  thinking: "/homefarm-shop/mascot/suy-ngam.webp",
  trust: "/homefarm-shop/mascot/tin-tuong.webp",
};

export const MASCOT_TALK: Record<MascotState, string> = {
  idle: "Có khách kìa!",
  happy: "Chuẩn rồi bro!",
  combo: "Combo cháy quá!",
  wrong: "Ơ sai món rồi!",
  hurry: "Nhanh lên nào!",
  fail: "Toang mất khách rồi...",
  idea: "Hint: nhìn ORDER nhé!",
  thinking: "Tính kỹ chút nha.",
  trust: "Tin tớ, món này bán chạy!",
};

export const ACHIEVEMENTS: Achievement[] = [
  { id: "first_serve", title: "Khởi nghiệp!", desc: "Phục vụ khách hàng đầu tiên", icon: "🎉" },
  { id: "combo_5", title: "Tốc độ ánh sáng", desc: "Đạt combo x5", icon: "⚡" },
  { id: "combo_10", title: "Combo Cháy", desc: "Đạt combo x10", icon: "🔥" },
  { id: "perfect_day", title: "Ngày hoàn hảo", desc: "0 khách bỏ qua trong 1 ngày (≥5 khách)", icon: "⭐" },
  { id: "big_revenue", title: "Ngày thắng lớn", desc: "Doanh thu 1 ngày đạt 10.000k", icon: "💰" },
  { id: "order_2000", title: "Đơn khủng!!!", desc: "Hoàn thành đơn hàng đạt 2.000k", icon: "🧾" },
  { id: "order_5000", title: "Khách sộp ghé thăm", desc: "Hoàn thành đơn hàng đạt 5.000k", icon: "💎" },
  { id: "order_10000", title: "Thần tài tới, thần tài tới", desc: "Hoàn thành đơn hàng đạt 10.000k", icon: "🧧" },
  { id: "total_100", title: "Chủ shop chăm chỉ", desc: "Phục vụ tổng 100 khách", icon: "🤝" },
  { id: "millionaire", title: "Tỷ phú mini", desc: "Tích lũy 50.000k tiền mặt", icon: "🏆" },
  { id: "salmon_master",   title: "Vua cá hồi",       desc: "Bán 50kg cá hồi trong 1 ngày",                      icon: "🐟" },
  { id: "bulk_save_200",  title: "Biết tính toán",   desc: "Tiết kiệm tích lũy 200k nhờ nhập số lượng lớn",    icon: "🧮" },
  { id: "bulk_save_500",  title: "Mua hàng khôn",    desc: "Tiết kiệm tích lũy 500k nhờ nhập số lượng lớn",    icon: "💡" },
  { id: "bulk_save_1000", title: "Thánh nhập hàng",  desc: "Tiết kiệm tích lũy 1.000k nhờ nhập số lượng lớn", icon: "📦" },
  { id: "bulk_save_1500", title: "Vua mua sỉ",       desc: "Tiết kiệm tích lũy 1.500k nhờ nhập số lượng lớn", icon: "👑" },
  { id: "bulk_save_2000",  title: "Thánh tiết kiệm",  desc: "Tiết kiệm tích lũy 2.000k nhờ nhập số lượng lớn",          icon: "🪙" },
  { id: "sold_salmon_100",  title: "Người cá",         desc: "Bán tích lũy 100kg cá hồi",                               icon: "🧜" },
  { id: "sold_beef_100",    title: "Vua bò",           desc: "Bán tích lũy 100kg bò các loại",                          icon: "🐄" },
  { id: "sold_pork_100",    title: "Đại gia heo",      desc: "Bán tích lũy 100 phần heo, bacon, jambon",                icon: "🐷" },
  { id: "sold_egg_50",      title: "Con gà vàng",      desc: "Bán tích lũy 50 hộp trứng",                               icon: "🐓" },
  { id: "sold_shrimp_50",   title: "Vua tôm",          desc: "Bán tích lũy 50kg tôm",                                   icon: "🦐" },
  { id: "sold_sashimi_30",  title: "Đầu bếp Nhật",    desc: "Bán tích lũy 30 set sashimi",                             icon: "🍣" },
  { id: "sold_fruit_100",   title: "Thần hoa quả",     desc: "Bán tích lũy 100kg/hộp trái cây các loại",               icon: "🍇" },
  { id: "sold_seafood_200", title: "Vua hải sản",      desc: "Bán tích lũy 200kg hải sản tổng",                        icon: "🦞" },
  { id: "sold_meat_200",    title: "Thánh thịt",       desc: "Bán tích lũy 200kg thịt tổng",                           icon: "🥩" },
  { id: "sold_dairy_100",   title: "Chủ trang trại",   desc: "Bán tích lũy 100 sản phẩm sữa (milk, yogurt, cheese, butter)", icon: "🥛" },
];

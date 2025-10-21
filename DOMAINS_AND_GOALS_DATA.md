# 🎯 Domains & Goal Templates - Dữ Liệu Mẫu

**Dự án:** UMX - Hệ Thống Quản Lý Can Thiệp ABA  
**Ngày:** 21 tháng 10, 2025  
**Mục đích:** Tài liệu chi tiết về 7 lĩnh vực can thiệp và dữ liệu goal templates mẫu

---

## 📋 Mục Lục

1. [7 Intervention Domains](#1-7-intervention-domains)
2. [Goal Templates theo từng Domain](#2-goal-templates-theo-từng-domain)
3. [Tags System](#3-tags-system)
4. [Seed Data SQL](#4-seed-data-sql)

---

## 1. 7 Intervention Domains

### 📊 Tổng Quan

Hệ thống ABA chia can thiệp thành 7 lĩnh vực chính, mỗi lĩnh vực tập trung vào một khía cạnh phát triển cụ thể.

### 🎨 Chi Tiết 7 Domains

#### 1. 👤 IMITATION (Bắt chước)

**Thông tin:**

- **Code:** `IMITATION`
- **Tên:** Bắt chước
- **Tên (English):** Imitation
- **Màu:** `#FF6B6B` (Red)
- **Icon:** 👤 hoặc `user-copy`
- **Order:** 1

**Mô tả:**
Khả năng quan sát và bắt chước hành động, âm thanh, hoặc cử chỉ của người khác. Đây là nền tảng cho việc học hỏi các kỹ năng mới.

**Các loại Imitation:**

- Motor Imitation (Bắt chước động tác)
- Vocal Imitation (Bắt chước âm thanh)
- Object Imitation (Bắt chước với đồ vật)
- Action Imitation (Bắt chước hành động)

**Số lượng goals:** ~25-30 templates

---

#### 2. 👂 RECEPTIVE LANGUAGE (Ngôn ngữ Receptive)

**Thông tin:**

- **Code:** `RECEPTIVE_LANGUAGE`
- **Tên:** Ngôn ngữ Receptive
- **Tên (English):** Receptive Language
- **Màu:** `#4ECDC4` (Teal)
- **Icon:** 👂 hoặc `ear`
- **Order:** 2

**Mô tả:**
Khả năng hiểu và xử lý ngôn ngữ được nghe hoặc đọc. Bao gồm việc hiểu chỉ dẫn, câu hỏi, và ngôn ngữ phức tạp.

**Kỹ năng chính:**

- Following Directions (Làm theo chỉ dẫn)
- Identifying Objects/Pictures (Nhận diện đồ vật/hình ảnh)
- Understanding Concepts (Hiểu khái niệm: màu sắc, kích thước, vị trí)
- Answering Questions (Trả lời câu hỏi)

**Số lượng goals:** ~35-40 templates

---

#### 3. 💬 EXPRESSIVE LANGUAGE (Ngôn ngữ Expressive)

**Thông tin:**

- **Code:** `EXPRESSIVE_LANGUAGE`
- **Tên:** Ngôn ngữ Expressive
- **Tên (English):** Expressive Language
- **Màu:** `#45B7D1` (Blue)
- **Icon:** 💬 hoặc `message-circle`
- **Order:** 3

**Mô tả:**
Khả năng truyền đạt ý tưởng, nhu cầu và cảm xúc qua lời nói, ký hiệu, hoặc hình ảnh (PECS).

**Kỹ năng chính:**

- Requesting (Yêu cầu)
- Labeling (Gọi tên)
- Commenting (Bình luận)
- Answering Questions (Trả lời câu hỏi)
- Conversational Skills (Kỹ năng hội thoại)

**Số lượng goals:** ~40-45 templates

---

#### 4. 👁️ VISUAL PERFORMANCE (Nhận thức thị giác)

**Thông tin:**

- **Code:** `VISUAL_PERFORMANCE`
- **Tên:** Nhận thức thị giác
- **Tên (English):** Visual Performance / Cognition
- **Màu:** `#96CEB4` (Green)
- **Icon:** 👁️ hoặc `eye`
- **Order:** 4

**Mô tả:**
Kỹ năng xử lý thông tin thị giác, ghép cặp, phân loại, và giải quyết vấn đề trực quan.

**Kỹ năng chính:**

- Matching (Ghép cặp)
- Sorting (Phân loại)
- Puzzles (Ghép hình)
- Visual Discrimination (Phân biệt thị giác)
- Sequencing (Sắp xếp theo trình tự)

**Số lượng goals:** ~30-35 templates

---

#### 5. 🎮 PLAY & LEISURE (Chơi & Giải trí)

**Thông tin:**

- **Code:** `PLAY_LEISURE`
- **Tên:** Chơi & Giải trí
- **Tên (English):** Play & Leisure
- **Màu:** `#FFEAA7` (Yellow)
- **Icon:** 🎮 hoặc `gamepad`
- **Order:** 5

**Mô tả:**
Khả năng tham gia vào các hoạt động vui chơi độc lập hoặc tương tác với người khác một cách phù hợp.

**Loại Play:**

- Independent Play (Chơi độc lập)
- Parallel Play (Chơi song song)
- Interactive Play (Chơi tương tác)
- Pretend Play (Chơi giả vờ)
- Game Play (Chơi trò chơi có quy tắc)

**Số lượng goals:** ~25-30 templates

---

#### 6. 🤝 SOCIAL SKILLS (Kỹ năng Xã hội)

**Thông tin:**

- **Code:** `SOCIAL_SKILLS`
- **Tên:** Kỹ năng Xã hội
- **Tên (English):** Social Skills
- **Màu:** `#A29BFE` (Purple)
- **Icon:** 🤝 hoặc `users`
- **Order:** 6

**Mô tả:**
Kỹ năng tương tác, chia sẻ, hợp tác, và hiểu cảm xúc của bản thân và người khác.

**Kỹ năng chính:**

- Joint Attention (Chú ý chung)
- Turn-Taking (Lần lượt)
- Sharing (Chia sẻ)
- Greeting (Chào hỏi)
- Emotion Recognition (Nhận diện cảm xúc)
- Perspective Taking (Hiểu góc nhìn người khác)

**Số lượng goals:** ~30-35 templates

---

#### 7. 🍽️ SELF-HELP (Tự phục vụ)

**Thông tin:**

- **Code:** `SELF_HELP`
- **Tên:** Tự phục vụ
- **Tên (English):** Self-Help / Daily Living Skills
- **Màu:** `#FD79A8` (Pink)
- **Icon:** 🍽️ hoặc `utensils`
- **Order:** 7

**Mô tả:**
Các kỹ năng sinh hoạt hàng ngày cần thiết cho sự độc lập: ăn uống, mặc quần áo, vệ sinh cá nhân.

**Kỹ năng chính:**

- Feeding (Ăn uống)
- Dressing (Mặc quần áo)
- Toileting (Vệ sinh cá nhân)
- Grooming (Chăm sóc bản thân)
- Safety (An toàn)

**Số lượng goals:** ~25-30 templates

---

## 2. Goal Templates theo từng Domain

### 🎯 Domain 1: IMITATION (25 Goals)

#### Easy Level (10 goals)

1. **Child can imitate 3 simple play actions with objects**

   - Mô tả: Trẻ có thể bắt chước 3 hành động chơi đơn giản với đồ vật (vd: đập trống, đẩy xe, cho ăn búp bê)
   - Độ khó: Easy
   - Tuổi: 18-36 tháng
   - Tags: `motor_imitation`, `object_manipulation`, `play_based`

2. **Child can imitate 5 gross motor movements**

   - Mô tả: Trẻ có thể bắt chước 5 động tác vận động thô (vd: nhảy, vỗ tay, vẫy tay, chạm đầu, đập bàn tay)
   - Độ khó: Easy
   - Tuổi: 24-36 tháng
   - Tags: `gross_motor`, `imitation`, `body_movements`

3. **Child can imitate 5 actions with objects**

   - Mô tả: Trẻ bắt chước 5 hành động với đồ vật (vd: vỗ bàn, gõ cốc, lắc lục lạc, ném bóng)
   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `object_imitation`, `motor_skills`

4. **Child can imitate 3 facial expressions**

   - Mô tả: Trẻ bắt chước 3 biểu cảm khuôn mặt (cười, làm mặt buồn, há miệng)
   - Độ khó: Easy
   - Tuổi: 24-36 tháng
   - Tags: `facial_imitation`, `emotions`, `social_learning`

5. **Child can imitate clapping hands**

   - Mô tả: Trẻ vỗ tay khi người lớn vỗ tay
   - Độ khó: Easy
   - Tuổi: 12-24 tháng
   - Tags: `basic_imitation`, `gross_motor`

6. **Child can imitate waving goodbye**

   - Mô tả: Trẻ vẫy tay tạm biệt khi người khác vẫy tay
   - Độ khó: Easy
   - Tuổi: 12-24 tháng
   - Tags: `social_imitation`, `greeting`

7. **Child can imitate touching body parts**

   - Mô tả: Trẻ chạm các bộ phận cơ thể khi người lớn chạm (đầu, mũi, bụng)
   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `body_awareness`, `imitation`

8. **Child can imitate 3 sounds with objects**

   - Mô tả: Trẻ bắt chước âm thanh khi dùng đồ vật (gõ trống, lắc lục lạc, bóp kèn)
   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `sound_imitation`, `object_play`

9. **Child can imitate simple block building**

   - Mô tả: Trẻ xếp khối sau khi người lớn xếp (xếp tháp 2-3 khối)
   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `construction_play`, `visual_imitation`

10. **Child can imitate touching nose**
    - Mô tả: Trẻ chạm mũi của mình khi người lớn chạm mũi
    - Độ khó: Easy
    - Tuổi: 18-30 tháng
    - Tags: `body_parts`, `basic_imitation`

#### Medium Level (10 goals)

11. **Child can imitate 10 fine motor actions**

    - Mô tả: Trẻ bắt chước 10 động tác vận động tinh (vd: lật trang sách, bấm nút, xoay núm, kéo dây)
    - Độ khó: Medium
    - Tuổi: 24-48 tháng
    - Tags: `fine_motor`, `imitation`, `hand_skills`

12. **Child can imitate 2-step action sequences**

    - Mô tả: Trẻ bắt chước chuỗi 2 hành động (vd: cầm búp bê rồi cho ăn)
    - Độ khó: Medium
    - Tuổi: 30-48 tháng
    - Tags: `sequencing`, `motor_planning`

13. **Child can imitate oral motor movements**

    - Mô tả: Trẻ bắt chước động tác miệng (mở rộng, thè lưỡi, phù má)
    - Độ khó: Medium
    - Tuổi: 24-42 tháng
    - Tags: `oral_motor`, `speech_preparation`

14. **Child can imitate drawing simple shapes**

    - Mô tả: Trẻ vẽ theo mẫu: đường thẳng, vòng tròn, chữ X
    - Độ khó: Medium
    - Tuổi: 30-48 tháng
    - Tags: `fine_motor`, `pre_writing`, `visual_imitation`

15. **Child can imitate pretend play actions**

    - Mô tả: Trẻ bắt chước hành động giả vờ (làm như uống trà, chải tóc búp bê)
    - Độ khó: Medium
    - Tuổi: 24-42 tháng
    - Tags: `pretend_play`, `symbolic_play`

16. **Child can imitate dance movements to music**

    - Mô tả: Trẻ bắt chước các động tác nhảy theo nhạc
    - Độ khó: Medium
    - Tuổi: 30-48 tháng
    - Tags: `gross_motor`, `music_response`, `rhythm`

17. **Child can imitate using utensils**

    - Mô tả: Trẻ bắt chước cách dùng thìa, nĩa, cốc
    - Độ khó: Medium
    - Tuổi: 24-42 tháng
    - Tags: `self_help`, `fine_motor`, `functional_skills`

18. **Child can imitate gestures in songs**

    - Mô tả: Trẻ làm các cử chỉ trong bài hát (vd: Twinkle Twinkle Little Star)
    - Độ khó: Medium
    - Tuổi: 24-42 tháng
    - Tags: `music_play`, `social_play`, `gestures`

19. **Child can imitate peer play actions**

    - Mô tả: Trẻ bắt chước hành động chơi của bạn cùng lứa
    - Độ khó: Medium
    - Tuổi: 30-48 tháng
    - Tags: `peer_imitation`, `social_learning`

20. **Child can imitate animal movements**
    - Mô tả: Trẻ bắt chước động tác động vật (nhảy như thỏ, bò như mèo)
    - Độ khó: Medium
    - Tuổi: 30-48 tháng
    - Tags: `gross_motor`, `pretend_play`, `animals`

#### Hard Level (5 goals)

21. **Child can imitate 3-4 step action sequences**

    - Mô tả: Trẻ bắt chước chuỗi 3-4 hành động phức tạp
    - Độ khó: Hard
    - Tuổi: 36-60 tháng
    - Tags: `complex_sequencing`, `motor_planning`, `memory`

22. **Child can imitate novel actions (not previously taught)**

    - Mô tả: Trẻ bắt chước hành động mới chưa được dạy trước
    - Độ khó: Hard
    - Tuổi: 36-60 tháng
    - Tags: `generalization`, `spontaneous_imitation`

23. **Child can imitate delayed actions (after 5 seconds)**

    - Mô tả: Trẻ nhớ và bắt chước hành động sau 5 giây delay
    - Độ khó: Hard
    - Tuổi: 36-60 tháng
    - Tags: `working_memory`, `delayed_imitation`

24. **Child can imitate complex oral motor patterns**

    - Mô tả: Trẻ bắt chước các mẫu phức tạp (ba-ba-ba, la-la-la)
    - Độ khó: Hard
    - Tuổi: 30-54 tháng
    - Tags: `oral_motor`, `speech_imitation`, `syllables`

25. **Child can imitate multi-step craft activities**
    - Mô tả: Trẻ làm theo các bước làm đồ thủ công (cắt, dán, vẽ)
    - Độ khó: Hard
    - Tuổi: 42-60 tháng
    - Tags: `fine_motor`, `sequencing`, `craft_skills`

---

### 🎯 Domain 2: RECEPTIVE LANGUAGE (35 Goals)

#### Easy Level (12 goals)

1. **Child can respond to their name**

   - Độ khó: Easy
   - Tuổi: 12-24 tháng
   - Tags: `attention`, `basic_receptive`

2. **Child can follow 1-step directions with gestures**

   - Ví dụ: "Đưa cho mẹ" (kèm tay chỉ)
   - Độ khó: Easy
   - Tuổi: 12-24 tháng
   - Tags: `following_directions`, `gestures`

3. **Child can identify 5 common objects**

   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `object_identification`, `vocabulary`

4. **Child can identify 3 body parts**

   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `body_parts`, `receptive_labels`

5. **Child can identify 5 pictures in a book**

   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `picture_identification`, `book_skills`

6. **Child can follow "give me" command**

   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `following_directions`, `basic_commands`

7. **Child can identify family members**

   - Mẹ, Bố, Anh/Chị
   - Độ khó: Easy
   - Tuổi: 18-30 tháng
   - Tags: `people_identification`, `family`

8. **Child can follow "come here" command**

   - Độ khó: Easy
   - Tuổi: 18-24 tháng
   - Tags: `motor_commands`, `attention`

9. **Child can identify 3 colors**

   - Độ khó: Easy
   - Tuổi: 24-36 tháng
   - Tags: `colors`, `concepts`

10. **Child can identify actions in pictures (5 actions)**

    - Ăn, uống, ngủ, chơi, chạy
    - Độ khó: Easy
    - Tuổi: 24-36 tháng
    - Tags: `action_identification`, `verbs`

11. **Child can point to desired item when asked**

    - Độ khó: Easy
    - Tuổi: 18-30 tháng
    - Tags: `requesting`, `choice_making`

12. **Child can identify common animals (5 animals)**
    - Độ khó: Easy
    - Tuổi: 18-30 tháng
    - Tags: `animals`, `vocabulary`

#### Medium Level (15 goals)

13. **Child can follow 1-step directions without gestures**

    - Độ khó: Medium
    - Tuổi: 24-36 tháng
    - Tags: `following_directions`, `auditory_processing`

14. **Child can identify 10 objects**

    - Độ khó: Medium
    - Tuổi: 24-36 tháng
    - Tags: `object_identification`, `vocabulary_expansion`

15. **Child can identify objects by function**

    - "Cái gì để ăn?" → Thìa
    - Độ khó: Medium
    - Tuổi: 30-42 tháng
    - Tags: `function`, `concepts`, `categorization`

16. **Child can follow 2-step related directions**

    - "Cầm cốc và đưa cho mẹ"
    - Độ khó: Medium
    - Tuổi: 30-42 tháng
    - Tags: `following_directions`, `sequencing`, `auditory_memory`

17. **Child can identify emotions in pictures**

    - Vui, buồn, giận, sợ
    - Độ khó: Medium
    - Tuổi: 30-48 tháng
    - Tags: `emotions`, `social_concepts`

18. **Child can identify prepositions (in, on, under)**

    - Độ khó: Medium
    - Tuổi: 30-48 tháng
    - Tags: `prepositions`, `spatial_concepts`

19. **Child can answer yes/no questions**

    - Độ khó: Medium
    - Tuổi: 30-42 tháng
    - Tags: `answering_questions`, `comprehension`

20. **Child can identify clothing items (5 items)**

    - Độ khó: Medium
    - Tuổi: 24-36 tháng
    - Tags: `clothing`, `vocabulary`, `self_help`

21. **Child can identify opposites (3 pairs)**

    - Lớn/nhỏ, nóng/lạnh, nhanh/chậm
    - Độ khó: Medium
    - Tuổi: 36-48 tháng
    - Tags: `opposites`, `concepts`, `language`

22. **Child can follow directions with pronouns**

    - "Đưa nó cho anh"
    - Độ khó: Medium
    - Tuổi: 36-48 tháng
    - Tags: `pronouns`, `following_directions`, `grammar`

23. **Child can identify categories (food, animals, toys)**

    - Độ khó: Medium
    - Tuổi: 30-42 tháng
    - Tags: `categorization`, `concepts`

24. **Child can understand negation (not, don't)**

    - Độ khó: Medium
    - Tuổi: 30-42 tháng
    - Tags: `negation`, `comprehension`, `grammar`

25. **Child can identify quantities (more, less, all, none)**

    - Độ khó: Medium
    - Tuổi: 36-48 tháng
    - Tags: `quantities`, `math_concepts`

26. **Child can answer "what" questions about familiar objects**

    - Độ khó: Medium
    - Tuổi: 30-42 tháng
    - Tags: `wh_questions`, `comprehension`

27. **Child can follow conditional directions**
    - "Nếu con muốn bánh, hãy ngồi xuống"
    - Độ khó: Medium
    - Tuổi: 36-48 tháng
    - Tags: `conditional`, `complex_directions`

#### Hard Level (8 goals)

28. **Child can follow 3-step unrelated directions**

    - "Cầm sách, đứng dậy, và chạm đầu"
    - Độ khó: Hard
    - Tuổi: 42-60 tháng
    - Tags: `complex_directions`, `working_memory`

29. **Child can answer "why" questions**

    - Độ khó: Hard
    - Tuổi: 48-60 tháng
    - Tags: `wh_questions`, `reasoning`, `complex_language`

30. **Child can understand complex sentences with conjunctions**

    - "Cầm cốc và bát nhưng không cầm thìa"
    - Độ khó: Hard
    - Tuổi: 48-60 tháng
    - Tags: `conjunctions`, `complex_grammar`, `comprehension`

31. **Child can follow directions with temporal concepts**

    - "Trước khi ăn, rửa tay"
    - Độ khó: Hard
    - Tuổi: 42-60 tháng
    - Tags: `temporal_concepts`, `sequencing`, `time`

32. **Child can answer "how" questions**

    - Độ khó: Hard
    - Tuổi: 48-60 tháng
    - Tags: `wh_questions`, `problem_solving`

33. **Child can understand passive voice**

    - "Quả bóng bị ném bởi bạn"
    - Độ khó: Hard
    - Tuổi: 48-60 tháng
    - Tags: `passive_voice`, `complex_grammar`

34. **Child can understand comparatives and superlatives**

    - Lớn hơn, lớn nhất
    - Độ khó: Hard
    - Tuổi: 42-60 tháng
    - Tags: `comparatives`, `grammar`, `concepts`

35. **Child can follow multi-step directions with obstacles**
    - "Đi quanh bàn, cầm sách, và đặt vào túi"
    - Độ khó: Hard
    - Tuổi: 48-60 tháng
    - Tags: `complex_directions`, `problem_solving`, `spatial`

---

### 🎯 Domain 3: EXPRESSIVE LANGUAGE (40 Goals)

_Note: Chi tiết 40 goals sẽ được cung cấp tương tự với cấu trúc trên_

**Categories trong Expressive Language:**

- Requesting (10 goals)
- Labeling (12 goals)
- Answering Questions (8 goals)
- Commenting (5 goals)
- Conversational Skills (5 goals)

---

### 🎯 Domain 4-7: Visual Performance, Play/Leisure, Social Skills, Self-Help

_Cấu trúc tương tự với 30-35 goals mỗi domain_

---

## 3. Tags System

### 📌 Danh Sách Tags

Tags được dùng để phân loại và filter goal templates.

#### Imitation Tags

- `motor_imitation`
- `vocal_imitation`
- `object_imitation`
- `action_imitation`
- `facial_imitation`
- `gross_motor`
- `fine_motor`
- `social_imitation`

#### Receptive Language Tags

- `following_directions`
- `object_identification`
- `picture_identification`
- `action_identification`
- `wh_questions`
- `concepts`
- `categorization`
- `comprehension`

#### Support Level Tags

- `independent`
- `verbal_prompt`
- `visual_prompt`
- `modeling`
- `partial_physical`
- `full_physical`

#### Age Range Tags

- `infant` (0-12 months)
- `toddler` (12-36 months)
- `preschool` (36-60 months)
- `school_age` (60+ months)

---

## 4. Seed Data SQL

### Domains Table

```sql
-- Insert 7 Domains
INSERT INTO domains (id, code, name, name_en, description, icon, color, order_index) VALUES
('d1111111-1111-1111-1111-111111111111', 'IMITATION', 'Bắt chước', 'Imitation', 'Khả năng quan sát và bắt chước hành động, âm thanh, hoặc cử chỉ của người khác', '👤', '#FF6B6B', 1),
('d2222222-2222-2222-2222-222222222222', 'RECEPTIVE_LANGUAGE', 'Ngôn ngữ Receptive', 'Receptive Language', 'Khả năng hiểu và xử lý ngôn ngữ được nghe hoặc đọc', '👂', '#4ECDC4', 2),
('d3333333-3333-3333-3333-333333333333', 'EXPRESSIVE_LANGUAGE', 'Ngôn ngữ Expressive', 'Expressive Language', 'Khả năng truyền đạt ý tưởng, nhu cầu và cảm xúc', '💬', '#45B7D1', 3),
('d4444444-4444-4444-4444-444444444444', 'VISUAL_PERFORMANCE', 'Nhận thức thị giác', 'Visual Performance', 'Kỹ năng xử lý thông tin thị giác, ghép cặp, phân loại', '👁️', '#96CEB4', 4),
('d5555555-5555-5555-5555-555555555555', 'PLAY_LEISURE', 'Chơi & Giải trí', 'Play & Leisure', 'Khả năng tham gia vào các hoạt động vui chơi', '🎮', '#FFEAA7', 5),
('d6666666-6666-6666-6666-666666666666', 'SOCIAL_SKILLS', 'Kỹ năng Xã hội', 'Social Skills', 'Kỹ năng tương tác, chia sẻ, hợp tác', '🤝', '#A29BFE', 6),
('d7777777-7777-7777-7777-777777777777', 'SELF_HELP', 'Tự phục vụ', 'Self-Help', 'Các kỹ năng sinh hoạt hàng ngày', '🍽️', '#FD79A8', 7);
```

### Goal Templates - Imitation (Sample 10 goals)

```sql
-- Imitation Goals (Easy Level)
INSERT INTO goal_templates (id, domain_id, description, description_vi, difficulty_level, age_range_min, age_range_max, order_index) VALUES
('gt-im-001', 'd1111111-1111-1111-1111-111111111111', 'Child can imitate 3 simple play actions with objects', 'Trẻ có thể bắt chước 3 hành động chơi đơn giản với đồ vật', 'easy', 18, 36, 1),
('gt-im-002', 'd1111111-1111-1111-1111-111111111111', 'Child can imitate 5 gross motor movements', 'Trẻ có thể bắt chước 5 động tác vận động thô', 'easy', 24, 36, 2),
('gt-im-003', 'd1111111-1111-1111-1111-111111111111', 'Child can imitate 5 actions with objects', 'Trẻ bắt chước 5 hành động với đồ vật', 'easy', 18, 30, 3),
('gt-im-004', 'd1111111-1111-1111-1111-111111111111', 'Child can imitate 3 facial expressions', 'Trẻ bắt chước 3 biểu cảm khuôn mặt', 'easy', 24, 36, 4),
('gt-im-005', 'd1111111-1111-1111-1111-111111111111', 'Child can imitate clapping hands', 'Trẻ vỗ tay khi người lớn vỗ tay', 'easy', 12, 24, 5),
-- ... thêm 20 goals nữa
;

-- Receptive Language Goals (Sample)
INSERT INTO goal_templates (id, domain_id, description, description_vi, difficulty_level, age_range_min, age_range_max, order_index) VALUES
('gt-rl-001', 'd2222222-2222-2222-2222-222222222222', 'Child can respond to their name', 'Trẻ phản ứng khi được gọi tên', 'easy', 12, 24, 1),
('gt-rl-002', 'd2222222-2222-2222-2222-222222222222', 'Child can follow 1-step directions with gestures', 'Trẻ làm theo chỉ dẫn 1 bước có cử chỉ', 'easy', 12, 24, 2),
('gt-rl-003', 'd2222222-2222-2222-2222-222222222222', 'Child can identify 5 common objects', 'Trẻ nhận diện 5 đồ vật thông dụng', 'easy', 18, 30, 3),
-- ... thêm 32 goals nữa
;
```

### Tags

```sql
-- Insert Tags
INSERT INTO tags (name, category, description) VALUES
-- Imitation Tags
('motor_imitation', 'imitation', 'Bắt chước động tác'),
('vocal_imitation', 'imitation', 'Bắt chước âm thanh'),
('object_imitation', 'imitation', 'Bắt chước với đồ vật'),
('gross_motor', 'motor', 'Vận động thô'),
('fine_motor', 'motor', 'Vận động tinh'),

-- Receptive Tags
('following_directions', 'receptive', 'Làm theo chỉ dẫn'),
('object_identification', 'receptive', 'Nhận diện đồ vật'),
('wh_questions', 'receptive', 'Câu hỏi Wh-'),
('concepts', 'receptive', 'Các khái niệm'),

-- Support Tags
('independent', 'support', 'Độc lập'),
('verbal_prompt', 'support', 'Nhắc nhở bằng lời'),
('modeling', 'support', 'Làm mẫu'),
('physical_prompt', 'support', 'Hỗ trợ vật lý');
```

---

## 📝 Tổng Kết

### Thống Kê

- **Tổng Domains:** 7
- **Tổng Goal Templates:** ~210-230 goals
- **Tổng Tags:** ~50-60 tags

### Phân Bố Độ Khó

- **Easy:** 40% (~85 goals)
- **Medium:** 45% (~95 goals)
- **Hard:** 15% (~30 goals)

### Độ Tuổi

- **12-24 tháng:** Chủ yếu Easy goals (Imitation, Basic Receptive)
- **24-36 tháng:** Mix Easy & Medium (Receptive, Expressive expansion)
- **36-48 tháng:** Chủ yếu Medium (Complex language, Social skills)
- **48-60+ tháng:** Medium & Hard (Advanced language, Self-help)

---

**Document Version:** 1.0  
**Last Updated:** October 21, 2025  
**Status:** ✅ Complete Data Structure

**Note:** Đây là dữ liệu mẫu. Trong thực tế, cần tham khảo chuyên gia ABA để xác định chính xác nội dung và phân loại goals cho từng domain.

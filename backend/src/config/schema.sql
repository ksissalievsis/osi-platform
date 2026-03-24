-- Users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100),
  role VARCHAR(20) NOT NULL DEFAULT 'resident', -- resident | executor | admin
  building_id UUID,
  entrance INT,
  apartment VARCHAR(20),
  lang VARCHAR(5) DEFAULT 'ru',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Buildings
CREATE TABLE IF NOT EXISTS buildings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  address VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ru VARCHAR(100) NOT NULL,
  name_kz VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Requests (Заявки)
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES categories(id),
  author_id UUID REFERENCES users(id),
  executor_id UUID REFERENCES users(id),
  building_id UUID REFERENCES buildings(id),
  description TEXT NOT NULL,
  status VARCHAR(30) DEFAULT 'new', -- new | accepted | assigned | in_progress | done | closed
  photos TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Status History
CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id),
  changed_by UUID REFERENCES users(id),
  old_status VARCHAR(30),
  new_status VARCHAR(30),
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Comments
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID REFERENCES requests(id),
  author_id UUID REFERENCES users(id),
  text TEXT NOT NULL,
  photos TEXT[],
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title_ru VARCHAR(255),
  title_kz VARCHAR(255),
  body_ru TEXT,
  body_kz TEXT,
  is_read BOOLEAN DEFAULT false,
  request_id UUID REFERENCES requests(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- OTP
CREATE TABLE IF NOT EXISTS otp_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone VARCHAR(20) NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT false
);

-- Default categories
INSERT INTO categories (name_ru, name_kz, icon) VALUES
  ('Лифт', 'Лифт', 'elevator'),
  ('Домофон', 'Домофон', 'intercom'),
  ('Сантехник', 'Сантехник', 'plumbing'),
  ('Мелкий ремонт', 'Ұсақ жөндеу', 'repair'),
  ('Уборка', 'Тазалық', 'cleaning'),
  ('Дворник', 'Дворник', 'outdoor')
ON CONFLICT DO NOTHING;

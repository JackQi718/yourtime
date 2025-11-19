/*
  # 创建提醒时间管理系统数据库架构

  ## 概述
  为个人提醒时间管理系统创建完整的数据库架构，支持用户配置、提醒管理和邮件通知。

  ## 1. 新建表

  ### `user_profiles` - 用户配置表
    - `id` (uuid, 主键) - 关联 auth.users
    - `email` (text) - 用户邮箱
    - `full_name` (text) - 用户全名
    - `avatar_url` (text) - 头像URL
    - `notification_email` (text) - 接收通知的邮箱
    - `email_notifications_enabled` (boolean) - 是否启用邮件通知
    - `created_at` (timestamptz) - 创建时间
    - `updated_at` (timestamptz) - 更新时间

  ### `reminders` - 提醒事项表
    - `id` (uuid, 主键) - 提醒ID
    - `user_id` (uuid, 外键) - 所属用户
    - `title` (text) - 提醒标题
    - `description` (text) - 提醒描述
    - `reminder_time` (timestamptz) - 提醒时间
    - `priority` (text) - 优先级: 'low', 'medium', 'high', 'urgent'
    - `category` (text) - 分类: 'work', 'personal', 'health', 'other'
    - `status` (text) - 状态: 'pending', 'completed', 'cancelled'
    - `email_sent` (boolean) - 是否已发送邮件
    - `created_at` (timestamptz) - 创建时间
    - `updated_at` (timestamptz) - 更新时间

  ## 2. 安全设置
    - 为所有表启用 RLS（行级安全）
    - 用户只能访问自己的数据
    - 使用 auth.uid() 进行身份验证

  ## 3. 索引优化
    - 为常用查询字段添加索引
    - reminder_time 索引用于时间查询
    - status 索引用于状态筛选
*/

-- 创建用户配置表
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  notification_email text,
  email_notifications_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 创建提醒事项表
CREATE TABLE IF NOT EXISTS reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text DEFAULT '',
  reminder_time timestamptz NOT NULL,
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text DEFAULT 'other' CHECK (category IN ('work', 'personal', 'health', 'other')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  email_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 启用 RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- user_profiles 表的安全策略
CREATE POLICY "用户可以查看自己的配置"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "用户可以插入自己的配置"
  ON user_profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "用户可以更新自己的配置"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- reminders 表的安全策略
CREATE POLICY "用户可以查看自己的提醒"
  ON reminders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "用户可以创建自己的提醒"
  ON reminders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以更新自己的提醒"
  ON reminders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "用户可以删除自己的提醒"
  ON reminders FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 创建索引以优化查询性能
CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_reminder_time ON reminders(reminder_time);
CREATE INDEX IF NOT EXISTS idx_reminders_status ON reminders(status);
CREATE INDEX IF NOT EXISTS idx_reminders_user_status ON reminders(user_id, status);

-- 创建更新时间的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为表添加自动更新触发器
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reminders_updated_at
  BEFORE UPDATE ON reminders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
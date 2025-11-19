import { useState, useEffect } from 'react';
import { Plus, Filter, Mail } from 'lucide-react';
import { supabase, Reminder } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Header } from './Header';
import { ReminderList } from './ReminderList';
import { ReminderForm } from './ReminderForm';

export function Dashboard() {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchReminders();
    }
  }, [user]);

  useEffect(() => {
    filterReminders();
  }, [reminders, filterStatus]);

  const fetchReminders = async () => {
    try {
      const { data, error } = await supabase
        .from('reminders')
        .select('*')
        .eq('user_id', user!.id)
        .order('reminder_time', { ascending: true });

      if (error) throw error;
      setReminders(data || []);
    } catch (error) {
      console.error('获取提醒失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterReminders = () => {
    let filtered = reminders;
    if (filterStatus !== 'all') {
      filtered = reminders.filter(r => r.status === filterStatus);
    }
    setFilteredReminders(filtered);
  };

  const handleCreateReminder = async (data: Omit<Reminder, 'id' | 'user_id' | 'status' | 'email_sent' | 'created_at' | 'updated_at'>) => {
    try {
      const { error } = await supabase.from('reminders').insert({
        ...data,
        user_id: user!.id,
        status: 'pending',
        email_sent: false,
      });

      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error('创建提醒失败:', error);
    }
  };

  const handleDeleteReminder = async (id: string) => {
    try {
      const { error } = await supabase.from('reminders').delete().eq('id', id);
      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error('删除提醒失败:', error);
    }
  };

  const handleToggleStatus = async (id: string, status: 'completed' | 'pending') => {
    try {
      const { error } = await supabase.from('reminders').update({ status }).eq('id', id);
      if (error) throw error;
      await fetchReminders();
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const handleSendTestEmail = async () => {
    try {
      const testReminder = reminders[0];
      if (!testReminder) {
        alert('请先创建一个提醒');
        return;
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-reminder-email`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: user?.email,
          subject: '测试提醒邮件',
          reminderTitle: testReminder.title,
          reminderDescription: testReminder.description,
          reminderTime: testReminder.reminder_time,
          priority: testReminder.priority,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('测试邮件发送成功! 请查看控制台日志');
      } else {
        alert('发送失败: ' + result.error);
      }
    } catch (error) {
      console.error('发送测试邮件失败:', error);
      alert('发送失败，请查看控制台');
    }
  };

  const stats = {
    total: reminders.length,
    pending: reminders.filter(r => r.status === 'pending').length,
    completed: reminders.filter(r => r.status === 'completed').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <Header />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">我的提醒</h2>
              <p className="text-gray-600">管理您的时间，掌控您的生活</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleSendTestEmail}
                className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors flex items-center gap-2 shadow-lg hover:shadow-xl"
                title="发送测试邮件"
              >
                <Mail className="w-5 h-5" />
                <span className="hidden sm:inline">测试邮件</span>
              </button>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-xl transition-all hover:scale-105 flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                新建提醒
              </button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-blue-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">全部提醒</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Filter className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-orange-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">待处理</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Filter className="w-6 h-6 text-orange-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 border-2 border-gray-200 hover:border-green-300 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">已完成</p>
                  <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Filter className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              全部
            </button>
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              待处理
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-200'
              }`}
            >
              已完成
            </button>
          </div>
        </div>

        <ReminderList
          reminders={filteredReminders}
          onDelete={handleDeleteReminder}
          onToggleStatus={handleToggleStatus}
        />
      </main>

      {showForm && (
        <ReminderForm
          onSubmit={handleCreateReminder}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}

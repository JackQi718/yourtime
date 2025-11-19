import { useState } from 'react';
import { X, Calendar, AlertCircle, Tag } from 'lucide-react';

interface ReminderFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    reminder_time: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: 'work' | 'personal' | 'health' | 'other';
  }) => void;
  onClose: () => void;
}

export function ReminderForm({ onSubmit, onClose }: ReminderFormProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    reminder_time: '',
    priority: 'medium' as const,
    category: 'other' as const,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.reminder_time) return;
    onSubmit(formData);
    onClose();
  };

  const minDateTime = new Date().toISOString().slice(0, 16);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">创建新提醒</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              提醒标题 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none"
              placeholder="例如: 团队会议、健身打卡"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              详细描述
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none resize-none"
              rows={3}
              placeholder="添加更多详细信息..."
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              提醒时间 <span className="text-red-500">*</span>
            </label>
            <input
              type="datetime-local"
              required
              min={minDateTime}
              value={formData.reminder_time}
              onChange={(e) => setFormData({ ...formData, reminder_time: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <AlertCircle className="w-4 h-4 inline mr-1" />
              优先级
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'low', label: '低', color: 'border-green-300 hover:bg-green-50 text-green-700' },
                { value: 'medium', label: '中', color: 'border-blue-300 hover:bg-blue-50 text-blue-700' },
                { value: 'high', label: '高', color: 'border-orange-300 hover:bg-orange-50 text-orange-700' },
                { value: 'urgent', label: '紧急', color: 'border-red-300 hover:bg-red-50 text-red-700' },
              ].map((priority) => (
                <button
                  key={priority.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, priority: priority.value as any })}
                  className={`px-4 py-2.5 border-2 rounded-xl font-medium transition-all ${
                    formData.priority === priority.value
                      ? `${priority.color} ring-2 ring-offset-2`
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {priority.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              分类
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'work', label: '工作' },
                { value: 'personal', label: '个人' },
                { value: 'health', label: '健康' },
                { value: 'other', label: '其他' },
              ].map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: category.value as any })}
                  className={`px-4 py-2.5 border-2 rounded-xl font-medium transition-all ${
                    formData.category === category.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200 ring-offset-2'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }`}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
            >
              创建提醒
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

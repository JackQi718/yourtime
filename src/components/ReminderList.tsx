import { Clock, Trash2, CheckCircle, AlertCircle, Circle, Briefcase, Heart, Activity } from 'lucide-react';
import { Reminder } from '../lib/supabase';

interface ReminderListProps {
  reminders: Reminder[];
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, status: 'completed' | 'pending') => void;
}

const priorityConfig = {
  low: { label: '低', color: 'bg-green-100 text-green-700 border-green-200', icon: Circle },
  medium: { label: '中', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: AlertCircle },
  high: { label: '高', color: 'bg-orange-100 text-orange-700 border-orange-200', icon: AlertCircle },
  urgent: { label: '紧急', color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle },
};

const categoryConfig = {
  work: { label: '工作', icon: Briefcase, color: 'text-blue-600' },
  personal: { label: '个人', icon: Heart, color: 'text-pink-600' },
  health: { label: '健康', icon: Activity, color: 'text-green-600' },
  other: { label: '其他', icon: Circle, color: 'text-gray-600' },
};

export function ReminderList({ reminders, onDelete, onToggleStatus }: ReminderListProps) {
  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 0) {
      return { text: '已过期', color: 'text-red-600', isPast: true };
    } else if (diffMins < 60) {
      return { text: `${diffMins} 分钟后`, color: 'text-red-600', isPast: false };
    } else if (diffHours < 24) {
      return { text: `${diffHours} 小时后`, color: 'text-orange-600', isPast: false };
    } else if (diffDays < 7) {
      return { text: `${diffDays} 天后`, color: 'text-blue-600', isPast: false };
    } else {
      return {
        text: date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' }),
        color: 'text-gray-600',
        isPast: false
      };
    }
  };

  if (reminders.length === 0) {
    return (
      <div className="text-center py-16">
        <Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">暂无提醒事项</p>
        <p className="text-gray-400 text-sm mt-2">点击上方按钮创建新的提醒</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {reminders.map((reminder) => {
        const priority = priorityConfig[reminder.priority];
        const category = categoryConfig[reminder.category];
        const CategoryIcon = category.icon;
        const PriorityIcon = priority.icon;
        const timeInfo = formatDateTime(reminder.reminder_time);
        const isCompleted = reminder.status === 'completed';

        return (
          <div
            key={reminder.id}
            className={`bg-white rounded-xl border-2 transition-all duration-200 hover:shadow-lg ${
              isCompleted
                ? 'border-gray-200 opacity-60'
                : timeInfo.isPast
                ? 'border-red-200 bg-red-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => onToggleStatus(reminder.id, isCompleted ? 'pending' : 'completed')}
                  className="flex-shrink-0 mt-1"
                >
                  {isCompleted ? (
                    <CheckCircle className="w-6 h-6 text-green-500" />
                  ) : (
                    <Circle className="w-6 h-6 text-gray-300 hover:text-blue-500 transition-colors" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3
                      className={`text-lg font-semibold ${
                        isCompleted ? 'line-through text-gray-400' : 'text-gray-900'
                      }`}
                    >
                      {reminder.title}
                    </h3>
                    <button
                      onClick={() => onDelete(reminder.id)}
                      className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {reminder.description && (
                    <p className={`text-sm mb-3 ${isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                      {reminder.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${priority.color}`}>
                      <PriorityIcon className="w-3 h-3" />
                      {priority.label}
                    </span>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200`}>
                      <CategoryIcon className={`w-3 h-3 ${category.color}`} />
                      {category.label}
                    </span>

                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                      isCompleted ? 'bg-gray-100 text-gray-500' : timeInfo.isPast ? 'bg-red-100 text-red-700' : 'bg-blue-50 text-blue-700'
                    }`}>
                      <Clock className="w-3 h-3" />
                      {isCompleted ? '已完成' : timeInfo.text}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function CapacityBar({ capacity, interestedCount }) {
  const percentage = Math.min((interestedCount / capacity) * 100, 100);
  const remaining = Math.max(capacity - interestedCount, 0);
  const isFull = interestedCount >= capacity;

  const getColor = () => {
    if (isFull) return 'bg-red-500';
    if (percentage >= 75) return 'bg-orange-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  const getTextColor = () => {
    if (isFull) return 'text-red-500 dark:text-red-400';
    if (percentage >= 75) return 'text-orange-500 dark:text-orange-400';
    return 'text-emerald-600 dark:text-emerald-400';
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Event Capacity
        </span>
        <span className={`text-sm font-bold ${getTextColor()}`}>
          {isFull ? '🔴 Event Full' : `${remaining} seat${remaining !== 1 ? 's' : ''} left`}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={`h-3 rounded-full transition-all duration-500 ${getColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div className="flex justify-between items-center mt-2">
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {interestedCount} reserved
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">
          {capacity} total capacity • {Math.round(percentage)}% filled
        </span>
      </div>
    </div>
  );
}

export default CapacityBar;
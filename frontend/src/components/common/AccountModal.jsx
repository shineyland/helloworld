import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const AccountModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { avatarColors } = useTheme();

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">My Account</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className={`w-20 h-20 rounded-full flex items-center justify-center ${avatarColors.bg}`}>
                <span className={`text-3xl font-bold ${avatarColors.text}`}>
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            </div>

            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Full Name</span>
                <span className="text-sm font-medium text-gray-900">{user?.name || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Email</span>
                <span className="text-sm font-medium text-gray-900">{user?.email || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Role</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{user?.role || 'N/A'}</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Password</span>
                <span className="text-sm font-medium text-gray-900">••••••••</span>
              </div>

              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <span className="text-sm text-gray-500">Date Joined</span>
                <span className="text-sm font-medium text-gray-900">{formatDate(user?.createdAt)}</span>
              </div>

              {user?.role === 'student' && user?.studentId && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Student ID</span>
                  <span className="text-sm font-medium text-gray-900">{user.studentId}</span>
                </div>
              )}

              {user?.role === 'student' && user?.gradeLevel && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Grade Level</span>
                  <span className="text-sm font-medium text-gray-900">Grade {user.gradeLevel}</span>
                </div>
              )}

              {user?.role === 'student' && user?.dateOfBirth && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Date of Birth</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(user.dateOfBirth)}</span>
                </div>
              )}

              {user?.role === 'teacher' && user?.employeeId && (
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Employee ID</span>
                  <span className="text-sm font-medium text-gray-900">{user.employeeId}</span>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full btn btn-primary"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountModal;

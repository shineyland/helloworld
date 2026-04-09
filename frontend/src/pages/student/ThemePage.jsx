import { useTheme, themeColors, avatarColors } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const StudentThemePage = () => {
  const { theme, setTheme, avatarColor, setAvatarColor } = useTheme();
  const { user } = useAuth();

  const themeColorKeys = Object.keys(themeColors);
  const avatarColorKeys = Object.keys(avatarColors);

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Theme Color Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">App Theme Color</h2>
        <p className="text-gray-600 mb-6">Choose a primary color theme for the entire application.</p>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {themeColorKeys.map((colorKey) => {
            const color = themeColors[colorKey];
            const isSelected = theme === colorKey;
            return (
              <button
                key={colorKey}
                onClick={() => setTheme(colorKey)}
                className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gray-100 ring-2 ring-offset-2'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  ringColor: isSelected ? color.primary : undefined
                }}
              >
                <div
                  className={`w-12 h-12 rounded-full shadow-md transition-transform group-hover:scale-110 ${
                    isSelected ? 'ring-4 ring-white' : ''
                  }`}
                  style={{ backgroundColor: color.primary }}
                >
                  {isSelected && (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
                <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                  {color.name}
                </span>
              </button>
            );
          })}
        </div>

        {/* Preview */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">Preview:</p>
          <div className="flex flex-wrap gap-3">
            <button
              className="px-4 py-2 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: themeColors[theme].primary }}
            >
              Primary Button
            </button>
            <button
              className="px-4 py-2 rounded-lg font-medium transition-colors"
              style={{
                backgroundColor: themeColors[theme].primaryLight,
                color: themeColors[theme].primary
              }}
            >
              Secondary Button
            </button>
            <span
              className="px-3 py-1 rounded-full text-sm font-medium"
              style={{
                backgroundColor: themeColors[theme].primaryLight,
                color: themeColors[theme].primary
              }}
            >
              Badge
            </span>
          </div>
        </div>
      </div>

      {/* Avatar Color Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Avatar Color</h2>
        <p className="text-gray-600 mb-6">Customize your profile avatar background color.</p>

        <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
          {avatarColorKeys.map((colorKey) => {
            const colors = avatarColors[colorKey];
            const isSelected = avatarColor === colorKey;
            return (
              <button
                key={colorKey}
                onClick={() => setAvatarColor(colorKey)}
                className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gray-100 ring-2 ring-offset-2 ring-gray-400'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md transition-transform group-hover:scale-110 ${colors.bg}`}
                >
                  <span className={`text-xl font-bold ${colors.text}`}>
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </span>
                </div>
                <span className={`text-xs font-medium capitalize ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                  {colorKey}
                </span>
              </button>
            );
          })}
        </div>

        {/* Avatar Preview */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-3">Your avatar will look like this:</p>
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${avatarColors[avatarColor].bg}`}>
              <span className={`text-2xl font-bold ${avatarColors[avatarColor].text}`}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user?.name || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Section */}
      <div className="card bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Reset to Default</h3>
            <p className="text-sm text-gray-600">Reset all theme settings to their default values.</p>
          </div>
          <button
            onClick={() => {
              setTheme('blue');
              setAvatarColor('blue');
            }}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentThemePage;

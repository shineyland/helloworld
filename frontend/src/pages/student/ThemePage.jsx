import { useState } from 'react';
import { useTheme, themeColors, avatarColors } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const StudentThemePage = () => {
  const { theme, setTheme, avatarColor, setAvatarColor, backgroundImage, setBackgroundImage } = useTheme();
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [pendingTheme, setPendingTheme] = useState(theme);
  const [pendingAvatarColor, setPendingAvatarColor] = useState(avatarColor);
  const [pendingBackgroundImage, setPendingBackgroundImage] = useState(backgroundImage);

  const themeColorKeys = Object.keys(themeColors);
  const avatarColorKeys = Object.keys(avatarColors);

  const hasChanges = pendingTheme !== theme || pendingAvatarColor !== avatarColor || pendingBackgroundImage !== backgroundImage;

  const handleSave = () => {
    setTheme(pendingTheme);
    setAvatarColor(pendingAvatarColor);
    setBackgroundImage(pendingBackgroundImage);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    setPendingTheme('blue');
    setPendingAvatarColor('blue');
    setPendingBackgroundImage('');
    setTheme('blue');
    setAvatarColor('blue');
    setBackgroundImage('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleRemoveBackground = () => {
    setPendingBackgroundImage('');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Theme Color Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">App Theme Color</h2>
        <p className="text-gray-600 mb-6">Choose a primary color theme for the entire application.</p>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {themeColorKeys.map((colorKey) => {
            const color = themeColors[colorKey];
            const isSelected = pendingTheme === colorKey;
            return (
              <button
                key={colorKey}
                onClick={() => setPendingTheme(colorKey)}
                className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
                  isSelected
                    ? 'bg-gray-100 ring-2 ring-offset-2'
                    : 'hover:bg-gray-50'
                }`}
                style={{
                  '--tw-ring-color': isSelected ? color.primary : undefined
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
            <div
              className="px-4 py-2 rounded-lg text-white font-medium"
              style={{ backgroundColor: themeColors[pendingTheme].primary }}
            >
              Primary Color
            </div>
            <div
              className="px-4 py-2 rounded-lg font-medium"
              style={{
                backgroundColor: themeColors[pendingTheme].primaryLight,
                color: themeColors[pendingTheme].primary
              }}
            >
              Secondary Color
            </div>
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
            const isSelected = pendingAvatarColor === colorKey;
            return (
              <button
                key={colorKey}
                onClick={() => setPendingAvatarColor(colorKey)}
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
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${avatarColors[pendingAvatarColor].bg}`}>
              <span className={`text-2xl font-bold ${avatarColors[pendingAvatarColor].text}`}>
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

      {/* Background Image Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Background Image</h2>
        <p className="text-gray-600 mb-6">Add a custom background image that appears on every page.</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
            <div className="flex gap-3">
              <input
                type="url"
                value={pendingBackgroundImage}
                onChange={(e) => setPendingBackgroundImage(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {pendingBackgroundImage && (
                <button
                  onClick={handleRemoveBackground}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Paste a URL to an image (JPG, PNG, or WebP)</p>
          </div>

          {/* Background Preview */}
          {pendingBackgroundImage && (
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div
                className="w-full h-48 rounded-lg bg-cover bg-center bg-no-repeat border border-gray-200"
                style={{ backgroundImage: `url(${pendingBackgroundImage})` }}
              >
                <div className="w-full h-full bg-black/20 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                    Background Preview
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Save and Reset Section */}
      <div className={`card ${hasChanges ? 'bg-yellow-50 border-2 border-yellow-300' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Save Changes</h3>
            {hasChanges ? (
              <p className="text-sm text-yellow-700 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Remember to save your changes!
              </p>
            ) : (
              <p className="text-sm text-gray-600">All changes are saved.</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saved && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Saved!
              </span>
            )}
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Reset to Default
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                hasChanges
                  ? 'bg-primary text-white hover:bg-primary-hover'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={hasChanges ? { backgroundColor: themeColors[pendingTheme].primary } : {}}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentThemePage;

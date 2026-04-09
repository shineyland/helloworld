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

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Please choose an image under 5MB.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPendingBackgroundImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
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

        {/* Save button for theme color */}
        {pendingTheme !== theme && (
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
              style={{ backgroundColor: themeColors[pendingTheme].primary }}
            >
              Save Changes
            </button>
            <span className="text-sm text-yellow-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Unsaved changes
            </span>
          </div>
        )}
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

        {/* Save button for avatar color */}
        {pendingAvatarColor !== avatarColor && (
          <div className="mt-6 flex items-center gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-2 rounded-lg text-white font-medium transition-colors bg-primary"
              style={{ backgroundColor: themeColors[pendingTheme].primary }}
            >
              Save Changes
            </button>
            <span className="text-sm text-yellow-600 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Unsaved changes
            </span>
          </div>
        )}
      </div>

      {/* Background Image Section */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Background Image</h2>
        <p className="text-gray-600 mb-6">Add a custom background image that appears on every page.</p>

        <div className="space-y-4">
          {/* Upload from device */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Upload from Device</label>
            <div className="flex gap-3 items-center">
              <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-opacity font-medium flex items-center gap-2"
                style={{ backgroundColor: themeColors[pendingTheme].primary }}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Choose Image
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              {pendingBackgroundImage && (
                <button
                  onClick={handleRemoveBackground}
                  className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                >
                  Remove
                </button>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Select an image from your device (max 5MB)</p>
          </div>

          {/* Or use URL */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or paste a URL</span>
            </div>
          </div>

          <div>
            <input
              type="url"
              value={pendingBackgroundImage.startsWith('data:') ? '' : pendingBackgroundImage}
              onChange={(e) => setPendingBackgroundImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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

          {/* Save button for background image */}
          {pendingBackgroundImage !== backgroundImage && (
            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium transition-colors"
                style={{ backgroundColor: themeColors[pendingTheme].primary }}
              >
                Save Changes
              </button>
              <span className="text-sm text-yellow-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Unsaved changes
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Reset Section */}
      <div className="card bg-gray-50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-900">Reset Theme</h3>
            <p className="text-sm text-gray-600">Reset all theme settings to default values.</p>
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentThemePage;

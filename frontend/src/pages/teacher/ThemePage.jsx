        1 import { useState } from 'react';
        2 import { useTheme, themeColors, avatarColors } from '../../context/ThemeContext';
        3 import { useAuth } from '../../context/AuthContext';
        4
        5 const TeacherThemePage = () => {
        6   const { theme, setTheme, avatarColor, setAvatarColor, backgroundImage, setBackgroundImage } = useThem
          e();
        7   const { user } = useAuth();
        8   const [saved, setSaved] = useState(false);
        9   const [pendingTheme, setPendingTheme] = useState(theme);
       10   const [pendingAvatarColor, setPendingAvatarColor] = useState(avatarColor);
       11   const [pendingBackgroundImage, setPendingBackgroundImage] = useState(backgroundImage);
       12
       13   const themeColorKeys = Object.keys(themeColors);
       14   const avatarColorKeys = Object.keys(avatarColors);
       15
       16   const handleSave = () => {
       17     setTheme(pendingTheme);
       18     setAvatarColor(pendingAvatarColor);
       19     setBackgroundImage(pendingBackgroundImage);
       20     setSaved(true);
       21     setTimeout(() => setSaved(false), 2000);
       22   };
       23
       24   const handleReset = () => {
       25     setPendingTheme('blue');
       26     setPendingAvatarColor('blue');
       27     setPendingBackgroundImage('');
       28     setTheme('blue');
       29     setAvatarColor('blue');
       30     setBackgroundImage('');
       31     setSaved(true);
       32     setTimeout(() => setSaved(false), 2000);
       33   };
       34
       35   const handleFileUpload = (e) => {
       36     const file = e.target.files[0];
       37     if (!file) return;
       38     if (file.size > 5 * 1024 * 1024) {
       39       alert('Image is too large. Please choose an image under 5MB.');
       40       return;
       41     }
       42     const reader = new FileReader();
       43     reader.onloadend = () => setPendingBackgroundImage(reader.result);
       44     reader.readAsDataURL(file);
       45   };
       46
       47   return (
       48     <div className="space-y-8 max-w-4xl">
       49       {/* Theme Color */}
       50       <div className="card">
       51         <h2 className="text-xl font-semibold text-gray-900 mb-2">App Theme Color</h2>
       52         <p className="text-gray-600 mb-6">Choose a primary color theme for the entire application.</p>
       53         <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
       54           {themeColorKeys.map((colorKey) => {
       55             const color = themeColors[colorKey];
       56             const isSelected = pendingTheme === colorKey;
       57             return (
       58               <button
       59                 key={colorKey}
       60                 onClick={() => setPendingTheme(colorKey)}
       61                 className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
       62                   isSelected ? 'bg-gray-100 ring-2 ring-offset-2' : 'hover:bg-gray-50'
       63                 }`}
       64               >
       65                 <div
       66                   className="w-12 h-12 rounded-full shadow-md transition-transform group-hover:scale-11
          0 flex items-center justify-center"
       67                   style={{ backgroundColor: color.primary }}
       68                 >
       69                   {isSelected && (
       70                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0
          24 24">
       71                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L1
          9 7" />
       72                     </svg>
       73                   )}
       74                 </div>
       75                 <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}
          `}>
       76                   {color.name}
       77                 </span>
       78               </button>
       79             );
       80           })}
       81         </div>
       82         {pendingTheme !== theme && (
       83           <div className="mt-6">
       84             <button
       85               onClick={handleSave}
       86               className="px-6 py-2 rounded-lg text-white font-medium"
       87               style={{ backgroundColor: themeColors[pendingTheme].primary }}
       88             >
       89               Save Changes
       90             </button>
       91           </div>
       92         )}
       93       </div>
       94
       95       {/* Avatar Color */}
       96       <div className="card">
       97         <h2 className="text-xl font-semibold text-gray-900 mb-2">Avatar Color</h2>
       98         <p className="text-gray-600 mb-6">Customize your profile avatar background color.</p>
       99         <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
      100           {avatarColorKeys.map((colorKey) => {
      101             const colors = avatarColors[colorKey];
      102             const isSelected = pendingAvatarColor === colorKey;
      103             return (
      104               <button
      105                 key={colorKey}
      106                 onClick={() => setPendingAvatarColor(colorKey)}
      107                 className={`group flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${
      108                   isSelected ? 'bg-gray-100 ring-2 ring-offset-2 ring-gray-400' : 'hover:bg-gray-50'
      109                 }`}
      110               >
      111                 <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${co
          lors.bg}`}>
      112                   <span className={`text-xl font-bold ${colors.text}`}>
      113                     {user?.name?.charAt(0)?.toUpperCase() || 'T'}
      114                   </span>
      115                 </div>
      116                 <span className={`text-xs font-medium capitalize ${isSelected ? 'text-gray-900' : 'text
          -gray-600'}`}>
      117                   {colorKey}
      118                 </span>
      119               </button>
      120             );
      121           })}
      122         </div>
      123         {pendingAvatarColor !== avatarColor && (
      124           <div className="mt-6">
      125             <button
      126               onClick={handleSave}
      127               className="px-6 py-2 rounded-lg text-white font-medium"
      128               style={{ backgroundColor: themeColors[pendingTheme].primary }}
      129             >
      130               Save Changes
      131             </button>
      132           </div>
      133         )}
      134       </div>
      135
      136       {/* Background Image */}
      137       <div className="card">
      138         <h2 className="text-xl font-semibold text-gray-900 mb-2">Background Image</h2>
      139         <p className="text-gray-600 mb-6">Upload a custom background image that appears on every page.<
          /p>
      140         <div className="space-y-4">
      141           <div>
      142             <label className="block text-sm font-medium text-gray-700 mb-2">Upload from Device</label>
      143             <div className="flex gap-3 items-center">
      144               <label
      145                 className="cursor-pointer px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium
          flex items-center gap-2"
      146                 style={{ backgroundColor: themeColors[pendingTheme].primary }}
      147               >
      148                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      149                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.5
          86a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00
          -2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      150                 </svg>
      151                 Choose Image
      152                 <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
      153               </label>
      154               {pendingBackgroundImage && (
      155                 <button
      156                   onClick={() => { setPendingBackgroundImage(''); setBackgroundImage(''); }}
      157                   className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium"
      158                 >
      159                   Remove
      160                 </button>
      161               )}
      162             </div>
      163             <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
      164           </div>
      165
      166           <div className="relative">
      167             <div className="absolute inset-0 flex items-center">
      168               <div className="w-full border-t border-gray-200"></div>
      169             </div>
      170             <div className="relative flex justify-center text-sm">
      171               <span className="px-2 bg-white text-gray-500">or paste a URL</span>
      172             </div>
      173           </div>
      174
      175           <input
      176             type="url"
      177             value={pendingBackgroundImage.startsWith('data:') ? '' : pendingBackgroundImage}
      178             onChange={(e) => setPendingBackgroundImage(e.target.value)}
      179             placeholder="https://example.com/image.jpg"
      180             className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-
          500 focus:border-transparent"
      181           />
      182
      183           {pendingBackgroundImage && (
      184             <div>
      185               <p className="text-sm text-gray-600 mb-2">Preview:</p>
      186               <div
      187                 className="w-full h-48 rounded-lg bg-cover bg-center border border-gray-200 flex items-
          center justify-center"
      188                 style={{ backgroundImage: `url(${pendingBackgroundImage})` }}
      189               >
      190                 <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
      191                   Background Preview
      192                 </span>
      193               </div>
      194             </div>
      195           )}
      196
      197           {pendingBackgroundImage !== backgroundImage && (
      198             <button
      199               onClick={handleSave}
      200               className="px-6 py-2 rounded-lg text-white font-medium"
      201               style={{ backgroundColor: themeColors[pendingTheme].primary }}
      202             >
      203               Save Changes
      204             </button>
      205           )}
      206         </div>
      207       </div>
      208
      209       {/* Reset */}
      210       <div className="card bg-gray-50">
      211         <div className="flex items-center justify-between">
      212           <div>
      213             <h3 className="font-medium text-gray-900">Reset Theme</h3>
      214             <p className="text-sm text-gray-600">Reset all theme settings to default values.</p>
      215           </div>
      216           <div className="flex items-center gap-3">
      217             {saved && (
      218               <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
      219                 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      220                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"
           />
      221                 </svg>
      222                 Saved!
      223               </span>
      224             )}
      225             <button
      226               onClick={handleReset}
      227               className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
      228             >
      229               Reset to Default
      230             </button>
      231           </div>
      232         </div>
      233       </div>
      234     </div>
      235   );
      236 };
      237
      238 export default TeacherThemePage;

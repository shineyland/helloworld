  ⎿  import { query } from '../db/index.js';

     export const getStudentGrades = async (req, res, next) => {
       try {
         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT g.*, a.title as assignment_title, a.max_points, a.assignment_type,
                  c.name as class_name, s.name as subject_name
           FROM grades g
           JOIN assignment_submissions sub ON g.submission_id = sub.id
           JOIN assignments a ON sub.assignment_id = a.id
           JOIN classes c ON a.class_id = c.id
           LEFT JOIN subjects s ON c.subject_id = s.id
           WHERE sub.student_id = $1
           ORDER BY g.graded_at DESC
         `, [studentResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const getGradeSummary = async (req, res, next) => {
       try {
         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT c.id as class_id, c.name as class_name, s.name as subject_name,
                  COUNT(g.id) as graded_count,
                  AVG(g.percentage) as average_percentage,
                  SUM(g.points_earned) as total_points,
                  SUM(a.max_points) as total_max_points
           FROM classes c
           JOIN class_students cs ON c.id = cs.class_id
           LEFT JOIN subjects s ON c.subject_id = s.id
           LEFT JOIN assignments a ON c.id = a.class_id AND a.is_published = true
           LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = cs.student_id
           LEFT JOIN grades g ON sub.id = g.submission_id
           WHERE cs.student_id = $1 AND cs.status = 'active'
           GROUP BY c.id, c.name, s.name
           ORDER BY c.name
         `, [studentResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const getGradeDetails = async (req, res, next) => {
       try {
         const { id } = req.params;

         const result = await query(`
           SELECT g.*, a.title as assignment_title, a.description, a.max_points, a.assignment_type,
                  c.name as class_name, sub.submission_text, sub.submitted_at
           FROM grades g
           JOIN assignment_submissions sub ON g.submission_id = sub.id
           JOIN assignments a ON sub.assignment_id = a.id
           JOIN classes c ON a.class_id = c.id
           WHERE g.id = $1
         `, [id]);

         if (result.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Grade not found'
           });
         }

         res.json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export default {
       getStudentGrades,
       getGradeSummary,
       getGradeDetails
     };

● Bash(cat /tmp/helloworld/frontend/src/pages/student/ThemePage.jsx)
  ⎿  import { useState } from 'react';
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

       const hasChanges = pendingTheme !== theme || pendingAvatarColor !== avatarColor || pendingBackgroundImage !==
     backgroundImage;

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
         setBackgroundImage('');
         setSaved(true);
         setTimeout(() => setSaved(false), 2000);
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
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938
     4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                       className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md
     transition-transform group-hover:scale-110 ${colors.bg}`}
                     >
                       <span className={`text-xl font-bold ${colors.text}`}>
                         {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                       </span>
                     </div>
                     <span className={`text-xs font-medium capitalize ${isSelected ? 'text-gray-900' :
     'text-gray-600'}`}>
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
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938
     4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                   <label className="cursor-pointer px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90
     transition-opacity font-medium flex items-center gap-2"
                     style={{ backgroundColor: themeColors[pendingTheme].primary }}>
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0
     012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2
     2v12a2 2 0 002 2z" />
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
                       className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors
     font-medium"
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
                   className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500
     focus:border-transparent"
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
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938
     4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
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
                   className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors
     font-medium"
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

● Bash(cat /tmp/helloworld/backend/src/controllers/assignment.controller.js)
  ⎿  import { query } from '../db/index.js';

     // Teacher methods
     export const listTeacherAssignments = async (req, res, next) => {
       try {
         const teacherResult = await query(
           `SELECT id FROM teachers WHERE user_id = $1`,
           [req.user.sub]
         );

         if (teacherResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT a.*, c.name as class_name,
                  (SELECT COUNT(*) FROM assignment_submissions WHERE assignment_id = a.id) as submission_count
           FROM assignments a
           JOIN classes c ON a.class_id = c.id
           WHERE a.teacher_id = $1
           ORDER BY a.due_date DESC
         `, [teacherResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const createAssignment = async (req, res, next) => {
       try {
         const { classId, title, description, instructions, dueDate, maxPoints, assignmentType, allowLateSubmission } =
     req.body;

         if (!classId || !title || !dueDate) {
           return res.status(400).json({
             success: false,
             error: 'Class ID, title, and due date are required'
           });
         }

         const teacherResult = await query(
           `SELECT id FROM teachers WHERE user_id = $1`,
           [req.user.sub]
         );

         if (teacherResult.rows.length === 0) {
           return res.status(403).json({
             success: false,
             error: 'Teacher profile not found'
           });
         }

         const result = await query(
           `INSERT INTO assignments (class_id, teacher_id, title, description, instructions, due_date, max_points,
     assignment_type, allow_late_submission)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            RETURNING *`,
           [classId, teacherResult.rows[0].id, title, description, instructions, dueDate, maxPoints || 100,
     assignmentType || 'homework', allowLateSubmission || false]
         );

         res.status(201).json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export const getAssignment = async (req, res, next) => {
       try {
         const { id } = req.params;

         const result = await query(`
           SELECT a.*, c.name as class_name
           FROM assignments a
           JOIN classes c ON a.class_id = c.id
           WHERE a.id = $1
         `, [id]);

         if (result.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Assignment not found'
           });
         }

         res.json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export const updateAssignment = async (req, res, next) => {
       try {
         const { id } = req.params;
         const { title, description, instructions, dueDate, maxPoints, assignmentType, allowLateSubmission } = req.body;

         const result = await query(
           `UPDATE assignments
            SET title = COALESCE($1, title),
                description = COALESCE($2, description),
                instructions = COALESCE($3, instructions),
                due_date = COALESCE($4, due_date),
                max_points = COALESCE($5, max_points),
                assignment_type = COALESCE($6, assignment_type),
                allow_late_submission = COALESCE($7, allow_late_submission),
                updated_at = NOW()
            WHERE id = $8
            RETURNING *`,
           [title, description, instructions, dueDate, maxPoints, assignmentType, allowLateSubmission, id]
         );

         if (result.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Assignment not found'
           });
         }

         res.json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export const deleteAssignment = async (req, res, next) => {
       try {
         const { id } = req.params;

         const result = await query(
           `DELETE FROM assignments WHERE id = $1 RETURNING id`,
           [id]
         );

         if (result.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Assignment not found'
           });
         }

         res.json({
           success: true,
           message: 'Assignment deleted successfully'
         });
       } catch (error) {
         next(error);
       }
     };

     export const publishAssignment = async (req, res, next) => {
       try {
         const { id } = req.params;

         const result = await query(
           `UPDATE assignments SET is_published = true, updated_at = NOW() WHERE id = $1 RETURNING *`,
           [id]
         );

         if (result.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Assignment not found'
           });
         }

         res.json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export const getSubmissions = async (req, res, next) => {
       try {
         const { id } = req.params;

         const result = await query(`
           SELECT s.*, u.first_name, u.last_name, st.student_id,
                  g.points_earned, g.feedback, g.graded_at
           FROM assignment_submissions s
           JOIN students st ON s.student_id = st.id
           JOIN users u ON st.user_id = u.id
           LEFT JOIN grades g ON s.id = g.submission_id
           WHERE s.assignment_id = $1
           ORDER BY s.submitted_at DESC
         `, [id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const getSubmission = async (req, res, next) => {
       try {
         const { id } = req.params;

         const result = await query(`
           SELECT s.*, u.first_name, u.last_name, st.student_id,
                  a.title as assignment_title, a.max_points,
                  g.points_earned, g.percentage, g.letter_grade, g.feedback, g.graded_at
           FROM assignment_submissions s
           JOIN students st ON s.student_id = st.id
           JOIN users u ON st.user_id = u.id
           JOIN assignments a ON s.assignment_id = a.id
           LEFT JOIN grades g ON s.id = g.submission_id
           WHERE s.id = $1
         `, [id]);

         if (result.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Submission not found'
           });
         }

         res.json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export const gradeSubmission = async (req, res, next) => {
       try {
         const { id } = req.params;
         const { pointsEarned, feedback } = req.body;

         if (pointsEarned === undefined) {
           return res.status(400).json({
             success: false,
             error: 'Points earned is required'
           });
         }

         const teacherResult = await query(
           `SELECT id FROM teachers WHERE user_id = $1`,
           [req.user.sub]
         );

         // Get assignment max points
         const submissionResult = await query(`
           SELECT s.*, a.max_points
           FROM assignment_submissions s
           JOIN assignments a ON s.assignment_id = a.id
           WHERE s.id = $1
         `, [id]);

         if (submissionResult.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Submission not found'
           });
         }

         const maxPoints = submissionResult.rows[0].max_points;
         const percentage = (pointsEarned / maxPoints) * 100;

         let letterGrade = 'F';
         if (percentage >= 90) letterGrade = 'A';
         else if (percentage >= 80) letterGrade = 'B';
         else if (percentage >= 70) letterGrade = 'C';
         else if (percentage >= 60) letterGrade = 'D';

         // Upsert grade
         const result = await query(`
           INSERT INTO grades (submission_id, teacher_id, points_earned, percentage, letter_grade, feedback)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (submission_id) DO UPDATE SET
             points_earned = $3, percentage = $4, letter_grade = $5, feedback = $6, updated_at = NOW()
           RETURNING *
         `, [id, teacherResult.rows[0].id, pointsEarned, percentage, letterGrade, feedback]);

         // Update submission status
         await query(
           `UPDATE assignment_submissions SET status = 'graded' WHERE id = $1`,
           [id]
         );

         res.json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     // Student methods
     export const getStudentClasses = async (req, res, next) => {
       try {
         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT c.*, s.name as subject_name,
                  u.first_name as teacher_first_name, u.last_name as teacher_last_name
           FROM class_students cs
           JOIN classes c ON cs.class_id = c.id
           LEFT JOIN subjects s ON c.subject_id = s.id
           LEFT JOIN class_teachers ct ON c.id = ct.class_id AND ct.is_primary = true
           LEFT JOIN teachers t ON ct.teacher_id = t.id
           LEFT JOIN users u ON t.user_id = u.id
           WHERE cs.student_id = $1 AND cs.status = 'active'
           ORDER BY c.name
         `, [studentResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const getStudentSchedule = async (req, res, next) => {
       try {
         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT
             c.id,
             c.name,
             c.room_number,
             c.schedule,
             c.grade_level,
             s.name as subject_name,
             s.code as subject_code,
             u.first_name as teacher_first_name,
             u.last_name as teacher_last_name
           FROM class_students cs
           JOIN classes c ON cs.class_id = c.id
           LEFT JOIN subjects s ON c.subject_id = s.id
           LEFT JOIN class_teachers ct ON c.id = ct.class_id AND ct.is_primary = true
           LEFT JOIN teachers t ON ct.teacher_id = t.id
           LEFT JOIN users u ON t.user_id = u.id
           WHERE cs.student_id = $1 AND cs.status = 'active' AND c.is_active = true
           ORDER BY c.name
         `, [studentResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const listStudentAssignments = async (req, res, next) => {
       try {
         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT a.*, c.name as class_name,
                  sub.id as submission_id, sub.status as submission_status, sub.submitted_at,
                  g.points_earned, g.percentage, g.letter_grade
           FROM assignments a
           JOIN classes c ON a.class_id = c.id
           JOIN class_students cs ON c.id = cs.class_id
           LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
           LEFT JOIN grades g ON sub.id = g.submission_id
           WHERE cs.student_id = $1 AND cs.status = 'active' AND a.is_published = true
           ORDER BY a.due_date DESC
         `, [studentResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const getPendingAssignments = async (req, res, next) => {
       try {
         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT a.*, c.name as class_name
           FROM assignments a
           JOIN classes c ON a.class_id = c.id
           JOIN class_students cs ON c.id = cs.class_id
           LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
           WHERE cs.student_id = $1 AND cs.status = 'active'
             AND a.is_published = true
             AND sub.id IS NULL
             AND a.due_date >= NOW()
           ORDER BY a.due_date ASC
         `, [studentResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const getCompletedAssignments = async (req, res, next) => {
       try {
         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT a.*, c.name as class_name,
                  sub.submitted_at, g.points_earned, g.percentage, g.letter_grade, g.feedback
           FROM assignments a
           JOIN classes c ON a.class_id = c.id
           JOIN assignment_submissions sub ON a.id = sub.assignment_id
           LEFT JOIN grades g ON sub.id = g.submission_id
           WHERE sub.student_id = $1
           ORDER BY sub.submitted_at DESC
         `, [studentResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const getOverdueAssignments = async (req, res, next) => {
       try {
         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.json({ success: true, data: [] });
         }

         const result = await query(`
           SELECT a.*, c.name as class_name
           FROM assignments a
           JOIN classes c ON a.class_id = c.id
           JOIN class_students cs ON c.id = cs.class_id
           LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
           WHERE cs.student_id = $1 AND cs.status = 'active'
             AND a.is_published = true
             AND sub.id IS NULL
             AND a.due_date < NOW()
           ORDER BY a.due_date DESC
         `, [studentResult.rows[0].id]);

         res.json({
           success: true,
           data: result.rows
         });
       } catch (error) {
         next(error);
       }
     };

     export const getAssignmentForStudent = async (req, res, next) => {
       try {
         const { id } = req.params;

         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         const result = await query(`
           SELECT a.*, c.name as class_name,
                  sub.id as submission_id, sub.submission_text, sub.file_urls, sub.submitted_at, sub.status as
     submission_status,
                  g.points_earned, g.percentage, g.letter_grade, g.feedback
           FROM assignments a
           JOIN classes c ON a.class_id = c.id
           LEFT JOIN assignment_submissions sub ON a.id = sub.assignment_id AND sub.student_id = $1
           LEFT JOIN grades g ON sub.id = g.submission_id
           WHERE a.id = $2
         `, [studentResult.rows[0]?.id, id]);

         if (result.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Assignment not found'
           });
         }

         res.json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export const submitAssignment = async (req, res, next) => {
       try {
         const { id } = req.params;
         const { submissionText, fileUrls } = req.body;

         const studentResult = await query(
           `SELECT id FROM students WHERE user_id = $1`,
           [req.user.sub]
         );

         if (studentResult.rows.length === 0) {
           return res.status(403).json({
             success: false,
             error: 'Student profile not found'
           });
         }

         // Check if assignment exists and due date
         const assignmentResult = await query(
           `SELECT due_date, allow_late_submission FROM assignments WHERE id = $1`,
           [id]
         );

         if (assignmentResult.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Assignment not found'
           });
         }

         const assignment = assignmentResult.rows[0];
         const isLate = new Date() > new Date(assignment.due_date);

         if (isLate && !assignment.allow_late_submission) {
           return res.status(400).json({
             success: false,
             error: 'Late submissions are not allowed for this assignment'
           });
         }

         const result = await query(`
           INSERT INTO assignment_submissions (assignment_id, student_id, submission_text, file_urls, is_late)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (assignment_id, student_id) DO UPDATE SET
             submission_text = $3, file_urls = $4, submitted_at = NOW(), is_late = $5, status = 'submitted'
           RETURNING *
         `, [id, studentResult.rows[0].id, submissionText, fileUrls, isLate]);

         res.status(201).json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export const updateSubmission = async (req, res, next) => {
       try {
         const { id } = req.params;
         const { submissionText, fileUrls } = req.body;

         const result = await query(`
           UPDATE assignment_submissions
           SET submission_text = COALESCE($1, submission_text),
               file_urls = COALESCE($2, file_urls),
               submitted_at = NOW()
           WHERE id = $3 AND status != 'graded'
           RETURNING *
         `, [submissionText, fileUrls, id]);

         if (result.rows.length === 0) {
           return res.status(404).json({
             success: false,
             error: 'Submission not found or already graded'
           });
         }

         res.json({
           success: true,
           data: result.rows[0]
         });
       } catch (error) {
         next(error);
       }
     };

     export default {
       listTeacherAssignments,
       createAssignment,
       getAssignment,
       updateAssignment,
       deleteAssignment,
       publishAssignment,
       getSubmissions,
       getSubmission,
       gradeSubmission,
       getStudentClasses,
       getStudentSchedule,
       listStudentAssignments,
       getPendingAssignments,
       getCompletedAssignments,
       getOverdueAssignments,
       getAssignmentForStudent,
       submitAssignment,
       updateSubmission
     };

● Bash(cat /tmp/helloworld/frontend/src/components/layout/DashboardLayout.jsx)
  ⎿  import { useState, useRef, useEffect } from 'react';
     import { Link, Outlet, useLocation } from 'react-router-dom';
     import { useAuth } from '../../context/AuthContext';
     import { useTheme, avatarColors as allAvatarColors } from '../../context/ThemeContext';
     import AccountModal from '../common/AccountModal';

     const DashboardLayout = () => {
       const { user, logout } = useAuth();
       const location = useLocation();
       const { avatarColors, avatarColor, setAvatarColor, backgroundImage } = useTheme();
       const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
       const [isSignOutModalOpen, setIsSignOutModalOpen] = useState(false);
       const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
       const [showColorPicker, setShowColorPicker] = useState(false);
       const avatarMenuRef = useRef(null);

       // Close menu when clicking outside
       useEffect(() => {
         const handleClickOutside = (event) => {
           if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target)) {
             setIsAvatarMenuOpen(false);
             setShowColorPicker(false);
           }
         };
         document.addEventListener('mousedown', handleClickOutside);
         return () => document.removeEventListener('mousedown', handleClickOutside);
       }, []);

       const getNavLinks = () => {
         switch (user?.role) {
           case 'admin':
             return [
               { path: '/admin', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2
     2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
               { path: '/admin/users', label: 'Users', icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0
     0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
               { path: '/admin/classes', label: 'Classes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2
     0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
               { path: '/admin/announcements', label: 'Announcements', icon: 'M11 5.882V19.24a1.76 1.76 0
     01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234
     9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
             ];
           case 'teacher':
             return [
               { path: '/teacher', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2
     2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
               { path: '/teacher/classes', label: 'My Classes', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2
      0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
               { path: '/teacher/assignments', label: 'Assignments', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0
     012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
               { path: '/teacher/attendance', label: 'Attendance', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0
     002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4' },
             ];
           case 'student':
             return [
               { path: '/student', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2
     2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
               { path: '/student/enrollment', label: 'Enroll in Classes', icon: 'M12 6v6m0 0v6m0-6h6m-6 0H6' },
               { path: '/student/assignments', label: 'Assignments', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0
     012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
               { path: '/student/grades', label: 'Grades', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2
      2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2
     2 0 01-2 2h-2a2 2 0 01-2-2z' },
               { path: '/student/schedule', label: 'Schedule', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0
     00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
               { path: '/student/theme', label: 'Theme', icon: 'M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0
     01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010
     2.828l-8.486 8.485M7 17h.01' },
             ];
           default:
             return [];
         }
       };

       const navLinks = getNavLinks();

       return (
         <div className={`min-h-screen ${backgroundImage ? 'has-background-image' : 'bg-gray-100'}`}>
           {/* Background Image Layer */}
           {backgroundImage && <div className="app-background" />}

           {/* Sidebar */}
           <aside className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg sidebar-bg">
             <div className="flex flex-col h-full">
               {/* Logo */}
               <div className="h-16 flex items-center px-6 border-b border-gray-200">
                 <h1 className="text-xl font-bold logo-text">School MS</h1>
               </div>

               {/* Navigation */}
               <nav className="flex-1 p-4 space-y-1">
                 {navLinks.map((link) => (
                   <Link
                     key={link.path}
                     to={link.path}
                     className={`sidebar-link ${
                       location.pathname === link.path ? 'active' : ''
                     }`}
                   >
                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={link.icon} />
                     </svg>
                     {link.label}
                   </Link>
                 ))}
               </nav>

               {/* User Info */}
               <div className="p-4 border-t border-gray-200" ref={avatarMenuRef}>
                 <div className="relative">
                   <button
                     onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
                     className="w-full flex items-center gap-3 mb-4 p-2 rounded-lg hover:bg-gray-100 transition-colors
     cursor-pointer"
                   >
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center ${avatarColors.bg}`}>
                       <span className={`font-medium ${avatarColors.text}`}>
                         {user?.name?.charAt(0) || 'U'}
                       </span>
                     </div>
                     <div className="flex-1 min-w-0 text-left">
                       <p className="text-sm font-medium text-gray-900 truncate">
                         {user?.name}
                       </p>
                       <p className="text-xs text-gray-500 capitalize">
                         {user?.role}
                       </p>
                     </div>
                     <svg className={`w-4 h-4 text-gray-400 transition-transform ${isAvatarMenuOpen ? 'rotate-90' :
     ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                     </svg>
                   </button>

                   {/* Avatar Dropdown Menu */}
                   {isAvatarMenuOpen && (
                     <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border
     border-gray-200 overflow-hidden z-50">
                       {/* My Account */}
                       <button
                         onClick={() => {
                           setIsAvatarMenuOpen(false);
                           setIsAccountModalOpen(true);
                         }}
                         className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors
     text-left"
                       >
                         <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4
     0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                         </svg>
                         <span className="text-sm text-gray-700">My Account</span>
                       </button>

                       {/* Change Avatar Color */}
                       <div className="border-t border-gray-100">
                         <button
                           onClick={() => setShowColorPicker(!showColorPicker)}
                           className="w-full flex items-center justify-between gap-3 px-4 py-3 hover:bg-gray-50
     transition-colors text-left"
                         >
                           <div className="flex items-center gap-3">
                             <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24
     24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0
     01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11
     7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                             </svg>
                             <span className="text-sm text-gray-700">Avatar Color</span>
                           </div>
                           <div className={`w-5 h-5 rounded-full ${avatarColors.bg}`}></div>
                         </button>

                         {/* Color Picker */}
                         {showColorPicker && (
                           <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                             <p className="text-xs text-gray-500 mb-2">Choose a color:</p>
                             <div className="grid grid-cols-6 gap-2">
                               {Object.keys(allAvatarColors).map((colorKey) => {
                                 const colors = allAvatarColors[colorKey];
                                 const isSelected = avatarColor === colorKey;
                                 return (
                                   <button
                                     key={colorKey}
                                     onClick={() => {
                                       setAvatarColor(colorKey);
                                     }}
                                     className={`w-7 h-7 rounded-full flex items-center justify-center
     transition-transform hover:scale-110 ${colors.bg} ${isSelected ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
                                     title={colorKey}
                                   >
                                     {isSelected && (
                                       <svg className={`w-4 h-4 ${colors.text}`} fill="none" stroke="currentColor"
     viewBox="0 0 24 24">
                                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4
     4L19 7" />
                                       </svg>
                                     )}
                                   </button>
                                 );
                               })}
                             </div>
                           </div>
                         )}
                       </div>

                       {/* Sign Out */}
                       <button
                         onClick={() => {
                           setIsAvatarMenuOpen(false);
                           setIsSignOutModalOpen(true);
                         }}
                         className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left
      border-t border-gray-100"
                       >
                         <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4
     4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                         </svg>
                         <span className="text-sm text-red-600">Sign Out</span>
                       </button>
                     </div>
                   )}
                 </div>
               </div>
             </div>
           </aside>

           {/* Main Content */}
           <main className="ml-64 min-h-screen main-content-bg">
             <header className="h-16 bg-primary shadow-sm flex items-center px-6">
               <h2 className="text-lg font-semibold text-white">
                 {navLinks.find(l => l.path === location.pathname)?.label || 'Dashboard'}
               </h2>
             </header>
             <div className="p-6">
               <Outlet />
             </div>
           </main>

           {/* Account Modal */}
           <AccountModal
             isOpen={isAccountModalOpen}
             onClose={() => setIsAccountModalOpen(false)}
           />

           {/* Sign Out Confirmation Modal */}
           {isSignOutModalOpen && (
             <>
               <div
                 className="fixed inset-0 bg-black/50 z-40"
                 onClick={() => setIsSignOutModalOpen(false)}
               />
               <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                 <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                   <div className="p-6 text-center">
                     {/* Warning Icon */}
                     <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                       <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4
     4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                       </svg>
                     </div>

                     <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Out</h3>
                     <p className="text-gray-600 mb-6">Are you sure you want to sign out?</p>

                     <div className="flex gap-3">
                       <button
                         onClick={() => setIsSignOutModalOpen(false)}
                         className="flex-1 btn btn-secondary"
                       >
                         Cancel
                       </button>
                       <button
                         onClick={() => {
                           setIsSignOutModalOpen(false);
                           logout();
                         }}
                         className="flex-1 btn btn-danger"
                       >
                         Sign Out
                       </button>
                     </div>
                   </div>
                 </div>
               </div>
             </>
           )}
         </div>
       );
     };

     export default DashboardLayout;

● Bash(cat /tmp/helloworld/frontend/src/context/ThemeContext.jsx)
  ⎿  import { createContext, useContext, useState, useEffect } from 'react';

     const ThemeContext = createContext(null);

     // Available theme colors
     export const themeColors = {
       blue: {
         name: 'Blue',
         primary: '#2563eb',
         primaryHover: '#1d4ed8',
         primaryLight: '#dbeafe',
         accent: '#3b82f6',
       },
       purple: {
         name: 'Purple',
         primary: '#7c3aed',
         primaryHover: '#6d28d9',
         primaryLight: '#ede9fe',
         accent: '#8b5cf6',
       },
       green: {
         name: 'Green',
         primary: '#059669',
         primaryHover: '#047857',
         primaryLight: '#d1fae5',
         accent: '#10b981',
       },
       red: {
         name: 'Red',
         primary: '#dc2626',
         primaryHover: '#b91c1c',
         primaryLight: '#fee2e2',
         accent: '#ef4444',
       },
       orange: {
         name: 'Orange',
         primary: '#ea580c',
         primaryHover: '#c2410c',
         primaryLight: '#ffedd5',
         accent: '#f97316',
       },
       pink: {
         name: 'Pink',
         primary: '#db2777',
         primaryHover: '#be185d',
         primaryLight: '#fce7f3',
         accent: '#ec4899',
       },
       teal: {
         name: 'Teal',
         primary: '#0d9488',
         primaryHover: '#0f766e',
         primaryLight: '#ccfbf1',
         accent: '#14b8a6',
       },
       indigo: {
         name: 'Indigo',
         primary: '#4f46e5',
         primaryHover: '#4338ca',
         primaryLight: '#e0e7ff',
         accent: '#6366f1',
       },
     };

     // Avatar background colors
     export const avatarColors = {
       blue: { bg: 'bg-blue-100', text: 'text-blue-600' },
       purple: { bg: 'bg-purple-100', text: 'text-purple-600' },
       green: { bg: 'bg-green-100', text: 'text-green-600' },
       red: { bg: 'bg-red-100', text: 'text-red-600' },
       orange: { bg: 'bg-orange-100', text: 'text-orange-600' },
       pink: { bg: 'bg-pink-100', text: 'text-pink-600' },
       teal: { bg: 'bg-teal-100', text: 'text-teal-600' },
       indigo: { bg: 'bg-indigo-100', text: 'text-indigo-600' },
       gray: { bg: 'bg-gray-100', text: 'text-gray-600' },
       yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600' },
       cyan: { bg: 'bg-cyan-100', text: 'text-cyan-600' },
       rose: { bg: 'bg-rose-100', text: 'text-rose-600' },
     };

     export const ThemeProvider = ({ children }) => {
       const [theme, setTheme] = useState(() => {
         const saved = localStorage.getItem('app-theme');
         return saved || 'blue';
       });

       const [avatarColor, setAvatarColor] = useState(() => {
         const saved = localStorage.getItem('avatar-color');
         return saved || 'blue';
       });

       const [backgroundImage, setBackgroundImage] = useState(() => {
         const saved = localStorage.getItem('background-image');
         return saved || '';
       });

       useEffect(() => {
         localStorage.setItem('app-theme', theme);
         applyTheme(theme);
       }, [theme]);

       useEffect(() => {
         localStorage.setItem('avatar-color', avatarColor);
       }, [avatarColor]);

       useEffect(() => {
         localStorage.setItem('background-image', backgroundImage);
         applyBackgroundImage(backgroundImage);
       }, [backgroundImage]);

       const applyTheme = (themeName) => {
         const colors = themeColors[themeName];
         if (!colors) return;

         const root = document.documentElement;
         root.style.setProperty('--color-primary', colors.primary);
         root.style.setProperty('--color-primary-hover', colors.primaryHover);
         root.style.setProperty('--color-primary-light', colors.primaryLight);
         root.style.setProperty('--color-accent', colors.accent);
       };

       const applyBackgroundImage = (imageUrl) => {
         const root = document.documentElement;
         if (imageUrl) {
           root.style.setProperty('--background-image', `url(${imageUrl})`);
         } else {
           root.style.removeProperty('--background-image');
         }
       };

       const value = {
         theme,
         setTheme,
         themeColors: themeColors[theme],
         avatarColor,
         setAvatarColor,
         avatarColors: avatarColors[avatarColor],
         backgroundImage,
         setBackgroundImage,
       };

       return (
         <ThemeContext.Provider value={value}>
           {children}
         </ThemeContext.Provider>
       );
     };

     export const useTheme = () => {
       const context = useContext(ThemeContext);
       if (!context) {
         throw new Error('useTheme must be used within a ThemeProvider');
       }
       return context;
     };

     export default ThemeContext;

● Bash(cat /tmp/helloworld/frontend/src/App.jsx)
  ⎿  import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
     import { AuthProvider } from './context/AuthContext';
     import { ThemeProvider } from './context/ThemeContext';
     import ProtectedRoute from './components/auth/ProtectedRoute';
     import DashboardLayout from './components/layout/DashboardLayout';

     // Auth pages
     import LoginPage from './pages/auth/LoginPage';

     // Admin pages
     import AdminDashboard from './pages/admin/DashboardPage';
     import AdminUsersPage from './pages/admin/UsersPage';
     import AdminClassesPage from './pages/admin/ClassesPage';
     import AdminAnnouncementsPage from './pages/admin/AnnouncementsPage';

     // Teacher pages
     import TeacherDashboard from './pages/teacher/DashboardPage';
     import TeacherClassesPage from './pages/teacher/ClassesPage';
     import TeacherAssignmentsPage from './pages/teacher/AssignmentsPage';
     import TeacherAttendancePage from './pages/teacher/AttendancePage';

     // Student pages
     import StudentDashboard from './pages/student/DashboardPage';
     import StudentAssignmentsPage from './pages/student/AssignmentsPage';
     import StudentGradesPage from './pages/student/GradesPage';
     import StudentSchedulePage from './pages/student/SchedulePage';
     import StudentEnrollmentPage from './pages/student/EnrollmentPage';
     import StudentThemePage from './pages/student/ThemePage';

     function App() {
       return (
         <BrowserRouter>
           <AuthProvider>
             <ThemeProvider>
             <Routes>
               {/* Public routes */}
               <Route path="/login" element={<LoginPage />} />

               {/* Admin routes */}
               <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                 <Route element={<DashboardLayout />}>
                   <Route path="/admin" element={<AdminDashboard />} />
                   <Route path="/admin/users" element={<AdminUsersPage />} />
                   <Route path="/admin/classes" element={<AdminClassesPage />} />
                   <Route path="/admin/announcements" element={<AdminAnnouncementsPage />} />
                 </Route>
               </Route>

               {/* Teacher routes */}
               <Route element={<ProtectedRoute allowedRoles={['teacher']} />}>
                 <Route element={<DashboardLayout />}>
                   <Route path="/teacher" element={<TeacherDashboard />} />
                   <Route path="/teacher/classes" element={<TeacherClassesPage />} />
                   <Route path="/teacher/assignments" element={<TeacherAssignmentsPage />} />
                   <Route path="/teacher/attendance" element={<TeacherAttendancePage />} />
                 </Route>
               </Route>

               {/* Student routes */}
               <Route element={<ProtectedRoute allowedRoles={['student']} />}>
                 <Route element={<DashboardLayout />}>
                   <Route path="/student" element={<StudentDashboard />} />
                   <Route path="/student/assignments" element={<StudentAssignmentsPage />} />
                   <Route path="/student/grades" element={<StudentGradesPage />} />
                   <Route path="/student/schedule" element={<StudentSchedulePage />} />
                   <Route path="/student/enrollment" element={<StudentEnrollmentPage />} />
                   <Route path="/student/theme" element={<StudentThemePage />} />
                 </Route>
               </Route>

               {/* Default redirect */}
               <Route path="/" element={<Navigate to="/login" replace />} />
               <Route path="*" element={<Navigate to="/login" replace />} />
             </Routes>
             </ThemeProvider>
           </AuthProvider>
         </BrowserRouter>
       );
     }

     export default App;

                                                                                      04:15 PM claude-sonnet-4-6
● Now I have everything I need. I'll build all three features:

  1. Students page for teacher — lists all students across their classes
  2. Background/theme page for teacher — same upload feature students already have
  3. Grade submissions in the Assignments page — view & grade what students turned in

● Bash(cat > /tmp/helloworld/frontend/src/pages/teacher/StudentsPage.jsx << 'EOF'
  import { useState, useEffect } from 'react';
  import api from '../../api/axios';

  const TeacherStudentsPage = () => {
    const [classes, setClasses] = useState([]);
    const [selectedClass, setSelectedClass] = useState('all');
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      loadAll();
    }, []);

    const loadAll = async () => {
      try {
        const classesRes = await api.get('/teacher/classes');
        const classList = classesRes.data.data || [];
        setClasses(classList);

        // Load rosters for all classes in parallel
        const rosterResults = await Promise.all(
          classList.map((cls) =>
            api.get(`/teacher/classes/${cls.id}/roster`).then((r) =>
              (r.data.data || []).map((s) => ({ ...s, class_name: cls.name, class_id: cls.id }))
            )
          )
        );

        // Flatten and deduplicate by student id
        const allStudents = rosterResults.flat();
        const seen = new Set();
        const unique = [];
        for (const s of allStudents) {
          const key = s.id;
          if (!seen.has(key)) {
            seen.add(key);
            unique.push({ ...s, classes: [{ id: s.class_id, name: s.class_name }] });
          } else {
            const existing = unique.find((u) => u.id === key);
            if (existing) existing.classes.push({ id: s.class_id, name: s.class_name });
          }
        }
        setStudents(unique);
      } catch (error) {
        console.error('Failed to load students:', error);
      } finally {
        setLoading(false);
      }
    };

    const filtered =
      selectedClass === 'all'
        ? students
        : students.filter((s) => s.classes.some((c) => c.id === selectedClass));

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Filter bar */}
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700">Filter by class:</label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value === 'all' ? 'all' : e.target.value)}
            className="input w-auto"
          >
            <option value="all">All Classes</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{filtered.length} student{filtered.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="card overflow-hidden p-0">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-500 py-12">No students found.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Student ID</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Name</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Email</th>
                  <th className="text-left py-3 px-6 text-sm font-medium text-gray-500">Classes</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-6 text-sm text-gray-600">{student.student_id}</td>
                    <td className="py-3 px-6 text-sm font-medium text-gray-900">
                      {student.first_name} {student.last_name}
                    </td>
                    <td className="py-3 px-6 text-sm text-gray-600">{student.email}</td>
                    <td className="py-3 px-6 text-sm text-gray-600">
                      <div className="flex flex-wrap gap-1">
                        {student.classes.map((c) => (
                          <span
                            key={c.id}
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
  bg-primary-100 text-primary-800"
                            style={{ backgroundColor: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                          >
                            {c.name}
                          </span>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  };

  export default TeacherStudentsPage;
  EOF)
  ⎿  (No output)

● Bash(cat > /tmp/helloworld/frontend/src/pages/teacher/ThemePage.jsx << 'EOF'
  import { useState } from 'react';
  import { useTheme, themeColors, avatarColors } from '../../context/ThemeContext';
  import { useAuth } from '../../context/AuthContext';

  const TeacherThemePage = () => {
    const { theme, setTheme, avatarColor, setAvatarColor, backgroundImage, setBackgroundImage } = useTheme();
    const { user } = useAuth();
    const [saved, setSaved] = useState(false);
    const [pendingTheme, setPendingTheme] = useState(theme);
    const [pendingAvatarColor, setPendingAvatarColor] = useState(avatarColor);
    const [pendingBackgroundImage, setPendingBackgroundImage] = useState(backgroundImage);

    const themeColorKeys = Object.keys(themeColors);
    const avatarColorKeys = Object.keys(avatarColors);

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

    const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        alert('Image is too large. Please choose an image under 5MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => setPendingBackgroundImage(reader.result);
      reader.readAsDataURL(file);
    };

    return (
      <div className="space-y-8 max-w-4xl">
        {/* Theme Color */}
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
                    isSelected ? 'bg-gray-100 ring-2 ring-offset-2' : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full shadow-md transition-transform group-hover:scale-110 flex
  items-center justify-center"
                    style={{ backgroundColor: color.primary }}
                  >
                    {isSelected && (
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                    {color.name}
                  </span>
                </button>
              );
            })}
          </div>
          {pendingTheme !== theme && (
            <div className="mt-6">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColors[pendingTheme].primary }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Avatar Color */}
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
                    isSelected ? 'bg-gray-100 ring-2 ring-offset-2 ring-gray-400' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-md ${colors.bg}`}>
                    <span className={`text-xl font-bold ${colors.text}`}>
                      {user?.name?.charAt(0)?.toUpperCase() || 'T'}
                    </span>
                  </div>
                  <span className={`text-xs font-medium capitalize ${isSelected ? 'text-gray-900' : 'text-gray-600'}`}>
                    {colorKey}
                  </span>
                </button>
              );
            })}
          </div>
          {pendingAvatarColor !== avatarColor && (
            <div className="mt-6">
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColors[pendingTheme].primary }}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {/* Background Image */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Background Image</h2>
          <p className="text-gray-600 mb-6">Upload a custom background image that appears on every page.</p>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload from Device</label>
              <div className="flex gap-3 items-center">
                <label
                  className="cursor-pointer px-4 py-2 text-white rounded-lg hover:opacity-90 font-medium flex
  items-center gap-2"
                  style={{ backgroundColor: themeColors[pendingTheme].primary }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0
  012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2
   2 0 002 2z" />
                  </svg>
                  Choose Image
                  <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                </label>
                {pendingBackgroundImage && (
                  <button
                    onClick={() => { setPendingBackgroundImage(''); setBackgroundImage(''); }}
                    className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 font-medium"
                  >
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">Max 5MB</p>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">or paste a URL</span>
              </div>
            </div>

            <input
              type="url"
              value={pendingBackgroundImage.startsWith('data:') ? '' : pendingBackgroundImage}
              onChange={(e) => setPendingBackgroundImage(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500
  focus:border-transparent"
            />

            {pendingBackgroundImage && (
              <div>
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <div
                  className="w-full h-48 rounded-lg bg-cover bg-center border border-gray-200 flex items-center
  justify-center"
                  style={{ backgroundImage: `url(${pendingBackgroundImage})` }}
                >
                  <span className="text-white text-sm font-medium bg-black/50 px-3 py-1 rounded">
                    Background Preview
                  </span>
                </div>
              </div>
            )}

            {pendingBackgroundImage !== backgroundImage && (
              <button
                onClick={handleSave}
                className="px-6 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColors[pendingTheme].primary }}
              >
                Save Changes
              </button>
            )}
          </div>
        </div>

        {/* Reset */}
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
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  export default TeacherThemePage;
  EOF)

 1 import { useState, useEffect } from 'react';
        2 import api from '../../api/axios';
        3
        4 const TeacherAssignmentsPage = () => {
        5   const [assignments, setAssignments] = useState([]);
        6   const [classes, setClasses] = useState([]);
        7   const [loading, setLoading] = useState(true);
        8   const [showModal, setShowModal] = useState(false);
        9   const [formData, setFormData] = useState({
       10     classId: '',
       11     title: '',
       12     description: '',
       13     instructions: '',
       14     dueDate: '',
       15     maxPoints: 100,
       16     assignmentType: 'homework',
       17     allowLateSubmission: false
       18   });
       19   const [error, setError] = useState('');
       20
       21   // Grading state
       22   const [gradingAssignment, setGradingAssignment] = useState(null);
       23   const [submissions, setSubmissions] = useState([]);
       24   const [loadingSubmissions, setLoadingSubmissions] = useState(false);
       25   const [gradingSubmission, setGradingSubmission] = useState(null);
       26   const [gradeForm, setGradeForm] = useState({ pointsEarned: '', feedback: '' });
       27   const [gradeError, setGradeError] = useState('');
       28   const [gradeSaving, setGradeSaving] = useState(false);
       29
       30   useEffect(() => {
       31     loadData();
       32   }, []);
       33
       34   const loadData = async () => {
       35     try {
       36       const [assignmentsRes, classesRes] = await Promise.all([
       37         api.get('/teacher/assignments'),
       38         api.get('/teacher/classes')
       39       ]);
       40       setAssignments(assignmentsRes.data.data || []);
       41       setClasses(classesRes.data.data || []);
       42     } catch (error) {
       43       console.error('Failed to load data:', error);
       44     } finally {
       45       setLoading(false);
       46     }
       47   };
       48
       49   const handleSubmit = async (e) => {
       50     e.preventDefault();
       51     setError('');
       52     try {
       53       await api.post('/teacher/assignments', formData);
       54       setShowModal(false);
       55       setFormData({
       56         classId: '',
       57         title: '',
       58         description: '',
       59         instructions: '',
       60         dueDate: '',
       61         maxPoints: 100,
       62         assignmentType: 'homework',
       63         allowLateSubmission: false
       64       });
       65       loadData();
       66     } catch (err) {
       67       setError(err.response?.data?.error || 'Failed to create assignment');
       68     }
       69   };
       70
       71   const handlePublish = async (id) => {
       72     try {
       73       await api.post(`/teacher/assignments/${id}/publish`);
       74       loadData();
       75     } catch (error) {
       76       console.error('Failed to publish assignment:', error);
       77     }
       78   };
       79
       80   const handleDelete = async (id) => {
       81     if (!confirm('Are you sure you want to delete this assignment?')) return;
       82     try {
       83       await api.delete(`/teacher/assignments/${id}`);
       84       loadData();
       85     } catch (error) {
       86       console.error('Failed to delete assignment:', error);
       87     }
       88   };
       89
       90   const openGrading = async (assignment) => {
       91     setGradingAssignment(assignment);
       92     setGradingSubmission(null);
       93     setGradeForm({ pointsEarned: '', feedback: '' });
       94     setGradeError('');
       95     setLoadingSubmissions(true);
       96     try {
       97       const res = await api.get(`/teacher/assignments/${assignment.id}/submissions`);
       98       setSubmissions(res.data.data || []);
       99     } catch (err) {
      100       console.error('Failed to load submissions:', err);
      101     } finally {
      102       setLoadingSubmissions(false);
      103     }
      104   };
      105
      106   const openGradeForm = (submission) => {
      107     setGradingSubmission(submission);
      108     setGradeForm({
      109       pointsEarned: submission.points_earned !== null && submission.points_earned !== undefined
      110         ? String(submission.points_earned)
      111         : '',
      112       feedback: submission.feedback || ''
      113     });
      114     setGradeError('');
      115   };
      116
      117   const submitGrade = async (e) => {
      118     e.preventDefault();
      119     setGradeError('');
      120     setGradeSaving(true);
      121     try {
      122       await api.post(`/teacher/submissions/${gradingSubmission.id}/grade`, {
      123         pointsEarned: Number(gradeForm.pointsEarned),
      124         feedback: gradeForm.feedback
      125       });
      126       // Refresh submissions list
      127       const res = await api.get(`/teacher/assignments/${gradingAssignment.id}/submissions`);
      128       setSubmissions(res.data.data || []);
      129       setGradingSubmission(null);
      130       loadData();
      131     } catch (err) {
      132       setGradeError(err.response?.data?.error || 'Failed to save grade');
      133     } finally {
      134       setGradeSaving(false);
      135     }
      136   };
      137
      138   if (loading) {
      139     return (
      140       <div className="flex items-center justify-center h-64">
      141         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      142       </div>
      143     );
      144   }
      145
      146   return (
      147     <div className="space-y-6">
      148       <div className="flex justify-between items-center">
      149         <h2 className="text-lg font-semibold text-gray-900">Assignments</h2>
      150         <button onClick={() => setShowModal(true)} className="btn btn-primary">
      151           Create Assignment
      152         </button>
      153       </div>
      154
      155       <div className="space-y-4">
      156         {assignments.length === 0 ? (
      157           <div className="text-center py-12 text-gray-500 card">
      158             No assignments yet. Create your first assignment.
      159           </div>
      160         ) : (
      161           assignments.map((assignment) => (
      162             <div key={assignment.id} className="card">
      163               <div className="flex justify-between items-start mb-2">
      164                 <div>
      165                   <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
      166                   <p className="text-sm text-gray-500">{assignment.class_name}</p>
      167                 </div>
      168                 <div className="flex items-center gap-2">
      169                   <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-me
          dium ${
      170                     assignment.is_published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yello
          w-800'
      171                   }`}>
      172                     {assignment.is_published ? 'Published' : 'Draft'}
      173                   </span>
      174                   <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-med
          ium bg-gray-100 text-gray-800 capitalize">
      175                     {assignment.assignment_type}
      176                   </span>
      177                 </div>
      178               </div>
      179               {assignment.description && (
      180                 <p className="text-gray-600 text-sm mt-2">{assignment.description}</p>
      181               )}
      182               <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
      183                 <div className="flex items-center gap-4">
      184                   <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
      185                   <span>Points: {assignment.max_points}</span>
      186                   <span>{assignment.submission_count || 0} submission{assignment.submission_count !== 1
           ? 's' : ''}</span>
      187                 </div>
      188                 <div className="flex items-center gap-3">
      189                   <button
      190                     onClick={() => openGrading(assignment)}
      191                     className="text-primary-600 hover:text-primary-700 font-medium"
      192                     style={{ color: 'var(--color-primary)' }}
      193                   >
      194                     Grade Submissions
      195                   </button>
      196                   {!assignment.is_published && (
      197                     <button
      198                       onClick={() => handlePublish(assignment.id)}
      199                       className="text-primary-600 hover:text-primary-700 font-medium"
      200                       style={{ color: 'var(--color-primary)' }}
      201                     >
      202                       Publish
      203                     </button>
      204                   )}
      205                   <button
      206                     onClick={() => handleDelete(assignment.id)}
      207                     className="text-red-600 hover:text-red-700 font-medium"
      208                   >
      209                     Delete
      210                   </button>
      211                 </div>
      212               </div>
      213             </div>
      214           ))
      215         )}
      216       </div>
      217
      218       {/* Create Assignment Modal */}
      219       {showModal && (
      220         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      221           <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-au
          to p-6">
      222             <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Assignment</h2>
      223             <form onSubmit={handleSubmit} className="space-y-4">
      224               {error && (
      225                 <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-
          sm">
      226                   {error}
      227                 </div>
      228               )}
      229               <div>
      230                 <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
      231                 <select
      232                   value={formData.classId}
      233                   onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
      234                   className="input"
      235                   required
      236                 >
      237                   <option value="">Select a class</option>
      238                   {classes.map((cls) => (
      239                     <option key={cls.id} value={cls.id}>{cls.name}</option>
      240                   ))}
      241                 </select>
      242               </div>
      243               <div>
      244                 <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
      245                 <input
      246                   type="text"
      247                   value={formData.title}
      248                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
      249                   className="input"
      250                   required
      251                 />
      252               </div>
      253               <div>
      254                 <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
      255                 <textarea
      256                   value={formData.description}
      257                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
      258                   className="input"
      259                   rows={3}
      260                 />
      261               </div>
      262               <div>
      263                 <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
      264                 <textarea
      265                   value={formData.instructions}
      266                   onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
      267                   className="input"
      268                   rows={3}
      269                 />
      270               </div>
      271               <div className="grid grid-cols-2 gap-4">
      272                 <div>
      273                   <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
      274                   <input
      275                     type="datetime-local"
      276                     value={formData.dueDate}
      277                     onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
      278                     className="input"
      279                     required
      280                   />
      281                 </div>
      282                 <div>
      283                   <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
      284                   <input
      285                     type="number"
      286                     value={formData.maxPoints}
      287                     onChange={(e) => setFormData({ ...formData, maxPoints: parseInt(e.target.value) })}
      288                     className="input"
      289                     min={1}
      290                   />
      291                 </div>
      292               </div>
      293               <div>
      294                 <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
      295                 <select
      296                   value={formData.assignmentType}
      297                   onChange={(e) => setFormData({ ...formData, assignmentType: e.target.value })}
      298                   className="input"
      299                 >
      300                   <option value="homework">Homework</option>
      301                   <option value="quiz">Quiz</option>
      302                   <option value="exam">Exam</option>
      303                   <option value="project">Project</option>
      304                   <option value="classwork">Classwork</option>
      305                 </select>
      306               </div>
      307               <div className="flex items-center">
      308                 <input
      309                   type="checkbox"
      310                   id="allowLate"
      311                   checked={formData.allowLateSubmission}
      312                   onChange={(e) => setFormData({ ...formData, allowLateSubmission: e.target.checked })}
      313                   className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
      314                 />
      315                 <label htmlFor="allowLate" className="ml-2 block text-sm text-gray-700">
      316                   Allow late submissions
      317                 </label>
      318               </div>
      319               <div className="flex gap-3 pt-4">
      320                 <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn btn-sec
          ondary">
      321                   Cancel
      322                 </button>
      323                 <button type="submit" className="flex-1 btn btn-primary">
      324                   Create Assignment
      325                 </button>
      326               </div>
      327             </form>
      328           </div>
      329         </div>
      330       )}
      331
      332       {/* Grade Submissions Modal */}
      333       {gradingAssignment && (
      334         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      335           <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hid
          den flex flex-col">
      336             <div className="p-6 border-b border-gray-200 flex justify-between items-start">
      337               <div>
      338                 <h2 className="text-xl font-semibold text-gray-900">{gradingAssignment.title}</h2>
      339                 <p className="text-sm text-gray-500">
      340                   {gradingAssignment.class_name} &mdash; Max points: {gradingAssignment.max_points}
      341                 </p>
      342               </div>
      343               <button
      344                 onClick={() => { setGradingAssignment(null); setGradingSubmission(null); }}
      345                 className="text-gray-400 hover:text-gray-600"
      346               >
      347                 <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      348                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l
          12 12" />
      349                 </svg>
      350               </button>
      351             </div>
      352
      353             <div className="flex flex-1 overflow-hidden">
      354               {/* Submissions list */}
      355               <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
      356                 {loadingSubmissions ? (
      357                   <div className="flex items-center justify-center h-32">
      358                     <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></
          div>
      359                   </div>
      360                 ) : submissions.length === 0 ? (
      361                   <p className="text-center text-gray-500 py-12 px-4">No submissions yet.</p>
      362                 ) : (
      363                   <ul className="divide-y divide-gray-100">
      364                     {submissions.map((sub) => (
      365                       <li key={sub.id}>
      366                         <button
      367                           onClick={() => openGradeForm(sub)}
      368                           className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors ${
      369                             gradingSubmission?.id === sub.id ? 'bg-blue-50' : ''
      370                           }`}
      371                         >
      372                           <div className="flex items-center justify-between">
      373                             <span className="font-medium text-gray-900 text-sm">
      374                               {sub.first_name} {sub.last_name}
      375                             </span>
      376                             {sub.points_earned !== null && sub.points_earned !== undefined ? (
      377                               <span className="text-xs font-semibold text-green-700 bg-green-100 px-2 p
          y-0.5 rounded-full">
      378                                 {sub.points_earned}/{gradingAssignment.max_points}
      379                               </span>
      380                             ) : (
      381                               <span className="text-xs text-yellow-700 bg-yellow-100 px-2 py-0.5 rounde
          d-full">
      382                                 Not graded
      383                               </span>
      384                             )}
      385                           </div>
      386                           <p className="text-xs text-gray-500 mt-0.5">
      387                             Submitted: {new Date(sub.submitted_at).toLocaleDateString()}
      388                             {sub.is_late && <span className="ml-2 text-red-500">Late</span>}
      389                           </p>
      390                         </button>
      391                       </li>
      392                     ))}
      393                   </ul>
      394                 )}
      395               </div>
      396
      397               {/* Grade form / submission detail */}
      398               <div className="w-1/2 overflow-y-auto p-5">
      399                 {!gradingSubmission ? (
      400                   <p className="text-gray-400 text-sm text-center mt-8">
      401                     Select a submission on the left to grade it.
      402                   </p>
      403                 ) : (
      404                   <div className="space-y-4">
      405                     <div>
      406                       <h3 className="font-semibold text-gray-900">
      407                         {gradingSubmission.first_name} {gradingSubmission.last_name}
      408                       </h3>
      409                       <p className="text-xs text-gray-500">Student ID: {gradingSubmission.student_id}</
          p>
      410                     </div>
      411
      412                     {gradingSubmission.submission_text && (
      413                       <div>
      414                         <p className="text-sm font-medium text-gray-700 mb-1">Submission</p>
      415                         <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700 whitespace-pre-
          wrap max-h-40 overflow-y-auto">
      416                           {gradingSubmission.submission_text}
      417                         </div>
      418                       </div>
      419                     )}
      420
      421                     <form onSubmit={submitGrade} className="space-y-3">
      422                       {gradeError && (
      423                         <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded
          text-sm">
      424                           {gradeError}
      425                         </div>
      426                       )}
      427                       <div>
      428                         <label className="block text-sm font-medium text-gray-700 mb-1">
      429                           Points Earned (out of {gradingAssignment.max_points})
      430                         </label>
      431                         <input
      432                           type="number"
      433                           value={gradeForm.pointsEarned}
      434                           onChange={(e) => setGradeForm({ ...gradeForm, pointsEarned: e.target.value })
          }
      435                           className="input"
      436                           min={0}
      437                           max={gradingAssignment.max_points}
      438                           required
      439                         />
      440                       </div>
      441                       <div>
      442                         <label className="block text-sm font-medium text-gray-700 mb-1">
      443                           Feedback (optional)
      444                         </label>
      445                         <textarea
      446                           value={gradeForm.feedback}
      447                           onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
      448                           className="input"
      449                           rows={3}
      450                           placeholder="Leave feedback for the student..."
      451                         />
      452                       </div>
      453                       <button
      454                         type="submit"
      455                         disabled={gradeSaving}
      456                         className="w-full btn btn-primary disabled:opacity-50"
      457                       >
      458                         {gradeSaving ? 'Saving...' : 'Save Grade'}
      459                       </button>
      460                     </form>
      461                   </div>
      462                 )}
      463               </div>
      464             </div>
      465           </div>
      466         </div>
      467       )}
      468     </div>
      469   );
      470 };
      471
      472 export default TeacherAssignmentsPage;

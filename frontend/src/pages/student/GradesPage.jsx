import { useState, useEffect } from 'react';
import api from '../../api/axios';

const StudentGradesPage = () => {
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedClasses, setExpandedClasses] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classesRes, gradesRes] = await Promise.all([
        api.get('/student/classes/enrolled'),
        api.get('/student/grades')
      ]);
      setEnrolledClasses(classesRes.data.data || []);
      setGrades(gradesRes.data.data || []);

      // Expand first class by default
      if (classesRes.data.data?.length > 0) {
        setExpandedClasses({ [classesRes.data.data[0].id]: true });
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleClass = (classId) => {
    setExpandedClasses(prev => ({
      ...prev,
      [classId]: !prev[classId]
    }));
  };

  const getGradeColor = (letter) => {
    switch (letter) {
      case 'A': return 'text-green-600 bg-green-100';
      case 'B': return 'text-blue-600 bg-blue-100';
      case 'C': return 'text-yellow-600 bg-yellow-100';
      case 'D': return 'text-orange-600 bg-orange-100';
      default: return 'text-red-600 bg-red-100';
    }
  };

  const getClassGrades = (className) => {
    return grades.filter(g => g.class_name === className);
  };

  const getClassAverage = (className) => {
    const classGrades = getClassGrades(className);
    if (classGrades.length === 0) return null;
    const avg = classGrades.reduce((sum, g) => sum + parseFloat(g.percentage), 0) / classGrades.length;
    return avg;
  };

  const getLetterGrade = (percentage) => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  const getCategoryBorderColor = (subjectCode) => {
    if (!subjectCode) return 'border-l-gray-400';
    if (subjectCode.startsWith('ENG')) return 'border-l-blue-500';
    if (subjectCode.startsWith('MATH')) return 'border-l-indigo-500';
    if (['SCI', 'PHY', 'CHEM', 'BIO'].some(s => subjectCode.startsWith(s))) return 'border-l-teal-500';
    if (subjectCode.startsWith('HIST')) return 'border-l-amber-500';
    if (subjectCode.startsWith('PE')) return 'border-l-rose-500';
    if (['ART', 'MUS', 'CS'].some(s => subjectCode.startsWith(s))) return 'border-l-pink-500';
    return 'border-l-gray-400';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {enrolledClasses.length === 0 ? (
        <div className="text-center py-12 text-gray-500 card">
          You are not enrolled in any classes yet.
        </div>
      ) : (
        enrolledClasses.map((cls) => {
          const classGrades = getClassGrades(cls.name);
          const average = getClassAverage(cls.name);
          const isExpanded = expandedClasses[cls.id];

          return (
            <div
              key={cls.id}
              className={`card border-l-4 ${getCategoryBorderColor(cls.subject_code)} overflow-hidden`}
            >
              {/* Class Header - Clickable */}
              <button
                onClick={() => toggleClass(cls.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors -m-6 mb-0"
              >
                <div className="flex items-center gap-4">
                  <div className={`transform transition-transform ${isExpanded ? 'rotate-90' : ''}`}>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                    <p className="text-sm text-gray-500">
                      {cls.subject_name} | {cls.teacher_first_name} {cls.teacher_last_name}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">{classGrades.length} graded</p>
                  </div>
                  {average !== null && (
                    <span className={`px-3 py-1 rounded-full text-lg font-semibold ${getGradeColor(getLetterGrade(average))}`}>
                      {getLetterGrade(average)}
                    </span>
                  )}
                  {average === null && (
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
                      No grades
                    </span>
                  )}
                </div>
              </button>

              {/* Expanded Content - Assignments */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  {classGrades.length === 0 ? (
                    <p className="text-gray-500 text-sm py-4 text-center">
                      No graded assignments yet for this class.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-lg text-xs font-medium text-gray-600 uppercase">
                        <div className="col-span-5">Assignment</div>
                        <div className="col-span-2 text-center">Type</div>
                        <div className="col-span-2 text-center">Score</div>
                        <div className="col-span-2 text-center">Percentage</div>
                        <div className="col-span-1 text-center">Grade</div>
                      </div>

                      {/* Assignment Rows */}
                      {classGrades.map((grade) => (
                        <div
                          key={grade.id}
                          className="grid grid-cols-12 gap-4 px-4 py-3 bg-white border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="col-span-5">
                            <p className="font-medium text-gray-900">{grade.assignment_title}</p>
                            <p className="text-xs text-gray-500">
                              Graded {new Date(grade.graded_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="col-span-2 flex items-center justify-center">
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs capitalize">
                              {grade.assignment_type}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center justify-center font-medium">
                            {grade.points_earned} / {grade.max_points}
                          </div>
                          <div className="col-span-2 flex items-center justify-center font-medium">
                            {parseFloat(grade.percentage).toFixed(1)}%
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <span className={`px-2 py-1 rounded-full text-sm font-bold ${getGradeColor(grade.letter_grade)}`}>
                              {grade.letter_grade}
                            </span>
                          </div>
                        </div>
                      ))}

                      {/* Class Summary */}
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg mt-2">
                        <div className="col-span-5 font-semibold text-blue-900">Class Average</div>
                        <div className="col-span-2"></div>
                        <div className="col-span-2 flex items-center justify-center font-semibold text-blue-900">
                          {classGrades.reduce((sum, g) => sum + parseFloat(g.points_earned), 0).toFixed(0)} / {classGrades.reduce((sum, g) => sum + parseFloat(g.max_points), 0).toFixed(0)}
                        </div>
                        <div className="col-span-2 flex items-center justify-center font-semibold text-blue-900">
                          {average?.toFixed(1)}%
                        </div>
                        <div className="col-span-1 flex items-center justify-center">
                          <span className={`px-2 py-1 rounded-full text-sm font-bold ${getGradeColor(getLetterGrade(average))}`}>
                            {getLetterGrade(average)}
                          </span>
                        </div>
                      </div>

                      {/* Feedback section if any */}
                      {classGrades.some(g => g.feedback) && (
                        <div className="mt-4 space-y-2">
                          <h4 className="text-sm font-semibold text-gray-700">Teacher Feedback</h4>
                          {classGrades.filter(g => g.feedback).map((grade) => (
                            <div key={grade.id} className="p-3 bg-blue-50 rounded-lg">
                              <p className="text-xs font-medium text-blue-800 mb-1">{grade.assignment_title}</p>
                              <p className="text-sm text-blue-900">{grade.feedback}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default StudentGradesPage;

import { useState, useEffect } from 'react';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';

const StudentEnrollmentPage = () => {
  const { user } = useAuth();
  const [availableClasses, setAvailableClasses] = useState([]);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [studentGradeLevel, setStudentGradeLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);
  const [view, setView] = useState('available');
  const [filter, setFilter] = useState('recommended');
  const [confirmWithdraw, setConfirmWithdraw] = useState(null);
  const [enrollmentTestModal, setEnrollmentTestModal] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [availableRes, enrolledRes] = await Promise.all([
        api.get('/student/classes/available'),
        api.get('/student/classes/enrolled')
      ]);
      setAvailableClasses(availableRes.data.data || []);
      setEnrolledClasses(enrolledRes.data.data || []);
      setStudentGradeLevel(availableRes.data.studentGradeLevel);
    } catch (error) {
      console.error('Failed to load classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (cls) => {
    // Check if it's an advanced class requiring enrollment test
    if (cls.enrollment_test_required && !cls.test_passed) {
      setEnrollmentTestModal(cls);
      return;
    }

    await performEnrollment(cls.id, false);
  };

  const performEnrollment = async (classId, confirmEnrollmentTest = false) => {
    setEnrolling(classId);
    try {
      await api.post(`/student/classes/${classId}/enroll`, { confirmEnrollmentTest });
      setEnrollmentTestModal(null);
      await loadData();
    } catch (error) {
      console.error('Failed to enroll:', error);
      if (error.response?.data?.requiresTestConfirmation) {
        setEnrollmentTestModal(availableClasses.find(c => c.id === classId));
      } else {
        alert(error.response?.data?.error || 'Failed to enroll in class');
      }
    } finally {
      setEnrolling(null);
    }
  };

  const handleWithdraw = async (classId) => {
    setWithdrawing(classId);
    try {
      await api.delete(`/student/classes/${classId}/withdraw`);
      setConfirmWithdraw(null);
      await loadData();
    } catch (error) {
      console.error('Failed to withdraw:', error);
      alert(error.response?.data?.error || 'Failed to withdraw from class');
    } finally {
      setWithdrawing(null);
    }
  };

  const formatSchedule = (schedule) => {
    if (!schedule) return 'Schedule TBD';
    if (typeof schedule === 'string') {
      try {
        schedule = JSON.parse(schedule);
      } catch {
        return schedule;
      }
    }
    if (schedule.days && schedule.time) {
      return `${schedule.days} at ${schedule.time}`;
    }
    if (schedule.period) {
      return `Period ${schedule.period}`;
    }
    return 'See details';
  };

  const getSubjectCategory = (subjectCode) => {
    if (!subjectCode) return 'other';
    if (subjectCode.startsWith('ENG')) return 'english';
    if (subjectCode.startsWith('HIST')) return 'history';
    if (subjectCode.startsWith('MATH')) return 'math';
    if (['SCI', 'PHY', 'CHEM', 'BIO'].some(s => subjectCode.startsWith(s))) return 'science';
    if (subjectCode.startsWith('PE')) return 'pe';
    if (['ART', 'MUS', 'CS'].some(s => subjectCode.startsWith(s))) return 'electives';
    return 'other';
  };

  const getFilteredClasses = () => {
    if (filter === 'all') return availableClasses;
    if (filter === 'recommended') return availableClasses.filter(c => c.is_recommended);
    if (filter === 'advanced') return availableClasses.filter(c => c.is_advanced);
    if (filter === 'mygrade') return availableClasses.filter(c => c.grade_level === studentGradeLevel);
    if (['english', 'history', 'math', 'science', 'pe', 'electives'].includes(filter)) {
      return availableClasses.filter(c => getSubjectCategory(c.subject_code) === filter);
    }
    return availableClasses;
  };

  const filteredClasses = getFilteredClasses();
  const recommendedCount = availableClasses.filter(c => c.is_recommended).length;
  const advancedCount = availableClasses.filter(c => c.is_advanced).length;

  // Core subjects that must be covered (one each)
  const coreSubjects = ['english', 'math', 'science', 'history', 'pe'];

  // Calculate enrolled counts by category
  const getEnrolledByCategory = (category) => {
    return enrolledClasses.filter(c => getSubjectCategory(c.subject_code) === category).length;
  };

  // Check which core subjects are covered
  const getCoveredSubjects = () => {
    const covered = {};
    coreSubjects.forEach(subject => {
      covered[subject] = getEnrolledByCategory(subject) > 0;
    });
    return covered;
  };

  const coveredSubjects = getCoveredSubjects();
  const coveredCount = Object.values(coveredSubjects).filter(Boolean).length;
  const missingSubjects = coreSubjects.filter(s => !coveredSubjects[s]);

  const electivesEnrolled = getEnrolledByCategory('electives');
  const totalEnrolled = enrolledClasses.length;
  const minimumCoreSubjects = 5; // Must have one of each core subject
  const minimumElectives = 2;

  // Check if enrollment requirements are met
  const coreRequirementsMet = coveredCount >= minimumCoreSubjects;
  const electivesRequirementMet = electivesEnrolled >= minimumElectives;
  const allRequirementsMet = coreRequirementsMet && electivesRequirementMet;

  // Check if enrollment is complete (no more classes can be added)
  const maxClasses = minimumCoreSubjects + minimumElectives; // 7 total
  const enrollmentComplete = allRequirementsMet && totalEnrolled >= maxClasses;

  const getSubjectDisplayName = (subject) => {
    const names = {
      english: 'English',
      math: 'Math',
      science: 'Science',
      history: 'History',
      pe: 'PE'
    };
    return names[subject] || subject;
  };

  const getSubjectColor = (subject, covered) => {
    if (covered) return 'bg-green-100 text-green-800 border-green-300';
    const colors = {
      english: 'bg-blue-50 text-blue-600 border-blue-200',
      math: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      science: 'bg-teal-50 text-teal-600 border-teal-200',
      history: 'bg-amber-50 text-amber-600 border-amber-200',
      pe: 'bg-rose-50 text-rose-600 border-rose-200'
    };
    return colors[subject] || 'bg-gray-50 text-gray-600 border-gray-200';
  };

  // Check if a class cannot be enrolled
  const isEnrollmentDisabled = (cls) => {
    // If enrollment is complete, disable all
    if (enrollmentComplete) return true;

    const category = getSubjectCategory(cls.subject_code);

    // For electives, check if we already have 2
    if (category === 'electives' || category === 'other') {
      return electivesEnrolled >= minimumElectives;
    }

    // For core subjects, check if already enrolled in that subject
    return coveredSubjects[category] === true;
  };

  // Get reason why enrollment is disabled
  const getDisabledReason = (cls) => {
    if (enrollmentComplete) return 'Enrollment Complete';

    const category = getSubjectCategory(cls.subject_code);

    if (category === 'electives' || category === 'other') {
      if (electivesEnrolled >= minimumElectives) return 'Electives Full';
    } else if (coveredSubjects[category]) {
      return `${getSubjectDisplayName(category)} Taken`;
    }

    return null;
  };

  // Check if class is recommended for a missing subject
  const isRecommendedForMissing = (cls) => {
    if (enrollmentComplete) return false;
    const category = getSubjectCategory(cls.subject_code);

    // For core subjects - recommend if that subject is missing and class is for student's grade
    if (coreSubjects.includes(category) && !coveredSubjects[category]) {
      return cls.is_recommended || cls.grade_level === studentGradeLevel;
    }

    // For electives - recommend if we still need electives
    if ((category === 'electives' || category === 'other') && electivesEnrolled < minimumElectives) {
      return cls.is_recommended || cls.grade_level === studentGradeLevel;
    }

    return false;
  };

  const getCategoryBorderColor = (subjectCode) => {
    const category = getSubjectCategory(subjectCode);
    switch (category) {
      case 'english': return 'border-l-blue-500';
      case 'math': return 'border-l-indigo-500';
      case 'science': return 'border-l-teal-500';
      case 'history': return 'border-l-amber-500';
      case 'pe': return 'border-l-rose-500';
      case 'electives': return 'border-l-pink-500';
      default: return 'border-l-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enrollment Requirements */}
      <div className={`border rounded-lg p-4 ${allRequirementsMet ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-4">
            {studentGradeLevel && (
              <p className={allRequirementsMet ? 'text-green-800' : 'text-blue-800'}>
                <span className="font-medium">Grade Level:</span> {studentGradeLevel}
              </p>
            )}
            {allRequirementsMet && (
              <span className="px-3 py-1 rounded-full bg-green-100 text-green-800 text-sm font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Requirements Met
              </span>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm ${electivesRequirementMet ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'}`}>
            Electives: {electivesEnrolled}/{minimumElectives} min
          </span>
        </div>

        {/* Core Subjects Status */}
        <div className="mt-2">
          <p className="text-sm text-gray-600 mb-2">Core Subjects (one required from each):</p>
          <div className="flex flex-wrap gap-2">
            {coreSubjects.map(subject => (
              <span
                key={subject}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border flex items-center gap-1.5 ${getSubjectColor(subject, coveredSubjects[subject])}`}
              >
                {coveredSubjects[subject] ? (
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                )}
                {getSubjectDisplayName(subject)}
              </span>
            ))}
          </div>
        </div>

        {/* Missing subjects warning */}
        {missingSubjects.length > 0 && (
          <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded-lg">
            <p className="text-sm text-orange-800">
              <span className="font-medium">Still needed:</span> {missingSubjects.map(s => getSubjectDisplayName(s)).join(', ')}
            </p>
          </div>
        )}
      </div>

      {/* Tab Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => setView('available')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'available'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Available Classes ({availableClasses.length})
        </button>
        <button
          onClick={() => setView('enrolled')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'enrolled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          My Enrolled Classes ({enrolledClasses.length})
        </button>
      </div>

      {/* Available Classes */}
      {view === 'available' && (
        <>
          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('recommended')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === 'recommended'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              Recommended ({recommendedCount})
            </button>
            <button
              onClick={() => setFilter('english')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'english'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
              }`}
            >
              English
              {coveredSubjects.english && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <button
              onClick={() => setFilter('math')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'math'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
              }`}
            >
              Math
              {coveredSubjects.math && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <button
              onClick={() => setFilter('science')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'science'
                  ? 'bg-teal-600 text-white'
                  : 'bg-teal-100 text-teal-700 hover:bg-teal-200'
              }`}
            >
              Science
              {coveredSubjects.science && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <button
              onClick={() => setFilter('history')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'history'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              }`}
            >
              History
              {coveredSubjects.history && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <button
              onClick={() => setFilter('pe')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'pe'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
              }`}
            >
              PE
              {coveredSubjects.pe && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <button
              onClick={() => setFilter('electives')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors flex items-center gap-1 ${
                filter === 'electives'
                  ? 'bg-pink-600 text-white'
                  : 'bg-pink-100 text-pink-700 hover:bg-pink-200'
              }`}
            >
              Electives ({electivesEnrolled}/{minimumElectives})
              {electivesRequirementMet && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
            </button>
            <button
              onClick={() => setFilter('advanced')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === 'advanced'
                  ? 'bg-purple-600 text-white'
                  : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
              }`}
            >
              Advanced/AP ({advancedCount})
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-gray-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>

          <div className="space-y-4">
            {filteredClasses.length === 0 ? (
              <div className="text-center py-12 text-gray-500 card">
                No classes available for this filter
              </div>
            ) : (
              filteredClasses.map((cls) => {
                const isHighlighted = isRecommendedForMissing(cls) && !isEnrollmentDisabled(cls);
                return (
                <div
                  key={cls.id}
                  className={`card border-l-4 transition-all ${
                    isHighlighted
                      ? 'border-l-green-500 ring-2 ring-green-200 bg-green-50/50'
                      : cls.is_advanced ? 'border-l-purple-500' :
                        cls.is_recommended ? 'border-l-green-500' :
                        getCategoryBorderColor(cls.subject_code)
                  }`}
                >
                  {/* Recommended Banner */}
                  {isHighlighted && (
                    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-green-200">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm font-medium text-green-700">
                        Recommended - Fills your {getSubjectDisplayName(getSubjectCategory(cls.subject_code))} requirement
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        {cls.subject_code && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                            {cls.subject_code}
                          </span>
                        )}
                        {isHighlighted && (
                          <span className="px-2 py-0.5 bg-green-500 text-white rounded text-xs font-medium animate-pulse">
                            Recommended
                          </span>
                        )}
                        {!isHighlighted && cls.is_recommended && (
                          <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                            Recommended
                          </span>
                        )}
                        {cls.is_advanced && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded text-xs font-medium">
                            Advanced/AP
                          </span>
                        )}
                        {cls.enrollment_test_required && (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                            Test Required
                          </span>
                        )}
                      </div>

                      <p className="text-gray-600 mb-3">{cls.subject_name || 'General'}</p>

                      {cls.prerequisite_description && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-2 mb-3 text-sm text-orange-800">
                          <strong>Prerequisites:</strong> {cls.prerequisite_description}
                        </div>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Teacher</span>
                          <p className="font-medium">
                            {cls.teacher_first_name && cls.teacher_last_name
                              ? `${cls.teacher_first_name} ${cls.teacher_last_name}`
                              : 'TBA'}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-500">Room</span>
                          <p className="font-medium">{cls.room_number || 'TBA'}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Schedule</span>
                          <p className="font-medium">{formatSchedule(cls.schedule)}</p>
                        </div>
                        <div>
                          <span className="text-gray-500">Seats</span>
                          <p className="font-medium">
                            {cls.enrolled_count}/{cls.max_students}
                            {parseInt(cls.enrolled_count) >= cls.max_students && (
                              <span className="text-red-600 ml-1">(Full)</span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                          Grade {cls.grade_level}
                        </span>
                        {cls.section && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                            Section {cls.section}
                          </span>
                        )}
                        {cls.credits && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                            {cls.credits} Credit{cls.credits > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col items-end gap-1">
                      {getDisabledReason(cls) && (
                        <span className="text-xs text-orange-600 font-medium">
                          {getDisabledReason(cls)}
                        </span>
                      )}
                      <button
                        onClick={() => handleEnroll(cls)}
                        disabled={enrolling === cls.id || parseInt(cls.enrolled_count) >= cls.max_students || isEnrollmentDisabled(cls)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                          parseInt(cls.enrolled_count) >= cls.max_students || isEnrollmentDisabled(cls)
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {enrolling === cls.id ? 'Enrolling...' : getDisabledReason(cls) || 'Enroll'}
                      </button>
                    </div>
                  </div>
                </div>
              );})
            )}
          </div>
        </>
      )}

      {/* Enrolled Classes */}
      {view === 'enrolled' && (
        <div className="space-y-4">
          {enrolledClasses.length === 0 ? (
            <div className="text-center py-12 text-gray-500 card">
              You are not enrolled in any classes yet
            </div>
          ) : (
            enrolledClasses.map((cls) => {
              const category = getSubjectCategory(cls.subject_code);
              return (
              <div key={cls.id} className={`card border-l-4 ${getCategoryBorderColor(cls.subject_code)}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                      {cls.subject_code && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {cls.subject_code}
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-medium">
                        {category === 'electives' ? 'Elective' : getSubjectDisplayName(category)}
                      </span>
                    </div>

                    <p className="text-gray-600 mb-3">{cls.subject_name || 'General'}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Teacher</span>
                        <p className="font-medium">
                          {cls.teacher_first_name && cls.teacher_last_name
                            ? `${cls.teacher_first_name} ${cls.teacher_last_name}`
                            : 'TBA'}
                        </p>
                      </div>
                      <div>
                        <span className="text-gray-500">Room</span>
                        <p className="font-medium">{cls.room_number || 'TBA'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Schedule</span>
                        <p className="font-medium">{formatSchedule(cls.schedule)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Enrolled On</span>
                        <p className="font-medium">
                          {new Date(cls.enrolled_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {cls.credits && (
                      <div className="mt-3">
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                          {cls.credits} Credit{cls.credits > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setConfirmWithdraw(cls)}
                    className="ml-4 px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            );})
          )}
        </div>
      )}

      {/* Enrollment Test Confirmation Modal */}
      {enrollmentTestModal && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setEnrollmentTestModal(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Advanced Class Enrollment
                </h3>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-orange-800 font-medium mb-1">
                    {enrollmentTestModal.name}
                  </p>
                  <p className="text-sm text-orange-700">
                    {enrollmentTestModal.prerequisite_description}
                  </p>
                </div>

                <p className="text-gray-600 text-center mb-6">
                  Have you passed the enrollment test for this advanced class?
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setEnrollmentTestModal(null)}
                    className="flex-1 btn btn-secondary"
                  >
                    No, Cancel
                  </button>
                  <button
                    onClick={() => performEnrollment(enrollmentTestModal.id, true)}
                    disabled={enrolling === enrollmentTestModal.id}
                    className="flex-1 btn btn-primary"
                  >
                    {enrolling === enrollmentTestModal.id ? 'Enrolling...' : 'Yes, I Passed'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Withdraw Confirmation Modal */}
      {confirmWithdraw && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setConfirmWithdraw(null)}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
              <div className="p-6">
                <div className="mx-auto w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">
                  Withdraw from Class
                </h3>
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to withdraw from <strong>{confirmWithdraw.name}</strong>?
                  This action cannot be undone easily.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmWithdraw(null)}
                    className="flex-1 btn btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleWithdraw(confirmWithdraw.id)}
                    disabled={withdrawing === confirmWithdraw.id}
                    className="flex-1 btn btn-danger"
                  >
                    {withdrawing === confirmWithdraw.id ? 'Withdrawing...' : 'Withdraw'}
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

export default StudentEnrollmentPage;

import { useState, useEffect } from 'react';
import api from '../../api/axios';

const StudentSchedulePage = () => {
  const [schedule, setSchedule] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [scheduleRes, announcementsRes] = await Promise.all([
        api.get('/student/schedule'),
        api.get('/student/announcements')
      ]);
      setSchedule(scheduleRes.data.data || []);
      setAnnouncements(announcementsRes.data.data || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'border-l-red-500 bg-red-50';
      case 'high': return 'border-l-orange-500 bg-orange-50';
      case 'normal': return 'border-l-blue-500 bg-blue-50';
      case 'low': return 'border-l-gray-500 bg-gray-50';
      default: return 'border-l-blue-500 bg-blue-50';
    }
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

  const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getPeriodLabel = (periodNum) => {
    if (!periodNum) return '';
    const suffixes = { 1: 'st', 2: 'nd', 3: 'rd' };
    const suffix = suffixes[periodNum] || 'th';
    return `${periodNum}${suffix} Period`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Class Schedule Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">My Class Schedule</h2>
        {schedule.length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            Not enrolled in any classes
          </div>
        ) : (
          <div className="space-y-3">
            {schedule.map((cls) => (
              <div
                key={cls.id}
                className={`card border-l-4 ${getCategoryBorderColor(cls.subject_code)} hover:shadow-md transition-shadow`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  {/* Left: Period & Time */}
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center justify-center w-20 h-20 bg-gray-100 rounded-lg">
                      {cls.period_number ? (
                        <>
                          <span className="text-2xl font-bold text-gray-800">{cls.period_number}</span>
                          <span className="text-xs text-gray-500">Period</span>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">No period</span>
                      )}
                    </div>

                    {/* Class Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900">{cls.name}</h3>
                        {cls.is_advanced && (
                          <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                            Advanced
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{cls.subject_name}</p>
                      {cls.teacher_first_name && (
                        <p className="text-sm text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {cls.teacher_first_name} {cls.teacher_last_name}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right: Details */}
                  <div className="flex flex-wrap gap-3 md:flex-col md:items-end">
                    {/* Time */}
                    {(cls.start_time || cls.end_time) && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          {formatTime(cls.start_time)}
                          {cls.start_time && cls.end_time && ' - '}
                          {formatTime(cls.end_time)}
                        </span>
                      </div>
                    )}

                    {/* Room */}
                    {cls.room_number && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span>Room {cls.room_number}</span>
                      </div>
                    )}

                    {/* Grade Level */}
                    {cls.grade_level && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        Grade {cls.grade_level}
                      </span>
                    )}
                  </div>
                </div>

                {/* Schedule Days (if available) */}
                {cls.schedule && (
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>
                        {typeof cls.schedule === 'object'
                          ? `${cls.schedule.days || ''} ${cls.schedule.time || ''}`.trim()
                          : cls.schedule}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Card */}
      {schedule.length > 0 && (
        <div className="card bg-blue-50 border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-900 mb-3">Schedule Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{schedule.length}</p>
              <p className="text-xs text-blue-700">Total Classes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">
                {schedule.filter(c => c.is_advanced).length}
              </p>
              <p className="text-xs text-purple-700">Advanced</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-teal-600">
                {new Set(schedule.map(c => c.subject_code?.slice(0, 3)).filter(Boolean)).size}
              </p>
              <p className="text-xs text-teal-700">Subjects</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-amber-600">
                {new Set(schedule.map(c => `${c.teacher_first_name} ${c.teacher_last_name}`).filter(n => n.trim())).size}
              </p>
              <p className="text-xs text-amber-700">Teachers</p>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Section */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Announcements</h2>
        <div className="space-y-4">
          {announcements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 card">
              No announcements
            </div>
          ) : (
            announcements.map((announcement) => (
              <div
                key={announcement.id}
                className={`card border-l-4 ${getPriorityColor(announcement.priority)}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                  {!announcement.read_at && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{announcement.content}</p>
                <div className="mt-3 flex justify-between items-center text-xs text-gray-500">
                  <span>
                    By {announcement.author_first_name} {announcement.author_last_name}
                  </span>
                  <span>{new Date(announcement.published_at).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentSchedulePage;

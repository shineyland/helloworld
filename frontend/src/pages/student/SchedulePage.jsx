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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">My Classes</h2>
          <div className="space-y-4">
            {schedule.length === 0 ? (
              <div className="text-center py-12 text-gray-500 card">
                Not enrolled in any classes
              </div>
            ) : (
              schedule.map((cls, index) => (
                <div key={index} className="card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">{cls.name}</h3>
                      <p className="text-sm text-gray-500">{cls.subject_name}</p>
                    </div>
                    {cls.room_number && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        Room {cls.room_number}
                      </span>
                    )}
                  </div>
                  {cls.schedule && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600">Schedule information available</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

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
    </div>
  );
};

export default StudentSchedulePage;

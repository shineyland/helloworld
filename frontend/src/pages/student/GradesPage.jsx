import { useState, useEffect } from 'react';
import api from '../../api/axios';

const StudentGradesPage = () => {
  const [grades, setGrades] = useState([]);
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('list');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [gradesRes, summaryRes] = await Promise.all([
        api.get('/student/grades'),
        api.get('/student/grades/summary')
      ]);
      setGrades(gradesRes.data.data || []);
      setSummary(summaryRes.data.data || []);
    } catch (error) {
      console.error('Failed to load grades:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <button
          onClick={() => setView('list')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'list'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          All Grades
        </button>
        <button
          onClick={() => setView('summary')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === 'summary'
              ? 'bg-primary-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-100'
          }`}
        >
          Summary by Class
        </button>
      </div>

      {view === 'summary' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {summary.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 card">
              No grade data available yet
            </div>
          ) : (
            summary.map((item) => (
              <div key={item.class_id} className="card">
                <h3 className="text-lg font-semibold text-gray-900">{item.class_name}</h3>
                <p className="text-sm text-gray-500 mb-4">{item.subject_name}</p>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Graded Assignments</span>
                    <span className="font-medium">{item.graded_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Average</span>
                    <span className={`font-semibold px-2 py-0.5 rounded ${
                      parseFloat(item.average_percentage) >= 90 ? 'text-green-600 bg-green-100' :
                      parseFloat(item.average_percentage) >= 80 ? 'text-blue-600 bg-blue-100' :
                      parseFloat(item.average_percentage) >= 70 ? 'text-yellow-600 bg-yellow-100' :
                      'text-red-600 bg-red-100'
                    }`}>
                      {item.average_percentage ? parseFloat(item.average_percentage).toFixed(1) + '%' : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Points</span>
                    <span className="font-medium">
                      {item.total_points || 0} / {item.total_max_points || 0}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {grades.length === 0 ? (
            <div className="text-center py-12 text-gray-500 card">
              No grades yet. Complete some assignments to see your grades here.
            </div>
          ) : (
            grades.map((grade) => (
              <div key={grade.id} className="card">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{grade.assignment_title}</h3>
                    <p className="text-sm text-gray-500">
                      {grade.class_name} | {grade.subject_name}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-lg font-semibold ${getGradeColor(grade.letter_grade)}`}>
                    {grade.letter_grade}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mt-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Score</p>
                    <p className="text-lg font-semibold">{grade.points_earned} / {grade.max_points}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Percentage</p>
                    <p className="text-lg font-semibold">{parseFloat(grade.percentage).toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 uppercase">Type</p>
                    <p className="text-lg font-semibold capitalize">{grade.assignment_type}</p>
                  </div>
                </div>

                {grade.feedback && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-600 uppercase mb-1">Teacher Feedback</p>
                    <p className="text-sm text-blue-900">{grade.feedback}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-3">
                  Graded on {new Date(grade.graded_at).toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default StudentGradesPage;

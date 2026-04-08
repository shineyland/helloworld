import { useState, useEffect } from 'react';
import api from '../../api/axios';

const StudentAssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, [filter]);

  const loadAssignments = async () => {
    setLoading(true);
    try {
      const endpoint = filter === 'pending' ? '/student/assignments/pending' :
                       filter === 'completed' ? '/student/assignments/completed' :
                       '/student/assignments';
      const response = await api.get(endpoint);
      setAssignments(response.data.data || []);
    } catch (error) {
      console.error('Failed to load assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!submissionText.trim()) {
      alert('Please enter your submission');
      return;
    }

    setSubmitting(true);
    try {
      await api.post(`/student/assignments/${selectedAssignment.id}/submit`, {
        submissionText
      });
      setSelectedAssignment(null);
      setSubmissionText('');
      loadAssignments();
    } catch (error) {
      console.error('Failed to submit assignment:', error);
      alert(error.response?.data?.error || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (assignment) => {
    if (assignment.submission_status === 'graded') {
      return <span className="bg-green-100 text-green-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Graded</span>;
    }
    if (assignment.submission_id) {
      return <span className="bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Submitted</span>;
    }
    if (new Date(assignment.due_date) < new Date()) {
      return <span className="bg-red-100 text-red-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Overdue</span>;
    }
    return <span className="bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full text-xs font-medium">Pending</span>;
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
        {['all', 'pending', 'completed'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            No assignments found
          </div>
        ) : (
          assignments.map((assignment) => (
            <div key={assignment.id} className="card">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                  <p className="text-sm text-gray-500">{assignment.class_name}</p>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(assignment)}
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 capitalize">
                    {assignment.assignment_type}
                  </span>
                </div>
              </div>

              {assignment.description && (
                <p className="text-gray-600 text-sm mt-2">{assignment.description}</p>
              )}

              <div className="mt-4 flex items-center justify-between text-sm">
                <div className="text-gray-500">
                  <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
                  <span className="mx-2">|</span>
                  <span>Points: {assignment.max_points}</span>
                </div>

                {assignment.letter_grade ? (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-600">Grade:</span>
                    <span className={`font-semibold ${
                      assignment.letter_grade === 'A' ? 'text-green-600' :
                      assignment.letter_grade === 'B' ? 'text-blue-600' :
                      assignment.letter_grade === 'C' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {assignment.letter_grade} ({assignment.points_earned}/{assignment.max_points})
                    </span>
                  </div>
                ) : !assignment.submission_id && new Date(assignment.due_date) > new Date() && (
                  <button
                    onClick={() => setSelectedAssignment(assignment)}
                    className="btn btn-primary text-sm"
                  >
                    Submit
                  </button>
                )}
              </div>

              {assignment.submitted_at && (
                <p className="text-xs text-gray-500 mt-2">
                  Submitted: {new Date(assignment.submitted_at).toLocaleString()}
                </p>
              )}
            </div>
          ))
        )}
      </div>

      {/* Submit Assignment Modal */}
      {selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Submit Assignment</h2>
            <p className="text-gray-600 mb-4">{selectedAssignment.title}</p>

            {selectedAssignment.instructions && (
              <div className="bg-gray-50 p-4 rounded-lg mb-4">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Instructions:</h4>
                <p className="text-sm text-gray-600">{selectedAssignment.instructions}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Submission</label>
              <textarea
                value={submissionText}
                onChange={(e) => setSubmissionText(e.target.value)}
                className="input"
                rows={6}
                placeholder="Enter your answer here..."
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setSelectedAssignment(null);
                  setSubmissionText('');
                }}
                className="flex-1 btn btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 btn btn-primary"
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignmentsPage;

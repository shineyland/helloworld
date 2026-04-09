import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ClassroomPage = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchStudents = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/teacher/students");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch students");
      }

      setStudents(data.students || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  if (loading) return <div style={{ padding: "24px" }}>Loading students...</div>;
  if (error) return <div style={{ padding: "24px" }}>{error}</div>;

  return (
    <div style={{ padding: "24px" }}>
      <h1>Classroom</h1>

      <table border="1" cellPadding="10" style={{ borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Username</th>
            <th>Email</th>
            <th>Status</th>
            <th>Profile</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student) => (
            <tr key={student._id}>
              <td>{student.firstName} {student.lastName}</td>
              <td>{student.username || "-"}</td>
              <td>{student.email}</td>
              <td>{student.status || (student.isActive ? "active" : "suspended")}</td>
              <td>
                <button onClick={() => navigate(`/teacher/student/${student._id}`)}>
                  Open Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClassroomPage;

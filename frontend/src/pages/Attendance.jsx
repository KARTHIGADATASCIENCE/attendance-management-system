import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Attendance() {
  const [students, setStudents] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState({});
  const [records, setRecords] = useState([]);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get('/students/').then(res => {
      setStudents(res.data);
      const init = {};
      res.data.forEach(s => { init[s.id] = 'present'; });
      setAttendance(init);
    });
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const res = await api.get('/attendance/');
    setRecords(res.data);
  };

  const handleBulkSubmit = async (e) => {
  e.preventDefault();
  const payload = {
    date: date,                              // top-level date
    records: students.map(s => ({
      student_id: s.id,
      status: attendance[s.id] || 'present',
    })),
  };
  await api.post('/attendance/bulk', payload);  // send object, not array
  setSaved(true);
  setTimeout(() => setSaved(false), 2500);
  fetchRecords();
};

  const downloadReport = async () => {
    const res = await api.get('/attendance/report', { responseType: 'blob' });
    const url = window.URL.createObjectURL(res.data);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'attendance_report.csv';
    a.click();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Mark Attendance</h2>
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="border rounded-lg px-3 py-2 text-sm" />
        </div>
        <form onSubmit={handleBulkSubmit}>
          <table className="w-full text-sm mb-4">
            <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">Student</th>
                <th className="px-4 py-3 text-left">Roll No</th>
                <th className="px-4 py-3 text-left">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(s => (
                <tr key={s.id} className="border-t">
                  <td className="px-4 py-3">{s.name}</td>
                  <td className="px-4 py-3">{s.roll_number}</td>
                  <td className="px-4 py-3">
                    <select value={attendance[s.id] || 'present'}
                      onChange={e => setAttendance({ ...attendance, [s.id]: e.target.value })}
                      className="border rounded px-2 py-1 text-sm">
                      <option value="present">✅ Present</option>
                      <option value="absent">❌ Absent</option>
                      <option value="late">⏰ Late</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex gap-3 items-center">
            <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
              Save Attendance
            </button>
            {saved && <span className="text-green-600 text-sm font-medium">✓ Saved successfully!</span>}
          </div>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Attendance Records</h2>
          <button onClick={downloadReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            ⬇ Download CSV Report
          </button>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Student ID</th>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {records.slice(0, 20).map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{r.student_id}</td>
                <td className="px-4 py-3">{r.date}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium
                    ${r.status === 'present' ? 'bg-green-100 text-green-700' :
                      r.status === 'absent' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'}`}>
                    {r.status}
                  </span>
                </td>
              </tr>
            ))}
            {records.length === 0 && (
              <tr><td colSpan={3} className="text-center py-8 text-gray-400">No records yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
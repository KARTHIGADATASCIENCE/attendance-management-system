import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Students() {
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ name: '', roll_number: '', class_name: '' });
  const [editId, setEditId] = useState(null);

  const fetchStudents = async () => {
    const res = await api.get('/students/');
    setStudents(res.data);
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await api.put(`/students/${editId}`, form);
      setEditId(null);
    } else {
      await api.post('/students/', form);
    }
    setForm({ name: '', roll_number: '', class_name: '' });
    fetchStudents();
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this student?')) {
      await api.delete(`/students/${id}`);
      fetchStudents();
    }
  };

  const handleEdit = (s) => {
    setEditId(s.id);
    setForm({ name: s.name, roll_number: s.roll_number, class_name: s.class_name });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Students</h2>

      <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl shadow mb-6 flex gap-3 flex-wrap">
        <input className="border rounded-lg px-3 py-2 flex-1 min-w-[150px]" placeholder="Name"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input className="border rounded-lg px-3 py-2 flex-1 min-w-[120px]" placeholder="Roll Number"
          value={form.roll_number} onChange={e => setForm({ ...form, roll_number: e.target.value })} required />
        <input className="border rounded-lg px-3 py-2 flex-1 min-w-[120px]" placeholder="Class"
          value={form.class_name} onChange={e => setForm({ ...form, class_name: e.target.value })} required />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
          {editId ? 'Update' : 'Add Student'}
        </button>
        {editId && (
          <button type="button" onClick={() => { setEditId(null); setForm({ name: '', roll_number: '', class_name: '' }); }}
            className="bg-gray-200 px-4 py-2 rounded-lg hover:bg-gray-300">
            Cancel
          </button>
        )}
      </form>

      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Roll No</th>
              <th className="px-4 py-3 text-left">Class</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">{s.name}</td>
                <td className="px-4 py-3">{s.roll_number}</td>
                <td className="px-4 py-3">{s.class_name}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => handleEdit(s)} className="text-blue-600 hover:underline text-xs">Edit</button>
                  <button onClick={() => handleDelete(s.id)} className="text-red-500 hover:underline text-xs">Delete</button>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">No students yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
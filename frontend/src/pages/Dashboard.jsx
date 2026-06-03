import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState({ students: 0, present: 0, absent: 0, late: 0 });

  useEffect(() => {
    Promise.all([
      api.get('/students/'),
      api.get('/attendance/'),
    ]).then(([s, a]) => {
      const today = new Date().toISOString().split('T')[0];
      const todayRecs = a.data.filter(r => r.date === today);
      setStats({
        students: s.data.length,
        present: todayRecs.filter(r => r.status === 'present').length,
        absent: todayRecs.filter(r => r.status === 'absent').length,
        late: todayRecs.filter(r => r.status === 'late').length,
      });
    });
  }, []);

  const cards = [
    { label: 'Total Students', value: stats.students, color: 'blue' },
    { label: "Present Today", value: stats.present, color: 'green' },
    { label: "Absent Today", value: stats.absent, color: 'red' },
    { label: "Late Today", value: stats.late, color: 'yellow' },
  ];

  const colorMap = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    green: 'bg-green-50 text-green-700 border-green-200',
    red: 'bg-red-50 text-red-700 border-red-200',
    yellow: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-6">Dashboard</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {cards.map(c => (
          <div key={c.label} className={`rounded-xl border p-5 ${colorMap[c.color]}`}>
            <p className="text-sm opacity-70">{c.label}</p>
            <p className="text-4xl font-bold mt-1">{c.value}</p>
          </div>
        ))}
      </div>
      <p className="mt-6 text-gray-500 text-sm">
        📅 Today: {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
      </p>
    </div>
  );
}
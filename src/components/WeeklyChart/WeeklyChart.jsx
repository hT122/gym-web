import React, { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

const DAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

function getLast7Days() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d);
  }
  return days;
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: '10px', padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)' }}>
      <p style={{ margin: 0, fontSize: '12px', color: '#aaa', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</p>
      <p style={{ margin: '4px 0 0', fontSize: '18px', fontWeight: 900, color: '#111', fontFamily: 'Manrope, sans-serif' }}>
        {payload[0].value} {payload[0].value === 1 ? 'sesión' : 'sesiones'}
      </p>
    </div>
  );
};

export default function WeeklyChart({ historial }) {
  const data = useMemo(() => {
    const days = getLast7Days();
    return days.map((day) => {
      const next = new Date(day);
      next.setDate(next.getDate() + 1);
      const count = historial.filter((e) => {
        const fecha = new Date(e.fecha);
        return fecha >= day && fecha < next;
      }).length;
      return { dia: `${DAY_LABELS[day.getDay()]} ${day.getDate()}`, sesiones: count };
    });
  }, [historial]);

  const maxVal = Math.max(...data.map((d) => d.sesiones), 1);

  return (
    <div className="workout-card">
      <h3 className="card-title">Actividad semanal</h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barSize={28} margin={{ top: 8, right: 0, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="dia"
            tick={{ fontSize: 12, fill: '#aaa', fontFamily: 'Inter, sans-serif', fontWeight: 700 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            domain={[0, maxVal + 1]}
            tick={{ fontSize: 11, fill: '#ccc', fontFamily: 'Inter, sans-serif' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f5f5f5', radius: 8 }} />
          <Bar dataKey="sesiones" fill="#111" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

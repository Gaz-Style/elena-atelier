const fs = require('fs');
let c = fs.readFileSync('src/app/admin/taller-monitor/page.tsx', 'utf8');

const startTag = "{view === 'operations' && dayData && (";
const endTag = "{/* ── VISTA 2: MATRIZ DE TRABAJOS Y PAGOS ────────────────── */}";

const startIdx = c.indexOf(startTag);
const endIdx = c.indexOf(endTag);

if (startIdx === -1 || endIdx === -1) {
  console.error("Tags not found");
  process.exit(1);
}

const newView = `{view === 'operations' && dayData && (
              <div className="h-full overflow-auto bg-gray-100 flex flex-col gap-6 p-4">
                {dayData.days.map((day: any) => {
                  const dObj = new Date(day.dateStr + 'T12:00:00');
                  const dayName = dObj.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long' });
                  const isToday = day.dateStr === todayStr;

                  return (
                    <div key={day.dateStr} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col shrink-0 min-h-[60vh] max-h-[80vh]">
                      <div className={\`shrink-0 px-4 py-2 border-b font-bold uppercase tracking-widest text-xs flex items-center justify-between \${isToday ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-gray-50 text-gray-700 border-gray-200'}\`}>
                        <span>{dayName}</span>
                        {isToday && <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-600 text-[10px]">HOY</span>}
                      </div>
                      <div className="flex-1 flex overflow-hidden">
                        {/* Left: Seamstress columns (70%) */}
                        <div className="flex-1 overflow-auto p-4 flex gap-4">
                          {dayData.operators.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center">
                              <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Sin costureras activas</p>
                            </div>
                          ) : (
                            dayData.operators.map((op: any) => {
                              const tasks = day.tasksByOperator[op.id] || [];
                              const totalHours = tasks.reduce((sum: number, t: any) => sum + Number(t.duration_hours || 0), 0);
        
                              return (
                                <div key={op.id} className="flex-1 min-w-[240px] max-w-[400px] flex flex-col">
                                  {/* Operator Header */}
                                  <div className="bg-white shadow-sm rounded-t-xl border border-gray-200 border-b-0 px-4 py-3">
                                    <div className="flex items-center justify-between">
                                      <h3 className="font-bold text-base text-gray-900">{op.name}</h3>
                                      <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {totalHours}h / {op.daily_hours_capacity || 8}h
                                      </span>
                                    </div>
                                    {/* Mini progress bar */}
                                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                      <div
                                        className={\`h-full rounded-full transition-all duration-500 \${totalHours > (op.daily_hours_capacity || 8) ? 'bg-rose-500' : 'bg-emerald-500'}\`}
                                        style={{ width: \`\${Math.min(100, (totalHours / (op.daily_hours_capacity || 8)) * 100)}%\` }}
                                      />
                                    </div>
                                  </div>
        
                                  {/* Tasks list */}
                                  <div className="flex-1 bg-white rounded-b-xl border border-gray-200 border-t-0 overflow-auto p-3 space-y-2">
                                    {tasks.length === 0 ? (
                                      <div className="h-full flex items-center justify-center">
                                        <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Sin tareas este día</p>
                                      </div>
                                    ) : (
                                      tasks.map((task: any) => {
                                        const startH = task.start_hour || 9;
                                        const endH = startH + (Number(task.duration_hours) || 1);
                                        const isCostura = task.task_type === 'costura';
                                        const isCita = task.task_type === 'cita';
                                        const isEntrega = task.task_type === 'entrega';
        
                                        return (
                                          <div
                                            key={task.id}
                                            className={\`rounded-lg p-3 border transition-all \${
                                              isCita
                                                ? 'bg-blue-500/10 border-blue-500/30'
                                                : isEntrega
                                                  ? 'bg-amber-500/10 border-amber-500/30'
                                                  : 'bg-gray-50 border-gray-200'
                                            }\`}
                                          >
                                            <div className="flex items-start justify-between gap-2">
                                              <div className="flex-1 min-w-0">
                                                <p className={\`font-bold text-sm truncate \${isCita ? 'text-blue-700' : isEntrega ? 'text-amber-700' : 'text-gray-900'}\`}>
                                                  {task.description}
                                                </p>
                                                <p className="text-[11px] text-gray-500 mt-0.5 font-mono">
                                                  ⏱ {formatHour(startH)} — {formatHour(endH)} ({task.duration_hours || 1}h)
                                                </p>
                                              </div>
                                              <span className={\`shrink-0 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded \${
                                                isCita ? 'bg-blue-500/20 text-blue-600' : isEntrega ? 'bg-amber-500/20 text-amber-600' : 'bg-gray-100 text-gray-500'
                                              }\`}>
                                                {isCita ? '📅 Cita' : isEntrega ? '🎁 Entrega' : '✂️ Costura'}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      })
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>

                        {/* Right: Appointments + Deliveries (30%) */}
                        <aside className="w-[340px] shrink-0 border-l border-gray-200 flex flex-col overflow-hidden">
                          {/* Appointments section */}
                          <div className="flex-1 overflow-auto border-b border-gray-200">
                            <div className="sticky top-0 bg-gray-50 z-10 px-4 py-3 border-b border-gray-200">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Citas y Pruebas
                                <span className="ml-auto bg-blue-500/20 px-2 py-0.5 rounded-full text-[10px]">{day.appointments.length}</span>
                              </h3>
                            </div>
                            <div className="p-3 space-y-2">
                              {day.appointments.length === 0 ? (
                                <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-8">Sin citas este día</p>
                              ) : (
                                day.appointments.map((apt: any) => {
                                  const aptTime = new Date(apt.fecha_hora);
                                  const now = new Date();
                                  const diffMin = (aptTime.getTime() - now.getTime()) / 60000;
                                  const isImminent = isToday && diffMin > 0 && diffMin < 30;
                                  const isPast = isToday && diffMin < 0;
        
                                  return (
                                    <div
                                      key={apt.id}
                                      className={\`rounded-lg p-3 border transition-all \${
                                        isImminent
                                          ? 'bg-blue-500/15 border-blue-400/50 animate-pulse'
                                          : isPast
                                            ? 'bg-white border-gray-200 opacity-60'
                                            : 'bg-blue-500/5 border-blue-500/20'
                                      }\`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono font-bold text-blue-600">
                                          {formatTime(apt.fecha_hora)}
                                        </span>
                                        {isImminent && (
                                          <span className="text-[8px] bg-blue-500 text-gray-900 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full animate-bounce">
                                            Próxima
                                          </span>
                                        )}
                                        {isPast && (
                                          <span className="text-[8px] bg-gray-300 text-gray-700 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">
                                            Pasada
                                          </span>
                                        )}
                                      </div>
                                      <p className="font-bold text-sm text-gray-900 truncate">{apt.nombre}</p>
                                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                        {apt.tipo === 'prueba' ? '👗 ' : '📅 '}{apt.notas}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
        
                          {/* Deliveries section */}
                          <div className="flex-1 overflow-auto">
                            <div className="sticky top-0 bg-gray-50 z-10 px-4 py-3 border-b border-gray-200">
                              <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                                <Gift className="w-3.5 h-3.5" /> Retiros del Taller
                                <span className="ml-auto bg-amber-500/20 px-2 py-0.5 rounded-full text-[10px]">{day.deliveries.length}</span>
                              </h3>
                            </div>
                            <div className="p-3 space-y-2">
                              {day.deliveries.length === 0 ? (
                                <p className="text-center text-gray-400 text-xs font-bold uppercase tracking-widest py-8">Sin retiros este día</p>
                              ) : (
                                day.deliveries.map((del: any) => {
                                  const allReady = del.statuses.every((s: string) => s === 'ready');
                                  return (
                                    <div
                                      key={del.id}
                                      className={\`rounded-lg p-3 border \${allReady ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-amber-500/10 border-amber-500/30'}\`}
                                    >
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-mono font-bold text-amber-600">
                                          {formatTime(del.deadline)}
                                        </span>
                                        <span className={\`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full \${
                                          allReady ? 'bg-emerald-500 text-gray-900' : 'bg-amber-500/30 text-amber-600'
                                        }\`}>
                                          {allReady ? '✓ Listo' : '⏳ En Proceso'}
                                        </span>
                                      </div>
                                      <p className="font-bold text-sm text-gray-900 truncate">{del.customer_name}</p>
                                      <p className="text-[10px] text-gray-500 truncate mt-0.5">
                                        📦 {del.descriptions.join(', ') || 'Prenda'}
                                      </p>
                                    </div>
                                  );
                                })
                              )}
                            </div>
                          </div>
                        </aside>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            `;

c = c.substring(0, startIdx) + newView + c.substring(endIdx);
fs.writeFileSync('src/app/admin/taller-monitor/page.tsx', c);
console.log('DOM replaced successfully.');

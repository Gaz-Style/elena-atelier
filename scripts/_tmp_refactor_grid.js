const fs = require('fs');

const path = 'src/app/admin/planificador/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetLoopStart = `                                    {(viewMode === 'day' || viewMode === 'week') && activeDays.map((day, idx) => {
                                        const ds      = dateStr(day);
                                        const dow     = day.getDay();
                                        const isToday = ds === todayStr;
                                        return (
                                            <React.Fragment key={ds}>`;

const replacementLoopStart = `                                    {(viewMode === 'day' || viewMode === 'week') && activeDays.map((day, idx) => {
                                        const ds      = dateStr(day);
                                        const dow     = day.getDay();
                                        const isToday = ds === todayStr;
                                        
                                        // Calculate dynamic max end hour for the day
                                        let dayMaxEndHour = workshopEnd ? Number(workshopEnd.split(':')[0]) : 18;
                                        operators.forEach(op => {
                                            const cell = planner[op.id]?.[ds];
                                            if (cell && cell.tasks) {
                                                cell.tasks.forEach(t => {
                                                    const taskEnd = (t.startHour || 9) + (t.durationHours || 1);
                                                    if (taskEnd > dayMaxEndHour) dayMaxEndHour = taskEnd;
                                                });
                                            }
                                        });
                                        const startH = workshopStart ? Number(workshopStart.split(':')[0]) : 9;
                                        const dayHoursArray = [];
                                        for (let h = startH; h < dayMaxEndHour; h++) {
                                            dayHoursArray.push(h);
                                        }

                                        return (
                                            <React.Fragment key={ds}>`;

content = content.replace(targetLoopStart, replacementLoopStart);


const targetTimeline = `                                                <td className="w-16 align-top border-r border-slate-100 bg-slate-50/30">
                                                    <div className="relative w-full" style={{ height: \`\${hoursArray.length * 60}px\` }}>
                                                        {hoursArray.map((hour, i) => (
                                                            <div 
                                                                key={hour} 
                                                                className="absolute w-full h-[60px] flex items-center justify-center text-[10px] font-bold text-slate-400"
                                                                style={{ top: \`\${i * 60}px\` }}
                                                            >
                                                                {hour.toString().padStart(2, '0')}:00
                                                            </div>
                                                        ))}
                                                    </div>
                                                </td>`;

const replacementTimeline = `                                                <td className="w-16 align-top border-r border-slate-100 bg-slate-50/30">
                                                    <div className="relative w-full" style={{ height: \`\${dayHoursArray.length * 60}px\` }}>
                                                        {dayHoursArray.map((hour, i) => {
                                                            const isOvertime = hour >= 18;
                                                            return (
                                                                <div 
                                                                    key={hour} 
                                                                    className={\`absolute w-full h-[60px] flex items-center justify-center text-[10px] font-bold \${isOvertime ? 'bg-rose-50/50 text-rose-400 border-b border-rose-100/50' : 'text-slate-400'}\`}
                                                                    style={{ top: \`\${i * 60}px\` }}
                                                                >
                                                                    {hour.toString().padStart(2, '0')}:00
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </td>`;

content = content.replace(targetTimeline, replacementTimeline);

const targetGridLines = `                                                            <div className="relative w-full" style={{ height: \`\${hoursArray.length * 60}px\` }}>
                                                                {/* Grid Lines */}
                                                                {hoursArray.map((hour, i) => (
                                                                    <div 
                                                                        key={hour} 
                                                                        className="absolute w-full border-t border-slate-100/70"
                                                                        style={{ top: \`\${i * 60}px\`, left: 0, right: 0 }}
                                                                    />
                                                                ))}`;

const replacementGridLines = `                                                            <div className="relative w-full" style={{ height: \`\${dayHoursArray.length * 60}px\` }}>
                                                                {/* Grid Lines */}
                                                                {dayHoursArray.map((hour, i) => {
                                                                    const isOvertime = hour >= 18;
                                                                    return (
                                                                        <div 
                                                                            key={hour} 
                                                                            className={\`absolute w-full border-t border-slate-100/70 \${isOvertime ? 'bg-rose-50/30' : ''}\`}
                                                                            style={{ top: \`\${i * 60}px\`, height: '60px', left: 0, right: 0 }}
                                                                        />
                                                                    );
                                                                })}`;

content = content.replace(targetGridLines, replacementGridLines);

const targetTaskLoop = `                                                                {cell.tasks.map((task, taskIdx) => {
                                                                    const startIdx = task.startHour - (hoursArray[0] || 9);
                                                                    const top = Math.max(0, startIdx * 60);
                                                                    const height = (task.durationHours || 1) * 60;
                                                                    const style = TASK_ROW_STYLE[task.type];`;

const replacementTaskLoop = `                                                                {cell.tasks.map((task, taskIdx) => {
                                                                    const startIdx = (task.startHour || 9) - (dayHoursArray[0] || 9);
                                                                    const top = Math.max(0, startIdx * 60);
                                                                    const height = (task.durationHours || 1) * 60;
                                                                    const style = TASK_ROW_STYLE[task.type];`;

content = content.replace(targetTaskLoop, replacementTaskLoop);

const targetTaskLabel = `                                                                            <div className="text-[11px] font-bold leading-tight text-slate-700 truncate">
                                                                                {task.label}
                                                                            </div>
                                                                            {task.time && (
                                                                                <div className="text-[9px] font-medium text-slate-500 mt-0.5 truncate">
                                                                                    ⏱ {task.time}
                                                                                </div>
                                                                            )}`;

const replacementTaskLabel = `                                                                            <div className="text-[11px] font-bold leading-tight text-slate-700 truncate">
                                                                                {task.label}
                                                                            </div>
                                                                            <div className="text-[9px] font-medium text-slate-500 mt-0.5 truncate">
                                                                                ⏱ {(task.startHour || 9).toString().padStart(2, '0')}:00 ({task.durationHours || 1}h)
                                                                            </div>`;

content = content.replace(targetTaskLabel, replacementTaskLabel);

fs.writeFileSync(path, content, 'utf8');
console.log("Grid layout refactored successfully.");

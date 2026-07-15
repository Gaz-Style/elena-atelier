const fs = require('fs');

const path = 'src/app/admin/planificador/page.tsx';
let content = fs.readFileSync(path, 'utf8');

const targetStart = `                                        return (
                                                        <span className=\`text-3xl font-light leading-none mb-1 \${isToday ? 'text-amber-600 font-medium' : 'text-slate-700'}\`>
                                                            {day.getDate()}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                            {day.toLocaleDateString('es-CL',{month:'short'})}
                                                        </span>
                                                        {isToday && (
                                                            <span className="mt-3 px-2.5 py-1 bg-amber-500 text-white text-[9px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                                                Hoy
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>

                                                {/* TIMELINE CELL */}`;

const replacementStart = `                                        return (
                                            <React.Fragment key={ds}>
                                                {/* Day Header Row */}
                                                <tr className="bg-slate-50 border-b border-slate-200">
                                                    <td colSpan={operators.length + 1} className="p-3 border-r border-slate-100">
                                                        <div className="flex items-center gap-4 pl-2">
                                                            <div className="flex items-baseline gap-2">
                                                                <span className={\`text-sm font-extrabold uppercase tracking-widest \${isToday ? 'text-amber-600' : 'text-slate-700'}\`}>
                                                                    {DAY_NAMES[dow]}
                                                                </span>
                                                                <span className={\`text-lg font-light \${isToday ? 'text-amber-600' : 'text-slate-600'}\`}>
                                                                    {day.getDate()} {day.toLocaleDateString('es-CL',{month:'short'})}
                                                                </span>
                                                            </div>
                                                            {isToday && (
                                                                <span className="px-2.5 py-1 bg-amber-500 text-white text-[10px] font-bold uppercase tracking-widest rounded-full shadow-sm">
                                                                    Hoy
                                                                </span>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                                
                                                <tr className="border-b border-slate-100 last:border-0 group">
                                                    
                                                    {/* TIMELINE CELL */}`;

content = content.replace(targetStart, replacementStart);

const targetEnd = `                                                })}
                                            </tr>
                                        );`;
                                        
const replacementEnd = `                                                })}
                                                </tr>
                                            </React.Fragment>
                                        );`;

content = content.replace(targetEnd, replacementEnd);

fs.writeFileSync(path, content, 'utf8');
console.log("Layout fixed successfully.");

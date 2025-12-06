import React, { useEffect, useState } from 'react';
import { SubmissionRecord, GradingResult } from '../types';
import { getAllSubmissions } from '../services/firebaseService';
import { Card } from './Card';
import { Button } from './Button';
import { GradingView } from './GradingView';
import { ArrowLeft, Search, GraduationCap, ChevronRight, BarChart3, Clock, Calendar } from 'lucide-react';

interface StudentsViewProps {
  userId: string;
}

interface StudentSummary {
  name: string;
  className: string;
  submissions: SubmissionRecord[];
  averageScore: number;
}

export const StudentsView: React.FC<StudentsViewProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<StudentSummary[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentSummary | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<GradingResult | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState<string>('All');
  const [availableClasses, setAvailableClasses] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const allSubs = await getAllSubmissions(userId);
      
      // Group by student name
      const map: Record<string, StudentSummary> = {};
      const classes = new Set<string>();

      allSubs.forEach(sub => {
        // Normalizing Name
        const name = sub.studentName.trim();
        const className = sub.className || 'Unassigned';
        classes.add(className);

        if (!map[name]) {
          map[name] = {
            name,
            className, // Assume latest class or most frequent
            submissions: [],
            averageScore: 0
          };
        }
        map[name].submissions.push(sub);
      });

      // Calculate averages
      const studentList = Object.values(map).map(s => {
        const totalPct = s.submissions.reduce((acc, curr) => acc + (curr.totalScore / curr.maxTotalScore), 0);
        return {
          ...s,
          averageScore: Math.round((totalPct / s.submissions.length) * 100)
        };
      });

      setStudents(studentList);
      setFilteredStudents(studentList);
      setAvailableClasses(['All', ...Array.from(classes)]);
      
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let res = students;
    if (classFilter !== 'All') {
      res = res.filter(s => s.className === classFilter);
    }
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      res = res.filter(s => s.name.toLowerCase().includes(lower));
    }
    setFilteredStudents(res);
  }, [searchTerm, classFilter, students]);

  const getGradeColor = (p: number) => {
    if (p >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (p >= 70) return 'text-brand-400 bg-brand-500/10 border-brand-500/20';
    if (p >= 50) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  if (loading) {
     return <div className="flex justify-center items-center h-[50vh] text-slate-500 tracking-widest uppercase text-sm">Aggregating Student Data...</div>;
  }

  // --- DETAIL VIEW: SINGLE STUDENT ---
  if (selectedStudent) {
    if (selectedSubmission) {
      return (
        <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in">
           <button 
             onClick={() => setSelectedSubmission(null)} 
             className="flex items-center gap-2 text-slate-400 hover:text-white mb-6 transition-colors"
           >
             <ArrowLeft size={16} />
             <span>Back to {selectedStudent.name}'s Profile</span>
           </button>
           <GradingView result={selectedSubmission} onReset={() => setSelectedSubmission(null)} />
        </div>
      )
    }

    return (
      <div className="max-w-5xl mx-auto p-4 md:p-6 animate-fade-in pb-32">
        <button 
          onClick={() => setSelectedStudent(null)} 
          className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Back to Roster</span>
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
           <div>
              <div className="flex items-center gap-3 mb-2">
                 <div className="p-3 bg-brand-500/20 rounded-full text-brand-400 border border-brand-500/10">
                   <GraduationCap size={32} />
                 </div>
                 <h1 className="text-4xl font-bold text-white">{selectedStudent.name}</h1>
              </div>
              <p className="text-slate-400 ml-1">{selectedStudent.className} • {selectedStudent.submissions.length} Submissions</p>
           </div>
           
           <div className="flex flex-col items-end">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Overall Performance</span>
              <div className={`text-5xl font-light px-4 py-2 rounded-xl border ${getGradeColor(selectedStudent.averageScore)}`}>
                 {selectedStudent.averageScore}%
              </div>
           </div>
        </div>

        <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">Submission History</h3>
        <div className="space-y-3">
          {selectedStudent.submissions.map((sub) => {
            const pct = Math.round((sub.totalScore / sub.maxTotalScore) * 100);
            return (
              <div 
                key={sub.id} 
                onClick={() => setSelectedSubmission(sub.fullResult)}
                className="group p-5 rounded-xl bg-[#0C101A] border border-indigo-500/10 hover:border-indigo-500/30 cursor-pointer transition-all flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
              >
                 <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-slate-200 group-hover:text-brand-400 transition-colors">{sub.rubricTitle}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                       <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(sub.timestamp).toLocaleDateString()}</span>
                       <span className="flex items-center gap-1"><Clock size={12} /> {new Date(sub.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-2 line-clamp-1">{sub.summary}</p>
                 </div>

                 <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className={`text-xl font-bold ${getGradeColor(pct).split(' ')[0]}`}>{pct}%</div>
                    <ChevronRight size={18} className="text-slate-600 group-hover:text-white" />
                 </div>
              </div>
            )
          })}
        </div>
      </div>
    );
  }

  // --- MAIN LIST VIEW ---
  return (
    <div className="max-w-7xl mx-auto w-full p-4 md:p-6 animate-fade-in pb-32">
      <div className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Student Roster</h1>
        <p className="text-slate-400">Manage performance and track progress across classes.</p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/5 p-4 rounded-xl border border-indigo-500/10">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Search students..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050810] border border-indigo-500/10 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-brand-500 transition-colors placeholder-slate-600"
            />
         </div>
         <select 
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="bg-[#050810] border border-indigo-500/10 rounded-lg py-2 px-4 text-white focus:outline-none focus:border-brand-500 transition-colors"
         >
            {availableClasses.map(c => <option key={c} value={c}>{c === 'All' ? 'All Classes' : c}</option>)}
         </select>
      </div>

      {filteredStudents.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border border-dashed border-indigo-500/10 rounded-2xl">
          No students found matching your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((s, idx) => (
            <div 
              key={idx} 
              onClick={() => setSelectedStudent(s)}
              className="group relative overflow-hidden rounded-2xl bg-[#0C101A] border border-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer p-6"
            >
               <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center border border-white/10 text-white font-serif italic text-lg shadow-lg">
                    {s.name.charAt(0)}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-bold uppercase tracking-wider ${getGradeColor(s.averageScore)}`}>
                     Avg: {s.averageScore}%
                  </div>
               </div>

               <h3 className="text-xl font-bold text-white mb-1 group-hover:text-brand-400 transition-colors">{s.name}</h3>
               <p className="text-slate-500 text-sm mb-6">{s.className}</p>

               <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1">
                     <BarChart3 size={14} />
                     <span>{s.submissions.length} Papers</span>
                  </div>
                  <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-brand-400">
                     <span>View Profile</span>
                     <ChevronRight size={14} />
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
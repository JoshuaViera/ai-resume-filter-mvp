'use client';

import { FilteredCandidate } from '@/types';
import { Download, Mail, Phone, MapPin, Award } from 'lucide-react';

interface ResultsTableProps {
  candidates: FilteredCandidate[];
  sessionId: string;
}

export default function ResultsTable({ candidates, sessionId }: ResultsTableProps) {
  if (candidates.length === 0) {
    return (
      <div className="text-center py-16 bg-coral/10 border-2 border-coral rounded-xl">
        <div className="max-w-md mx-auto space-y-4">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-graphite mb-2">
            No candidates matched your criteria
          </h3>
          <p className="text-ink/70 text-sm mb-6">
            No resumes met both your skill requirements and distance filter.
          </p>
          <div className="bg-white backdrop-blur-sm rounded-lg p-4 text-left shadow-sm">
            <p className="text-sm font-semibold text-graphite mb-2">💡 Try these suggestions:</p>
            <ul className="text-sm text-ink/70 space-y-1 ml-4">
              <li>• Increase the maximum commute distance</li>
              <li>• Reduce or adjust your required keywords</li>
              <li>• Verify candidate resumes include location data</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  const downloadCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      'Address',
      'Distance (miles)',
      'Commute',
      'Matched Skills',
      'Skill Score',
      'Overall Score',
    ];

    const rows = candidates.map(c => [
      c.candidateName,
      c.email,
      c.phone,
      c.address,
      c.distanceMiles.toFixed(1),
      c.commuteEstimate,
      c.matchedSkills.join('; '),
      c.skillMatchScore.toString(),
      c.overallScore.toString(),
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered-candidates-${sessionId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between bg-mint/10 p-4 rounded-lg border border-silver">
        <div>
          <h2 className="text-2xl font-bold text-graphite">
            Top Candidates
          </h2>
          <p className="text-sm text-ink/70 mt-1">
            {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'} matched your criteria
          </p>
        </div>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-5 py-2.5 bg-sky text-white rounded-lg hover:bg-sky/90 transition-all hover:shadow-md font-medium"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="space-y-3 lg:hidden">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white border border-silver rounded-xl p-5 space-y-3 hover:border-sky transition-colors shadow-sm"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-graphite">
                  {candidate.candidateName}
                </h3>
                <div className="flex items-center gap-3 mt-2">
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-mint/20 text-ink text-xs font-medium rounded">
                    <Award size={12} />
                    Score: {candidate.overallScore}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-1 bg-sky/10 text-ink text-xs font-medium rounded border border-sky/20">
                    <MapPin size={12} className="text-sky" />
                    <span className="font-semibold">{candidate.distanceMiles.toFixed(1)} mi</span>
                    <span className="text-sky">•</span>
                    <span>{candidate.commuteEstimate}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {candidate.email && (
                
                  <a href={`mailto:${candidate.email}`}
                  className="flex items-center gap-2 text-sky hover:underline"
                >
                  <Mail size={14} />
                  {candidate.email}
                </a>
              )}
              {candidate.phone && (
                
                  <a href={`tel:${candidate.phone}`}
                  className="flex items-center gap-2 text-sky hover:underline"
                >
                  <Phone size={14} />
                  {candidate.phone}
                </a>
              )}
            </div>

            {candidate.matchedSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-ink/60 mb-1">Matched Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-mint/20 text-ink text-xs rounded border border-mint/30"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            
             <a  href={candidate.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block text-sm text-sky hover:underline font-medium"
            >
              View Resume
            </a>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto rounded-xl border border-silver shadow-sm">
        <table className="w-full border-collapse bg-white">
          <thead className="bg-fog">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-graphite uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-graphite uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-graphite uppercase tracking-wider">
                Distance & Commute
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-graphite uppercase tracking-wider">
                Matched Skills
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-graphite uppercase tracking-wider">
                Scores
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-graphite uppercase tracking-wider">
                Resume
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-silver">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-fog transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-graphite">{candidate.candidateName}</div>
                  <div className="text-sm text-ink/60 mt-1">{candidate.address}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {candidate.email && (
                    
                    <a   href={`mailto:${candidate.email}`}
                      className="text-sky hover:underline block"
                    >
                      {candidate.email}
                    </a>
                  )}
                  {candidate.phone && (
                    
                      <a href={`tel:${candidate.phone}`}
                      className="text-sky hover:underline block mt-1"
                    >
                      {candidate.phone}
                    </a>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="inline-flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-sky" />
                      <span className="text-sm font-semibold text-graphite">
                        {candidate.distanceMiles.toFixed(1)} mi
                      </span>
                    </div>
                    <div className="text-xs text-ink/60 pl-5">
                      {candidate.commuteEstimate}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {candidate.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-mint/20 text-ink text-xs rounded border border-mint/30"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-mint/20 text-ink rounded-lg w-fit border border-mint/30">
                      <Award size={14} />
                      <span className="text-xs font-medium">Overall:</span>
                      <span className="text-sm font-bold">
                        {candidate.overallScore}
                      </span>
                    </div>
                    <div className="text-xs text-ink/60 ml-1">
                      Skills: <span className="font-semibold text-graphite">{candidate.skillMatchScore}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  
                    <a href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky hover:underline text-sm font-medium"
                  >
                    View Resume
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
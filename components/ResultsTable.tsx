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
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No candidates matched your criteria</p>
        <p className="text-gray-400 text-sm mt-2">
          Try adjusting your keywords or increasing the distance radius
        </p>
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
      'Matched Skills',
      'Skill Score',
      'Overall Score',
    ];

    const rows = candidates.map(c => [
      c.candidateName,
      c.email,
      c.phone,
      c.address,
      c.distanceMiles.toString(),
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Filtered Candidates ({candidates.length})
        </h2>
        <button
          onClick={downloadCSV}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download size={18} />
          Export CSV
        </button>
      </div>

      <div className="space-y-4 lg:hidden">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-gray-900">
                  {candidate.candidateName}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Award size={14} />
                    Score: {candidate.overallScore}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={14} />
                    {candidate.distanceMiles} mi
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {candidate.email && (
                
                  <a href={`mailto:${candidate.email}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Mail size={14} />
                  {candidate.email}
                </a>
              )}
              {candidate.phone && (
                
                  <a href={`tel:${candidate.phone}`}
                  className="flex items-center gap-2 text-blue-600 hover:underline"
                >
                  <Phone size={14} />
                  {candidate.phone}
                </a>
              )}
            </div>

            {candidate.matchedSkills.length > 0 && (
              <div>
                <p className="text-xs font-medium text-gray-500 mb-1">Matched Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {candidate.matchedSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
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
              className="inline-block text-sm text-blue-600 hover:underline"
            >
              View Resume
            </a>
          </div>
        ))}
      </div>

      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Distance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Matched Skills
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Scores
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Resume
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {candidates.map((candidate) => (
              <tr key={candidate.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{candidate.candidateName}</div>
                  <div className="text-sm text-gray-500 mt-1">{candidate.address}</div>
                </td>
                <td className="px-6 py-4 text-sm">
                  {candidate.email && (
                    
                    <a   href={`mailto:${candidate.email}`}
                      className="text-blue-600 hover:underline block"
                    >
                      {candidate.email}
                    </a>
                  )}
                  {candidate.phone && (
                    
                      <a href={`tel:${candidate.phone}`}
                      className="text-blue-600 hover:underline block mt-1"
                    >
                      {candidate.phone}
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {candidate.distanceMiles} miles
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {candidate.matchedSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Overall:</span>
                      <span className="font-semibold text-gray-900">
                        {candidate.overallScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">Skills:</span>
                      <span className="text-gray-700">{candidate.skillMatchScore}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  
                    <a href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
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
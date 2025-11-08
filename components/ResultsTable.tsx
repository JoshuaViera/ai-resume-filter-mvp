'use client';

// FIX: Import the REAL FilteredCandidate type
import { FilteredCandidate } from '@/types';
import { Download, Mail, Phone, MapPin, Award, RotateCcw } from 'lucide-react';

interface ResultsTableProps {
  candidates: FilteredCandidate[];
  sessionId: string;
  onReset: () => void; // <-- Add the onReset prop
}

export default function ResultsTable({ candidates, sessionId, onReset }: ResultsTableProps) {
  
  const downloadCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Phone',
      // REMOVED: Address
      // REMOVED: Distance (miles)
      'Matched Skills',
      'Skill Score',
      'Overall Score',
      'Resume URL'
    ];

    const rows = candidates.map(c => [
      c.candidateName,
      c.email,
      c.phone,
      // REMOVED: c.address
      // REMOVED: c.distanceMiles
      c.matchedSkills.join('; '),
      c.skillMatchScore.toString(),
      c.overallScore.toString(),
      c.resumeUrl,
    ]);

    // Helper to escape CSV fields
    const escapeCSV = (field: string) => `"${String(field).replace(/"/g, '""')}"`;

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(escapeCSV).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `filtered-candidates-${sessionId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Handle no matching candidates
  if (candidates.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600 text-xl font-semibold">No candidates matched your criteria</p>
        <p className="text-gray-500 text-md mt-2">
          Try adjusting your keywords
        </p>
        <button
          onClick={onReset}
          className="mt-6 flex items-center gap-2 mx-auto px-5 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <RotateCcw size={18} />
          Start Over
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-3xl font-bold text-gray-900">
          Ranked Candidates ({candidates.length})
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition-colors border border-gray-300"
          >
            <RotateCcw size={18} />
            Start Over
          </button>
          <button
            onClick={downloadCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Download size={18} />
            Export CSV
          </button>
        </div>
      </div>

      {/* --- Mobile/Card View --- */}
      <div className="space-y-4 lg:hidden">
        {candidates.map((candidate) => (
          <div
            key={candidate.id}
            className="bg-white border border-gray-200 rounded-lg p-4 space-y-3 shadow"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-lg text-graphite">
                  {candidate.candidateName}
                </h3>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1 font-bold text-indigo-600">
                    <Award size={14} />
                    Score: {candidate.overallScore}
                  </span>
                  {/* REMOVED: Distance span */}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm border-t pt-3">
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
              <div className="border-t pt-3">
                <p className="text-xs font-medium text-gray-500 mb-1">Matched Skills:</p>
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
              className="inline-block text-sm font-semibold text-blue-600 hover:underline pt-2"
            >
              View Resume
            </a>
          </div>
        ))}
      </div>

      {/* --- Desktop/Table View --- */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-graphite uppercase tracking-wider">
                Candidate
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-graphite uppercase tracking-wider">
                Contact
              </th>
              {/* REMOVED: Location Header */}
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
              <tr key={candidate.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{candidate.candidateName}</div>
                  {/* REMOVED: address div */}
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
                {/* REMOVED: Location/Distance TD */}
                <td className="px-6 py-4" style={{ maxWidth: '200px' }}>
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
                <td className="px-6 py-4 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-12">Overall:</span>
                      <span className="font-semibold text-gray-900 text-base">
                        {candidate.overallScore}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 w-12">Skills:</span>
                      <span className="text-gray-700">{candidate.skillMatchScore}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                    <a href={candidate.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm font-medium"
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
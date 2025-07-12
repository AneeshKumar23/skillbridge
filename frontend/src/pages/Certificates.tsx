import React, { useState } from 'react';
import { ArrowLeft, Award, Download, Share2, Calendar, Clock, CheckCircle, Star, Trophy, Medal, Target } from 'lucide-react';

interface Certificate {
  id: string;
  title: string;
  skill: string;
  completedDate: Date;
  progress: number;
  status: 'completed' | 'in-progress' | 'locked';
  description: string;
  issuer: string;
  credentialId?: string;
  validUntil?: Date;
  badge: string;
  color: string;
}

const certificates: Certificate[] = [
  {
    id: '1',
    title: 'JavaScript Fundamentals',
    skill: 'JavaScript',
    completedDate: new Date('2024-01-15'),
    progress: 100,
    status: 'completed',
    description: 'Master the core concepts of JavaScript programming including variables, functions, objects, and DOM manipulation.',
    issuer: 'SkillChat Academy',
    credentialId: 'SC-JS-2024-001',
    validUntil: new Date('2026-01-15'),
    badge: 'trophy',
    color: 'yellow'
  },
  {
    id: '2',
    title: 'React Development',
    skill: 'React',
    completedDate: new Date('2024-02-20'),
    progress: 85,
    status: 'in-progress',
    description: 'Build modern web applications using React, including components, hooks, state management, and routing.',
    issuer: 'SkillChat Academy',
    badge: 'medal',
    color: 'blue'
  },
  {
    id: '3',
    title: 'TypeScript Expert',
    skill: 'TypeScript',
    completedDate: new Date(),
    progress: 0,
    status: 'locked',
    description: 'Advanced TypeScript concepts including generics, decorators, and advanced type manipulation.',
    issuer: 'SkillChat Academy',
    badge: 'star',
    color: 'purple'
  },
  {
    id: '4',
    title: 'CSS Grid & Flexbox',
    skill: 'CSS',
    completedDate: new Date('2024-01-30'),
    progress: 100,
    status: 'completed',
    description: 'Master modern CSS layout techniques with Grid and Flexbox for responsive web design.',
    issuer: 'SkillChat Academy',
    credentialId: 'SC-CSS-2024-002',
    validUntil: new Date('2026-01-30'),
    badge: 'award',
    color: 'green'
  },
  {
    id: '5',
    title: 'Node.js Backend',
    skill: 'Node.js',
    completedDate: new Date(),
    progress: 45,
    status: 'in-progress',
    description: 'Build scalable backend applications with Node.js, Express, and database integration.',
    issuer: 'SkillChat Academy',
    badge: 'target',
    color: 'indigo'
  },
  {
    id: '6',
    title: 'Full Stack Developer',
    skill: 'Full Stack',
    completedDate: new Date(),
    progress: 0,
    status: 'locked',
    description: 'Complete full-stack development certification covering frontend, backend, and deployment.',
    issuer: 'SkillChat Academy',
    badge: 'trophy',
    color: 'red'
  }
];

interface CertificatesProps {
  onBack: () => void;
}

export const Certificates: React.FC<CertificatesProps> = ({ onBack }) => {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'locked'>('all');

  const getBadgeIcon = (badge: string, size: string = 'w-6 h-6') => {
    switch (badge) {
      case 'trophy':
        return <Trophy className={`${size} text-current`} />;
      case 'medal':
        return <Medal className={`${size} text-current`} />;
      case 'star':
        return <Star className={`${size} text-current`} />;
      case 'award':
        return <Award className={`${size} text-current`} />;
      case 'target':
        return <Target className={`${size} text-current`} />;
      default:
        return <Award className={`${size} text-current`} />;
    }
  };

  const getColorClasses = (color: string, status: string) => {
    if (status === 'locked') {
      return {
        bg: 'bg-gray-100',
        border: 'border-gray-200',
        text: 'text-gray-400',
        badge: 'text-gray-400'
      };
    }

    const colorMap: Record<string, any> = {
      yellow: {
        bg: 'bg-gradient-to-br from-yellow-50 to-amber-50',
        border: 'border-yellow-200',
        text: 'text-yellow-800',
        badge: 'text-yellow-600'
      },
      blue: {
        bg: 'bg-gradient-to-br from-blue-50 to-cyan-50',
        border: 'border-blue-200',
        text: 'text-blue-800',
        badge: 'text-blue-600'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50 to-indigo-50',
        border: 'border-purple-200',
        text: 'text-purple-800',
        badge: 'text-purple-600'
      },
      green: {
        bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
        border: 'border-green-200',
        text: 'text-green-800',
        badge: 'text-green-600'
      },
      indigo: {
        bg: 'bg-gradient-to-br from-indigo-50 to-blue-50',
        border: 'border-indigo-200',
        text: 'text-indigo-800',
        badge: 'text-indigo-600'
      },
      red: {
        bg: 'bg-gradient-to-br from-red-50 to-pink-50',
        border: 'border-red-200',
        text: 'text-red-800',
        badge: 'text-red-600'
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  const filteredCertificates = certificates.filter(cert => 
    filter === 'all' || cert.status === filter
  );

  const completedCount = certificates.filter(cert => cert.status === 'completed').length;
  const inProgressCount = certificates.filter(cert => cert.status === 'in-progress').length;

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Certificates</h1>
              <p className="text-sm text-gray-500">Track your learning achievements</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">{completedCount} Completed</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">{inProgressCount} In Progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Certificates' },
            { key: 'completed', label: 'Completed' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'locked', label: 'Locked' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === filterOption.key
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Certificates Grid */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredCertificates.map((certificate) => {
            const colors = getColorClasses(certificate.color, certificate.status);
            
            return (
              <div
                key={certificate.id}
                className={`${colors.bg} ${colors.border} border-2 rounded-xl p-6 cursor-pointer hover:shadow-lg transition-all duration-200 ${
                  certificate.status === 'locked' ? 'opacity-60' : 'hover:scale-105'
                }`}
                onClick={() => certificate.status !== 'locked' && setSelectedCertificate(certificate)}
              >
                {/* Certificate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-full ${colors.badge}`}>
                    {getBadgeIcon(certificate.badge, 'w-8 h-8')}
                  </div>
                  <div className="text-right">
                    {certificate.status === 'completed' && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-xs font-medium">Completed</span>
                      </div>
                    )}
                    {certificate.status === 'in-progress' && (
                      <div className="flex items-center space-x-1 text-blue-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">In Progress</span>
                      </div>
                    )}
                    {certificate.status === 'locked' && (
                      <div className="flex items-center space-x-1 text-gray-400">
                        <span className="text-xs font-medium">Locked</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Certificate Content */}
                <div className="space-y-3">
                  <div>
                    <h3 className={`font-bold text-lg ${colors.text}`}>
                      {certificate.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {certificate.skill}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2">
                    {certificate.description}
                  </p>

                  {/* Progress Bar */}
                  {certificate.status !== 'locked' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className={`font-medium ${colors.text}`}>
                          {certificate.progress}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            certificate.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${certificate.progress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Certificate Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <span className="text-xs text-gray-500">
                      {certificate.issuer}
                    </span>
                    {certificate.completedDate && certificate.status === 'completed' && (
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{certificate.completedDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certificate Detail Modal */}
      {selectedCertificate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Modal Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`p-3 rounded-full ${getColorClasses(selectedCertificate.color, selectedCertificate.status).badge}`}>
                    {getBadgeIcon(selectedCertificate.badge, 'w-8 h-8')}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      {selectedCertificate.title}
                    </h2>
                    <p className="text-gray-600">{selectedCertificate.skill}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCertificate(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ×
                </button>
              </div>

              {/* Certificate Details */}
              <div className="space-y-4">
                <p className="text-gray-700">{selectedCertificate.description}</p>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-900">Status:</span>
                    <p className="text-gray-600 capitalize">{selectedCertificate.status.replace('-', ' ')}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Progress:</span>
                    <p className="text-gray-600">{selectedCertificate.progress}%</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-900">Issuer:</span>
                    <p className="text-gray-600">{selectedCertificate.issuer}</p>
                  </div>
                  {selectedCertificate.credentialId && (
                    <div>
                      <span className="font-medium text-gray-900">Credential ID:</span>
                      <p className="text-gray-600 font-mono text-xs">{selectedCertificate.credentialId}</p>
                    </div>
                  )}
                </div>

                {selectedCertificate.status === 'completed' && (
                  <div className="flex space-x-3 pt-4">
                    <button className="flex-1 flex items-center justify-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                      <span>Download</span>
                    </button>
                    <button className="flex-1 flex items-center justify-center space-x-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
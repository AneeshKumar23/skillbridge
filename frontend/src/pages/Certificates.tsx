import React, { useState, useEffect, useCallback } from 'react';
import { ArrowLeft, Award, Download, Share2, Calendar, Clock, CheckCircle, Star, Trophy, Medal, Target, ShieldCheck, Loader2 } from 'lucide-react';
import { getSkillHistory, getUserCertificates, generateCertificateForSkill, DBUserCertificate } from '../../api/db';
import { toast } from 'sonner';

interface CertificatesProps {
  onBack: () => void;
  userId: string;
}

interface UiCertificate {
  id: string; // certificate ID or skill name
  title: string;
  skill: string;
  completedDate: Date | null;
  progress: number;
  status: 'completed' | 'in-progress' | 'locked' | 'paused';
  description: string;
  issuer: string;
  badge: string;
  color: string;
  // DB record values
  dbCert?: DBUserCertificate;
}

export const Certificates: React.FC<CertificatesProps> = ({ onBack, userId }) => {
  const [loading, setLoading] = useState(true);
  const [skillHistory, setSkillHistory] = useState<any[]>([]);
  const [userCerts, setUserCerts] = useState<DBUserCertificate[]>([]);
  const [generatingSkill, setGeneratingSkill] = useState<string | null>(null);
  const [selectedCertificate, setSelectedCertificate] = useState<UiCertificate | null>(null);
  const [filter, setFilter] = useState<'all' | 'completed' | 'in-progress' | 'locked'>('all');

  const loadData = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const [skillsData, certsData] = await Promise.all([
        getSkillHistory(userId),
        getUserCertificates(userId)
      ]);
      setSkillHistory(skillsData);
      setUserCerts(certsData);
    } catch (e) {
      console.error('Failed to load certificates data', e);
      toast.error('Failed to fetch certificate and skill records.');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Flatten and map skills to UiCertificates
  const getUiCertificates = (): UiCertificate[] => {
    // 1. Get flat list of skills from history
    const flatSkills = skillHistory.flatMap(item =>
      (item.skills || []).map(skill => ({
        skill,
        status: item.status ?? 'active',
        created_at: item.created_at,
      }))
    );

    // Remove duplicates keeping the latest status
    const uniqueSkillsMap = new Map<string, typeof flatSkills[0]>();
    flatSkills.forEach(s => {
      uniqueSkillsMap.set(s.skill.toLowerCase(), s);
    });

    const uniqueSkills = Array.from(uniqueSkillsMap.values());

    const list: UiCertificate[] = [];

    // Map completed & active skills
    uniqueSkills.forEach((s) => {
      // Find if certificate exists
      const dbCert = userCerts.find(c => c.skill.toLowerCase() === s.skill.toLowerCase());
      
      const isCompleted = s.status === 'completed';
      const isPaused = s.status === 'paused';
      
      let progress = 100;
      if (!isCompleted) {
        progress = isPaused ? 30 : 65; // mock progress for active/paused
      }

      list.push({
        id: dbCert ? dbCert.id : s.skill,
        title: `${s.skill} Professional Certification`,
        skill: s.skill,
        completedDate: dbCert ? new Date(dbCert.created_at) : (isCompleted ? new Date(s.created_at) : null),
        progress,
        status: isCompleted ? 'completed' : (isPaused ? 'locked' : 'in-progress'),
        description: isCompleted
          ? `Verify proficiency in ${s.skill} including advanced workflows, concepts, and practical applications.`
          : `Earn this certification by completing all learning modules for ${s.skill}.`,
        issuer: 'SkillBridge Academy',
        badge: isCompleted ? 'trophy' : 'medal',
        color: isCompleted ? 'yellow' : 'blue',
        dbCert
      });
    });

    // Add generic locked certificates for demonstration if empty or small list
    if (list.length < 3) {
      const demoLocked = [
        { skill: 'Cloud Architecture', desc: 'AWS, Kubernetes & Docker' },
        { skill: 'Data Structures', desc: 'Algorithms & Optimizations' }
      ];
      demoLocked.forEach((demo, idx) => {
        if (!list.some(item => item.skill.toLowerCase() === demo.skill.toLowerCase())) {
          list.push({
            id: `locked-${idx}`,
            title: `${demo.skill} Certification`,
            skill: demo.skill,
            completedDate: null,
            progress: 0,
            status: 'locked',
            description: demo.desc,
            issuer: 'SkillBridge Academy',
            badge: 'star',
            color: 'purple'
          });
        }
      });
    }

    return list;
  };

  const handleGenerateCertificate = async (skill: string) => {
    try {
      setGeneratingSkill(skill);
      toast.info(`Initiating certificate generation for ${skill}...`);
      const res = await generateCertificateForSkill(userId, skill);
      toast.success(`Certificate generated! Registering on Polygon Testnet in the background.`);
      
      // Reload certificates
      await loadData();
      
      // Auto-select the newly generated certificate to show the modal
      const uiCerts = getUiCertificates();
      const newUiCert = uiCerts.find(c => c.skill.toLowerCase() === skill.toLowerCase());
      if (newUiCert) {
        setSelectedCertificate(newUiCert);
      }
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || 'Failed to generate certificate.');
    } finally {
      setGeneratingSkill(null);
    }
  };

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
        bg: 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
        text: 'text-gray-400',
        badge: 'text-gray-400 bg-gray-50 dark:bg-gray-950'
      };
    }

    const colorMap: Record<string, any> = {
      yellow: {
        bg: 'bg-gradient-to-br from-yellow-50/60 to-amber-50/20 dark:from-yellow-950/20 dark:to-transparent border-yellow-200 dark:border-yellow-900/30',
        text: 'text-amber-800 dark:text-amber-300',
        badge: 'text-amber-600 bg-amber-100/60 dark:bg-amber-950/40'
      },
      blue: {
        bg: 'bg-gradient-to-br from-blue-50/60 to-cyan-50/20 dark:from-blue-950/20 dark:to-transparent border-blue-200 dark:border-blue-900/30',
        text: 'text-blue-800 dark:text-blue-300',
        badge: 'text-blue-600 bg-blue-100/60 dark:bg-blue-950/40'
      },
      purple: {
        bg: 'bg-gradient-to-br from-purple-50/60 to-indigo-50/20 dark:from-purple-950/20 dark:to-transparent border-purple-200 dark:border-purple-900/30',
        text: 'text-purple-800 dark:text-purple-300',
        badge: 'text-purple-600 bg-purple-100/60 dark:bg-purple-950/40'
      }
    };

    return colorMap[color] || colorMap.blue;
  };

  const uiCertificates = getUiCertificates();
  
  const filteredCertificates = uiCertificates.filter(cert => {
    if (filter === 'all') return true;
    if (filter === 'completed') return cert.status === 'completed';
    if (filter === 'in-progress') return cert.status === 'in-progress';
    if (filter === 'locked') return cert.status === 'locked';
    return true;
  });

  const completedCount = uiCertificates.filter(cert => cert.status === 'completed').length;
  const inProgressCount = uiCertificates.filter(cert => cert.status === 'in-progress').length;

  return (
    <div className="h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                <span>Certificates</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">
                  Polygon Secure
                </span>
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Track and verify your learning achievements</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4 text-sm">
            <div className="hidden sm:flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">{completedCount} Earned</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600 dark:text-gray-400">{inProgressCount} Learning</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 sm:px-6 py-3">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All Certificates' },
            { key: 'completed', label: 'Earned' },
            { key: 'in-progress', label: 'In Progress' },
            { key: 'locked', label: 'Locked' }
          ].map((filterOption) => (
            <button
              key={filterOption.key}
              onClick={() => setFilter(filterOption.key as any)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                filter === filterOption.key
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCertificates.map((cert) => {
              const colors = getColorClasses(cert.color, cert.status);
              const isCompleted = cert.status === 'completed';
              const hasCert = !!cert.dbCert;
              
              return (
                <div
                  key={cert.id}
                  className={`border rounded-2xl p-6 transition-all duration-200 relative bg-white dark:bg-gray-900 flex flex-col justify-between ${
                    cert.status === 'locked' 
                      ? 'opacity-60 border-gray-200 dark:border-gray-800' 
                      : 'hover:shadow-md border-gray-200 dark:border-gray-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className={`p-2.5 rounded-xl ${colors.badge}`}>
                        {getBadgeIcon(cert.badge, 'w-6 h-6')}
                      </div>
                      
                      {/* Status Badges */}
                      <div className="text-right">
                        {isCompleted ? (
                          hasCert ? (
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                              cert.dbCert?.verification_status === 'verified'
                                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                : cert.dbCert?.verification_status === 'pending'
                                ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 animate-pulse'
                                : 'bg-red-500/10 text-red-500 border border-red-500/20'
                            }`}>
                              {cert.dbCert?.verification_status === 'verified' && <ShieldCheck className="w-3 h-3" />}
                              {cert.dbCert?.verification_status}
                            </span>
                          ) : (
                            <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                              Ready to Mint
                            </span>
                          )
                        ) : cert.status === 'in-progress' ? (
                          <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs font-semibold px-2 py-0.5 rounded-full">
                            In Progress
                          </span>
                        ) : (
                          <span className="bg-gray-100 dark:bg-gray-800 text-gray-400 text-xs font-semibold px-2 py-0.5 rounded-full">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Meta */}
                    <div className="space-y-1.5">
                      <h3 className="font-bold text-base text-gray-900 dark:text-white leading-snug">
                        {cert.title}
                      </h3>
                      <p className="text-xs text-gray-500 font-medium">
                        Topic: {cert.skill}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                        {cert.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between gap-4">
                    {/* Date / Progress bar */}
                    {isCompleted ? (
                      cert.completedDate && (
                        <div className="flex items-center space-x-1 text-[11px] text-gray-400">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{cert.completedDate.toLocaleDateString()}</span>
                        </div>
                      )
                    ) : (
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between text-[11px] text-gray-400">
                          <span>Progress</span>
                          <span>{cert.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${cert.progress}%` }}></div>
                        </div>
                      </div>
                    )}

                    {/* Action button */}
                    {isCompleted && (
                      hasCert ? (
                        <button
                          onClick={() => setSelectedCertificate(cert)}
                          className="bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-950 px-3.5 py-1.5 rounded-xl text-xs font-semibold hover:bg-gray-800 dark:hover:bg-white transition-all shadow-sm shrink-0"
                        >
                          View Certificate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleGenerateCertificate(cert.skill)}
                          disabled={generatingSkill !== null}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shrink-0 flex items-center space-x-1"
                        >
                          {generatingSkill === cert.skill && <Loader2 className="w-3 h-3 animate-spin" />}
                          <span>Generate</span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Certificate Modal */}
      {selectedCertificate && selectedCertificate.dbCert && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 max-w-md w-full max-h-[95vh] overflow-hidden shadow-2xl flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Polygon Verification
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                  {selectedCertificate.skill} Certificate
                </h3>
              </div>
              <button
                onClick={() => setSelectedCertificate(null)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-white text-2xl font-bold p-1 leading-none"
              >
                &times;
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-4 space-y-4 overflow-y-auto">
              
              {/* Image Preview */}
              <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden shadow-sm max-w-[320px] mx-auto relative bg-gray-50 dark:bg-gray-950">
                <img 
                  src={selectedCertificate.dbCert.image_url} 
                  alt="Certificate Preview" 
                  className="w-full h-auto object-contain"
                />
              </div>

              {/* Status and Details */}
              <div className="bg-gray-50 dark:bg-gray-950 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex justify-between items-center border-b border-gray-200/40 dark:border-gray-800 pb-1.5">
                  <span className="text-gray-400">Certificate ID:</span>
                  <span className="font-semibold text-gray-900 dark:text-white font-mono">
                    {selectedCertificate.dbCert.id}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200/40 dark:border-gray-800 pb-1.5">
                  <span className="text-gray-400">On-Chain Status:</span>
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    selectedCertificate.dbCert.verification_status === 'verified'
                      ? 'bg-emerald-500/15 text-emerald-500'
                      : selectedCertificate.dbCert.verification_status === 'pending'
                      ? 'bg-amber-500/15 text-amber-500 animate-pulse'
                      : 'bg-red-500/15 text-red-500'
                  }`}>
                    {selectedCertificate.dbCert.verification_status}
                  </span>
                </div>

                {selectedCertificate.dbCert.tx_hash && (
                  <div className="flex justify-between items-center pb-0.5">
                    <span className="text-gray-400">Transaction:</span>
                    <span className="font-mono text-gray-500 truncate max-w-[180px]" title={selectedCertificate.dbCert.tx_hash}>
                      {selectedCertificate.dbCert.tx_hash}
                    </span>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <a
                  href={selectedCertificate.dbCert.image_url}
                  download={`${selectedCertificate.dbCert.id}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-white py-2 rounded-lg text-center text-xs font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors flex items-center justify-center space-x-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download file</span>
                </a>
                
                <a
                  href={`/verify/${selectedCertificate.dbCert.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-center text-xs font-semibold transition-colors flex items-center justify-center space-x-1"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verify Blockchain Proof</span>
                </a>
              </div>

            </div>

          </div>
        </div>
      )}
    </div>
  );
};
export default Certificates;
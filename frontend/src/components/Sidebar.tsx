import React, { useState, useEffect, useCallback } from 'react';
import { Plus, Award, Settings, BookOpen, User, Search, MoreHorizontal, ChevronLeft, ChevronRight, CheckCircle2, Clock, PauseCircle } from 'lucide-react';
import { getSkillHistory, updateSkillStatus, ProfileItem } from '../../api/db';
import { SuggestSkillsModal } from './SuggestSkillsModal';

interface SidebarProps {
  isOpen: boolean;            // mobile slide-over open
  isCollapsed: boolean;       // desktop collapsed (icon rail)
  onClose: () => void;
  onToggleCollapse: () => void;
  onNavigate: (page: string) => void;
  userId: string;
  user: {
    first_name: string;
    last_name: string;
    email: string;
  } | null;
}

type SkillStatus = 'active' | 'completed' | 'paused';

const STATUS_NEXT: Record<SkillStatus, SkillStatus> = {
  active: 'completed',
  completed: 'paused',
  paused: 'active',
};

const StatusIcon: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'completed') return <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />;
  if (status === 'paused') return <PauseCircle className="w-3.5 h-3.5 text-yellow-500" />;
  return <Clock className="w-3.5 h-3.5 text-blue-500" />;
};

const statusBadge: Record<string, string> = {
  active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  paused: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
};

export const Sidebar: React.FC<SidebarProps> = ({
  isOpen,
  isCollapsed,
  onClose,
  onToggleCollapse,
  onNavigate,
  userId,
  user,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [skillHistory, setSkillHistory] = useState<ProfileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestModal, setShowSuggestModal] = useState(false);

  const loadSkills = useCallback(async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await getSkillHistory(userId);
      setSkillHistory(data);
    } catch (e) {
      console.error('Failed to load skill history', e);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadSkills(); }, [loadSkills]);

  const handleStatusCycle = async (skill: string, current: string) => {
    const next = STATUS_NEXT[current as SkillStatus] ?? 'active';
    try {
      await updateSkillStatus(userId, skill, next);
      await loadSkills();
    } catch (e) {
      console.error('Failed to update skill status', e);
    }
  };

  // Flatten skills for rendering — each ProfileItem has skills[]
  const flatSkills = skillHistory.flatMap(item =>
    (item.skills || []).map(skill => ({ skill, status: item.status ?? 'active', created_at: item.created_at }))
  );

  const filtered = flatSkills.filter(s =>
    s.skill.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dt: string) => {
    const d = new Date(dt);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  // ── Collapsed (icon rail) ────────────────────────────────────────────────────
  if (isCollapsed) {
    return (
      <>
        {/* Mobile overlay still works when sidebar is open on mobile */}
        {isOpen && (
          <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={onClose} />
        )}

        <div className="hidden lg:flex flex-col items-center w-16 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 h-full py-4 gap-4 shrink-0">
          {/* Expand button */}
          <button
            onClick={onToggleCollapse}
            className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Avatar */}
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center" title={user ? `${user.first_name} ${user.last_name}` : 'User'}>
            <User className="w-4 h-4 text-white" />
          </div>

          <div className="w-px h-px" /> {/* spacer */}

          {/* New Skill */}
          <button
            onClick={() => setShowSuggestModal(true)}
            className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            title="Add new skill"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Certificates */}
          <button
            onClick={() => onNavigate('certificates')}
            className="p-2 text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors"
            title="Certificates"
          >
            <Award className="w-5 h-5" />
          </button>

          {/* Settings */}
          <button
            onClick={() => onNavigate('settings')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors mt-auto"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

        {showSuggestModal && (
          <SuggestSkillsModal
            userId={userId}
            onClose={() => setShowSuggestModal(false)}
            onSaved={loadSkills}
          />
        )}
      </>
    );
  }

  // ── Expanded ─────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={onClose} />
      )}

      {/* Sidebar panel */}
      <div className={`
        fixed lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out z-50
        w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700
        flex flex-col h-full shrink-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:flex
      `}>

        {/* Profile Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate text-sm">
                {user ? `${user.first_name} ${user.last_name}` : 'Guest User'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user ? user.email : 'guest@example.com'}
              </p>
            </div>
            <button
              onClick={onToggleCollapse}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* New Skill Button */}
        <div className="p-4 pb-3">
          <button
            className="w-full flex items-center justify-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2.5 rounded-xl transition-colors font-medium text-sm shadow-sm"
            onClick={() => setShowSuggestModal(true)}
          >
            <Plus className="w-4 h-4" />
            <span>New Skill</span>
          </button>
        </div>

        {/* Certification Card */}
        <div className="px-4 pb-3">
          <div
            className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-3 cursor-pointer hover:from-yellow-100 hover:to-orange-100 dark:hover:from-yellow-900/30 dark:hover:to-orange-900/30 transition-colors"
            onClick={() => onNavigate('certificates')}
          >
            <div className="flex items-center space-x-2">
              <Award className="w-4 h-4 text-yellow-600 dark:text-yellow-400 shrink-0" />
              <div>
                <h4 className="font-medium text-yellow-900 dark:text-yellow-200 text-sm">Certifications</h4>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">View earned certificates</p>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="px-4 pb-3">
          <button
            className="w-full flex items-center space-x-3 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-xl transition-colors text-sm"
            onClick={() => onNavigate('settings')}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>

        <div className="mx-4 border-t border-gray-100 dark:border-gray-800" />

        {/* Skills History */}
        <div className="flex-1 flex flex-col min-h-0 pt-3">
          <div className="px-4 pb-2">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">Skills History</h4>
              </div>
              <span className="text-xs text-gray-400 dark:text-gray-500">{filtered.length}</span>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search skills…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs text-gray-900 dark:text-gray-100 placeholder-gray-400"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {isLoading && (
              <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">Loading skills…</p>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="text-center py-6">
                <BookOpen className="w-8 h-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {searchTerm ? 'No matching skills' : 'No skills yet. Add your first!'}
                </p>
              </div>
            )}
            <div className="space-y-1.5">
              {filtered.map(({ skill, status, created_at }, idx) => (
                <div
                  key={`${skill}-${idx}`}
                  className="group flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <StatusIcon status={status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{skill}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{formatDate(created_at)}</p>
                  </div>
                  <button
                    onClick={() => handleStatusCycle(skill, status)}
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadge[status] ?? statusBadge.active} opacity-0 group-hover:opacity-100 transition-opacity`}
                    title="Click to cycle status"
                  >
                    {status}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showSuggestModal && (
        <SuggestSkillsModal
          userId={userId}
          onClose={() => setShowSuggestModal(false)}
          onSaved={loadSkills}
        />
      )}
    </>
  );
};
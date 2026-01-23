import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, CheckCircle, Circle, Target, BookOpen, Clock, Award } from 'lucide-react';
import { generateLearningPath } from '../../../api/db';

interface LearningNode {
  id: string;
  title: string;
  completed: boolean;
  progress?: number;
  duration?: string;
  children?: LearningNode[];
}

interface LearningPathProps {
  prompt?: string;
}

export const LearningPath: React.FC<LearningPathProps> = ({ prompt }) => {
  const [nodes, setNodes] = useState<LearningNode[]>([]);
  const [loading, setLoading] = useState(false);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (prompt) {
      loadPath(prompt);
    }
  }, [prompt]);

  const loadPath = async (searchPrompt: string) => {
    setLoading(true);
    try {
      const data = await generateLearningPath(searchPrompt);
      if (data && data.milestones) {
        const newNodes: LearningNode[] = data.milestones.map((m: any, i: number) => ({
          id: `${i}`,
          title: m.main_goal,
          completed: false,
          progress: 0,
          children: m.sub_goals?.map((sub: string, j: number) => ({
            id: `${i}.${j}`,
            title: sub,
            completed: false
          }))
        }));
        setNodes(newNodes);
        // Expand first node by default
        if (newNodes.length > 0) {
            setExpandedNodes(new Set([newNodes[0].id]));
        }
      }
    } catch (error) {
      console.error("Failed to load learning path", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNode = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const getStatusColor = (completed: boolean, progress?: number) => {
    if (completed) return 'text-green-500';
    if (progress && progress > 0) return 'text-blue-500';
    return 'text-gray-400';
  };

  const getProgressColor = (completed: boolean, progress?: number) => {
    if (completed) return 'bg-green-500';
    if (progress && progress > 0) return 'bg-blue-500';
    return 'bg-gray-300';
  };

  const renderTimelineNode = (node: LearningNode, level: number = 0, isLast: boolean = false) => {
    const hasChildren = node.children && node.children.length > 0;
    const isNodeExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="relative">
        {/* Timeline Line */}
        {level === 0 && !isLast && (
          <div className="absolute left-6 top-12 w-0.5 h-full bg-gray-200"></div>
        )}
        
        {/* Node Container */}
        <div className="flex items-start space-x-4 mb-6">
          {/* Timeline Dot */}
          <div className="relative flex-shrink-0">
            <div className={`w-12 h-12 rounded-full border-4 border-white shadow-lg flex items-center justify-center ${
              node.completed ? 'bg-green-500' : node.progress ? 'bg-blue-500' : 'bg-gray-300'
            }`}>
              {node.completed ? (
                <CheckCircle className="w-6 h-6 text-white" />
              ) : node.progress ? (
                <Clock className="w-6 h-6 text-white" />
              ) : (
                <Circle className="w-6 h-6 text-white" />
              )}
            </div>
            
            {/* Progress Ring */}
            {node.progress !== undefined && !node.completed && (
              <svg className="absolute inset-0 w-12 h-12 transform -rotate-90">
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  className="text-gray-200"
                />
                <circle
                  cx="24"
                  cy="24"
                  r="20"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray={`${2 * Math.PI * 20}`}
                  strokeDashoffset={`${2 * Math.PI * 20 * (1 - (node.progress || 0) / 100)}`}
                  className="text-blue-500 transition-all duration-300"
                />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div
              className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${
                hasChildren ? 'cursor-pointer' : ''
              }`}
              onClick={() => hasChildren && toggleNode(node.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {hasChildren && (
                      <button className="p-1">
                        {isNodeExpanded ? (
                          <ChevronDown className="w-4 h-4 text-gray-500" />
                        ) : (
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        )}
                      </button>
                    )}
                    <h4 className={`font-semibold ${
                      node.completed ? 'text-green-700' : 'text-gray-900'
                    }`}>
                      {node.title}
                    </h4>
                    {node.completed && (
                      <Award className="w-4 h-4 text-yellow-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    {node.duration && (
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{node.duration}</span>
                      </div>
                    )}
                    {node.progress !== undefined && (
                      <div className="flex items-center space-x-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(node.completed, node.progress)}`}
                            style={{ width: `${node.completed ? 100 : node.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-medium">
                          {node.completed ? '100%' : `${node.progress}%`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Children */}
            {hasChildren && isNodeExpanded && (
              <div className="mt-4 ml-8 space-y-3">
                {node.children!.map((child, index) => (
                  <div key={child.id} className="relative">
                    {/* Sub-timeline line */}
                    {index < node.children!.length - 1 && (
                      <div className="absolute left-6 top-8 w-0.5 h-full bg-gray-200"></div>
                    )}
                    
                    <div className="flex items-start space-x-3">
                      <div className={`w-12 h-12 rounded-full border-2 border-white shadow flex items-center justify-center ${
                        child.completed ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {child.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      
                      <div className="flex-1 bg-white rounded-lg border border-gray-100 p-3 hover:border-gray-200 transition-colors">
                        <div className="flex items-center justify-between">
                          <h5 className={`text-sm font-medium ${
                            child.completed ? 'text-green-700' : 'text-gray-900'
                          }`}>
                            {child.title}
                          </h5>
                          {child.duration && (
                            <span className="text-xs text-gray-500 flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{child.duration}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const completedCount = nodes.reduce((acc, node) => {
    const nodeCompleted = node.completed ? 1 : 0;
    const childrenCompleted = node.children?.filter(child => child.completed).length || 0;
    return acc + nodeCompleted + childrenCompleted;
  }, 0);

  const totalCount = nodes.reduce((acc, node) => {
    return acc + 1 + (node.children?.length || 0);
  }, 0);

  if (loading) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500">Generating Personal Learning Path for "{prompt}"...</p>
        </div>
      );
  }

  if (nodes.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 text-center h-full">
            <BookOpen className="w-12 h-12 text-gray-300 mb-2" />
            <p className="text-gray-500">No learning path generated yet.</p>
            <p className="text-xs text-gray-400 mt-1">Prompt: {prompt || 'None'}</p>
        </div>
      );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <BookOpen className="w-6 h-6 text-blue-500" />
          <h3 className="font-semibold text-gray-900">Learning Path</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Target className="w-4 h-4 text-blue-500" />
          <span className="text-sm text-gray-600">{completedCount}/{totalCount}</span>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="p-4 bg-blue-50 border-b border-gray-200">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-blue-900">Overall Progress</span>
          <span className="text-sm text-blue-700">{Math.round((completedCount / (totalCount || 1)) * 100)}%</span>
        </div>
        <div className="w-full bg-blue-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / (totalCount || 1)) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-2">
          {nodes.map((node, index) => 
            renderTimelineNode(node, 0, index === nodes.length - 1)
          )}
        </div>
      </div>
    </div>
  );
};
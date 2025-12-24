
import React, { useState } from 'react';
import { Project } from '../types';

interface ProjectManagementProps {
  projects: Project[];
  onAdd: (proj: Omit<Project, 'id'>) => void;
  onDelete: (id: string) => void;
}

const ProjectManagement: React.FC<ProjectManagementProps> = ({ projects, onAdd, onDelete }) => {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd({ name, location });
    setName('');
    setLocation('');
  };

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6">Register New Project</h3>
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Project Name</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border-slate-300 rounded-lg" required />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-slate-700 mb-1">Site Location</label>
            <input type="text" value={location} onChange={e => setLocation(e.target.value)} className="w-full border-slate-300 rounded-lg" required />
          </div>
          <div className="flex items-end">
            <button type="submit" className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100">
              Create Project
            </button>
          </div>
        </form>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map(proj => (
          <div key={proj.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative group">
            <button 
              onClick={() => onDelete(proj.id)}
              className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 transition p-1"
            >
              🗑️
            </button>
            <div className="text-3xl mb-4">🏗️</div>
            <h4 className="text-lg font-bold text-slate-900">{proj.name}</h4>
            <p className="text-sm text-slate-500 flex items-center mt-1">
              <span className="mr-1">📍</span> {proj.location}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectManagement;

import React, { useState } from "react";

const Sidebar = ({
  projects,
  onSelectProject,
  onDeleteProject,
  onCreateProject,
  selectedProjectId,
}) => {
  const [hoveredProject, setHoveredProject] = useState(null);
  const [showOptions, setShowOptions] = useState(null);

  return (
    <div className="w-80 bg-gray-100 p-4 flex flex-col h-screen">
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      <ul className="flex-grow">
        {projects.map((project) => (
          <li
            key={project.id}
            className={`flex justify-between items-center p-2 rounded mb-2 relative ${
              project.id === selectedProjectId
                ? "bg-blue-100 hover:bg-blue-200"
                : "hover:bg-gray-200"
            }`}
            onMouseEnter={() => setHoveredProject(project.id)}
            onMouseLeave={() => setHoveredProject(null)}
          >
            <span
              className="cursor-pointer flex-grow"
              onClick={() => onSelectProject(project.id)}
            >
              {project.title}
            </span>
            {hoveredProject === project.id && (
              <button
                className="text-gray-500 hover:text-gray-700"
                onClick={() => setShowOptions(project.id)}
              >
                ⋮
              </button>
            )}
            {showOptions === project.id && (
              <div className="absolute right-0 mt-8 w-32 bg-white rounded-md shadow-lg z-10">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    // Implement edit functionality
                    setShowOptions(null);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => {
                    onDeleteProject(project.id);
                    setShowOptions(null);
                  }}
                >
                  Delete
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
      <button
        onClick={onCreateProject}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mt-4"
      >
        Create New Project
      </button>
    </div>
  );
};

export default Sidebar;

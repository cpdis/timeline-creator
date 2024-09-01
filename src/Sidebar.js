import React, { useState, useRef, useEffect } from "react";

const Sidebar = ({
  projects,
  onSelectProject,
  onDeleteProject,
  onCreateProject,
  selectedProjectId,
}) => {
  const [showOptions, setShowOptions] = useState(null);
  const optionsRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptions(null);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="w-80 bg-gray-100 p-4 flex flex-col h-screen sticky top-0">
      <h2 className="text-xl font-bold mb-4">Projects</h2>
      <ul className="flex-grow overflow-y-auto">
        {projects.map((project) => (
          <li
            key={project.id}
            className={`flex justify-between items-center p-2 rounded mb-2 relative ${
              project.id === selectedProjectId
                ? "bg-blue-100 hover:bg-blue-200"
                : "hover:bg-gray-200"
            }`}
            onClick={() => onSelectProject(project.id)}
          >
            <span
              className="cursor-pointer flex-grow"
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(project.id);
              }}
            >
              {project.title}
            </span>
            <button
              className="text-gray-500 hover:text-gray-700 p-2"
              onClick={(e) => {
                e.stopPropagation();
                setShowOptions(project.id);
              }}
            >
              ⋮
            </button>
            {showOptions === project.id && (
              <div
                ref={optionsRef}
                className="absolute right-0 top-full mt-1 w-32 bg-white rounded-md shadow-lg z-10"
              >
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectProject(project.id);
                    setShowOptions(null);
                  }}
                >
                  Edit
                </button>
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={(e) => {
                    e.stopPropagation();
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

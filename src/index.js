import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import Timeline from "./Timeline";
import Sidebar from "./Sidebar";
import reportWebVitals from "./reportWebVitals";
import { supabase } from "./supabaseClient";

const App = () => {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  async function fetchProjects() {
    const { data, error } = await supabase.from("projects").select("id, title");

    if (error) console.log("Error fetching projects:", error);
    else setProjects(data || []);
  }

  const handleSelectProject = (projectId) => {
    setSelectedProjectId(projectId);
    fetchProjectDetails(projectId);
  };

  const fetchProjectDetails = async (projectId) => {
    const { data, error } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single();

    if (error) {
      console.error("Error fetching project details:", error);
    } else {
      // Update the Timeline component with the fetched project details
      // You'll need to pass this data to the Timeline component
    }
  };

  const handleCreateProject = () => {
    const newProject = { id: Date.now(), title: "New Project" };
    setProjects([...projects, newProject]);
    setSelectedProjectId(newProject.id);
  };

  const handleDeleteProject = async (projectId) => {
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId);

    if (error) {
      console.error("Error deleting project:", error);
      alert("Error deleting project. Please try again.");
    } else {
      setProjects(projects.filter((project) => project.id !== projectId));
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
      }
    }
  };

  return (
    <div className="flex">
      <Sidebar
        projects={projects}
        onSelectProject={handleSelectProject}
        onDeleteProject={handleDeleteProject}
        onCreateProject={handleCreateProject}
        selectedProjectId={selectedProjectId}
      />
      <div className="flex-grow">
        <Timeline
          projectId={selectedProjectId}
          onCreateProject={(updatedProject) => {
            setProjects(
              projects.map((p) =>
                p.id === updatedProject.id ? updatedProject : p
              )
            );
          }}
        />
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();

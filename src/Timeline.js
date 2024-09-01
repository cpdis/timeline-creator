import React, { useState, useEffect, useRef } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Timeline = () => {
  const [projectInfo, setProjectInfo] = useState(() => {
    const savedInfo = localStorage.getItem("projectInfo");
    return savedInfo
      ? JSON.parse(savedInfo)
      : {
          title: "",
          customer: "",
          startDateTime: "",
          disconnectLocation: "",
          connectLocation: "",
          rig: "",
          vessel: "",
          logo: null,
        };
  });
  const [events, setEvents] = useState(() => {
    const savedEvents = localStorage.getItem("events");
    return savedEvents ? JSON.parse(savedEvents) : [];
  });
  const [newEvent, setNewEvent] = useState({
    line: "",
    operation: "",
    estimatedDuration: "",
    actualDuration: "",
    remarks: "",
  });
  const [editingCell, setEditingCell] = useState(null);
  const [isHoveringLogo, setIsHoveringLogo] = useState(false);
  const fileInputRef = useRef(null);

  const chartRef = useRef(null);

  useEffect(() => {
    localStorage.setItem("projectInfo", JSON.stringify(projectInfo));
  }, [projectInfo]);

  useEffect(() => {
    localStorage.setItem("events", JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.data.labels = events.map((event) => event.operation);
      chartRef.current.data.datasets[0].data = events.map(
        (event) => event.estimatedDuration
      );
      chartRef.current.data.datasets[1].data = events.map(
        (event) => event.actualDuration
      );
      chartRef.current.update();
    }
  }, [events]);

  const handleProjectInfoChange = (e) => {
    const { name, value } = e.target;
    setProjectInfo((prev) => {
      const updated = { ...prev, [name]: value };
      localStorage.setItem("projectInfo", JSON.stringify(updated));
      return updated;
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewEvent((prev) => ({ ...prev, [name]: value }));
  };

  const formatDate = (date) => {
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const addHours = (date, hours) => {
    const newDate = new Date(date);
    newDate.setTime(newDate.getTime() + hours * 60 * 60 * 1000);
    return newDate;
  };

  const calculateTimes = (events) => {
    let currentDateTime = new Date(projectInfo.startDateTime);
    return events.map((event) => {
      const startDateTime = new Date(currentDateTime);
      const estimatedDuration = parseFloat(event.estimatedDuration) || 0;
      const actualDuration =
        parseFloat(event.actualDuration) || estimatedDuration;
      const endDateTime = addHours(startDateTime, actualDuration);
      currentDateTime = endDateTime;
      return {
        ...event,
        startDateTime: formatDate(startDateTime),
        endDateTime: formatDate(endDateTime),
        estimatedDuration,
        actualDuration,
      };
    });
  };

  const addEvent = () => {
    setEvents((prev) => {
      const updatedEvents = calculateTimes([...prev, { ...newEvent }]);
      return updatedEvents;
    });
    setNewEvent({
      line: "",
      operation: "",
      estimatedDuration: "",
      actualDuration: "",
      remarks: "",
    });
  };

  const handleCellEdit = (index, field, value) => {
    // For duration fields, only allow numbers and a single decimal point
    if (field === "estimatedDuration" || field === "actualDuration") {
      // Allow empty string for actualDuration
      if (field === "actualDuration" && value === "") {
        // Do nothing, allow empty string
      } else {
        value = value.replace(/[^\d.]/g, "");
        const parts = value.split(".");
        if (parts.length > 2) {
          value = parts[0] + "." + parts.slice(1).join("");
        }
      }
    }
    const updatedEvents = [...events];
    updatedEvents[index] = { ...updatedEvents[index], [field]: value };
    setEvents(calculateTimes(updatedEvents));
  };

  const renderEditableCell = (event, index, field) => {
    const isEditing =
      editingCell && editingCell.index === index && editingCell.field === field;

    if (isEditing) {
      return (
        <input
          type={
            field === "estimatedDuration" || field === "actualDuration"
              ? "number"
              : "text"
          }
          value={event[field] || ""}
          onChange={(e) => handleCellEdit(index, field, e.target.value)}
          onBlur={() => setEditingCell(null)}
          autoFocus
          className="w-full py-0 px-1" // Reduced padding
          step={
            field === "estimatedDuration" || field === "actualDuration"
              ? "0.01"
              : undefined
          }
        />
      );
    }

    return (
      <div
        onClick={() => setEditingCell({ index, field })}
        className="cursor-pointer min-h-[1.5em]"
      >
        {event[field] || ""}
      </div>
    );
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProjectInfo((prev) => ({ ...prev, logo: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleLogoEdit = () => {
    fileInputRef.current.click();
  };

  const calculateCumulativeTimes = (events) => {
    let cumulativeEstimated = 0;
    let cumulativeActual = 0;
    return events.map((event) => {
      cumulativeEstimated += parseFloat(event.estimatedDuration) || 0;
      // Only add to cumulative actual if there's a value
      if (event.actualDuration) {
        cumulativeActual += parseFloat(event.actualDuration);
      }
      return {
        operation: event.operation,
        cumulativeEstimated,
        cumulativeActual: event.actualDuration ? cumulativeActual : null,
      };
    });
  };

  // Define your logo colors here
  const logoColors = {
    primary: "rgb(221, 63, 10)", // Replace with your logo's primary color
    secondary: "rgb(38, 44, 96)", // Replace with your logo's secondary color
  };

  const chartData = {
    labels: events.map((event) => event.operation),
    datasets: [
      {
        label: "Cumulative Estimated Duration",
        data: calculateCumulativeTimes(events).map(
          (e) => e.cumulativeEstimated
        ),
        borderColor: logoColors.primary,
        backgroundColor: `${logoColors.primary}`,
        tension: 0.1,
      },
      {
        label: "Cumulative Actual Duration",
        data: calculateCumulativeTimes(events).map((e) => e.cumulativeActual),
        borderColor: logoColors.secondary,
        backgroundColor: `${logoColors.secondary}`,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        display: false,
      },
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: "Cumulative Duration (days)",
        },
        ticks: {
          callback: function (value) {
            return (value / 24).toFixed(1);
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: false,
        text: projectInfo.title || "Project Timeline",
        font: {
          size: 18,
          weight: "bold",
        },
      },
    },
    elements: {
      line: {
        borderWidth: 3,
      },
      point: {
        radius: 5,
        hoverRadius: 7,
      },
    },
  };

  const calculateTotals = () => {
    const estimatedDays = events.reduce(
      (sum, event) => sum + parseFloat(event.estimatedDuration) / 24,
      0
    );
    const actualDays = events.reduce(
      (sum, event) => sum + parseFloat(event.actualDuration) / 24,
      0
    );
    const lastEvent = events[events.length - 1];
    const estimatedCompletionDate = lastEvent ? lastEvent.endDateTime : "";

    return {
      estimatedDays: estimatedDays.toFixed(2),
      actualDays: actualDays.toFixed(2),
      estimatedCompletionDate,
    };
  };

  const totals = calculateTotals();

  return (
    <div className="p-8 max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto">
      <style>{styles}</style>
      <div className="flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold text-gray-800">
          Rig Move Release / Connect Timeline
        </h1>
        <div className="relative">
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
            className="hidden"
            id="logo-upload"
            ref={fileInputRef}
          />
          {!projectInfo.logo && (
            <label
              htmlFor="logo-upload"
              className="cursor-pointer bg-blue-800 text-white p-2 rounded"
            >
              Upload Logo
            </label>
          )}
          {projectInfo.logo && (
            <div
              className="relative"
              onMouseEnter={() => setIsHoveringLogo(true)}
              onMouseLeave={() => setIsHoveringLogo(false)}
            >
              <img src={projectInfo.logo} alt="Logo" className="max-h-16" />
              {isHoveringLogo && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 cursor-pointer"
                  onClick={handleLogoEdit}
                >
                  <span className="text-white font-bold">Edit</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        <input
          type="text"
          name="title"
          value={projectInfo.title}
          onChange={handleProjectInfoChange}
          placeholder="Project Title"
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          name="customer"
          value={projectInfo.customer}
          onChange={handleProjectInfoChange}
          placeholder="Customer"
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="datetime-local"
          name="startDateTime"
          value={projectInfo.startDateTime}
          onChange={handleProjectInfoChange}
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          name="disconnectLocation"
          value={projectInfo.disconnectLocation}
          onChange={handleProjectInfoChange}
          placeholder="Disconnect Location"
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          name="connectLocation"
          value={projectInfo.connectLocation}
          onChange={handleProjectInfoChange}
          placeholder="Connect Location"
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          name="rig"
          value={projectInfo.rig}
          onChange={handleProjectInfoChange}
          placeholder="Rig"
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
        <input
          type="text"
          name="vessel"
          value={projectInfo.vessel}
          onChange={handleProjectInfoChange}
          placeholder="Vessel"
          className="border border-gray-300 p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        />
      </div>

      <hr className="my-8 border-t border-gray-300" />

      <div className="mb-12 flex justify-left">
        <div className="w-1/2">
          <h2 className="text-3xl font-semibold mb-4">Project Summary</h2>
          <table className="w-full border-collapse border">
            <tbody>
              <tr>
                <th className="w-1/2 border p-2 bg-gray-200 text-left">
                  Estimated Days
                </th>
                <td className="border p-2 text-center">
                  {totals.estimatedDays}
                </td>
              </tr>
              <tr>
                <th className="border p-2 bg-gray-200 text-left">
                  Actual Days
                </th>
                <td className="border p-2 text-center">{totals.actualDays}</td>
              </tr>
              <tr>
                <th className="border p-2 bg-gray-200 text-left">
                  Estimated Completion Date
                </th>
                <td className="border p-2 text-center">
                  {totals.estimatedCompletionDate}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <hr className="my-8 border-t border-gray-300" />

      <div className="mt-12">
        <h2 className="text-3xl font-semibold mb-4">
          {projectInfo.title || "Project Timeline"}
        </h2>
        <Line data={chartData} options={chartOptions} />
      </div>

      <hr className="my-8 border-t border-gray-300" />

      <div className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Add New Event</h2>
        <div className="flex flex-wrap gap-2">
          <input
            type="text"
            name="line"
            value={newEvent.line}
            onChange={handleInputChange}
            placeholder="Line"
            className="border text-center p-2 w-24"
          />
          <input
            type="text"
            name="operation"
            value={newEvent.operation}
            onChange={handleInputChange}
            placeholder="Operation"
            className="border text-center p-2 flex-grow"
          />
          <input
            type="number"
            name="estimatedDuration"
            value={newEvent.estimatedDuration}
            onChange={handleInputChange}
            placeholder="Estimated (hours)"
            className="border text-center p-2 w-48"
          />
          <input
            type="number"
            name="actualDuration"
            value={newEvent.actualDuration}
            onChange={handleInputChange}
            placeholder="Actual (hours)"
            className="border text-center p-2 w-48"
          />
          <input
            type="text"
            name="remarks"
            value={newEvent.remarks}
            onChange={handleInputChange}
            placeholder="Remarks"
            className="border text-center p-2 flex-grow"
          />
          <button
            onClick={addEvent}
            className="bg-blue-500 text-white p-2 rounded"
          >
            Add Event
          </button>
        </div>
      </div>

      <hr className="my-8 border-t border-gray-300" />

      <div className="mb-12">
        <h2 className="text-3xl font-semibold mb-4">Events</h2>
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Line</th>
              <th className="border p-2">Operation</th>
              <th className="border p-2 text-center">Estimated Duration</th>
              <th className="border p-2 text-center">Actual Duration</th>
              <th className="border p-2">Start Date/Time</th>
              <th className="border p-2">End Date/Time</th>
              <th className="border p-2">Remarks</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event, index) => (
              <tr key={index}>
                <td className="border p-2">
                  {renderEditableCell(event, index, "line")}
                </td>
                <td className="border p-2">
                  {renderEditableCell(event, index, "operation")}
                </td>
                <td className="border p-2 text-center">
                  {renderEditableCell(event, index, "estimatedDuration")}
                </td>
                <td className="border p-2 text-center">
                  {renderEditableCell(event, index, "actualDuration")}
                </td>
                <td className="border p-2">{event.startDateTime}</td>
                <td className="border p-2">{event.endDateTime}</td>
                <td className="border p-2">
                  {renderEditableCell(event, index, "remarks")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = `
  body, input, textarea, button {
    font-family: 'Inconsolata', sans-serif;
  }

  h1, h2, h3, h4, h5, h6 {
    font-weight: 700;
    color: #2d3748;
  }

  input, textarea {
    font-weight: 300;
    border-radius: 0.375rem;
    transition: all 0.3s ease;
  }

  input:hover, textarea:hover {
    border-color: #4299e1;
  }

  input:focus, textarea:focus {
    outline: none;
    border-color: #4299e1;
    box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.5);
  }

  .btn {
    transition: all 0.3s ease;
  }

  .btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 768px) {
    h1 {
      font-size: 1.875rem;
    }
    h2 {
      font-size: 1.5rem;
    }
    .grid {
      grid-template-columns: 1fr;
    }
  }
`;

export default Timeline;

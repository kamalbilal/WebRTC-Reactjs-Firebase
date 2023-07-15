import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import VideoRoutes from "./components/VideoRoute/VideoRoutes";
import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

function App() {
  const [mode, setMode] = useState("create");
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage setMode={setMode} />} />
        <Route path="/:id" element={<VideoRoutes mode={mode} />} />
      </Routes>
    </BrowserRouter>
  );
}

function HomePage({ setMode }) {
  const navigate = useNavigate();
  const createMeetingRef = useRef();
  const joinMeetingRef = useRef();

  function joinMeeting() {
    const value = joinMeetingRef.current.value;
    if (value) {
      setMode("join");
      navigate(`/${value}`);
    }
  }
  function createMeeting() {
    const value = createMeetingRef.current.value;
    if (value) {
      setMode("create");
      navigate(`/${value}`);
    }
  }

  return (
    <div className="homepage-container">
      <div>
        <input
          ref={createMeetingRef}
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              createMeeting();
            }
          }}
          type="text"
          placeholder="Enter Any Meeting Id..."
        />
        <button onClick={createMeeting}>Create Meeting</button>
      </div>

      <div>
        <input
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              joinMeeting();
            }
          }}
          ref={joinMeetingRef}
          type="text"
          placeholder="Enter Meeting Id..."
        />
        <button onClick={joinMeeting}>Join Meeting</button>
      </div>
    </div>
  );
}

export default App;

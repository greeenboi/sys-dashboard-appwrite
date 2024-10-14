import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const SSHTerminal = () => {
  const terminalRef = useRef(null);
  const [terminal, setTerminal] = useState(null);
  const [ws, setWs] = useState(null);

  useEffect(() => {
    const term = new Terminal();
    setTerminal(term);

    if (terminalRef.current) {
      term.open(terminalRef.current);
    }

    const socket = new WebSocket('ws://localhost:8080/ws');
    setWs(socket);

    socket.onopen = () => {
      console.log('WebSocket connected');
    };

    socket.onmessage = (event) => {
      term.write(event.data);
    };

    socket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    return () => {
      term.dispose();
      socket.close();
    };
  }, []);

  useEffect(() => {
    if (terminal && ws) {
      terminal.onData((data) => {
        ws.send(data);
      });
    }
  }, [terminal, ws]);

  return (
    <div className="ssh-terminal">
      <div ref={terminalRef} />
    </div>
  );
};

export default SSHTerminal;
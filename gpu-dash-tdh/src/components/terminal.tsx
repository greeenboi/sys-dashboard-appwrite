import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import 'xterm/css/xterm.css';

const PowerShellTerminal: React.FC = () => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstance = useRef<Terminal | null>(null);

  useEffect(() => {
    if (terminalRef.current) {
      terminalInstance.current = new Terminal({
        cursorBlink: true,
        theme: {
          background: '#1E1E1E',
          foreground: '#D4D4D4',
        },
      });

      const fitAddon = new FitAddon();
      terminalInstance.current.loadAddon(fitAddon);
      terminalInstance.current.open(terminalRef.current);
      fitAddon.fit();

      const socket = new WebSocket('ws://localhost:8081/ws');

      socket.onopen = () => {
        terminalInstance.current?.writeln('Connected to PowerShell server');
      };

      socket.onmessage = (event: MessageEvent) => {
        terminalInstance.current?.write(event.data);
      };

      socket.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
        terminalInstance.current?.writeln('Waiting for response');
      };

      socket.onclose = () => {
        terminalInstance.current?.writeln('Server Idle');
      };

      terminalInstance.current.onData((data: string) => {
        socket.send(data);
      });

      const handleResize = () => {
        fitAddon.fit();
      };

      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        terminalInstance.current?.dispose();
        socket.close();
      };
    }
  }, []);

  return (
    <div className="h-screen w-full bg-gray-900 p-4">
      <div ref={terminalRef} className="h-full w-full" />
    </div>
  );
};

export default PowerShellTerminal;
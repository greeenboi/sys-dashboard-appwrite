import { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs"

import './App.css'
import CPUStatsChart from './components/cpu-dash';
import GPUStatsChart from './components/gpu-dash';
import SystemInfo from './components/sys-info'
import { GPUStatsType, SystemInfoData } from './types/core';
import { toast } from 'sonner';
import axios from 'axios';
import { db } from './lib/db';
import { id, tx } from '@instantdb/react';
import { AreaChartInteravtive } from './components/ui/interactive-area-chart';
import DiskStatsChart from './components/disk-dash';
import PowerShellTerminal from './components/terminal';

function App() {
  const [systemInfo, setSystemInfo] = useState<SystemInfoData | null>(null);

    useEffect(() => {
        const fetchSystemInfo = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8080/system_info');
                const data: SystemInfoData = await response.json();
                setSystemInfo(data);
            } catch (error) {
                console.error('Error fetching system info:', error);
            }
        };
        setInterval(() => {
          fetchSystemInfo();
        }, 200);
    }, []);

    const [stats, setStats] = useState<GPUStatsType>({
      gpu3dUsage: 0,
      gpuComputeUsage: 0,
      gpuMemoryUsage: 0,
      gpuVideoDecodeUsage: 0,
      gpuCopyUsage: 0,
      gpuVideoProcessingUsage: 0,
      cpuName: '',
      cpuCores: 0,
      cpuLogicalProcessors: 0,
      cpuCoreUsages: [],
      cpuTotalUsage: 0,
      disks: [],
    });

useEffect(() => {
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:8080/gpu_stats')
      const data = response.data
      
      const gpu3dUsageMatch = data.match(/Total GPU 3D Engine Usage: (\d+(\.\d+)?)%/);
      const gpuComputeUsageMatch = data.match(/Total GPU Compute Engine Usage: (\d+(\.\d+)?)%/);
      const gpuMemoryUsageMatch = data.match(/Total GPU Process Memory Local Usage: (\d+(\.\d+)?) MB/);
      const gpuVideoDecodeUsageMatch = data.match(/Total GPU Video Decode Engine Usage: (\d+(\.\d+)?)%/);
      const gpuCopyUsageMatch = data.match(/Total GPU Copy Engine Usage: (\d+(\.\d+)?)%/);
      const gpuVideoProcessingUsageMatch = data.match(/Total GPU Video Processing Engine Usage: (\d+(\.\d+)?)%/);

      const gpu3dUsage = gpu3dUsageMatch ? parseFloat(gpu3dUsageMatch[1]) : 0;
      const gpuComputeUsage = gpuComputeUsageMatch ? parseFloat(gpuComputeUsageMatch[1]) : 0;
      const gpuMemoryUsage = gpuMemoryUsageMatch ? parseFloat(gpuMemoryUsageMatch[1]) : 0;
      const gpuVideoDecodeUsage = gpuVideoDecodeUsageMatch ? parseFloat(gpuVideoDecodeUsageMatch[1]) : 0;
      const gpuCopyUsage = gpuCopyUsageMatch ? parseFloat(gpuCopyUsageMatch[1]) : 0;
      const gpuVideoProcessingUsage = gpuVideoProcessingUsageMatch ? parseFloat(gpuVideoProcessingUsageMatch[1]) : 0;

      const cpuNameMatch = data.match(/CPU Name: (.+)/);
      const cpuCoresMatch = data.match(/CPU Cores: (\d+)/);
      const cpuLogicalProcessorsMatch = data.match(/CPU Logical Processors: (\d+)/);
      const cpuCoreUsagesMatches = [...data.matchAll(/CPU Core: \d+ - Usage: (\d+(\.\d+)?)%/g)];
      const cpuTotalUsageMatch = data.match(/CPU Core: _total - Usage: (\d+(\.\d+)?)%/);

      const cpuName = cpuNameMatch ? cpuNameMatch[1] : '';
      const cpuCores = cpuCoresMatch ? parseInt(cpuCoresMatch[1], 10) : 0;
      const cpuLogicalProcessors = cpuLogicalProcessorsMatch ? parseInt(cpuLogicalProcessorsMatch[1], 10) : 0;
      const cpuCoreUsages = cpuCoreUsagesMatches.map(match => parseFloat(match[1]));
      const cpuTotalUsage = cpuTotalUsageMatch ? parseFloat(cpuTotalUsageMatch[1]) : 0;

      const diskMatches = [...data.matchAll(/Disk \d+ - [\w\s]+:\s+Read Speed: (\d+(\.\d+)?) KB\/sec\s+Write Speed: (\d+(\.\d+)?) MB\/sec\s+Read Operations: (\d+(\.\d+)?)\/sec\s+Write Operations: (\d+(\.\d+)?)\/sec\s+Avg\. Read Time: (\d+(\.\d+)?) ms\s+Avg\. Write Time: (\d+(\.\d+)?) ms\s+Idle Time: (\d+(\.\d+)?)%/g)];
      
      const disks = diskMatches.map(match => ({
          readSpeed: parseFloat(match[1]),
          writeSpeed: parseFloat(match[3]),
          readOperations: parseFloat(match[5]),
          writeOperations: parseFloat(match[7]),
          avgReadTime: parseFloat(match[9]),
          avgWriteTime: parseFloat(match[11]),
          idleTime: parseFloat(match[13]),
      }));

      setStats({
        gpu3dUsage,
        gpuComputeUsage,
        gpuMemoryUsage,
        gpuVideoDecodeUsage,
        gpuCopyUsage,
        gpuVideoProcessingUsage,
        cpuName,
        cpuCores,
        cpuLogicalProcessors,
        cpuCoreUsages,
        cpuTotalUsage,
        disks
      });
      // console.log(disks)
      

    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Error fetching data')
    }
  }

  const pushData = async () => {
    if (systemInfo) {
      await db.transact([
        tx.logs[id()].update({
          timestamp: new Date(),
          total_memory: systemInfo.total_memory,
          used_memory: systemInfo.used_memory,
          total_swap: systemInfo.total_swap,
          used_swap: systemInfo.used_swap,
          system_name: systemInfo.system_name,
          kernel_version: systemInfo.kernel_version,
          os_version: systemInfo.os_version,
          host_name: systemInfo.host_name,
          // cpu_count: systemInfo.cpu_count,
          gpu3dUsage: stats.gpu3dUsage,
          gpuComputeUsage: stats.gpuComputeUsage,
          gpuMemoryUsage: stats.gpuMemoryUsage,
          gpuVideoDecodeUsage: stats.gpuVideoDecodeUsage,
          gpuCopyUsage: stats.gpuCopyUsage,
          gpuVideoProcessingUsage: stats.gpuVideoProcessingUsage,
          cpuName: stats.cpuName,
          cpuCores: stats.cpuCores,
          cpuLogicalProcessors: stats.cpuLogicalProcessors,
          cpuCoreUsages: stats.cpuCoreUsages,
          cpuTotalUsage: stats.cpuTotalUsage,
          disks: stats.disks,
        }),
      ]);
    }
  }

  fetchData()
  pushData()
  
  const intervalId = setInterval(fetchData, 300)
  const updateData = setInterval(pushData, 50000)

  return () => {
    clearInterval(intervalId)
    clearInterval(updateData)
  }
}, [stats.cpuCoreUsages, stats.cpuCores, stats.cpuLogicalProcessors, stats.cpuName, stats.cpuTotalUsage, stats.disks, stats.gpu3dUsage, stats.gpuComputeUsage, stats.gpuCopyUsage, stats.gpuMemoryUsage, stats.gpuVideoDecodeUsage, stats.gpuVideoProcessingUsage, systemInfo])

  return (
    <main className='flex items-center justify-center w-full h-full min-h-screen py-12 md:px-8 lg:px-12 '>
      <Tabs defaultValue="General" className="w-full">
        <TabsList className='sticky z-50 top-[2%] left-[-10%] rounded-md'>
          <TabsTrigger value="General">General</TabsTrigger>
          <TabsTrigger value="SystemInfo">System Info</TabsTrigger>
          <TabsTrigger value="GpuInfo">GPU Info</TabsTrigger>
          <TabsTrigger value="CpuInfo">CPU Info</TabsTrigger>
          <TabsTrigger value="DiskInfo">Disk Info</TabsTrigger>
          <TabsTrigger value="terminal">Terminal</TabsTrigger>
        </TabsList>
        <TabsContent value="General" className='grid grid-cols-3'><AreaChartInteravtive /></TabsContent>
        <TabsContent value="SystemInfo"><SystemInfo systemInfo={systemInfo} /></TabsContent>
        <TabsContent value="GpuInfo"><GPUStatsChart stats={stats} /></TabsContent>
        <TabsContent value="CpuInfo"><CPUStatsChart stats={stats} /></TabsContent>
        <TabsContent value="DiskInfo"><DiskStatsChart stats={stats} /></TabsContent>
        <TabsContent value="terminal"><PowerShellTerminal /></TabsContent>
      </Tabs>
    </main>
  );
}

export default App;

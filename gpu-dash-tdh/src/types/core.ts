interface SystemInfoData {
    total_memory: number;
    used_memory: number;
    total_swap: number;
    used_swap: number;
    system_name: string;
    kernel_version: string;
    os_version: string;
    host_name: string;
    cpu_count: number;
  }

interface DiskStats {
  readSpeed: number; // KB/sec
  writeSpeed: number; // MB/sec
  readOperations: number; // Operations/sec
  writeOperations: number; // Operations/sec
  avgReadTime: number; // ms
  avgWriteTime: number; // ms
  idleTime: number; // Percentage
}
  
interface GPUStatsType {
    gpu3dUsage: number;
    gpuComputeUsage: number;
    gpuMemoryUsage: number;
    gpuVideoDecodeUsage: number;
    gpuCopyUsage: number;
    gpuVideoProcessingUsage: number;
    cpuName: string;
    cpuCores: number;
    cpuLogicalProcessors: number;
    cpuCoreUsages: number[];
    cpuTotalUsage: number;
    disks: DiskStats[]; 
}

export type { SystemInfoData, GPUStatsType, DiskStats };
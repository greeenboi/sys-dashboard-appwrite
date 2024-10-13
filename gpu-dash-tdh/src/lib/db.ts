import { init } from '@instantdb/react'

const APP_ID = 'f4bebc41-7c9b-4b19-b063-68adb014ea2e'

type Schema = {
  logs:{
    timestamp: Date,
    total_memory: number,
    used_memory: number,
    total_swap: number,
    used_swap: number,
    system_name: string,
    kernel_version: string,
    os_version: string,
    host_name: string,
    // cpu_count: number,
    gpu3dUsage: number,
    gpuComputeUsage: number,
    gpuMemoryUsage: number,
    gpuVideoDecodeUsage: number,
    gpuCopyUsage: number,
    gpuVideoProcessingUsage: number
    cpuName: string,
    cpuCores: number,
    cpuLogicalProcessors: number,
    cpuCoreUsages: number[],
    cpuTotalUsage: number,
  }
}

export const db = init<Schema>({ appId: APP_ID })
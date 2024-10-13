"use client"

import {useState, useEffect, useRef} from "react"
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select"
import { db } from "../../lib/db"
import { toast } from "sonner"

export const description = "An interactive area chart"


const chartConfig = {
  gpu3dUsage: {
    label: 'GPU 3D Usage',
    color: 'hsl(var(--chart-2))',
  },
  gpuComputeUsage: {
    label: 'GPU Compute Usage',
    color: 'hsl(var(--chart-3))',
  },
  gpuVideoDecodeUsage: {
    label: 'GPU Video Decode Usage',
    color: 'hsl(var(--chart-5))',
  },
  gpuCopyUsage: {
    label: 'GPU Copy Usage',
    color: 'hsl(var(--chart-1))',
  },
  gpuVideoProcessingUsage: {
    label: 'GPU Video Processing Usage',
    color: 'hsl(var(--chart-4))',
  },
  totalCpuUsage: {
    label: 'Total CPU Usage',
    color: 'hsl(var(--chart-6))',
  },
} satisfies ChartConfig

interface ChartData {
  date: Date;
  gpu3dUsage: number;
  gpuComputeUsage: number;
  gpuVideoDecodeUsage: number;
  gpuCopyUsage: number;
  gpuVideoProcessingUsage: number;
  totalCpuUsage: number;
}


export function AreaChartInteravtive() {
    const [selectedValue, setSelectedValue] = useState('CPU');
    const [chartData, setChartData] = useState<ChartData[]>([]);
    // const [isObserved, setIsObserved] = useState(false);
    const chartRef = useRef<HTMLDivElement>(null);
    const query = {
      logs: {
        $: { 
          limit: 50,
          order: {
            serverCreatedAt: 'desc' as const,
          },
        },
      },
    };
    const { error, data } = db.useQuery(query);
    
    useEffect(() => {
      if (data && data.logs) {
        const mappedData = data.logs.map(log => ({
          date: log.timestamp,
          gpu3dUsage: log.gpu3dUsage,
          gpuComputeUsage: log.gpuComputeUsage,
          gpuVideoDecodeUsage: log.gpuVideoDecodeUsage,
          gpuCopyUsage: log.gpuCopyUsage,
          gpuVideoProcessingUsage: log.gpuVideoProcessingUsage,
          totalCpuUsage: Math.ceil(log.cpuTotalUsage * 10) / 10,
        }));
        setChartData(mappedData);
        // console.log(mappedData);
      }
    }, [data]);

    // useEffect(() => {
    //   const observer = new IntersectionObserver(
    //     ([entry]) => {
    //       if (entry.isIntersecting) {
    //         setIsObserved(true);
    //         observer.disconnect();
    //       }
    //     },
    //     { threshold: 0.1 }
    //   );
  
    //   if (chartRef.current) {
    //     observer.observe(chartRef.current);
    //   }
  
    //   return () => {
    //     if (chartRef.current) {
    //       observer.unobserve(chartRef.current);
    //     }
    //   };
    // }, []);

    if (error) {
      toast.error("Failed to fetch data " + error.message);
    }
  
    

  return (
    <Card className="w-full h-full col-span-3" ref={chartRef}>
      <CardHeader className="flex items-center w-full gap-2 py-5 space-y-0 border-b sm:flex-row">
        <div className="grid flex-1 gap-1 text-center sm:text-left">
          <CardTitle>General Information</CardTitle>
          <CardDescription>
            Showing {selectedValue} usage
          </CardDescription>
        </div>
        <Select value={selectedValue} onValueChange={setSelectedValue}>
          <SelectTrigger
            className="w-[160px] rounded-lg sm:ml-auto"
            aria-label="Select a value"
          >
            <SelectValue placeholder="CPU" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="CPU" className="rounded-lg">
              CPU
            </SelectItem>
            <SelectItem value="GPU" className="rounded-lg">
              GPU
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="w-full px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[400px] w-full"
        >
          <AreaChart data={chartData}>
            { selectedValue === 'GPU' && (
              <>
                <defs>
                  <linearGradient id="fillGPU3D" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-gpu3dUsage)"
                      stopOpacity={1}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-gpu3dUsage)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillGPUCompute" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-gpuComputeUsage)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-gpuComputeUsage)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillGPUVideoDecode" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-gpuVideoDecodeUsage)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-gpuVideoDecodeUsage)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillGPUCopy" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-gpuCopyUsage)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-gpuCopyUsage)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                  <linearGradient id="fillGPUVideoProcessing" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor="var(--color-gpuVideoProcessingUsage)"
                      stopOpacity={0.8}
                    />
                    <stop
                      offset="95%"
                      stopColor="var(--color-gpuVideoProcessingUsage)"
                      stopOpacity={0.1}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <YAxis />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      // second: "2-digit",
                    })
                  }}
                />
                {/* <YAxis tickLine={false} axisLine={false} tickMargin={10} /> */}
                <ChartTooltip
                  cursor={true}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit"
                        })
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  type="natural"
                  dataKey="gpu3dUsage"
                  stroke="var(--color-gpu3dUsage)"
                  fillOpacity={1}
                  fill="url(#fillGPU3D)"
                />
                <Area
                  type="natural"
                  dataKey="gpuComputeUsage"
                  stroke="var(--color-gpuComputeUsage)"
                  fillOpacity={1}
                  fill="url(#fillGPUCompute)"
                />
                <Area
                  type="natural"
                  dataKey="gpuVideoDecodeUsage"
                  stroke="var(--color-gpuVideoDecodeUsage)"
                  fillOpacity={1}
                  fill="url(#fillGPUVideoDecode)"
                />
                <Area
                  type="natural"
                  dataKey="gpuCopyUsage"
                  stroke="var(--color-gpuCopyUsage)"
                  fillOpacity={1}
                  fill="url(#fillGPUCopy)"
                />
                <Area
                  type="natural"
                  dataKey="gpuVideoProcessingUsage"
                  stroke="var(--color-gpuVideoProcessingUsage)"
                  fillOpacity={1}
                  fill="url(#fillGPUVideoProcessing)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </>
            )}
            { selectedValue === 'CPU' && (
              <>
                <defs>
                <linearGradient id="fillTotalCpuUsage" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="var(--color-totalCpuUsage)"
                    stopOpacity={1}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-totalCpuUsage)"
                    stopOpacity={0.1}
                  />
                </linearGradient>
                </defs>
                <CartesianGrid vertical={false} />
                <YAxis
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10}
                  label={{ value: 'Usage (%)', angle: -90, position: 'insideLeft' }}
                  domain={[0, 100]}
                />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  minTickGap={32}
                  tickFormatter={(value) => {
                    const date = new Date(value)
                    return date.toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                      // second: "2-digit",
                    })
                  }}
                />
                {/* <YAxis tickLine={false} axisLine={false} tickMargin={10} /> */}
                <ChartTooltip
                  cursor={true}
                  content={
                    <ChartTooltipContent
                      labelFormatter={(value) => {
                        return new Date(value).toLocaleDateString("en-US", {
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })
                      }}
                      indicator="dot"
                    />
                  }
                />
                <Area
                  type="monotone"
                  dataKey="totalCpuUsage"
                  stroke="var(--color-totalCpuUsage)"
                  fillOpacity={1}
                  fill="url(#fillTotalCpuUsage)"
                />
                <ChartLegend content={<ChartLegendContent />} />
              </>
            )}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

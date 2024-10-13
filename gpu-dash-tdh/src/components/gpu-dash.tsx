
import { Card, CardContent } from "../components/ui/card"
import { GPUStatsType } from "../types/core";
import { RadialChartText } from './ui/radial-chart-text';



export default function GPUStatsChart({ stats } : { stats: GPUStatsType }) {
    

  const totalMemory = 8192
  const memoryUsagePercentage = (stats.gpuMemoryUsage / totalMemory) * 100

  const createChartData = (value: number) => [
    { name: 'Used', value: value },
    { name: 'Free', value: 100 - value }
  ]

  const gpu3dData = createChartData(stats.gpu3dUsage)
  const gpuComputeData = createChartData(stats.gpuComputeUsage)
  const gpuMemoryData = createChartData(memoryUsagePercentage)

  return (
    <Card className="w-full h-full mx-auto border-none">
      <CardContent className="grid gap-6 pt-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 max-md:gap-y-8">
          {[
            { title: '3D Engine Usage', data: gpu3dData, value: stats.gpu3dUsage, maxUnit:100, unit: '%' },
            { title: 'Compute Engine Usage', data: gpuComputeData, value: stats.gpuComputeUsage, maxUnit:100, unit: '%' },
            { title: 'Memory Usage', data: gpuMemoryData, value: stats.gpuMemoryUsage, unit:'MB',maxUnit:8397, isMemory: true },
            { title: 'Video Decode Engine Usage', data: gpuComputeData, value: stats.gpuComputeUsage, maxUnit:100, unit: '%' },
            { title: 'Copy Engine Usage', data: gpuComputeData, value: stats.gpuComputeUsage, maxUnit:100, unit: '%' },
            { title: 'Video Processing Engine Usage', data: gpuComputeData, value: stats.gpuComputeUsage, maxUnit:100, unit: '%' },
          ].map((chart, index) => <RadialChartText key={index} label={chart.title} number={chart.value} unit={chart.unit} maxUnit={chart.maxUnit} />)}
        </div>
      </CardContent>
    </Card>
  )
}
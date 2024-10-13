
import { Card, CardContent } from "../components/ui/card"
import { GPUStatsType } from "../types/core";
import { RadialChartText } from './ui/radial-chart-text';

export default function CPUStatsChart({ stats } : { stats: GPUStatsType }) {
    
  
    const createChartData = (value: number) => [
      { name: 'Used', value: value },
      { name: 'Free', value: 100 - value }
    ]
  
    const cpuTotalData = createChartData(stats.cpuTotalUsage)
  
    return (
      <Card className="w-full h-full mx-auto border-[1px]">
        <CardContent className="grid gap-6 pt-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 max-md:gap-y-8">
            {[
              { title: 'Cpu Total Usage', data: cpuTotalData, name:stats.cpuName,  value: stats.cpuTotalUsage, maxUnit:100, unit: '%', className: 'col-span-full' },
              ...stats.cpuCoreUsages.map((usage, index) => ({
                title: `CPU Core ${index} Usage`,
                name:stats.cpuName,
                data: createChartData(usage),
                value: usage,
                maxUnit: 100,
                unit: '%',
                className: ''
              }))
            ].map((chart, index) => (
                <RadialChartText key={index} cpuName={chart.name} label={chart.title} number={chart.value} unit={chart.unit} maxUnit={chart.maxUnit} className={chart.className} />
              ))}
          </div>
        </CardContent>
      </Card>
    )
  }
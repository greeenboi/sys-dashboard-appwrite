"use client"
// import { TrendingUp } from "lucide-react"
import {
  Label,
  PolarGrid,
  PolarRadiusAxis,
  RadialBar,
  RadialBarChart,
} from "recharts"
import {
  Card,
  CardContent,
//   CardDescription,
  CardFooter,
  CardHeader,
//   CardTitle,
} from "./card"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart"
import { cn } from "../../lib/utils"
import { Badge } from "./badge"
export const description = "A radial chart with text"

export function RadialChartText({ label, number, cpuName, unit, maxUnit, className }: { label: string, number: number, cpuName?: string, unit: string, maxUnit: number, className?: string }) {

    const getBorderColor = () => {
      const fraction = number / maxUnit;
      if (fraction <= 1 / 3) {
          return "hsl(var(--chart-2))";
      } else if (fraction <= 2 / 3) {
          return "orange";
      } else {
          return "hsl(var(--destructive))";
      }
    };

    const getSafariColor = () => {
        const fraction = number / maxUnit;
        if (fraction <= 1 / 3) {
            return "hsl(var(--chart-2))";
        } else if (fraction <= 2 / 3) {
            return "orange";
        } else {
            return "hsl(var(--destructive))";
        }
    };

    const chartData = [
      { browser: "safari", visitors: number, fill: getSafariColor() },
    ];

    const chartConfig = {
      visitors: {
        label: label,
      },
      safari: {
        label: "Safari",
        color: "hsl(var(--chart-2))",
      },
    } satisfies ChartConfig

    const calculateEndAngle = () => {
        return 360 * (number / maxUnit);
    };

    return (
      <Card className={cn(className, "flex flex-col border-[1.5px]")} style={{ borderColor: getBorderColor() }}>
        <CardHeader className="items-center pb-0">
          <Badge variant="outline" className="mb-2 flex items-center justify-center gap-1 rounded-[20px]">
            <div
              style={{
                backgroundColor: "hsl(var(--chart-2))",
                borderRadius: "50%",
                width: "8px",
                height: "8px",
              }}
            ></div>
            Real-time
          </Badge> 
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-[250px]"
          >
            <RadialBarChart
              data={chartData}
              startAngle={0}
              endAngle={calculateEndAngle()}
              innerRadius={80}
              outerRadius={110}
            >
              <PolarGrid
                gridType="circle"
                radialLines={false}
                stroke="none"
                className="first:fill-muted last:fill-background"
                polarRadius={[86, 74]}
              />
              <RadialBar dataKey="visitors" background cornerRadius={10} />
              <PolarRadiusAxis tick={false} tickLine={false} axisLine={false}>
                <Label
                  content={({ viewBox }) => {
                    if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                      return (
                        <text
                          x={viewBox.cx}
                          y={viewBox.cy}
                          textAnchor="middle"
                          dominantBaseline="middle"
                        >
                          <tspan
                            x={viewBox.cx}
                            y={viewBox.cy}
                            className="text-4xl font-bold fill-foreground"
                          >
                            {chartData[0].visitors.toLocaleString()}
                          </tspan>
                          <tspan
                            x={viewBox.cx}
                            y={(viewBox.cy || 0) + 24}
                            className="fill-muted-foreground"
                          >
                            {unit}
                          </tspan>
                        </text>
                      )
                    }
                  }}
                />
              </PolarRadiusAxis>
              <ChartTooltip content={<ChartTooltipContent labelKey={cpuName} />} />
            </RadialBarChart>
          </ChartContainer>
        </CardContent>
        <CardFooter className="flex-col gap-2 text-sm">
          <div className="leading-none text-muted-foreground">
            Showing {label}
          </div>
        </CardFooter>
      </Card>
    );
}

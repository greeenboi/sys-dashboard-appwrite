// import { RadialChartText } from './ui/radial-chart-text'
import { GPUStatsType } from '../types/core'

export default function DiskStatsChart({ stats } : { stats : GPUStatsType }) {
  return (
    <>
        {stats.disks.map((disk, index) => (
            <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 max-md:gap-y-8">
                {/* <RadialChartText label={`Disk ${index} Read Speed`} number={disk.readSpeed} unit="KB/sec" maxUnit={100} className="col-span-full" />
                <RadialChartText label={`Disk ${index} Write Speed`} number={disk.writeSpeed} unit="MB/sec" maxUnit={100} className="" />
                <RadialChartText label={`Disk ${index} Read Operations`} number={disk.readOperations} unit="Operations/sec" maxUnit={100} className="" />
                <RadialChartText label={`Disk ${index} Write Operations`} number={disk.writeOperations} unit="Operations/sec" maxUnit={100} className="" />
                <RadialChartText label={`Disk ${index} Avg Read Time`} number={disk.avgReadTime} unit="ms" maxUnit={100} className="" />
                <RadialChartText label={`Disk ${index} Avg Write Time`} number={disk.avgWriteTime} unit="ms" maxUnit={100} className="" />
                <RadialChartText label={`Disk ${index} Idle Time`} number={disk.idleTime} unit="%" maxUnit={100} className="" /> */}
                <p>{`Disk ${index} Read Speed: ${disk.readSpeed} KB/sec`}</p>
                <p>{`Disk ${index} Write Speed: ${disk.writeSpeed} MB/sec`}</p>
                <p>{`Disk ${index} Read Operations: ${disk.readOperations} Operations/sec`}</p>
                <p>{`Disk ${index} Write Operations: ${disk.writeOperations} Operations/sec`}</p>
                <p>{`Disk ${index} Avg Read Time: ${disk.avgReadTime} ms`}</p>
                <p>{`Disk ${index} Avg Write Time: ${disk.avgWriteTime} ms`}</p>
                <p>{`Disk ${index} Idle Time: ${disk.idleTime} %`}</p>
            </div>
        ))}
    </>
  )
}


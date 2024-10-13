import { SystemInfoData } from '../types/core';

const SystemInfo = ({ systemInfo }: { systemInfo : SystemInfoData | null}) => {

    if (!systemInfo) {
        return <div>Loading...</div>;
    }

    return (
        <div className='w-full h-[84vh] flex justify-center items-center flex-col gap-12 max-md:h-[80vh]'>
            <h1 className='text-6xl font-semibold underline underline-offset-8 max-md:text-4xl'>System Information</h1>
            <ul className='flex flex-col gap-4'>
                <li className='text-xl text-white'>Total Memory : {(systemInfo.total_memory / (1024 * 1024 * 1024)).toFixed(3)} GB</li>
                <li className='text-xl text-white'>Used Memory : {(systemInfo.used_memory / (1024 * 1024 * 1024)).toFixed(3)} GB</li>
                <li className='text-xl text-white'>Total Swap : {(systemInfo.total_swap / (1024 * 1024 * 1024)).toFixed(3)} GB</li>
                <li className='text-xl text-white'>Used Swap : {(systemInfo.used_swap / (1024 * 1024 * 1024)).toFixed(3)} GB</li>
                <li className='text-xl text-white'>System Name : {systemInfo.system_name}</li>
                <li className='text-xl text-white'>Kernel Version : {systemInfo.kernel_version}</li>
                <li className='text-xl text-white'>OS Version : {systemInfo.os_version}</li>
                <li className='text-xl text-white'>Host Name : {systemInfo.host_name}</li>
                {/* <li className='text-xl text-white'>CPU Count : {systemInfo.cpu_count}</li> */}
            </ul>
        </div>
    );
};

export default SystemInfo;
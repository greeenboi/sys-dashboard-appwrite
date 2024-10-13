// mod terminal;

use std::process::{Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;
use actix_cors::Cors;
use actix_web::{get, post, web, App, HttpResponse, HttpServer, Responder};
use env_logger::Env;
use serde::{Serialize, Deserialize};
use sysinfo:: System;
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::sync::mpsc;
use tokio::process::Command as TokioCommand;
use tokio_stream::wrappers::ReceiverStream;
use bytes::Bytes;
use futures::StreamExt;

#[derive(Serialize, Deserialize)]
struct SystemInfo {
    total_memory: u64,
    used_memory: u64,
    total_swap: u64,
    used_swap: u64,
    system_name: Option<String>,
    kernel_version: Option<String>,
    os_version: Option<String>,
    host_name: Option<String>,
    // cpu_count: usize,
}

#[derive(Deserialize)]
struct PowerShellCommand {
    command: String,
}

#[actix_rt::main]
async fn main() -> Result<(), std::io::Error> { 
    env_logger::init_from_env(Env::default().default_filter_or("info"));

    let data = Arc::new(Mutex::new(String::new()));
    start_data_update_thread(data.clone());

    HttpServer::new(move || {
        App::new()
            .wrap(
                Cors::default()
                    .allow_any_origin()
                    .allow_any_method()
                    .allow_any_header()
            )
            .app_data(web::Data::new(data.clone()))
            .service(get_gpu_stats)
            .service(get_system_info)
            // .service(execute_powershell)
            // .service(stream_powershell)
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await 
}

#[get("/system_info")]
async fn get_system_info() -> impl Responder {
    let mut sys = System::new_all();
    sys.refresh_all();

    let system_info = SystemInfo {
        total_memory: sys.total_memory(),
        used_memory: sys.used_memory(),
        total_swap: sys.total_swap(),
        used_swap: sys.used_swap(),
        system_name: System::name().map(|s| s.to_string()),
        kernel_version: System::kernel_version().map(|s| s.to_string()),
        os_version: System::os_version().map(|s| s.to_string()),
        host_name: System::host_name().map(|s| s.to_string()),
        // cpu_count: sys.cpus().len(),
    };

    HttpResponse::Ok().json(system_info)
}

// #[post("/execute_powershell")]
// async fn execute_powershell(command: web::Json<PowerShellCommand>) -> impl Responder {
//     let output = Command::new("powershell.exe")
//         .args(["-Command", &command.command])
//         .output()
//         .expect("Failed to execute PowerShell command");

//     let stdout = String::from_utf8_lossy(&output.stdout).to_string();
//     let stderr = String::from_utf8_lossy(&output.stderr).to_string();

//     HttpResponse::Ok().json(serde_json::json!({
//         "stdout": stdout,
//         "stderr": stderr
//     }))
// }

// #[get("/stream_powershell")]
// async fn stream_powershell(mut payload: web::Payload) -> impl Responder {
//     let (tx, rx) = mpsc::channel(100);

//     actix_web::rt::spawn(async move {
//         let mut powershell = TokioCommand::new("powershell.exe")
//             .args(["-NoExit", "-Command", "-"])
//             .stdin(Stdio::piped())
//             .stdout(Stdio::piped())
//             .stderr(Stdio::piped())
//             .spawn()
//             .expect("Failed to spawn PowerShell process");

//         let stdin = powershell.stdin.take().expect("Failed to open stdin");
//         let stdout = powershell.stdout.take().expect("Failed to open stdout");
//         let stderr = powershell.stderr.take().expect("Failed to open stderr");

//         let mut stdin_writer = tokio::io::BufWriter::new(stdin);
//         let mut stdout_reader = BufReader::new(stdout);
//         let mut stderr_reader = BufReader::new(stderr);

//         let tx_clone = tx.clone();
//         tokio::spawn(async move {
//             let mut line = String::new();
//             loop {
//                 match stdout_reader.read_line(&mut line).await {
//                     Ok(0) => break,
//                     Ok(_) => {
//                         tx_clone.send(Ok(line.clone())).await.unwrap();
//                         line.clear();
//                     }
//                     Err(e) => {
//                         tx_clone.send(Err(e.to_string())).await.unwrap();
//                         break;
//                     }
//                 }
//             }
//         });

//         let tx_clone = tx.clone();
//         tokio::spawn(async move {
//             let mut line = String::new();
//             loop {
//                 match stderr_reader.read_line(&mut line).await {
//                     Ok(0) => break,
//                     Ok(_) => {
//                         tx_clone.send(Ok(format!("ERROR: {}", line))).await.unwrap();
//                         line.clear();
//                     }
//                     Err(e) => {
//                         tx_clone.send(Err(e.to_string())).await.unwrap();
//                         break;
//                     }
//                 }
//             }
//         });

//         while let Some(chunk) = payload.next().await {
//             let chunk = chunk.unwrap();
//             let command = String::from_utf8_lossy(&chunk);
//             stdin_writer.write_all(command.as_bytes()).await.unwrap();
//             stdin_writer.write_all(b"\n").await.unwrap();
//             stdin_writer.flush().await.unwrap();
//         }
//     });

//     let byte_stream = ReceiverStream::new(rx).map(|result| {
//         result.map(|string| Bytes::from(string))
//     });

//     HttpResponse::Ok().streaming(byte_stream)
// }   

#[get("/gpu_stats")]
async fn get_gpu_stats(data: web::Data<Arc<Mutex<String>>>) -> impl Responder {
    let data = data.lock().unwrap(); // I hate borrowing data it sucks
    let data_clone = data.clone(); 

    HttpResponse::Ok().body(data_clone)
}

fn start_data_update_thread(data: Arc<Mutex<String>>) {
    thread::spawn(move || loop {
        let new_data = execute_powershell_script();
        let mut data = data.lock().unwrap();
        *data = new_data;
        // *data = String::from("{\"gpuUsage\": 50, \"cpuUsage\": 30}");
        thread::sleep(std::time::Duration::from_millis(100));
    });
}

fn execute_powershell_script() -> String {
    let script = r#"
        # Get 3D and compute usage
        $Gpu3DUsage = (((Get-Counter "\GPU Engine(*engtype_3D)\Utilization Percentage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum
        $GpuComputeUsage = (((Get-Counter "\GPU Engine(*engtype_compute)\Utilization Percentage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum

        # Get additional GPU engine usage
        $GpuVideoDecodeUsage = (((Get-Counter "\GPU Engine(*engtype_VideoDecode)\Utilization Percentage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum
        $GpuCopyUsage = (((Get-Counter "\GPU Engine(*engtype_Copy)\Utilization Percentage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum
        $GpuVideoProcessingUsage = (((Get-Counter "\GPU Engine(*engtype_VideoProcessing)\Utilization Percentage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum

        # Get total GPU memory usage
        $GpuMemTotal = (((Get-Counter "\GPU Process Memory(*)\Local Usage").CounterSamples | where CookedValue).CookedValue | measure -sum).sum

        # Get CPU information
        $CpuInfo = Get-CimInstance -ClassName Win32_Processor

        # Get CPU usage for each logical processor
        $CpuUsage = Get-Counter -Counter "\Processor(*)\% Processor Time"

        # Display CPU name and core information
        $CpuName = $CpuInfo.Name
        $CpuCores = $CpuInfo.NumberOfCores
        $CpuLogicalProcessors = $CpuInfo.NumberOfLogicalProcessors

        # Get all physical disks
        $physicalDisks = Get-WmiObject Win32_DiskDrive

        # Initialize an array to store the counter paths
        $counterPaths = @()

        foreach ($disk in $physicalDisks) {
            $diskNumber = $disk.Index
            $counterPaths += "\PhysicalDisk($diskNumber*)\Disk Read Bytes/sec"
            $counterPaths += "\PhysicalDisk($diskNumber*)\Disk Write Bytes/sec"
            $counterPaths += "\PhysicalDisk($diskNumber*)\Disk Reads/sec"
            $counterPaths += "\PhysicalDisk($diskNumber*)\Disk Writes/sec"
            $counterPaths += "\PhysicalDisk($diskNumber*)\Avg. Disk sec/Read"
            $counterPaths += "\PhysicalDisk($diskNumber*)\Avg. Disk sec/Write"
            $counterPaths += "\PhysicalDisk($diskNumber*)\% Idle Time"
        }

        # Function to convert bytes to a human-readable format
        function Format-Bytes {
            param ([long]$Bytes)
            if ($Bytes -ge 1TB) {[string]::Format("{0:0.00} TB", $Bytes / 1TB)}
            elseif ($Bytes -ge 1GB) {[string]::Format("{0:0.00} GB", $Bytes / 1GB)}
            elseif ($Bytes -ge 1MB) {[string]::Format("{0:0.00} MB", $Bytes / 1MB)}
            elseif ($Bytes -ge 1KB) {[string]::Format("{0:0.00} KB", $Bytes / 1KB)}
            else {[string]::Format("{0} B", $Bytes)}
        }

        # Get disk statistics
        $diskResults = Get-Counter -Counter $counterPaths -SampleInterval 1 -MaxSamples 1

        # Output the results
        Write-Host "CPU Name: $CpuName"
        Write-Host "CPU Cores: $CpuCores"
        Write-Host "CPU Logical Processors: $CpuLogicalProcessors"
        
        # Display CPU usage for each logical processor
        $CpuUsage.CounterSamples | ForEach-Object {
            Write-Host "CPU Core: $($_.InstanceName) - Usage: $($_.CookedValue)%"
        }
        
        Write-Output "Total GPU Process Memory Local Usage: $([math]::Round($GpuMemTotal/1MB,2)) MB"
        Write-Output "Total GPU 3D Engine Usage: $([math]::Round($Gpu3DUsage,2))%"
        Write-Output "Total GPU Compute Engine Usage: $([math]::Round($GpuComputeUsage,2))%"
        Write-Output "Total GPU Video Decode Engine Usage: $([math]::Round($GpuVideoDecodeUsage,2))%"
        Write-Output "Total GPU Copy Engine Usage: $([math]::Round($GpuCopyUsage,2))%"
        Write-Output "Total GPU Video Processing Engine Usage: $([math]::Round($GpuVideoProcessingUsage,2))%"

        # Display disk statistics
        foreach ($disk in $physicalDisks) {
            $diskNumber = $disk.Index
            $diskName = $disk.Caption
            
            $readBytes = ($diskResults.CounterSamples | Where-Object {$_.Path -like "*($diskNumber*)*" -and $_.Path -like "*Disk Read Bytes/sec"}).CookedValue
            $writeBytes = ($diskResults.CounterSamples | Where-Object {$_.Path -like "*($diskNumber*)*" -and $_.Path -like "*Disk Write Bytes/sec"}).CookedValue
            $readOps = ($diskResults.CounterSamples | Where-Object {$_.Path -like "*($diskNumber*)*" -and $_.Path -like "*Disk Reads/sec"}).CookedValue
            $writeOps = ($diskResults.CounterSamples | Where-Object {$_.Path -like "*($diskNumber*)*" -and $_.Path -like "*Disk Writes/sec"}).CookedValue
            $avgReadTime = ($diskResults.CounterSamples | Where-Object {$_.Path -like "*($diskNumber*)*" -and $_.Path -like "*Avg. Disk sec/Read"}).CookedValue
            $avgWriteTime = ($diskResults.CounterSamples | Where-Object {$_.Path -like "*($diskNumber*)*" -and $_.Path -like "*Avg. Disk sec/Write"}).CookedValue
            $idleTime = ($diskResults.CounterSamples | Where-Object {$_.Path -like "*($diskNumber*)*" -and $_.Path -like "*% Idle Time"}).CookedValue

            Write-Host "Disk $diskNumber - $diskName"
            Write-Host "  Read Speed: $(Format-Bytes $readBytes)/sec"
            Write-Host "  Write Speed: $(Format-Bytes $writeBytes)/sec"
            Write-Host "  Read Operations: $([math]::Round($readOps, 2))/sec"
            Write-Host "  Write Operations: $([math]::Round($writeOps, 2))/sec"
            Write-Host "  Avg. Read Time: $([math]::Round($avgReadTime * 1000, 2)) ms"
            Write-Host "  Avg. Write Time: $([math]::Round($avgWriteTime * 1000, 2)) ms"
            Write-Host "  Idle Time: $([math]::Round($idleTime, 2))%"
            Write-Host ""
        }
    "#;

    let output = Command::new("powershell.exe")
        .args(["-ExecutionPolicy", "Bypass", "-Command", script])
        .stdout(Stdio::piped())
        .output()
        .expect("Failed to execute PowerShell script");

    String::from_utf8(output.stdout).unwrap()
}
use actix_web::{web, App, Error, HttpRequest, HttpResponse, HttpServer};
use actix_web_actors::ws;
use actix::prelude::*;
use std::process::{Command, Stdio};
use tokio::io::{AsyncBufReadExt, AsyncWriteExt, BufReader};
use tokio::sync::mpsc;
use futures::StreamExt;

struct PowerShellWs {
    tx: mpsc::Sender<String>,
}

impl actor::Actor for PowerShellWs {
    type Context = ws::WebsocketContext<Self>;

    fn started(&mut self, ctx: &mut Self::Context) {
        let (process_tx, mut process_rx) = mpsc::channel(100);
        let tx = self.tx.clone();

        // Spawn PowerShell process
        tokio::spawn(async move {
            let mut child = Command::new("powershell")
                .args(&["-NoExit", "-Command", "-"])
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
                .expect("Failed to spawn PowerShell process");

            let mut stdin = child.stdin.take().expect("Failed to open stdin");
            let stdout = child.stdout.take().expect("Failed to open stdout");
            let stderr = child.stderr.take().expect("Failed to open stderr");

            let mut stdout_reader = BufReader::new(stdout);
            let mut stderr_reader = BufReader::new(stderr);

            loop {
                tokio::select! {
                    line = stdout_reader.lines().next() => {
                        if let Some(Ok(line)) = line {
                            tx.send(line).await.ok();
                        }
                    }
                    line = stderr_reader.lines().next() => {
                        if let Some(Ok(line)) = line {
                            tx.send(format!("ERROR: {}", line)).await.ok();
                        }
                    }
                    cmd = process_rx.recv() => {
                        match cmd {
                            Some(cmd) => {
                                stdin.write_all(cmd.as_bytes()).await.ok();
                                stdin.write_all(b"\n").await.ok();
                                stdin.flush().await.ok();
                            }
                            None => break,
                        }
                    }
                }
            }
        });

        // Forward PowerShell output to WebSocket
        ctx.spawn(
            async move {
                while let Some(msg) = process_rx.recv().await {
                    ctx.text(msg);
                }
            }
            .into_actor(self),
        );
    }
}

impl StreamHandler<Result<ws::Message, ws::ProtocolError>> for PowerShellWs {
    fn handle(&mut self, msg: Result<ws::Message, ws::ProtocolError>, ctx: &mut Self::Context) {
        match msg {
            Ok(ws::Message::Text(text)) => {
                self.tx.try_send(text.to_string()).ok();
            }
            Ok(ws::Message::Close(reason)) => {
                ctx.close(reason);
                ctx.stop();
            }
            _ => (),
        }
    }
}

async fn powershell_ws(req: HttpRequest, stream: web::Payload) -> Result<HttpResponse, Error> {
    let (tx, _) = mpsc::channel(100);
    let resp = ws::start(PowerShellWs { tx }, &req, stream);
    resp
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    HttpServer::new(|| {
        App::new().route("/ws", web::get().to(powershell_ws))
    })
    .bind("127.0.0.1:808")?
    .run()
    .await
}
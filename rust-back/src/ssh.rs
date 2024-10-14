use std::io::{Read, Write};
use actix_web::{web, Error, HttpResponse};
use actix_web_actors::ws;
use futures::StreamExt;
use ssh2::Session;
use tokio::sync::mpsc;

pub async fn ssh_connect(
    mut ws: web::WebsocketStream<actix_web::web::Payload>,
) -> Result<HttpResponse, Error> {
    let (tx, mut rx) = mpsc::channel(100);

    actix_web::rt::spawn(async move {
        let tcp = std::net::TcpStream::connect("your_ssh_server:22").unwrap();
        let mut sess = Session::new().unwrap();
        sess.set_tcp_stream(tcp);
        sess.handshake().unwrap();

        sess.userauth_password("your_username", "your_password").unwrap();

        let mut channel = sess.channel_session().unwrap();
        channel.shell().unwrap();

        let (mut reader, mut writer) = (channel.stream(0), channel);

        let tx_clone = tx.clone();
        tokio::spawn(async move {
            let mut buffer = [0; 1024];
            loop {
                match reader.read(&mut buffer) {
                    Ok(n) if n > 0 => {
                        tx_clone.send(Ok(buffer[..n].to_vec())).await.unwrap();
                    }
                    _ => break,
                }
            }
        });

        while let Some(msg) = ws.next().await {
            match msg {
                Ok(ws::Message::Text(text)) => {
                    writer.write_all(text.as_bytes()).unwrap();
                    writer.flush().unwrap();
                }
                Ok(ws::Message::Close(_)) | Err(_) => break,
                _ => {}
            }
        }
    });

    Ok(HttpResponse::SwitchingProtocols()
        .upgrade("websocket")
        .connection("Upgrade")
        .body(""))
}
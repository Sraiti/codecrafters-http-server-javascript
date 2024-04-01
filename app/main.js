const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();

    const path = request.split(" ")[1];

    const pathParam = path.substring(6);

    console.log({ path, pathParam });

    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    }

    if (path.startsWith("/echo")) {
      console.log("echo", pathParam);
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${pathParam.length}\r\n\r\n${pathParam}`
      );
    }

    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");

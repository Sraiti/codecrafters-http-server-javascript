const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.
console.log("Logs from your program will appear here!");

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", (data) => {
    const request = data.toString();

    const reqParts = request.split("\r\n");

    console.log({ reqParts });

    const userAgentHeader = reqParts.find((part) =>
      part.startsWith("User-Agent")
    );

    console.log({
      userAgentHeader,
    });

    const userAgent = userAgentHeader ? userAgentHeader.split(": ")[1] : null;

    console.log({
      userAgent,
    });

    const path = reqParts[0].split(" ")[1];

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

    if (path.startsWith("/user-agent") && userAgent) {
      console.log({ userAgent });

      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
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

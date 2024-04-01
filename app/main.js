const { readFile, writeFile } = require("fs/promises");
const net = require("net");

// You can use print statements as follows for debugging, they'll be visible when running tests.

const args = process.argv;

function getArgValue() {
  return args[args.findIndex((arg) => arg === "--directory") + 1];
}

// Uncomment this to pass the first stage
const server = net.createServer((socket) => {
  socket.on("data", async (data) => {
    const request = data.toString();
    const reqParts = request.split("\r\n");
    const [requestVerb, path] = reqParts[0].split(" ")[0];

    const userAgentHeader = reqParts.find((part) =>
      part.startsWith("User-Agent")
    );

    const userAgent = userAgentHeader ? userAgentHeader.split(": ")[1] : null;

    if (path === "/") {
      socket.write("HTTP/1.1 200 OK\r\n\r\n");
    }

    if (path.startsWith("/echo")) {
      const echoParam = path.substring(6);
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${echoParam.length}\r\n\r\n${echoParam}`
      );
    }

    if (path.startsWith("/user-agent") && userAgent) {
      socket.write(
        `HTTP/1.1 200 OK\r\nContent-Type: text/plain\r\nContent-Length: ${userAgent.length}\r\n\r\n${userAgent}`
      );
    }

    if (requestVerb === "GET" && path.startsWith("/files")) {
      const directory = getArgValue();

      const fileName = path.split("/").pop();

      const fileContent = await readFile(
        `${directory}${fileName}`,
        "utf-8"
      ).catch((err) => {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
      });

      if (fileContent) {
        socket.write(
          `HTTP/1.1 200 OK\r\nContent-Type: application/octet-stream\r\nContent-Length: ${fileContent.length}\r\n\r\n${fileContent}`
        );
      }
    }
    if (requestVerb === "POST" && path.startsWith("/files")) {
      const directory = getArgValue();
      const fileName = path.split("/").pop();

      const payload = reqParts[reqParts.length - 1];

      await writeFile(`${directory}${fileName}`, payload).catch((err) => {
        socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
        socket.end();
      });

      socket.write(`HTTP/1.1 201 OK\r\n\r\n`);
    }

    socket.write("HTTP/1.1 404 Not Found\r\n\r\n");

    socket.end();
  });

  socket.on("close", () => {
    socket.end();
    server.close();
  });
});

server.listen(4221, "localhost");

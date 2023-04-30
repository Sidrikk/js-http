import fs from "fs";
import url from "url";
import httpHeaders from "http-headers";
import parser from "http-string-parser";
import build from "../server/server.js";

const { parseRequest } = parser;

describe("request", () => {
  const app = build();

  const data = fs.readFileSync("solutions/3-body", "utf-8");
  const requestObj = httpHeaders(
    data
      .split("\n")
      .map((el) => el.trim())
      .join("\r\n")
  );

  let options;

  it("check version", async () => {
    expect(requestObj.version).toEqual({ major: 1, minor: 1 });
  });

  it("should work", async () => {
    const { body } = parseRequest(data);

    const parts = {
      port: 8080,
      protocol: "http",
      hostname: "localhost",
      pathname: requestObj.url,
    };
    const requestUrl = url.format(parts);

    const headers = Object.entries(requestObj.headers).reduce(
      (acc, [header, value]) => ({
        ...acc,
        [header]: value.split(",").join("; "),
      }),
      {}
    );

    const { host } = headers;
    expect(host).toEqual("localhost");

    options = {
      method: requestObj.method,
      headers,
      body: body.trim(),
      url: requestUrl,
    };

    const {
      raw: { req },
      statusCode: status,
    } = await app.inject(options);

    const { method } = req;
    const result = { method, status };
    expect(result).toMatchObject({ status: 200, method: "POST" });
  });

  it("request length", async () => {
    const requestLength = Number(options.headers["content-length"]);
    expect(options.body.length).toEqual(requestLength);
  });
});

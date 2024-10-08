import http from "node:http";
import { URL } from "node:url";
import AppError from "../core/appError";

export interface CustomRequest extends http.IncomingMessage {
  body?: any;
}

export type CustomResponse = http.ServerResponse;

type NextMiddlewareExecutor = (error?: Error) => void;

export type Middleware = (
  request: CustomRequest,
  response: CustomResponse,
  next?: NextMiddlewareExecutor
) => void;

type URLPath = string;
export type AllowedHTTPMethods = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type RequestProcessorPathMap = Record<URLPath, Middleware[]>;

export class HTTPServer {
  private port: number;
  private server: ReturnType<typeof http.createServer>;
  private middlewareMap: Record<AllowedHTTPMethods, RequestProcessorPathMap> = {
    GET: {},
    POST: {},
    PUT: {},
    PATCH: {},
    DELETE: {},
  };
  private appMiddlewares: Middleware[] = [];
  private pathSpecificProcessors: RequestProcessorPathMap = {};

  constructor(port: number) {
    this.port = port;

    this.server = http.createServer(
      (request: http.IncomingMessage, response: CustomResponse) => {
        if (
          !["GET", "POST", "PUT", "PATCH", "DELETE"].includes(request.method!)
        ) {
          response
            .writeHead(500)
            .end(`Sorry, currently not handling ${request.method}`);
          return;
        }
        this.handleRequest(request as CustomRequest, response);
      }
    );

    this.server.listen(port, () => {
      console.log("listening at port: ", port);
    });
  }

  private handleRequest(request: CustomRequest, response: CustomResponse) {
    console.log("Handling request:", request.method, request.url);
    if (request.method) {
      const pathMap = this.middlewareMap[request.method as AllowedHTTPMethods];
      const url = new URL(request.url ?? "", `http://${request.headers.host}`);
      const routeMiddlewares = pathMap[url.pathname] || [];
      console.dir(routeMiddlewares, { depth: 0 });

      const allMiddlewares = [...this.appMiddlewares, ...routeMiddlewares];
      this.executeMiddlewares(request, response, allMiddlewares, 0);
    }
  }

  private registerRoute(
    method: AllowedHTTPMethods,
    path: string,
    ...processor: Middleware[]
  ) {
    if (!this.middlewareMap[method][path]) {
      this.middlewareMap[method][path] = [];
    }
    this.middlewareMap[method][path].push(...processor);
  }

  public get(path: string, ...processor: Middleware[]) {
    this.registerRoute("GET", path, ...processor);
  }

  public post(path: string, ...processor: Middleware[]) {
    this.registerRoute("POST", path, ...processor);
  }

  public put(path: string, ...processor: Middleware[]) {
    this.registerRoute("PUT", path, ...processor);
  }

  public patch(path: string, ...processor: Middleware[]) {
    this.registerRoute("PATCH", path, ...processor);
  }

  public delete(path: string, ...processor: Middleware[]) {
    this.registerRoute("DELETE", path, ...processor);
  }

  public use(middleware: Middleware) {
    this.appMiddlewares.push(middleware);
  }

  private nextFunctionCreator(
    request: CustomRequest,
    response: CustomResponse,
    middlewares: Middleware[],
    nextIndex: number
  ): NextMiddlewareExecutor {
    return (error?: Error) => {
      if (error) {
        response.writeHead(500).end(error.message);
      } else {
        if (nextIndex < middlewares.length) {
          this.executeMiddlewares(request, response, middlewares, nextIndex);
        } else {
          response
            .writeHead(404, { "Content-Type": "text/plain" })
            .end("Not Found");
        }
      }
    };
  }

  private executeMiddlewares(
    request: CustomRequest,
    response: CustomResponse,
    middlewares: Middleware[],
    nextIndex: number
  ) {
    console.log("Executing middleware:", nextIndex);
    const currentMiddleware = middlewares[nextIndex];
    if (currentMiddleware) {
      currentMiddleware(
        request,
        response,
        this.nextFunctionCreator(request, response, middlewares, nextIndex + 1)
      );
    } else {
      response
        .writeHead(404, { "Content-Type": "text/plain" })
        .end("Not Found");
    }
  }
}

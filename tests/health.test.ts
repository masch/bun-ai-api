import { expect, test, describe } from "bun:test";
import { app } from "../index";

const handler = (req: Request) => app.fetch(req);

describe("Health Check", () => {
    test("GET /healthcheck should return OK", async () => {
        const req = new Request("http://localhost/healthcheck");
        const res = await handler(req);
        expect(res.status).toBe(200);
        expect(await res.text()).toBe("OK");
    });
});

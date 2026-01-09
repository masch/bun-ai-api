import { expect, test, describe } from "bun:test";
import { app } from "../index";

const handler = (req: Request) => app.fetch(req);

describe("Not Found Handlers", () => {
    test("GET /invalid-path should return 404", async () => {
        const req = new Request("http://localhost/invalid-path");
        const res = await handler(req);
        expect(res.status).toBe(404);
        expect(await res.text()).toBe("Not Found");
    });

    test("POST /invalid-path should return 404", async () => {
        const req = new Request("http://localhost/invalid-path", { method: "POST" });
        const res = await handler(req);
        expect(res.status).toBe(404);
        expect(await res.text()).toBe("Not Found");
    });
});

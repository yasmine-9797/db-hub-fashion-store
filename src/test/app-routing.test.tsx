import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";

const makeRouter = () => createRouter({ routeTree, context: { queryClient: new QueryClient() } });

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    expect(makeRouter().matchRoutes("/").at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it.each([
    ["/shop", "/shop"],
    ["/search", "/search"],
    ["/collections/women", "/collections/$slug"],
    ["/products/oversized-linen-shirt", "/products/$slug"],
    ["/cart", "/cart"],
    ["/checkout", "/checkout"],
    ["/order/DBH-261021-ABCDE", "/order/$orderNumber"],
    ["/payment-status", "/payment-status"],
    ["/wishlist", "/wishlist"],
    ["/wholesale", "/wholesale"],
    ["/about", "/about"],
    ["/contact", "/contact"],
    ["/faq", "/faq"],
    ["/policies/shipping", "/policies/shipping"],
    ["/policies/returns", "/policies/returns"],
    ["/policies/privacy", "/policies/privacy"],
    ["/policies/terms", "/policies/terms"],
    ["/admin", "/admin"],
  ])("matches %s", (path, routeId) => {
    expect(makeRouter().matchRoutes(path).at(-1)?.routeId).toBe(routeId);
  });

  it("drops unknown shop filter values", () => {
    const match = makeRouter()
      .matchRoutes("/shop", { category: "korean", size: "XXL", sort: "bogus", colour: "Black" })
      .at(-1);
    expect(match?.routeId).toBe("/shop");
    expect(match?.search).toEqual({ category: "korean", colour: "Black" });
  });
});

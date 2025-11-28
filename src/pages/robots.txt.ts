import type { APIRoute } from "astro";
// 核心修改：仅保留「禁止所有爬虫抓取全站」的规则
const robotsTxt = `
User-agent: *
Disallow: /
`.trim();

export const GET: APIRoute = () => {
	return new Response(robotsTxt, {
		headers: {
			"Content-Type": "text/plain; charset=utf-8",
		},
	});
};

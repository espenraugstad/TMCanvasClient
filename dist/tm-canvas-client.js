class TMCanvasClient {
    constructor() {
        this.COURSE_ID = ENV.current_context.id;
        this.BASE_URL = "https://uia.instructure.com/api/v1";
    }
    welcome() {
        console.log("Welcome to the TM Canvas Client");
    }

    async listModules(url = '', modules = []) {
        try {
            if (url === '') {
                url = `${this.BASE_URL}/courses/${this.COURSE_ID}/modules`
            }
            const res = await fetch(url);
            const data = await res.json();
            modules = modules.concat(data);
            const nextLink = this.#findNextLink(res);
            if (nextLink) {
                return await this.listModules(nextLink, modules);
            } else {
                return modules;
            }
        } catch (err) {
            console.error("Unable to list modules", err);
        }
    }

    async listPages(url = '', pages = []) {
        try {
            if (url === '') {
                url = `${this.BASE_URL}/courses/${this.COURSE_ID}/pages`
            }
            const res = await fetch(url);
            const data = await res.json();
            pages = pages.concat(data);
            const nextLink = this.#findNextLink(res);
            if (nextLink) {
                return await this.listPages(nextLink, pages);
            } else {
                return pages;
            }

        } catch (err) {
            console.error("Unable to list pages", err);

        }
    }

    async listModulesWithItemsAndPageContent() {
        const modules = await this.listModules();

        for (const module of modules) {
            const items = await this.listModuleItems(module.items_url);

            for (const item of items) {
                if (item.type === "Page") {
                    const page = await this.getPage(item.url);
                    if (page) {
                        item._page_info = page;
                    } else {
                        item._page_info = {};
                    }
                }
            }
            module._module_items = items;

        }

        return modules;

    }

    async getPage(url) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            return data;
        } catch (err) {
            console.error("Unable to get page", err);
        }
    }

    async listModuleItems(url, items = []) {
        try {
            const res = await fetch(url);
            const data = await res.json();
            items = items.concat(data);
            const nextLink = this.#findNextLink(res);
            if (nextLink) {
                return await this.listModuleItems(nextLink, items);
            } else {
                return items;
            }
        } catch (err) {
            console.error("Unable to list module items", err);
        }
    }

    #findNextLink(results) {
        let responseHeaders = [...results.headers];
        let linkHeader = responseHeaders.find((el) => el[0].toLowerCase() === "link");
        let textArray = linkHeader[1].split(",");
        // Go through and see if we find a next link
        for (const link of textArray) {
            let [url, rel] = link.split(";");
            if (rel.includes("next")) {
                // Remove the < and > from start and end.
                return url.substring(1, url.length - 1);
            }
        }
        return false; // No next-link was found.
    }

}
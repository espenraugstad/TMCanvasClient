class TMCanvasClient {
    constructor() {
        this.COURSE_ID = ENV.current_context.id;
        this.BASE_URL = "https://uia.instructure.com/api/v1";
    }
    welcome() {
        console.log("Welcome to the TM Canvas Client");
    }

    async getModules(url = '', modules = []) {
        try {
            if (url === '') {
                url = `${this.BASE_URL}/courses/${this.COURSE_ID}/modules`
            }
            const res = await fetch(url);
            const data = await res.json();
            modules = modules.concat(data);
            const nextLink = this.#findNextLink(res);
            if (nextLink) {
                return await this.getModules(nextLink, modules);
            } else {
                return modules;
            }
        } catch (err) {
            console.error("Unable to get modules", err);
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
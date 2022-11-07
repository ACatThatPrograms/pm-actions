const core = require("@actions/core");
const gh = require("@actions/github");

(async () => {
    try {
        core.notice("Checking event status...")
    } catch (ex) {
        core.setFailed(ex.message);
    }
})();

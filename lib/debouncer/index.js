module.exports = function(callback, sensitivity) {

    if (typeof(callback) !== "function") {
        throw new Error("Callback is required");
    }

    sensitivity = sensitivity || 70;
    var lastState, lastSent, timeout;

    return {
        process: function(value) {
            if (timeout !== false) {
                clearTimeout(timeout);
            }

            timeout = setTimeout(function() {
                timeout = false;

                if (lastState != lastSent) {
                    callback(lastState);
                }

                lastSent = lastState;
            }, sensitivity);

            lastState = value;
        }
    }
};
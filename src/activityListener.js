const activityListener = (function () {
    // internal state; isRunning - Boolean
    let isRunning = true
    // lookup table, callback is key, procdeure is value; callbackMap - WeakMap
    const callbackMap = new Map()

    /**
     * Execute callback with checks
     * @private
     */
    const execute = function (event, callback) {
        if (!isRunning) {
            return
        }
        try {
            callback(event)
        } catch (error) {
            console.error('activityListener caught faulty callback')
        }
    }

    /**
     * Add or remove EventListeners
     * @private
     * @param {String} aim - 'add' | 'remove'
     * @param {String} type - eventType
     * @param {Function} callback - external function to call in case of event
     */
    const eventHandling = function (aim, type, callback) {
        const eventOptions = { passive: true, capture: true }
        const handler = `on${type}`
        const procedure = callbackMap.get(callback).procedure
        if (handler in window) {
            window[aim + 'EventListener'](type, procedure, eventOptions)
        } else if (handler in document) {
            document[aim + 'EventListener'](type, procedure, eventOptions)
        } else if (aim === 'add') {
            console.warn(`activityListener rejected ${type}-event`)
        }
    }

    /**
     * Attach callback to event.
     * @param {String} type - event type to watch
     * @param {Function} callback
     */
    const register = function (type, callback) {
        const procedure = function (event) {
            execute(event, callback)
        }
        callbackMap.set(callback, { type: type, procedure: procedure })
        eventHandling('add', type, callback)
    }

    /**
     * Detach event/callback pair.
     * @param {String} type - event type to watch
     * @param {Function} callback
     */
    const erase = function (type, callback) {
        eventHandling('remove', type, callback)
        callbackMap.delete(callback)
    }

    /**
     * Erase all callbacks, without knowing them :-)
     */
    const destroy = function () {
        for (let [key, value] of callbackMap) {
            erase(value.type, key)
        }
    }

    /**
     * Expose callbacks
     */
    const resume = function () {
        isRunning = true
    }

    /**
     * Block callbacks
     */
    const pause = function () {
        isRunning = false
    }

    return {
        clear: destroy, // deprecated
        destroy: destroy,
        erase: erase,
        pause: pause,
        register: register,
        resume: resume,
    }
})()

export { activityListener }

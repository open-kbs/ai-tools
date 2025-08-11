/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	// The require scope
/******/ 	var __nccwpck_require__ = {};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__nccwpck_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__nccwpck_require__.o(definition, key) && !__nccwpck_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__nccwpck_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__nccwpck_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// ESM COMPAT FLAG
__nccwpck_require__.r(__webpack_exports__);

// EXPORTS
__nccwpck_require__.d(__webpack_exports__, {
  "handler": () => (/* binding */ handler)
});

;// CONCATENATED MODULE: ./actions.js
const getActions = () => [
    [/\/?googleSearch\("(.*)"\)/, async (match) => {
        const q = match[1];
        try {
            const response = await openkbs.googleSearch(q, {});
            const data = response?.map(({ title, link, snippet, pagemap }) => ({
                title, link, snippet, image: pagemap?.metatags?.[0]?.["og:image"]
            }));
            return { data };
        } catch (e) {
            return { error: e.message };
        }
    }],

    [/\/?webpageToText\("(.*)"\)/, async (match) => {
        try {
            let response = await openkbs.webpageToText(match[1]);
            if(!response?.url) return { data: { error: "Unable to read website" } };
            return { data: response };
        } catch (e) {
            return { error: e.response?.data || e };
        }
    }],

    [/\/?documentToText\("(.*)"\)/, async (match) => {
        try {
            let response = await openkbs.documentToText(match[1]);
            return { data: response };
        } catch (e) {
            return { error: e.response.data };
        }
    }],

    [/\/?imageToText\("(.*)"\)/, async (match) => {
        try {
            let response = await openkbs.imageToText(match[1]);

            if (response?.detections?.[0]?.txt) {
                response = { detections: response?.detections?.[0]?.txt };
            }

            return { data: response };
        } catch (e) {
            return { error: e.response.data };
        }
    }]
];

;// CONCATENATED MODULE: ./handler.js


const backendHandler = async (event) => {
    const lastMessage = event.payload.messages[event.payload.messages.length - 1];
    const actions = getActions();

    const matchingActions = actions.reduce((acc, [regex, action]) => {
        const matches = [...lastMessage.content.matchAll(new RegExp(regex, 'g'))];
        matches.forEach(match => {
            acc.push(action(match, event));
        });
        return acc;
    }, []);

    const reachedMessageLimit = event?.payload?.messages?.length > 60;

    if (matchingActions.length > 0) {
        try {
            const results = await Promise.all(matchingActions);
            
            const isOnlyJobCompletion = results.length === 1 && 
                (results[0]?.type === 'JOB_COMPLETED' || results[0]?.type === 'JOB_FAILED');
            
            const meta = {
                _meta_actions: (reachedMessageLimit || isOnlyJobCompletion) ? [] : ["REQUEST_CHAT_MODEL"]
            };

            if (results?.[0]?.data?.some?.(o => o?.type === 'image_url')) {
                return {
                    ...results[0],
                    ...meta
                };
            }

            return {
                type: 'RESPONSE',
                data: results,
                ...meta
            };
        } catch (error) {
            return {
                type: 'ERROR',
                error: error.message,
                _meta_actions: reachedMessageLimit ? [] : ["REQUEST_CHAT_MODEL"]
            };
        }
    }

    return { type: 'CONTINUE' };
};
;// CONCATENATED MODULE: ./onRequest.js


const handler = async (event) => backendHandler(event)
module.exports = __webpack_exports__;
/******/ })()
;
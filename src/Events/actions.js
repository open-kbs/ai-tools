export const getActions = () => [
    [/\/?textToImage\("(.*)"\)/, async (match) => {
        const response = await openkbs.textToImage(match[1], { serviceId: 'stability.sd3Medium' });
        const imageSrc = `data:${response.ContentType};base64,${response.base64Data}`;
        return { type: 'SAVED_CHAT_IMAGE', imageSrc };
    }],

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
    }],

    [/\/?textToSpeech\("(.*)"\s*,\s*"(.*)"\)/, async (match) => {
        try {
            const response = await openkbs.textToSpeech(match[2], {
                languageCode: match[1]
            });
            return { data: response };
        } catch (e) {
            return { error: e.response.data };
        }
    }],
];

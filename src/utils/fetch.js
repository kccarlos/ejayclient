import React, {useState, useEffect} from "react";

/**
 * all get requests
 * @param link
 * @param params
 */
function customizedFetch(link, params) {
    return new Promise((resolve, reject) => {
        fetch(link).then((response, rej) => {
            if (!response.ok) {
                window.alert(`Error: ${response.statusText}`);
                reject(response.statusText)
            } else {
                resolve(response.json())
            }
        })
    })
}

export default customizedFetch


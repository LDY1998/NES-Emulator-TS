


const recursive_log = (obj: Object) => {
    Object.entries(obj).filter((entry) => entry[0] !== "memory").map((entry) => {
        if (typeof entry[1] === "object" && entry[1] !== null) {
            recursive_log(entry[1]);
        } else {
            console.log(`${entry[0]}: ${entry[1]} \n`);
        }
    })
}

export {
    recursive_log
}
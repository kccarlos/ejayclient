function KeyWordMatch(posts, query) {
    if (posts === undefined) {
        return [];
    }
    let filtered = posts;
    let n = filtered.length;
    // console.log('query = ', query);
    let word_list = query.map(word => word.toLowerCase());
    // let word_list = query.split(' ').map(word => word.toLowerCase());
    for (let i = 0; i < n; i++ ) {
        filtered[i].combined = (filtered[i].title + " " + filtered[i].description).split(" ").map(word => word.toLowerCase());
        // calculate TF-IDF Scoring Function
        let score = 0;
        // filtered.map(post => {console.log('hi', post.combined)});

        for (let j = 0; j < word_list.length; j++) {
            let tf = filtered[i].combined.filter(ele => ele === word_list[j]).length;
            if (tf !== 0) {
                score += (filtered[i].combined.filter(ele => ele === word_list[j]).length * Math.log( n / (filtered.filter(post => post.combined !== undefined && post.combined.includes(word_list[j])).length)));
            }
        }
        filtered[i].score = score;
    }
    

    return filtered.filter(post => post.score !== 0).sort((a,b) => b.score - a.score);
}

export default KeyWordMatch;
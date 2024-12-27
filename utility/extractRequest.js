function getQueryFromReq(req) {
    const query = {};
    // Build the query object based on queryParam
    if (req.query.keyword) query.name_vn = {$regex: req.query.keyword, $options: "i"};
    if (req.query.genre) query.type_name_vn = req.query.genre;
    if (req.query.age) query.limitage_vn = req.query.age;
    if (req.query.country) query.country_name_vn = req.query.country;

    return query;
}

function getPageFromReq(req) {
    return parseInt(req.query.page) || 1;
}

module.exports = {getQueryFromReq, getPageFromReq};
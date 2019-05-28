'use strict';

module.exports = () => {
    var img_repo = process.env.BUCKET || 'serverless-cat-detector-img-repo';
    var results_table = process.env.TABLE || 'ServerlessCatDetectorStatus';

    return {
        serverless_cat_detector_img_repo: img_repo,
        serverless_cat_detector_results_table: results_table
    };
};

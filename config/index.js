var mongoDevUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "localhost:27017/koaVote_Dev";
var mongoStageUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "localhost:27017/koaVote_Test";
var mongoProdUri = process.env.MONGOLAB_URI || process.env.MONGOHQ_URL || "localhost:27017/koaVote_Prod";

var config = {
  local: {
    mode: 'local',
    port: 3000,
    mongoUrl: mongoDevUri
  },
  staging: {
    mode: 'staging',
    port: 4000,
    mongoUrl: mongoStageUri
  },
  prod: {
    mode: 'prod',
    port: 5000,
    mongoUrl: mongoProdUri
  }
};

module.exports = function (mode) {
  return config[mode || process.argv[2] || 'local'] || config.local;
};
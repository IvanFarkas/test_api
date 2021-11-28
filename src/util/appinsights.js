const appInsights = require("applicationinsights");
const config = require("./config");
const logger = require("./logger");

const { APPINSIGHTS_INSTRUMENTATIONKEY } = config;

logger.info(`appinsightsInstrumentationKey: ${APPINSIGHTS_INSTRUMENTATIONKEY}`);
appInsights
	.setup(APPINSIGHTS_INSTRUMENTATIONKEY)
	.setAutoDependencyCorrelation(true)
	.setAutoCollectRequests(true)
	.setAutoCollectPerformance(true, true)
	.setAutoCollectExceptions(true)
	.setAutoCollectDependencies(true)
	.setAutoCollectConsole(true)
	.setUseDiskRetryCaching(true)
	.setSendLiveMetrics(false)
	.setDistributedTracingMode(appInsights.DistributedTracingModes.AI)
	.start();

const client = appInsights.defaultClient;

exports.client = client;

const express = require("express");
const controller = require("../controllers/test");

const router = express.Router();

router.get("/", controller.root);

// Configure Liveness, Readiness and Startup Probes - https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
// Health Checks Endpoints - https://github.com/nodeshift/nodejs-reference-architecture/blob/main/docs/operations/healthchecks.md#endpoints
// values.yaml - livenessProbePath
router.get("/livez", controller.health);

// values.yaml - readinessProbePath
router.get("/readyz", controller.readyness);

router.get("/cluster", controller.cluster);

router.get("/redis", controller.redis);

module.exports = router;

const sharp = require('sharp');
const fscam = require('./fswebcam');
const fs = require('fs');
const path = require('path');

const DIFFERENCE_SCORE_BREAKPOINT = 2.2;

const PROCESS_INTEVAL = 2000;

(async () => {


  const resultsDir = path.join(__dirname, 'results');

  if (!fs.existsSync(resultsDir))
    fs.mkdirSync(resultsDir)

  const processCameraView = async () => {
    const cameraSnapshot = await fscam.getSnapshot();
    const cameraSnapshotDifference = await fscam.getSnapshotDifferenceScore(cameraSnapshot);
    if (cameraSnapshotDifference > DIFFERENCE_SCORE_BREAKPOINT) {
      fs.renameSync(cameraSnapshot.captureFile.filePath, path.join(resultsDir, cameraSnapshot.captureFile.fileName))
    } else {
      fs.rmSync(cameraSnapshot.captureFile.filePath)
    }
    fs.rmSync(cameraSnapshot.imageDiffFile.filePath)
  }

  const tick = async () => {
    await processCameraView();
  }

  setInterval(tick, PROCESS_INTEVAL)
})();
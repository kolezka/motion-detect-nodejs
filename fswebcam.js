const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid').v4;
const { timeout } = require('./utils');
const sharp = require('sharp');


const config = {
  width: 1280,
  height: 720,
  quality: 50,
  timeoutBetweenFrames: 500,
}


class FSWebcam {
  snapshotsDir = path.join(__dirname, 'snapshots')

  constructor() {
    if (!fs.existsSync(this.snapshotsDir))
      fs.mkdirSync(this.snapshotsDir);
  }

  async getNewFrame() {
    const fileName = uuid();
    const filePath = path.join(this.snapshotsDir, fileName);
    const process = spawn('fswebcam', [
      '-r', `${config.width}x${config.height}`,
      '--no-banner',
      '--no-timestamp',
      '--jpeg', config.quality,
      '--save', filePath,
    ]);
    await new Promise((resolve) => {
      process.on('exit', () => {
        resolve();
      })
    })
    return {
      fileName: `${fileName}`,
      filePath: `${filePath}`,
    }
  }

  async getSnapshot() {
    const captureFile = await this.getNewFrame();
    await timeout(config.timeoutBetweenFrames);
    const imageDiffFile = await this.getNewFrame();
    return {
      captureFile,
      imageDiffFile,
    }
  }

  async getSnapshotDifferenceScore({ captureFile, imageDiffFile }) {
    const buffer = await sharp({
      create: {
        width: config.width, height: config.height, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 }
      }
    }).composite([
      { input: captureFile.filePath },
      { input: imageDiffFile.filePath, blend: 'difference' }
    ]).toBuffer({ resolveWithObject: true, })

    let score = 0;
    const DIFF_BREAKPOINT = 100;

    for (let i = 0; i < buffer.data.length; i += 4) {
      const r = buffer.data[i], g = buffer.data[i + 1], b = buffer.data[i + 2];
      const diff = r * 0.5 + g * 0.5 + b * 0.5;
      if (diff > DIFF_BREAKPOINT) {
        score += 1;
      }
    }
    return score / 10000;
  }

}



module.exports = new FSWebcam();
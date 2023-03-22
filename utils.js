
module.exports = {
  async timeout(t = 1000) {
    return new Promise((resolve) => {
      setTimeout(
        () => {
          resolve();
        },
        t
      )
    })
  }
}

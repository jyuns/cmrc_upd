module.exports = {
  "transpileDependencies": [
    "vuetify"
  ],
  pluginOptions: {
    electronBuilder: {
      builderOptions: {
        mac: {
          icon: './src/assets/icon.ico'
        },
        win: {
          icon: './src/assets/icon.ico'
        }
      }
    }
  }
}
// Tells autolinking exactly which package class to register, instead of relying
// on it scanning the Kotlin sources for a ReactPackage subclass.
module.exports = {
  dependency: {
    platforms: {
      android: {
        packageImportPath: 'import com.fieldkit.deviceinfo.NativeDeviceInfoPackage;',
        packageInstance: 'new NativeDeviceInfoPackage()',
      },
    },
  },
};
